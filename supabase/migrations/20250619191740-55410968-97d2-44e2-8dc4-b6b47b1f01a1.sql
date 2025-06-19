
-- Asegurar que la tabla borradores_carta_porte tenga la estructura correcta
CREATE TABLE IF NOT EXISTS public.borradores_carta_porte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nombre_borrador TEXT NOT NULL DEFAULT 'Borrador sin título',
  datos_formulario JSONB NOT NULL DEFAULT '{}',
  auto_saved BOOLEAN NOT NULL DEFAULT false,
  ultima_edicion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version_formulario TEXT NOT NULL DEFAULT '3.1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en borradores_carta_porte
ALTER TABLE public.borradores_carta_porte ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para borradores_carta_porte
DROP POLICY IF EXISTS "Users can manage their own borradores" ON public.borradores_carta_porte;
CREATE POLICY "Users can manage their own borradores" ON public.borradores_carta_porte
  FOR ALL USING (auth.uid() = user_id);

-- Crear tabla carta_porte_documentos para versionado de documentos
CREATE TABLE IF NOT EXISTS public.carta_porte_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carta_porte_id UUID REFERENCES public.cartas_porte(id) ON DELETE CASCADE NOT NULL,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('xml', 'pdf', 'xml_firmado', 'xml_timbrado')),
  version_documento TEXT NOT NULL DEFAULT 'v1.0',
  contenido_path TEXT,
  contenido_blob TEXT,
  metadatos JSONB DEFAULT '{}',
  fecha_generacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en carta_porte_documentos
ALTER TABLE public.carta_porte_documentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para carta_porte_documentos (basado en el owner de la carta porte)
DROP POLICY IF EXISTS "Users can manage documents of their own cartas porte" ON public.carta_porte_documentos;
CREATE POLICY "Users can manage documents of their own cartas porte" ON public.carta_porte_documentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = carta_porte_documentos.carta_porte_id 
      AND cp.usuario_id = auth.uid()
    )
  );

-- Actualizar tabla cartas_porte para el nuevo sistema
ALTER TABLE public.cartas_porte 
ADD COLUMN IF NOT EXISTS borrador_origen_id UUID REFERENCES public.borradores_carta_porte(id),
ADD COLUMN IF NOT EXISTS version_documento TEXT DEFAULT 'v1.0',
ADD COLUMN IF NOT EXISTS nombre_documento TEXT,
ADD COLUMN IF NOT EXISTS id_ccp TEXT UNIQUE;

-- Actualizar status para ser más específico
ALTER TABLE public.cartas_porte 
DROP CONSTRAINT IF EXISTS cartas_porte_status_check;

ALTER TABLE public.cartas_porte 
ADD CONSTRAINT cartas_porte_status_check 
CHECK (status IN ('draft', 'active', 'timbrado', 'cancelado'));

-- Trigger para actualizar ultima_edicion en borradores
CREATE OR REPLACE FUNCTION public.update_borrador_ultima_edicion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_edicion = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a borradores
DROP TRIGGER IF EXISTS trigger_update_borrador_edicion ON public.borradores_carta_porte;
CREATE TRIGGER trigger_update_borrador_edicion
  BEFORE UPDATE ON public.borradores_carta_porte
  FOR EACH ROW EXECUTE FUNCTION public.update_borrador_ultima_edicion();

-- Función para generar IdCCP único
CREATE OR REPLACE FUNCTION public.generar_id_ccp_unico()
RETURNS TEXT AS $$
DECLARE
  nuevo_id_ccp TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    -- Generar UUID y convertir a formato IdCCP
    nuevo_id_ccp := REPLACE(gen_random_uuid()::text, '-', '');
    nuevo_id_ccp := UPPER(SUBSTR(nuevo_id_ccp, 1, 36));
    
    -- Verificar que no exista
    SELECT EXISTS(
      SELECT 1 FROM public.cartas_porte 
      WHERE id_ccp = nuevo_id_ccp
    ) INTO existe;
    
    -- Si no existe, retornar
    IF NOT existe THEN
      RETURN nuevo_id_ccp;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
