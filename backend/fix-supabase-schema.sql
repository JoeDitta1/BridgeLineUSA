-- Fix Supabase Schema for BridgeLineUSA
-- Run these commands in your Supabase SQL Editor

-- ===========================================
-- QUOTES TABLE FIXES
-- ===========================================

-- Add missing app_state column (required for quote saving)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS app_state JSONB;

-- Add soft delete support
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Ensure updated_at column exists (it should already exist based on our check)
-- ALTER TABLE quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ===========================================
-- QUOTE_FILES TABLE FIXES
-- ===========================================

-- Add missing columns for file metadata
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS stored_filename TEXT;
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS public_url TEXT;
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS subdir TEXT;
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS quote_no TEXT;
ALTER TABLE quote_files ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Quotes table indexes
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_name);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_no ON quotes(quote_no);
CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON quotes(deleted_at);

-- Quote files table indexes
CREATE INDEX IF NOT EXISTS idx_quote_files_quote_no ON quote_files(quote_no);
CREATE INDEX IF NOT EXISTS idx_quote_files_uploaded ON quote_files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_quote_files_deleted ON quote_files(deleted_at);
CREATE INDEX IF NOT EXISTS idx_quote_files_subdir ON quote_files(subdir);

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check quotes table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quotes'
ORDER BY ordinal_position;

-- Check quote_files table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quote_files'
ORDER BY ordinal_position;

-- Test quote insertion with app_state
-- INSERT INTO quotes (quote_no, customer_name, description, date, status, rev, app_state)
-- VALUES ('TEST-QUOTE', 'Test Customer', 'Schema test', CURRENT_DATE, 'Draft', 0, '{"test": "success"}'::jsonb);