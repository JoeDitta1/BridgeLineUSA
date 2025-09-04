ALTER TABLE quote_bom ADD COLUMN length_value REAL;
ALTER TABLE quote_bom ADD COLUMN length_unit  TEXT;   -- 'in','mm','ft'
ALTER TABLE quote_bom ADD COLUMN tol_plus     REAL;   -- numeric tolerance +
ALTER TABLE quote_bom ADD COLUMN tol_minus    REAL;   -- numeric tolerance -
ALTER TABLE quote_bom ADD COLUMN tol_unit     TEXT;   -- 'in','mm','ft'
