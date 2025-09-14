// backend/src/routes/quoteFilesRoute.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import * as dbModule from '../db.js';
import { fileURLToPath } from 'url';
import { uploadFileToSupabase, getQuoteFilesFromSupabase } from '../utils/supabaseClient.js';

// Resolve quotes base dir relative to this source file so it's stable
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = dbModule.default ?? dbModule.db ?? dbModule;
const router = express.Router();

/* -------------------------------- helpers ---------------------------------- */
const safeFolderName = (input) => String(input).replace(/[\\/:*?"<>|]/g, '_').trim();
const getQuotesBaseDir = () => path.resolve(__dirname, '..', '..', 'data', 'quotes');

/** Look up customer_name by quote_no in DB */
function getCustomerByQuoteNo(quoteNo) {
  const row = db.prepare?.('SELECT customer_name FROM quotes WHERE quote_no = ?')?.get?.(quoteNo);
  return row?.customer_name || null;
}

/** data/quotes/<CustomerName>/<QuoteFolder>
 * Try to find an existing folder under the customer that starts with the quoteNo (e.g. "SCM-Q0017-Street Rod").
 * If none found, return a fallback path using quoteNo.
 */
async function getQuoteDir(customerName, quoteNo) {
  const customerDir = path.join(getQuotesBaseDir(), safeFolderName(customerName || 'unknown'));
  await fsp.mkdir(customerDir, { recursive: true });
  const want = (String(quoteNo || '')).toLowerCase();
  if (!want) return path.join(customerDir, safeFolderName(String(quoteNo || 'quote')));
  const entries = await fsp.readdir(customerDir).catch(() => []);
  const match = entries.find(d => String(d).toLowerCase().startsWith(want));
  if (match) return path.join(customerDir, match);
  // fallback: simple folder named after quoteNo
  return path.join(customerDir, safeFolderName(quoteNo));
}

/** Ensure standard subfolders & return { dir, subdirs } */
async function ensureQuoteTree(customerName, quoteNo) {
  const dir = await getQuoteDir(customerName, quoteNo);
  const subdirs = ['uploads', 'drawings', 'vendors', 'notes', 'exports'];
  await fsp.mkdir(dir, { recursive: true });
  for (const s of subdirs) await fsp.mkdir(path.join(dir, s), { recursive: true });
  return { dir, subdirs };
}

/** Find first file named `filename` under any standard subdir */
async function findFileAnySubdir(customerName, quoteNo, filename) {
  const { dir, subdirs } = await ensureQuoteTree(customerName, quoteNo);
  for (const s of subdirs) {
    const p = path.join(dir, s, filename);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return { fullPath: p, subdir: s };
    }
  }
  return null;
}

/* ------------------------------- multer setup ------------------------------ */
// Save to: data/quotes/<CustomerName>/<QuoteNo>/<subdir>
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { quoteNo } = req.params;
      const subdir = String(req.query.subdir || 'uploads');
      const customerName = getCustomerByQuoteNo(quoteNo);
      if (!customerName) return cb(new Error(`Quote ${quoteNo} not found`));

      const { dir } = await ensureQuoteTree(customerName, quoteNo);
      const dest = path.join(dir, safeFolderName(subdir));
      await fsp.mkdir(dest, { recursive: true });
      cb(null, dest);
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    // keep readable names but avoid collisions
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const base = path.parse(file.originalname).name.replace(/\s+/g, '_');
    const ext = path.extname(file.originalname);
    cb(null, `${base}__${ts}${ext}`);
  }
});
const upload = multer({ storage });

/* ----------------------------- list all files ------------------------------ */
// GET /api/quotes/:quoteNo/files   (returns ARRAY for backward compat)
// Now scans uploads/drawings/vendors/notes/exports
router.get('/:quoteNo/files', async (req, res) => {
  try {
    const { quoteNo } = req.params;
    
    // Try to get files from Supabase first
    try {
      console.log(`[FILE LISTING] Getting files for quote ${quoteNo} with params:`, req.query);
      const { getQuoteFilesFromSupabase } = await import('../utils/supabaseClient.js');
      const supabaseFiles = await getQuoteFilesFromSupabase(quoteNo);
      
      console.log(`[FILE LISTING] Supabase returned ${supabaseFiles?.length || 0} files for quote ${quoteNo}:`, 
        supabaseFiles?.map(f => f.name || f.originalname).slice(0, 5) || []);
      
      if (supabaseFiles && supabaseFiles.length > 0) {
        // Convert Supabase file format to expected format
        const formattedFiles = supabaseFiles.map(file => ({
          name: file.name || file.originalname,
          subdir: file.subdir || 'drawings',
          size: file.size || 0,
          modifiedAt: file.modifiedAt || new Date(file.mtime || file.uploaded_at),
          mime: file.mime || file.content_type || 'application/octet-stream',
          url: file.url || file.signed_url
        }));
        
        formattedFiles.sort((a, b) => b.modifiedAt - a.modifiedAt);
        console.log(`[FILE LISTING] Returning ${formattedFiles.length} formatted files to client`);
        return res.json(formattedFiles);
      }
    } catch (supabaseError) {
      console.warn('[FILE LISTING] Failed to get files from Supabase, falling back to local:', supabaseError.message);
    }
    
    // Fallback to local filesystem
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json([]);

  const { dir, subdirs } = await ensureQuoteTree(customerName, quoteNo);
    const rows = [];

    for (const s of subdirs) {
      const p = path.join(dir, s);
      if (!fs.existsSync(p)) continue;
      const names = await fsp.readdir(p);
      for (const name of names) {
        const full = path.join(p, name);
        const st = await fsp.stat(full);
        if (!st.isFile()) continue;
        rows.push({
          name,
          subdir: s,
          size: st.size,
          modifiedAt: st.mtime,
          mime: mime.lookup(name) || 'application/octet-stream',
          // Use actual folder base name (may include description suffix)
          url: `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(path.basename(dir))}/${encodeURIComponent(s)}/${encodeURIComponent(name)}`
        });
      }
    }

    rows.sort((a, b) => b.modifiedAt - a.modifiedAt);
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

/* --------------------------------- upload ---------------------------------- */
// NEW preferred: POST /api/quotes/:quoteNo/upload?subdir=uploads|drawings|vendors|notes
// field name: files (multiple OK)
router.post('/:quoteNo/upload', upload.array('files'), async (req, res) => {
  try {
    const { quoteNo } = req.params;
    const subdir = String(req.query.subdir || 'uploads');
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json({ ok: false, error: `Quote ${quoteNo} not found` });
    // log for debugging where files were stored
    console.log('quote upload - files:', (req.files || []).map(f => ({ originalname: f.originalname, filename: f.filename, path: f.path, dest: f.destination })) );
    // determine actual folder name used on disk
    const folderBase = path.basename(await getQuoteDir(customerName, quoteNo));
    const uploaded = (req.files || []).map(f => ({
      originalname: f.originalname,
      filename: f.filename,
      size: f.size,
      subdir,
      path: f.path,
      url: `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(folderBase)}/${encodeURIComponent(subdir)}/${encodeURIComponent(f.filename)}`
    }));
    res.json({ ok: true, uploaded });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* -------------------------- Supabase Upload -------------------------------- */
// POST /api/quotes/:quoteNo/upload-supabase?subdir=drawings|uploads|etc
// Uses Supabase storage instead of local filesystem
const memoryUpload = multer({ storage: multer.memoryStorage() });

router.post('/:quoteNo/upload-supabase', memoryUpload.array('files'), async (req, res) => {
  try {
    const { quoteNo } = req.params;
    const subdir = String(req.query.subdir || 'uploads');
    const customerName = getCustomerByQuoteNo(quoteNo);
    
    if (!customerName) {
      return res.status(404).json({ ok: false, error: `Quote ${quoteNo} not found` });
    }
    
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ ok: false, error: 'No files provided' });
    }
    
    console.log(`Uploading ${files.length} files to Supabase for quote ${quoteNo}, subdir: ${subdir}`);
    
    const uploaded = [];
    let supabaseSuccess = false;
    
    for (const file of files) {
      try {
        const result = await uploadFileToSupabase(file, quoteNo, subdir, customerName);
        uploaded.push(result);
        supabaseSuccess = true;
        console.log(`Successfully uploaded to Supabase: ${file.originalname}`);
      } catch (error) {
        console.error(`Supabase upload failed for ${file.originalname}:`, error);
        console.log(`Falling back to local filesystem for ${file.originalname}`);
        
        // Fallback to local filesystem
        try {
          // Recreate the file with proper structure for local upload
          const localFile = {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            buffer: file.buffer
          };
          
          // Use the existing local upload logic
          const { dir } = await ensureQuoteTree(customerName, quoteNo);
          const dest = path.join(dir, safeFolderName(subdir));
          await fsp.mkdir(dest, { recursive: true });
          
          // Create unique filename
          const ts = new Date().toISOString().replace(/[:.]/g, '-');
          const base = path.parse(file.originalname).name.replace(/\s+/g, '_');
          const ext = path.extname(file.originalname);
          const filename = `${base}__${ts}${ext}`;
          const filePath = path.join(dest, filename);
          
          // Write file to local filesystem
          await fsp.writeFile(filePath, file.buffer);
          
          const folderBase = path.basename(dir);
          uploaded.push({
            originalname: file.originalname,
            filename: filename,
            size: file.size,
            subdir,
            path: filePath,
            url: `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(folderBase)}/${encodeURIComponent(subdir)}/${encodeURIComponent(filename)}`,
            source: 'local_fallback'
          });
          
          console.log(`Successfully uploaded to local filesystem: ${file.originalname}`);
        } catch (localError) {
          console.error(`Both Supabase and local upload failed for ${file.originalname}:`, localError);
        }
      }
    }
    
    if (uploaded.length === 0) {
      return res.status(500).json({ ok: false, error: 'All file uploads failed' });
    }
    
    res.json({ 
      ok: true, 
      uploaded,
      source: supabaseSuccess ? 'supabase' : 'local_fallback',
      message: supabaseSuccess ? 'Files uploaded to Supabase successfully' : 'Files uploaded to local filesystem (Supabase fallback)'
    });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* ----------------------- legacy upload (kept for compat) ------------------- */
// POST /api/quotes/:quoteNo/files   (uploads to uploads/ subdir)
router.post('/:quoteNo/files', (req, res, next) => {
  // force subdir=uploads for legacy route
  req.query.subdir = 'uploads';
  next();
}, upload.array('files'), async (req, res) => {
  try {
    const { quoteNo } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json({ uploaded: [] });
    const folderBase = path.basename(await getQuoteDir(customerName, quoteNo));

    res.json({
      uploaded: (req.files || []).map(f => ({
        name: f.originalname,
        size: f.size,
        storedAs: f.filename,
        url: `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(folderBase)}/uploads/${encodeURIComponent(f.filename)}`
      }))
    });
  } catch {
    res.json({ uploaded: [] });
  }
});

/* --------------------------- download (legacy) ----------------------------- */
// GET /api/quotes/:quoteNo/files/:filename   (search all subdirs)
router.get('/:quoteNo/files/:filename', async (req, res) => {
  try {
    const { quoteNo, filename } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).end();

    const found = await findFileAnySubdir(customerName, quoteNo, filename);
    if (!found) return res.status(404).end();
    res.download(found.fullPath, filename);
  } catch {
    res.status(500).end();
  }
});

// DELETE /api/quotes/:quoteNo/files/:filename (using query params for customer & section)
router.delete('/:quoteNo/files/:filename', async (req, res) => {
  try {
    const { quoteNo, filename } = req.params;
    const { customer: customerName, section: subdir } = req.query;
    
    console.log(`[DELETE] Deleting file: ${filename} from quote ${quoteNo}, customer: ${customerName}, section: ${subdir}`);
    
    let deleted = false;
    let errors = [];

    // Try to delete from Supabase first
    try {
      const { getSupabaseClient } = await import('../utils/supabaseClient.js');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        errors.push('Supabase not configured');
      } else {
        // Build the storage path - files are stored as quotes/{customerName}/{quoteNo}/{subdir}/{filename}
        const storagePath = `quotes/${customerName}/${quoteNo}/${subdir}/${filename}`;
        console.log(`[DELETE] Attempting to delete from Supabase storage: ${storagePath}`);
        
        const { error: storageError } = await supabase.storage
          .from('quote-files')
          .remove([storagePath]);
          
        if (storageError) {
          console.warn(`[DELETE] Supabase storage deletion warning:`, storageError);
          errors.push(`Supabase: ${storageError.message}`);
        } else {
          console.log(`[DELETE] Successfully deleted from Supabase storage: ${storagePath}`);
          deleted = true;
        }
        
        // Also try to remove from quote_files table
        const { error: dbError } = await supabase
          .from('quote_files')
          .delete()
          .eq('quote_no', quoteNo)
          .eq('filename', filename);
          
        if (dbError) {
          console.warn(`[DELETE] Supabase DB deletion warning:`, dbError);
          errors.push(`Supabase DB: ${dbError.message}`);
        } else {
          console.log(`[DELETE] Successfully deleted from Supabase DB: ${filename}`);
          deleted = true;
        }
      }
    } catch (e) {
      console.warn(`[DELETE] Supabase deletion error:`, e);
      errors.push(`Supabase: ${e.message}`);
    }

    // Fallback: try local filesystem deletion
    try {
      const resolvedCustomerName = customerName || getCustomerByQuoteNo(quoteNo);
      if (resolvedCustomerName && subdir) {
        const dir = await getQuoteDir(resolvedCustomerName, quoteNo);
        const p = path.join(dir, safeFolderName(subdir), filename);
        
        if (fs.existsSync(p)) {
          await fsp.unlink(p);
          console.log(`[DELETE] Successfully deleted from local filesystem: ${p}`);
          deleted = true;
        }
      } else {
        // Legacy: search all subdirs
        const found = await findFileAnySubdir(resolvedCustomerName, quoteNo, filename);
        if (found) {
          await fsp.unlink(found.fullPath);
          console.log(`[DELETE] Successfully deleted from local filesystem (found): ${found.fullPath}`);
          deleted = true;
        }
      }
    } catch (e) {
      console.warn(`[DELETE] Local filesystem deletion error:`, e);
      errors.push(`Local: ${e.message}`);
    }
    
    if (deleted) {
      const response = { ok: true, deleted: true };
      if (errors.length > 0) {
        response.warnings = errors;
      }
      res.json(response);
    } else {
      res.status(404).json({ 
        ok: false, 
        error: 'File not found',
        details: errors.length > 0 ? errors : ['File not found in Supabase or local storage']
      });
    }
  } catch (e) {
    console.error(`[DELETE] Unexpected error:`, e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* ---------------------- SOFT DELETE for File Management ---------------------- */
// NOTE: Requires 'deleted_at' column in Supabase quote_files table (TIMESTAMP WITH TIME ZONE)
// POST /api/quotes/:quoteNo/files/:filename/soft-delete (using query params for customer & section)
router.post('/:quoteNo/files/:filename/soft-delete', async (req, res) => {
  try {
    const { quoteNo, filename } = req.params;
    const { customer: customerName, section: subdir } = req.query;
    
    console.log(`[SOFT DELETE] Soft deleting file: ${filename} from quote ${quoteNo}, customer: ${customerName}, section: ${subdir}`);
    
    const deletedAt = new Date().toISOString();
    let softDeleted = false;
    let errors = [];

    // Simple approach: Mark file as deleted in database
    try {
      // First, get the quote_id from quote_no
      const quoteRecord = db.prepare('SELECT id FROM quotes WHERE quote_no = ?').get(quoteNo);
      if (!quoteRecord) {
        errors.push('Quote not found in database');
      } else {
        const quoteId = quoteRecord.id;
        
        // Find the file record using filename (stored as title or id in files table)
        const fileRecord = db.prepare(`
          SELECT f.id FROM files f 
          WHERE f.quote_id = ? AND (f.title = ? OR f.id LIKE ?)
        `).get(quoteId, filename, `%${filename}%`);
        
        if (fileRecord) {
          // Update existing file record
          const updateResult = db.prepare(`
            UPDATE files 
            SET deleted_at = ? 
            WHERE id = ? AND deleted_at IS NULL
          `).run(deletedAt, fileRecord.id);
          
          console.log(`[SOFT DELETE] Updated existing file record:`, updateResult);
          softDeleted = updateResult.changes > 0;
        } else {
          // Create new file record as soft-deleted (using filename as both id and title)
          const fileId = `${quoteNo}_${filename}_${Date.now()}`;
          const insertFileResult = db.prepare(`
            INSERT INTO files (id, quote_id, title, kind, deleted_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(fileId, quoteId, filename, 'drawing', deletedAt, deletedAt);
          
          console.log(`[SOFT DELETE] Created new soft-deleted file record:`, insertFileResult);
          softDeleted = insertFileResult.changes > 0;
        }
      }
      
      if (softDeleted) {
        console.log(`[SOFT DELETE] File ${filename} successfully marked as soft deleted in database`);
      }
    } catch (dbError) {
      console.error(`[SOFT DELETE] Database error:`, dbError);
      errors.push(`Database: ${dbError.message}`);
    }
    
    if (softDeleted) {
      res.json({ 
        ok: true, 
        softDeleted: true,
        deletedAt: deletedAt,
        message: 'File soft deleted successfully. Can be restored from Admin portal.',
        warnings: errors.length > 0 ? errors : undefined
      });
    } else {
      res.status(404).json({ 
        ok: false, 
        error: 'Could not soft delete file',
        details: errors.length > 0 ? errors : ['Database update failed']
      });
    }
  } catch (e) {
    console.error(`[SOFT DELETE] Unexpected error:`, e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* --------------------- subdir-aware download/delete ------------------------ */
// GET /api/quotes/:quoteNo/files/:subdir/:filename
router.get('/:quoteNo/files/:subdir/:filename', async (req, res) => {
  try {
    const { quoteNo, subdir, filename } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).end();

    const dir = await getQuoteDir(customerName, quoteNo);
    const p = path.join(dir, safeFolderName(subdir), filename);
    if (!fs.existsSync(p)) return res.status(404).end();
    res.download(p, filename);
  } catch {
    res.status(500).end();
  }
});

// DELETE /api/quotes/:quoteNo/files/:subdir/:filename
router.delete('/:quoteNo/files/:subdir/:filename', async (req, res) => {
  try {
    const { quoteNo, subdir, filename } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json({ ok: false });

    let deleted = false;
    let errors = [];

    // Try to delete from Supabase first
    try {
      const { getSupabaseClient } = await import('../utils/supabaseClient.js');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        errors.push('Supabase not configured');
      } else {
        // Build the storage path
        const storagePath = `quotes/${customerName}/${quoteNo}/${subdir}/${filename}`;
        console.log(`[DELETE] Attempting to delete from Supabase storage: ${storagePath}`);
        
        const { error: storageError } = await supabase.storage
          .from('quote-files')
          .remove([storagePath]);
          
        if (storageError) {
          console.warn(`[DELETE] Supabase storage deletion warning:`, storageError);
          errors.push(`Supabase: ${storageError.message}`);
        } else {
          console.log(`[DELETE] Successfully deleted from Supabase storage: ${storagePath}`);
          deleted = true;
        }
        
        // Also try to remove from quote_files table
        const { error: dbError } = await supabase
          .from('quote_files')
          .delete()
          .eq('quote_no', quoteNo)
          .eq('filename', filename);
          
        if (dbError) {
          console.warn(`[DELETE] Supabase DB deletion warning:`, dbError);
          errors.push(`Supabase DB: ${dbError.message}`);
        } else {
          console.log(`[DELETE] Successfully deleted from Supabase DB: ${filename}`);
          deleted = true;
        }
      }
    } catch (e) {
      console.warn(`[DELETE] Supabase deletion error:`, e);
      errors.push(`Supabase: ${e.message}`);
    }

    // Fallback: try local filesystem deletion
    try {
      const dir = await getQuoteDir(customerName, quoteNo);
      const p = path.join(dir, safeFolderName(subdir), filename);
      
      if (fs.existsSync(p)) {
        await fsp.unlink(p);
        console.log(`[DELETE] Successfully deleted from local filesystem: ${p}`);
        deleted = true;
      }
    } catch (e) {
      console.warn(`[DELETE] Local filesystem deletion error:`, e);
      errors.push(`Local: ${e.message}`);
    }
    
    if (deleted) {
      const response = { ok: true };
      if (errors.length > 0) {
        response.warnings = errors;
      }
      res.json(response);
    } else {
      res.status(404).json({ 
        ok: false, 
        error: 'File not found',
        details: errors.length > 0 ? errors : ['File not found in Supabase or local storage']
      });
    }
  } catch (e) {
    console.error(`[DELETE] Unexpected error:`, e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
