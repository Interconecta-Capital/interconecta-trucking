-- Add columns to store PDF path and timbre data for cartas_porte
ALTER TABLE public.cartas_porte
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS timbre_data JSONB;
