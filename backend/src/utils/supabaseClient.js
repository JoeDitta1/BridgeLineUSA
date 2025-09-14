import { createClient } from '@supabase/supabase-js';
import * as dbModule from '../db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;

// Helper function to check if a file is soft deleted using local SQLite database
function isFileSoftDeleted(filename, quoteNo) {
  try {
    // Get quote ID from quote number
    const quoteRow = db.prepare?.('SELECT id FROM quotes WHERE quote_no = ?')?.get?.(quoteNo);
    if (!quoteRow) {
      return false; // Quote not found, assume file is not deleted
    }
    
    // Check if file is marked as deleted in local database
    const fileRow = db.prepare?.('SELECT deleted_at FROM files WHERE title = ? AND quote_id = ? AND deleted_at IS NOT NULL')?.get?.(filename, quoteRow.id);
    return !!fileRow; // Return true if file has deleted_at set
  } catch (error) {
    console.warn(`[isFileSoftDeleted] Error checking deletion status for ${filename}:`, error.message);
    return false; // If error, assume file is not deleted (conservative approach)
  }
}

let supabaseClient = null;
let supabaseAdminClient = null;
let supabaseCredentials = { url: null, key: null, serviceKey: null };

// Get Supabase client with current settings
export function getSupabaseClient() {
  try {
    // Get current settings from kv_store
    const urlRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_URL'").get();
    const keyRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_ANON_KEY'").get();
    
    const supabaseUrl = urlRow?.value;
    const supabaseAnonKey = keyRow?.value;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not configured in admin settings');
      return null;
    }
    
    // Create new client if credentials changed or client doesn't exist
    if (!supabaseClient || supabaseCredentials.url !== supabaseUrl || supabaseCredentials.key !== supabaseAnonKey) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      supabaseCredentials.url = supabaseUrl;
      supabaseCredentials.key = supabaseAnonKey;
      console.log('Supabase client created/updated');
    }
    
    return supabaseClient;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
}

// Get Supabase admin client with service role key for administrative operations
export function getSupabaseAdminClient() {
  try {
    // Get current settings from kv_store
    const urlRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_URL'").get();
    const serviceKeyRow = db.prepare("SELECT value FROM kv_store WHERE key = 'SUPABASE_SERVICE_KEY'").get();
    
    const supabaseUrl = urlRow?.value;
    const supabaseServiceKey = serviceKeyRow?.value;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase admin credentials not configured in admin settings');
      return null;
    }
    
    // Create new admin client if credentials changed or client doesn't exist
    if (!supabaseAdminClient || supabaseCredentials.url !== supabaseUrl || supabaseCredentials.serviceKey !== supabaseServiceKey) {
      supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey);
      supabaseCredentials.url = supabaseUrl;
      supabaseCredentials.serviceKey = supabaseServiceKey;
      console.log('Supabase admin client created/updated');
    }
    
    return supabaseAdminClient;
  } catch (error) {
    console.error('Failed to create Supabase admin client:', error);
    return null;
  }
}

// Ensure required Supabase storage buckets exist
export async function ensureSupabaseBuckets() {
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) return false;
  
  try {
    // Check if quote-files bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Failed to list Supabase buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'quote-files');
    
    if (!bucketExists) {
      console.log('Creating quote-files bucket in Supabase...');
      const { error: createError } = await supabaseAdmin.storage.createBucket('quote-files', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/*', 'application/dwg', 'application/dxf', 'text/*'],
        fileSizeLimit: 50 * 1024 * 1024 // 50MB
      });
      
      if (createError) {
        console.error('Failed to create quote-files bucket:', createError);
        return false;
      }
      
      console.log('Successfully created quote-files bucket');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring Supabase buckets:', error);
    return false;
  }
}

// Ensure required Supabase database tables exist
export async function ensureSupabaseTables() {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  try {
    // Check if quote_files table exists, if not create it
    const { data, error } = await supabase
      .from('quote_files')
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('quote_files table does not exist - this is expected if using Supabase for the first time');
      return false; // Table doesn't exist, would need to be created via Supabase dashboard
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Supabase tables:', error);
    return false;
  }
}

// Upload file to Supabase storage and save metadata to files table
export async function uploadFileToSupabase(file, quoteNo, subdir, customerName) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  try {
    // Ensure buckets exist
    const bucketsReady = await ensureSupabaseBuckets();
    if (!bucketsReady) {
      console.warn('Supabase buckets not ready, falling back to local storage');
      throw new Error('Supabase storage not ready');
    }
    
    // Create a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = file.originalname.split('.').pop() || 'unknown';
    const basename = file.originalname.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${basename}__${timestamp}.${extension}`;
    const storagePath = `quotes/${customerName}/${quoteNo}/${subdir}/${filename}`;
    
    console.log(`Uploading file to Supabase: ${storagePath}`);
    
    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('quote-files')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
      
    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }
    
    console.log('File uploaded successfully to Supabase:', uploadData.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('quote-files')
      .getPublicUrl(storagePath);
    
    // Try to save file metadata to database (optional - might not have tables set up yet)
    try {
      const fileRecord = {
        quote_no: quoteNo,
        customer_name: customerName,
        filename: file.originalname,
        stored_filename: filename,
        storage_path: storagePath,
        public_url: publicUrl,
        subdir: subdir,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_at: new Date().toISOString()
      };
      
      const { error: dbError } = await supabase
        .from('quote_files')
        .insert(fileRecord);
        
      if (dbError) {
        console.warn('Failed to save file metadata to Supabase database (table may not exist):', dbError.message);
        // Continue anyway - file is uploaded to storage
      }
    } catch (dbError) {
      console.warn('File metadata save skipped (quote_files table may not exist):', dbError.message);
    }
    
    return {
      originalname: file.originalname,
      filename: filename,
      size: file.size,
      subdir: subdir,
      path: storagePath,
      url: publicUrl,
      storage_path: storagePath,
      source: 'supabase'
    };
  } catch (error) {
    console.error('Supabase file upload error:', error);
    throw error;
  }
}

// Get files for a quote from Supabase
export async function getQuoteFilesFromSupabase(quoteNo) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase not configured, returning empty file list');
    return [];
  }
  
  console.log(`[getQuoteFilesFromSupabase] Looking for files for quote: ${quoteNo}`);
  
  try {
    // Try to get from database first but don't fail if table structure is wrong
    console.log(`[getQuoteFilesFromSupabase] Attempting database query for quote: ${quoteNo}`);
    
    try {
      // Try to get from database first (check both quote_no and quote_id for compatibility)
      // Exclude soft-deleted files if deleted_at column exists
      let { data, error } = await supabase
        .from('quote_files')
        .select('*')
        .eq('quote_no', quoteNo)  // Try quote_no first
        .order('uploaded_at', { ascending: false });
        
      // If quote_no column doesn't exist, try quote_id
      if (error && error.code === '42703' && error.message.includes('quote_no does not exist')) {
        console.log(`[getQuoteFilesFromSupabase] quote_no column doesn't exist, trying quote_id`);
        const result = await supabase
          .from('quote_files')
          .select('*')
          .eq('quote_id', quoteNo)  // Fallback to quote_id
          .order('uploaded_at', { ascending: false });
        data = result.data;
        error = result.error;
      }
      
      // Try to filter deleted files if deleted_at column exists
      if (data && data.length > 0) {
        try {
          const filteredData = data.filter(file => !file.deleted_at);
          data = filteredData;
        } catch (filterError) {
          // If deleted_at column doesn't exist, just use all data
          console.log(`[getQuoteFilesFromSupabase] deleted_at column doesn't exist, using all data`);
        }
      }
        
      console.log(`[getQuoteFilesFromSupabase] Database query result:`, { count: data?.length || 0, error: error?.message || 'none' });
        
      if (data && data.length > 0) {
        console.log(`Found ${data.length} files in Supabase database for quote ${quoteNo}`);
        
        // Apply soft delete filtering using local SQLite database
        const filteredFiles = [];
        for (const file of data) {
          if (!isFileSoftDeleted(file.filename, quoteNo)) {
            filteredFiles.push({
              name: file.filename,
              originalname: file.filename,
              size: file.file_size || 0,
              subdir: file.subdir || 'drawings', // Default to drawings if not specified
              url: file.public_url,
              path: file.storage_path,
              modifiedAt: new Date(file.uploaded_at),
              mime: file.mime_type || 'application/octet-stream',
              source: 'supabase'
            });
          } else {
            console.log(`[getQuoteFilesFromSupabase] File ${file.filename} is soft-deleted in local DB, excluding`);
          }
        }
        
        return filteredFiles;
      }
    } catch (dbError) {
      console.log(`[getQuoteFilesFromSupabase] Database query failed (table may not exist or have wrong structure):`, dbError.message);
    }

    // If no database records found OR table doesn't exist, try to list files from storage directly
    console.log(`[getQuoteFilesFromSupabase] No database records found, checking storage directly for quote ${quoteNo}`);
    
    // First, find which customer folder contains this quote
    let customerFolder = null;
    try {
      const { data: customerFolders, error: customerError } = await supabase.storage
        .from('quote-files')
        .list('quotes', { limit: 100 });
        
      console.log(`[getQuoteFilesFromSupabase] Found customer folders:`, customerFolders?.map(f => f.name) || []);
      
      if (!customerError && customerFolders) {
        // Check each customer folder for the quote
        for (const folder of customerFolders) {
          const { data: quoteFolders, error: quoteError } = await supabase.storage
            .from('quote-files')
            .list(`quotes/${folder.name}`, { limit: 100 });
            
          if (!quoteError && quoteFolders) {
            const quoteFolder = quoteFolders.find(qf => qf.name === quoteNo);
            if (quoteFolder) {
              customerFolder = folder.name;
              console.log(`[getQuoteFilesFromSupabase] Found quote ${quoteNo} in customer folder: ${customerFolder}`);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.log(`[getQuoteFilesFromSupabase] Error searching customer folders:`, error.message);
    }
    
    // Try multiple storage path patterns
    const searchPaths = [
      customerFolder ? `quotes/${customerFolder}/${quoteNo}` : null,           // /quotes/SLB/SCM-Q0062/
      customerFolder ? `quotes/${customerFolder}/${quoteNo}/drawings` : null, // /quotes/SLB/SCM-Q0062/drawings/
      `quotes/${quoteNo}`,           // /quotes/SCM-Q0062/
      `quotes`,                      // /quotes/ (then filter)
      `${quoteNo}`,                  // /SCM-Q0062/
    ].filter(Boolean); // Remove null entries
    
    let allFiles = [];
    
    for (const searchPath of searchPaths) {
      try {
        const { data: storageFiles, error: storageError } = await supabase.storage
          .from('quote-files')
          .list(searchPath, { 
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' }
          });
          
        console.log(`[getQuoteFilesFromSupabase] Storage search in "${searchPath}":`, { 
          count: storageFiles?.length || 0, 
          error: storageError?.message,
          files: storageFiles?.map(f => f.name).slice(0, 3) // Show first 3 filenames
        });
        
        if (!storageError && storageFiles && storageFiles.length > 0) {
          // Filter files that contain the quote number or add all if searching in quote-specific folder
          const relevantFiles = searchPath.includes(quoteNo) 
            ? storageFiles 
            : storageFiles.filter(file => file.name.includes(quoteNo));
            
          // Exclude soft-deleted files (files in _deleted folders) AND folders
          const nonDeletedFiles = relevantFiles.filter(file => {
            const isNotDeleted = !searchPath.includes('_deleted') && !file.name.includes('_deleted');
            const isNotFolder = file.metadata && file.metadata.mimetype !== null; // Folders have null mimetype
            const isNotSystemFolder = !['drawings', 'uploads', 'vendors', 'notes', 'exports', '_deleted'].includes(file.name);
            const hasValidName = file.name && file.name.trim() !== '' && !file.name.startsWith('.');
            
            return isNotDeleted && isNotFolder && isNotSystemFolder && hasValidName;
          });
          
          // Additional verification: check if each file still exists in its original location
          const verifiedFiles = [];
          for (const file of nonDeletedFiles) {
            try {
              const filePath = `${searchPath}/${file.name}`;
              const { data: fileExists, error: checkError } = await supabase.storage
                .from('quote-files')
                .list(searchPath, { search: file.name });
                
              if (!checkError && fileExists && fileExists.length > 0) {
                // Double-check it's not in the deleted folder
                const deletedPath = searchPath.replace(/\/[^/]+$/, '/_deleted/$1');
                const { data: deletedExists, error: deletedError } = await supabase.storage
                  .from('quote-files')
                  .list(deletedPath, { search: file.name });
                  
                if (deletedError || !deletedExists || deletedExists.length === 0) {
                  verifiedFiles.push(file);
                } else {
                  console.log(`[getQuoteFilesFromSupabase] File ${file.name} found in deleted folder, excluding`);
                }
              } else {
                console.log(`[getQuoteFilesFromSupabase] File ${file.name} no longer exists in original location`);
              }
            } catch (verifyError) {
              console.log(`[getQuoteFilesFromSupabase] Error verifying file ${file.name}:`, verifyError.message);
              // Include file if verification fails (conservative approach)
              verifiedFiles.push(file);
            }
          }
            
          if (verifiedFiles.length > 0) {
            console.log(`[getQuoteFilesFromSupabase] Found ${verifiedFiles.length} verified non-deleted files in path "${searchPath}"`);
            allFiles.push(...verifiedFiles.map(file => ({ ...file, searchPath })));
          }
        }
      } catch (pathError) {
        console.log(`[getQuoteFilesFromSupabase] Error searching path "${searchPath}":`, pathError.message);
      }
    }
    
    if (allFiles.length === 0) {
      console.log(`[getQuoteFilesFromSupabase] No files found in any storage path for quote ${quoteNo}`);
      return [];
    }

    const files = allFiles
      .filter(file => file.name !== '.emptyFolderPlaceholder') // Filter out placeholder files
      .filter(file => {
        // Check if file is soft-deleted in the local database using helper function
        if (isFileSoftDeleted(file.name, quoteNo)) {
          console.log(`[getQuoteFilesFromSupabase] File ${file.name} is soft-deleted, excluding`);
          return false; // Exclude soft-deleted files
        }
        return true; // Include non-deleted files
      })
      .map(file => {
        const fullPath = file.searchPath ? `${file.searchPath}/${file.name}` : file.name;
        const { data: { publicUrl } } = supabase.storage
          .from('quote-files')
          .getPublicUrl(fullPath);
          
        return {
          name: file.name,
          originalname: file.name,
          size: file.metadata?.size || 0,
          subdir: 'drawings', // Default since we can't determine from storage alone
          url: publicUrl,
          path: fullPath,
          modifiedAt: new Date(file.created_at || file.updated_at),
          mime: file.metadata?.mimetype || 'application/octet-stream',
          source: 'supabase-storage'
        };
      });
      
    console.log(`[getQuoteFilesFromSupabase] Returning ${files.length} files from storage`);
    return files;  } catch (error) {
    console.error('Error fetching quote files from Supabase:', error);
    return [];
  }
}

// Create customer folder in Supabase (metadata only - storage is created on upload)
export async function createCustomerFolderInSupabase(customerName) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  try {
    // In Supabase, we don't need to explicitly create folders
    // They're created automatically when files are uploaded
    // But we can save customer metadata if needed
    console.log(`Customer folder concept created for: ${customerName} (Supabase ready)`);
    return true;
  } catch (error) {
    console.error('Error creating customer folder in Supabase:', error);
    return false;
  }
}

// Soft delete quote in Supabase
export async function softDeleteQuoteInSupabase(quoteNo, customerName) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  try {
    // Mark files as deleted rather than actually deleting them
    const { error } = await supabase
      .from('quote_files')
      .update({ 
        deleted_at: new Date().toISOString(),
        status: 'deleted'
      })
      .eq('quote_no', quoteNo)
      .eq('customer_name', customerName);
      
    if (error && error.code !== 'PGRST116') {
      console.error('Failed to soft delete quote files in Supabase:', error);
      return false;
    }
    
    console.log(`Soft deleted quote ${quoteNo} files in Supabase`);
    return true;
  } catch (error) {
    console.error('Error soft deleting quote in Supabase:', error);
    return false;
  }
}

// Get OpenAI API key from settings
export function getOpenAIApiKey() {
  try {
    const row = db.prepare("SELECT value FROM kv_store WHERE key = 'OPENAI_API_KEY'").get();
    return row?.value || null;
  } catch (error) {
    console.error('Failed to get OpenAI API key:', error);
    return null;
  }
}

// Ensure Supabase quotes table exists
export async function ensureSupabaseQuotesTable() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.log('Supabase not configured, skipping quotes table creation');
    return false;
  }

  try {
    // Check if quotes table exists by trying to query it
    const { data, error } = await supabase
      .from('quotes')
      .select('quote_no')
      .limit(1);

    if (!error) {
      console.log('Supabase quotes table already exists');
      return true;
    }

    // If table doesn't exist, log instructions for manual creation
    console.log('='.repeat(80));
    console.log('SUPABASE TABLES SETUP REQUIRED');
    console.log('='.repeat(80));
    console.log('Please create these tables in your Supabase dashboard:');
    console.log('');
    console.log(`-- Quotes table with soft delete support
CREATE TABLE IF NOT EXISTS quotes (
  id BIGSERIAL PRIMARY KEY,
  quote_no TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  description TEXT,
  requested_by TEXT,
  estimator TEXT,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  sales_order_no TEXT,
  rev INTEGER NOT NULL DEFAULT 0,
  app_state JSONB,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table for soft delete support
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_name);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_no ON quotes(quote_no);
CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON quotes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted_at);

-- Enable Row Level Security (optional)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    `);
    console.log('='.repeat(80));
    
    return false;
  } catch (error) {
    console.warn('Could not verify Supabase quotes table:', error.message);
    return false;
  }
}
