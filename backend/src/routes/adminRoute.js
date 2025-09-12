import express from "express";
import path from "path";
import fs from "fs";
import * as dbModule from "../db.js";
import { getSupabaseClient } from '../utils/supabaseClient.js';

const router = express.Router();
const db = dbModule.default ?? dbModule.db ?? dbModule;

// Ensure kv_store table exists for API keys
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
} catch (e) {
  console.error('[admin] Failed to create kv_store table:', e);
}

router.get('/stats', (req, res) => {
  try {
    const qRow = db.prepare?.("SELECT COUNT(*) as c FROM quotes")?.get?.() || { c: 0 };
    const quotes = Number(qRow.c || 0);

    let users = 0;
    try {
      const uRow = db.prepare?.("SELECT COUNT(*) as c FROM users")?.get?.();
      users = Number(uRow?.c || 0);
    } catch {}

    let materials = 0;
    try {
      const JSON_PATH = path.resolve(process.cwd(), '..', 'frontend', 'src', 'data', 'materials.json');
      const text = fs.readFileSync(JSON_PATH, 'utf8');
      const data = JSON.parse(text || '[]');
      const list = Array.isArray(data) ? data : (Array.isArray(data?.materials) ? data.materials : []);
      materials = list.length;
    } catch {}

    res.json({ ok: true, quotes, users, materials });
  } catch (e) {
    console.error('[admin:stats] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.get('/settings', (req, res) => {
  try {
    let row = db.prepare?.("SELECT * FROM settings WHERE id=1")?.get?.();
    if (!row) {
      row = {
        id: 1,
        org_prefix: "SCM",
        system_abbr: null,
        quote_series: "Q",
        quote_pad: 4,
        next_quote_seq: 1,
        sales_series: "S",
        sales_pad: 3,
        next_sales_seq: 1
      };
    }
    
    // Load API keys from kv_store
    try {
      const apiKeys = db.prepare("SELECT key, value FROM kv_store WHERE key LIKE '%_API_KEY' OR key LIKE '%_URL' OR key LIKE '%_ANON_KEY' OR key LIKE '%_SERVICE_KEY'").all();
      for (const {key, value} of apiKeys) {
        row[key] = value;
      }
    } catch (e) {
      console.warn('[admin:settings] Failed to load API keys:', e);
    }
    
    res.json({ ok: true, settings: row });
  } catch (e) {
    console.error('[admin:settings] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// PUT /api/admin/settings - Update settings including API keys
router.put('/settings', (req, res) => {
  try {
    const { OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, ...otherSettings } = req.body;
    
    // Update or insert API keys in kv_store
    const upsertStmt = db.prepare(`
      INSERT INTO kv_store (key, value, description, updated_at) 
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET 
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    if (OPENAI_API_KEY) {
      upsertStmt.run('OPENAI_API_KEY', OPENAI_API_KEY, 'OpenAI API key for AI BOM extraction');
    }
    if (SUPABASE_URL) {
      upsertStmt.run('SUPABASE_URL', SUPABASE_URL, 'Supabase project URL');
    }
    if (SUPABASE_ANON_KEY) {
      upsertStmt.run('SUPABASE_ANON_KEY', SUPABASE_ANON_KEY, 'Supabase anonymous key');
    }
    if (SUPABASE_SERVICE_KEY) {
      upsertStmt.run('SUPABASE_SERVICE_KEY', SUPABASE_SERVICE_KEY, 'Supabase service role key for file uploads and admin operations');
    }
    
    // Update other settings in the settings table if provided
    if (Object.keys(otherSettings).length > 0) {
      // This would handle other non-API-key settings
      console.log('[admin:settings] Other settings update not implemented yet:', otherSettings);
    }
    
    res.json({ ok: true, message: 'Settings updated successfully' });
  } catch (e) {
    console.error('[admin:settings PUT] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// POST /api/admin/test-openai - Test OpenAI API key
router.post('/test-openai', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ ok: false, error: 'API key required' });
    }
    
    // Test the API key with a simple request
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!testResponse.ok) {
      throw new Error(`OpenAI API responded with status ${testResponse.status}`);
    }
    
    const data = await testResponse.json();
    const modelCount = data.data ? data.data.length : 0;
    
    res.json({ 
      ok: true, 
      message: `OpenAI API key is valid! Found ${modelCount} available models.`,
      modelCount
    });
  } catch (e) {
    console.error('[admin:test-openai] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.get('/users', (req, res) => {
  try {
    let rows = [];
    try {
      rows = db.prepare?.("SELECT id, username AS name, email, role FROM users ORDER BY id DESC")?.all?.() || [];
    } catch (_) {
      rows = [];
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

router.get('/equipment', (req, res) => {
  try {
    let rows = [];
    try {
      rows = db.prepare?.("SELECT id, name, location, notes FROM equipment ORDER BY id DESC")?.all?.() || [];
    } catch (_) {
      rows = [];
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

/* ======================== SOFT DELETE OPERATIONS ======================== */

// Soft delete a quote
router.post('/quotes/:quoteNo/soft-delete', async (req, res) => {
  try {
    const { quoteNo } = req.params;
    const deletedAt = new Date().toISOString();
    
    console.log(`[admin] Starting soft delete for quote: ${quoteNo}`);
    
    // Update local database
    const result = db.prepare('UPDATE quotes SET deleted_at = ? WHERE quote_no = ?')
      .run(deletedAt, quoteNo);
    
    console.log(`[admin] Database update result:`, result);
    
    // Verify the update worked
    const verification = db.prepare('SELECT quote_no, deleted_at FROM quotes WHERE quote_no = ?').get(quoteNo);
    console.log(`[admin] Verification query result:`, verification);
    
    // Try to sync soft delete to Supabase 
    // Since Supabase doesn't have deleted_at column, we'll delete the record entirely
    const supabase = getSupabaseClient();
    if (supabase) {
      console.log(`[admin] Removing quote ${quoteNo} from Supabase (no soft delete support)`);
      const { error: supabaseError } = await supabase
        .from('quotes')
        .delete()
        .eq('quote_no', quoteNo);
        
      if (supabaseError) {
        console.warn(`[admin] Supabase delete warning for ${quoteNo}:`, supabaseError.message);
      } else {
        console.log(`[admin] Successfully removed ${quoteNo} from Supabase`);
      }
    }
    
    console.log(`[admin] Soft deleted quote: ${quoteNo}`);
    res.json({ ok: true, message: 'Quote soft deleted' });
  } catch (error) {
    console.error('[admin] Error soft deleting quote:', error);
    res.status(500).json({ ok: false, error: 'Failed to soft delete quote' });
  }
});

// Soft delete a customer (and all their quotes)
router.post('/customers/:customerName/soft-delete', async (req, res) => {
  try {
    const { customerName } = req.params;
    const decodedCustomerName = decodeURIComponent(customerName);
    const deletedAt = new Date().toISOString();
    
    console.log(`[admin] Soft deleting customer - URL param: "${customerName}", decoded: "${decodedCustomerName}"`);
    
    // Find all potential customer name variations in the database
    const customerVariations = [
      customerName,
      decodedCustomerName,
      customerName.toLowerCase(),
      decodedCustomerName.toLowerCase(),
      customerName.toUpperCase(),
      decodedCustomerName.toUpperCase(),
      // Capitalize first letter
      customerName.charAt(0).toUpperCase() + customerName.slice(1).toLowerCase(),
      decodedCustomerName.charAt(0).toUpperCase() + decodedCustomerName.slice(1).toLowerCase()
    ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    console.log(`[admin] Checking customer variations:`, customerVariations);
    
    let totalUpdated = 0;
    
    // Update local database - try all variations
    for (const variation of customerVariations) {
      const updateResult = db.prepare('UPDATE quotes SET deleted_at = ? WHERE customer_name = ?')
        .run(deletedAt, variation);
      
      if (updateResult.changes > 0) {
        console.log(`[admin] Updated ${updateResult.changes} quotes for customer variation "${variation}"`);
        totalUpdated += updateResult.changes;
      }
    }
    
    console.log(`[admin] Total quotes updated: ${totalUpdated}`);
    
    // Try to update Supabase too
    const supabase = getSupabaseClient();
    if (supabase) {
      // Delete all quotes for this customer (try all variations)
      for (const variation of customerVariations) {
        await supabase
          .from('quotes')
          .update({ deleted_at: deletedAt })
          .eq('customer_name', variation);
      }
      
      // Mark customer as deleted for all variations
      for (const variation of customerVariations) {
        await supabase
          .from('customers')
          .upsert({ 
            name: variation, 
            deleted_at: deletedAt 
          }, { onConflict: 'name' });
      }
    }
    
    console.log(`[admin] Soft deleted customer: ${customerName} (and ${customerVariations.length - 1} variations)`);
    res.json({ ok: true, message: 'Customer and all quotes soft deleted', quotesUpdated: totalUpdated });
  } catch (error) {
    console.error('[admin] Error soft deleting customer:', error);
    res.status(500).json({ ok: false, error: 'Failed to soft delete customer' });
  }
});

// Restore a quote
router.post('/quotes/:quoteNo/restore', async (req, res) => {
  try {
    const { quoteNo } = req.params;
    
    // Update local database
    const result = db.prepare('UPDATE quotes SET deleted_at = NULL WHERE quote_no = ?')
      .run(quoteNo);
    
    if (result.changes === 0) {
      return res.status(404).json({ ok: false, error: 'Quote not found' });
    }
    
    // Get the quote data to re-sync to Supabase
    const quote = db.prepare('SELECT * FROM quotes WHERE quote_no = ?').get(quoteNo);
    
    // Re-create the quote in Supabase since we deleted it during soft delete
    const supabase = getSupabaseClient();
    if (supabase && quote) {
      console.log(`[admin] Re-syncing restored quote ${quoteNo} to Supabase`);
      
      const supabaseData = {
        quote_no: quote.quote_no,
        customer_name: quote.customer_name,
        description: quote.description,
        requested_by: quote.requested_by,
        estimator: quote.estimator,
        date: quote.date,
        status: quote.status,
        sales_order_no: quote.sales_order_no,
        rev: quote.rev,
        customer: quote.customer_name,
        updated_at: new Date().toISOString()
      };
      
      const { error: supabaseError } = await supabase
        .from('quotes')
        .insert(supabaseData);
        
      if (supabaseError) {
        console.warn(`[admin] Supabase restore warning for ${quoteNo}:`, supabaseError.message);
      } else {
        console.log(`[admin] Successfully restored ${quoteNo} to Supabase`);
      }
    }
    
    console.log(`[admin] Restored quote: ${quoteNo}`);
    res.json({ ok: true, message: 'Quote restored' });
  } catch (error) {
    console.error('[admin] Error restoring quote:', error);
    res.status(500).json({ ok: false, error: 'Failed to restore quote' });
  }
});

// Restore a customer (and all their quotes)
router.post('/customers/:customerName/restore', async (req, res) => {
  try {
    const { customerName } = req.params;
    
    // Update local database
    db.prepare('UPDATE quotes SET deleted_at = NULL WHERE customer_name = ?')
      .run(customerName);
    
    // Try to update Supabase too
    const supabase = getSupabaseClient();
    if (supabase) {
      // Restore all quotes for this customer
      await supabase
        .from('quotes')
        .update({ deleted_at: null })
        .eq('customer_name', customerName);
      
      // Restore customer
      await supabase
        .from('customers')
        .update({ deleted_at: null })
        .eq('name', customerName);
    }
    
    console.log(`[admin] Restored customer: ${customerName}`);
    res.json({ ok: true, message: 'Customer and all quotes restored' });
  } catch (error) {
    console.error('[admin] Error restoring customer:', error);
    res.status(500).json({ ok: false, error: 'Failed to restore customer' });
  }
});

// Permanently delete a quote
router.delete('/quotes/:quoteNo/permanent', async (req, res) => {
  try {
    const { quoteNo } = req.params;
    
    // Delete from local database
    db.prepare('DELETE FROM quotes WHERE quote_no = ?')
      .run(quoteNo);
    
    // Try to delete from Supabase too
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase
        .from('quotes')
        .delete()
        .eq('quote_no', quoteNo);
      
      // Also delete files in Supabase storage
      try {
        await supabase.storage
          .from('quote-files')
          .remove([`${quoteNo}/`]);
      } catch (storageError) {
        console.warn('[admin] Storage delete warning:', storageError.message);
      }
    }
    
    console.log(`[admin] Permanently deleted quote: ${quoteNo}`);
    res.json({ ok: true, message: 'Quote permanently deleted' });
  } catch (error) {
    console.error('[admin] Error permanently deleting quote:', error);
    res.status(500).json({ ok: false, error: 'Failed to permanently delete quote' });
  }
});

// Get all deleted quotes
router.get('/deleted/quotes', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    if (supabase) {
      // Get from Supabase
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      
      if (!error) {
        return res.json({ ok: true, deletedQuotes: data, source: 'supabase' });
      }
    }
    
    // Fallback to local database
    const deletedQuotes = db.prepare(`
      SELECT * FROM quotes 
      WHERE deleted_at IS NOT NULL 
      ORDER BY deleted_at DESC
    `).all();
    
    res.json({ ok: true, deletedQuotes, source: 'local' });
  } catch (error) {
    console.error('[admin] Error getting deleted quotes:', error);
    res.status(500).json({ ok: false, error: 'Failed to get deleted quotes' });
  }
});

// Get all deleted customers  
router.get('/deleted/customers', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    if (supabase) {
      // Get from Supabase
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      
      if (!error) {
        return res.json({ ok: true, deletedCustomers: data, source: 'supabase' });
      }
    }
    
    // Fallback: get unique deleted customers from quotes
    const deletedCustomers = db.prepare(`
      SELECT DISTINCT customer_name as name, deleted_at
      FROM quotes 
      WHERE deleted_at IS NOT NULL 
      ORDER BY deleted_at DESC
    `).all();
    
    res.json({ ok: true, deletedCustomers, source: 'local' });
  } catch (error) {
    console.error('[admin] Error getting deleted customers:', error);
    res.status(500).json({ ok: false, error: 'Failed to get deleted customers' });
  }
});

// GET /admin/system-status - Check system health and cleanup status
router.get('/system-status', async (req, res) => {
  try {
    const quotesInDb = db.prepare('SELECT COUNT(*) as count FROM quotes').get();
    const quotesWithDeleted = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE deleted_at IS NOT NULL').get();
    
    // Count filesystem folders
    const fs = await import('fs/promises');
    const path = await import('path');
    const quotesDir = path.join(process.cwd(), 'data', 'quotes');
    
    let filesystemFolders = 0;
    try {
      const entries = await fs.readdir(quotesDir, { withFileTypes: true });
      filesystemFolders = entries.filter(e => e.isDirectory()).length;
    } catch (err) {
      console.log('Error reading quotes directory:', err.message);
    }
    
    const status = {
      database: {
        totalQuotes: quotesInDb.count,
        softDeletedQuotes: quotesWithDeleted.count,
        activeQuotes: quotesInDb.count - quotesWithDeleted.count
      },
      filesystem: {
        customerFolders: filesystemFolders
      },
      systemHealth: {
        databaseConnected: true,
        quotesDirectoryExists: filesystemFolders >= 0,
        orphanedFolders: filesystemFolders > 0 && quotesInDb.count === 0
      }
    };
    
    res.json({ ok: true, status });
  } catch (error) {
    console.error('[admin] System status error:', error);
    res.status(500).json({ ok: false, error: 'Failed to get system status' });
  }
});

// POST /admin/cleanup-orphaned-folders - Clean up folders that don't have database records
router.post('/cleanup-orphaned-folders', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const quotesDir = path.join(process.cwd(), 'data', 'quotes');
    
    // Get all quotes from database
    const dbQuotes = new Set();
    const quotes = db.prepare('SELECT quote_no FROM quotes').all();
    quotes.forEach(q => dbQuotes.add(q.quote_no));
    
    let foldersRemoved = 0;
    let customersRemoved = 0;
    const removedItems = [];
    
    try {
      const customerDirs = await fs.readdir(quotesDir, { withFileTypes: true });
      
      for (const customerDir of customerDirs) {
        if (!customerDir.isDirectory()) continue;
        
        const customerPath = path.join(quotesDir, customerDir.name);
        const quoteDirs = await fs.readdir(customerPath, { withFileTypes: true });
        const quoteDirectories = quoteDirs.filter(d => d.isDirectory());
        
        let quotesKeptForCustomer = 0;
        
        for (const quoteDir of quoteDirectories) {
          const quotePath = path.join(customerPath, quoteDir.name);
          
          // Parse quote number from folder name
          const quoteMatch = quoteDir.name.match(/^([A-Z]+-[QSO]\d+)/);
          if (!quoteMatch) {
            // Not a valid quote folder, remove it
            await fs.rm(quotePath, { recursive: true, force: true });
            foldersRemoved++;
            removedItems.push(`Invalid folder: ${customerDir.name}/${quoteDir.name}`);
            continue;
          }
          
          const quoteNo = quoteMatch[1];
          if (!dbQuotes.has(quoteNo)) {
            // Quote doesn't exist in database, remove folder
            await fs.rm(quotePath, { recursive: true, force: true });
            foldersRemoved++;
            removedItems.push(`Orphaned quote: ${customerDir.name}/${quoteDir.name}`);
          } else {
            quotesKeptForCustomer++;
          }
        }
        
        // Remove customer folder if no quotes remain
        if (quotesKeptForCustomer === 0) {
          await fs.rm(customerPath, { recursive: true, force: true });
          customersRemoved++;
          removedItems.push(`Empty customer: ${customerDir.name}`);
        }
      }
    } catch (err) {
      console.error('Cleanup error:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
    
    res.json({
      ok: true,
      message: 'Cleanup completed',
      summary: {
        foldersRemoved,
        customersRemoved,
        totalDbQuotes: dbQuotes.size,
        removedItems
      }
    });
  } catch (error) {
    console.error('[admin] Cleanup error:', error);
    res.status(500).json({ ok: false, error: 'Failed to cleanup orphaned folders' });
  }
});

/* ======================== FILE MANAGEMENT OPERATIONS ======================== */

// Get all soft-deleted files for admin management (database-based approach)
router.get('/files/deleted', async (req, res) => {
  try {
    console.log('[admin] Getting all soft-deleted files from database');
    
    // Query database for soft-deleted files
    const deletedFiles = db.prepare(`
      SELECT 
        f.id,
        f.title as filename,
        f.deleted_at,
        f.created_at,
        q.quote_no,
        q.customer_name,
        'drawings' as subdir
      FROM files f
      JOIN quotes q ON f.quote_id = q.id
      WHERE f.deleted_at IS NOT NULL
      ORDER BY f.deleted_at DESC
    `).all();
    
    console.log(`[admin] Found ${deletedFiles.length} soft-deleted files in database`);
    
    // Format for frontend compatibility
    const formattedFiles = deletedFiles.map(file => ({
      id: file.id,
      filename: file.filename,
      quote_no: file.quote_no,
      customer_name: file.customer_name,
      subdir: file.subdir,
      deleted_at: file.deleted_at,
      created_at: file.created_at,
      file_size: 0 // Size not available in database
    }));
    
    res.json(formattedFiles);
  } catch (error) {
    console.error('[admin] Error getting deleted files:', error);
    res.status(500).json({ ok: false, error: 'Failed to get deleted files' });
  }
});

// Restore a soft-deleted file (database-based approach)
router.post('/files/:fileId/restore', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log(`[admin] Restoring file with ID: ${fileId}`);
    
    // Simply clear the deleted_at timestamp in the database
    const result = db.prepare(`
      UPDATE files 
      SET deleted_at = NULL 
      WHERE id = ? AND deleted_at IS NOT NULL
    `).run(fileId);
    
    if (result.changes === 0) {
      return res.status(404).json({ ok: false, error: 'File not found or not deleted' });
    }
    
    console.log(`[admin] Successfully restored file: ${fileId}`);
    res.json({ ok: true, message: 'File restored successfully' });
  } catch (error) {
    console.error('[admin] Error restoring file:', error);
    res.status(500).json({ ok: false, error: 'Failed to restore file' });
  }
});

// Permanently delete a soft-deleted file (database-based approach)
router.delete('/files/:fileId/permanent', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log(`[admin] Permanently deleting file with ID: ${fileId}`);
    
    // Remove the file record from the database entirely
    const result = db.prepare(`
      DELETE FROM files 
      WHERE id = ? AND deleted_at IS NOT NULL
    `).run(fileId);
    
    if (result.changes === 0) {
      return res.status(404).json({ ok: false, error: 'File not found or not soft-deleted' });
    }
    
    console.log(`[admin] Successfully permanently deleted file: ${fileId}`);
    res.json({ ok: true, message: 'File permanently deleted' });
  } catch (error) {
    console.error('[admin] Error permanently deleting file:', error);
    res.status(500).json({ ok: false, error: 'Failed to permanently delete file' });
  }
});

export default router;
