-- Step 1: First, let's see what duplicates exist
SELECT quote_no, customer_name, COUNT(*) as duplicate_count, 
       STRING_AGG(id::text, ', ' ORDER BY id) as record_ids
FROM quotes 
GROUP BY quote_no, customer_name 
HAVING COUNT(*) > 1
ORDER BY quote_no;

-- Step 2: Delete duplicate records, keeping only the one with the highest ID (latest)
WITH duplicates_to_delete AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY quote_no ORDER BY id DESC) as rn
  FROM quotes
)
DELETE FROM quotes 
WHERE id IN (
  SELECT id FROM duplicates_to_delete WHERE rn > 1
);

-- Step 3: Verify no duplicates remain
SELECT quote_no, customer_name, COUNT(*) as duplicate_count
FROM quotes 
GROUP BY quote_no, customer_name 
HAVING COUNT(*) > 1;

-- Step 4: Now create the unique constraint
ALTER TABLE quotes ADD CONSTRAINT quotes_quote_no_unique UNIQUE (quote_no);
