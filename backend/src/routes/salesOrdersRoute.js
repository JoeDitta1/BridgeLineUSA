import { Router } from 'express';
import path from 'path';
import * as dbModule from '../db.js';
import { ensureSalesOrderFolders, archiveSalesOrderFolder, getSalesOrdersRoot } from '../lib/salesOrderFolders.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;
const router = Router();

/* ----------------- DB table init (idempotent) ----------------- */
(function ensureTable() {
  try {
    db.exec?.(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_no TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        po_number TEXT,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'Draft',
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
  } catch (e) {
    console.warn('sales_orders table ensure failed', e?.message || e);
  }
})();

/* ----------------- Helper: getNextSalesNo ----------------- */
function getNextSalesNo() {
  const s = db
    .prepare(
      'SELECT org_prefix, system_abbr, sales_series, sales_pad, next_sales_seq FROM settings WHERE id=1'
    )
    .get();
  if (!s) throw new Error('Settings missing (id=1)');
  const seq = Number(s.next_sales_seq) || 1;
  const padded = String(seq).padStart(Number(s.sales_pad) || 3, '0');
  const parts = [s.org_prefix, s.system_abbr, `${s.sales_series}${padded}`].filter(Boolean);
  const orderNo = parts.join('-');
  db.prepare('UPDATE settings SET next_sales_seq = ? WHERE id=1').run(seq + 1);
  return orderNo;
}

/* ----------------- Create Sales Order ----------------- */
router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.customer_name) return res.status(400).json({ ok: false, error: 'customer_name required' });

    let order_no = b.order_no || getNextSalesNo();

    const stmt = db.prepare(
      `INSERT INTO sales_orders (order_no, customer_name, po_number, description, status)
       VALUES (?, ?, ?, ?, ?)`
    );
    const result = stmt.run(order_no, b.customer_name, b.po_number || null, b.description || '', b.status || 'Draft');
    const created = db.prepare('SELECT * FROM sales_orders WHERE id = ?').get(result.lastInsertRowid);

    // ensure folder structure
    let folderInfo = null;
    try {
      folderInfo = await ensureSalesOrderFolders({
        customerName: created.customer_name,
        orderNo: created.order_no,
        description: created.description || 'order'
      });
    } catch (e) {
      console.warn('ensureSalesOrderFolders warning:', e?.message || e);
    }

    res.status(201).json({ ok: true, order: created, folder: folderInfo || null });
  } catch (err) {
    console.error('create sales order error', err);
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

/* ----------------- List sales orders ----------------- */
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM sales_orders ORDER BY created_at DESC, id DESC').all();
    res.json({ ok: true, orders: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* ----------------- Get by id ----------------- */
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM sales_orders WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ ok: false });
    res.json({ ok: true, order: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* ----------------- Init folders (idempotent) ----------------- */
router.post('/:orderNo/init-folders', async (req, res) => {
  try {
    const orderNo = req.params.orderNo;
    let { customer_name, description } = req.body || {};
    if (!customer_name && db?.prepare) {
      const row = db.prepare('SELECT customer_name, description FROM sales_orders WHERE order_no = ?').get(orderNo);
      if (row) {
        customer_name = row.customer_name;
        description = description || row.description || '';
      }
    }
    if (!customer_name) return res.status(400).json({ ok: false, error: 'customer_name required' });
    const out = await ensureSalesOrderFolders({ customerName: customer_name, orderNo, description });
    res.json({ ok: true, ...out });
  } catch (e) {
    console.error('init-folders error', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* ----------------- Archive ----------------- */
router.post('/:id/archive', async (req, res) => {
  try {
    const id = req.params.id;
    const row = db.prepare('SELECT * FROM sales_orders WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ ok: false, error: 'Order not found' });

    const customerName = (req.body?.customer_name || row.customer_name || '').toString();
    const baseName = `${row.order_no}-${(row.description || '').replace(/\s+/g,'-')}`.replace(/-$/, '');
    const folderName = baseName; // revision handling can be added
    try {
      const out = await archiveSalesOrderFolder(customerName, folderName);
      // mark status
      db.prepare('UPDATE sales_orders SET status = ? WHERE id = ?').run('Archived', id);
      res.json({ ok: true, archivedPath: out.archivedPath });
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e?.message || e) });
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* ----------------- AI Booster: analyze folder contents ----------------- */
router.post('/:orderNo/ai-analyze', async (req, res) => {
  try {
    const orderNo = req.params.orderNo;
    const row = db.prepare('SELECT * FROM sales_orders WHERE order_no = ?').get(orderNo);
    if (!row) return res.status(404).json({ ok: false, error: 'Order not found' });

    const { customer_name } = row;
    const { orderDir } = await ensureSalesOrderFolders({ customerName: customer_name, orderNo, description: row.description || '' });
    const reports = [];
    // check PO
    if (!row.po_number) reports.push({ level: 'warning', msg: 'PO number missing on order record' });

    // check for order form files inside Order Form folder
    const orderFormDir = path.join(orderDir, 'Order Form');
    try {
      const fsp = await import('fs/promises');
      const names = await fsp.readdir(orderFormDir).catch(()=>[]);
      if (!names || names.length === 0) reports.push({ level: 'info', msg: 'No files found in Order Form folder' });

      const metaPath = names.find(n => n.toLowerCase().includes('_meta') || n.toLowerCase().endsWith('.json'));
      if (metaPath) {
        const metaFull = path.join(orderFormDir, metaPath);
        try {
          const content = JSON.parse(await fsp.readFile(metaFull, 'utf8'));
          if (!content.items || !Array.isArray(content.items)) reports.push({ level:'warning', msg:'Order meta missing items array' });
        } catch (e) {
          reports.push({ level: 'warning', msg: `Failed to parse ${metaPath}` });
        }
      }
    } catch (e) {
      reports.push({ level: 'error', msg: 'Failed to scan Order Form folder' });
    }

    const prodDir = path.join(orderDir, 'Production');
    try {
      const fsp = await import('fs/promises');
      const pnames = await fsp.readdir(prodDir).catch(()=>[]);
      if (pnames.length === 0) reports.push({ level:'info', msg:'Production folder empty' });
    } catch (e) { /*ignore*/ }

    res.json({ ok: true, reports });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* ----------------- Production router generation ----------------- */
router.post('/production-router', async (req, res) => {
  try {
    const { orderIds = [], options = {} } = req.body || {};
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ ok: false, error: 'orderIds required' });
    }

    const fsp = await import('fs/promises');
    const batches = [];
    const pool = [];

    for (const id of orderIds) {
      const order = db.prepare('SELECT * FROM sales_orders WHERE id = ?').get(id);
      if (!order) continue;
      const { orderDir } = await ensureSalesOrderFolders({ customerName: order.customer_name, orderNo: order.order_no, description: order.description || '' });
      const metaPath = path.join(orderDir, 'Order Form', '_meta.json');
      try {
        const raw = await fsp.readFile(metaPath, 'utf8');
        const meta = JSON.parse(raw);
        (meta.items || []).forEach(it => pool.push({ orderId: id, orderNo: order.order_no, customer: order.customer_name, item: it }));
      } catch (e) {
        // ignore missing metas
      }
    }

    if (options.batchByMaterial) {
      const map = new Map();
      for (const p of pool) {
        const key = String(p.item.material || 'MISC').toLowerCase();
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(p);
      }
      for (const [k, arr] of map.entries()) {
        batches.push({ key: k, items: arr });
      }
    } else {
      batches.push({ key: 'ALL', items: pool });
    }

    res.json({ ok: true, batches, scanned: pool.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
