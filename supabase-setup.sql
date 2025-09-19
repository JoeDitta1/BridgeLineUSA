-- BridgeLineUSA Supabase Tables Setup
-- Run this SQL in your Supabase dashboard SQL editor

-- Quotes table
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

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote files table
CREATE TABLE IF NOT EXISTS quote_files (
  id BIGSERIAL PRIMARY KEY,
  quote_no TEXT,
  quote_id TEXT,
  customer_name TEXT,
  filename TEXT NOT NULL,
  stored_filename TEXT,
  storage_path TEXT,
  public_url TEXT,
  subdir TEXT,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  size TEXT,
  unit_type TEXT,
  grade TEXT,
  weight_per_ft REAL,
  weight_per_sqin REAL,
  price_per_lb REAL,
  price_per_ft REAL,
  price_each REAL,
  description TEXT,
  pipe_schedule TEXT,
  pipe_schedule_num INTEGER,
  ai_searchable INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_name);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_no ON quotes(quote_no);
CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON quotes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_quote_files_quote_no ON quote_files(quote_no);
CREATE INDEX IF NOT EXISTS idx_quote_files_deleted ON quote_files(deleted_at);

-- Enable Row Level Security (optional - you can remove these if not needed)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;