
-- Crear la tabla documentos_procesados con todas las columnas necesarias
CREATE TABLE public.documentos_procesados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  document_type TEXT NOT NULL,
  extracted_text TEXT,
  confidence NUMERIC NOT NULL DEFAULT 0,
  mercancias_count INTEGER NOT NULL DEFAULT 0,
  errors TEXT,
  carta_porte_id UUID,
  documento_original_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.documentos_procesados ENABLE ROW LEVEL SECURITY;

-- Crear función RPC para obtener documentos procesados del usuario
CREATE OR REPLACE FUNCTION public.get_documentos_procesados(user_uuid uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  file_path text,
  document_type text,
  extracted_text text,
  confidence numeric,
  mercancias_count integer,
  errors text,
  carta_porte_id uuid,
  documento_original_id uuid,
  metadata jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.user_id,
    dp.file_path,
    dp.document_type,
    dp.extracted_text,
    dp.confidence,
    dp.mercancias_count,
    dp.errors,
    dp.carta_porte_id,
    dp.documento_original_id,
    dp.metadata,
    dp.created_at
  FROM public.documentos_procesados dp
  WHERE dp.user_id = user_uuid
  ORDER BY dp.created_at DESC;
END;
$$;

-- Políticas RLS restrictivas
CREATE POLICY "Users can view own processed documents" ON public.documentos_procesados
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processed documents" ON public.documentos_procesados
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own processed documents" ON public.documentos_procesados
  FOR DELETE USING (auth.uid() = user_id);
