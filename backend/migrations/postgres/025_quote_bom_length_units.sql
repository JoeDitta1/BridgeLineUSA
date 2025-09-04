ALTER TABLE public.quote_bom
  ADD COLUMN IF NOT EXISTS length_value double precision,
  ADD COLUMN IF NOT EXISTS length_unit  text,
  ADD COLUMN IF NOT EXISTS tol_plus     double precision,
  ADD COLUMN IF NOT EXISTS tol_minus    double precision,
  ADD COLUMN IF NOT EXISTS tol_unit     text;
