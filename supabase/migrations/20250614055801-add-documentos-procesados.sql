CREATE TABLE public.documentos_procesados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  extracted_text TEXT,
  confidence NUMERIC,
  mercancias_count INTEGER,
  errors TEXT,
  carta_porte_id UUID,
  documento_original_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos_procesados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert documentos_procesados" ON public.documentos_procesados
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view documentos_procesados" ON public.documentos_procesados
  FOR SELECT USING (true);
