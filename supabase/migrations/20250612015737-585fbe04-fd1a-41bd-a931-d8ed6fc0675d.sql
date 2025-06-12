
-- Create tracking_carta_porte table for storing tracking events
CREATE TABLE public.tracking_carta_porte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carta_porte_id UUID NOT NULL REFERENCES public.cartas_porte(id) ON DELETE CASCADE,
  evento VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  ubicacion VARCHAR,
  uuid_fiscal VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for better query performance
CREATE INDEX idx_tracking_carta_porte_carta_porte_id ON public.tracking_carta_porte(carta_porte_id);
CREATE INDEX idx_tracking_carta_porte_created_at ON public.tracking_carta_porte(created_at);

-- Enable Row Level Security
ALTER TABLE public.tracking_carta_porte ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (assuming we'll add user authentication later)
-- For now, allow all operations since there's no auth system in place
CREATE POLICY "Allow all operations on tracking_carta_porte" 
  ON public.tracking_carta_porte 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
