-- Tabla para tracking de solicitudes de cancelación
CREATE TABLE IF NOT EXISTS public.solicitudes_cancelacion_cfdi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  carta_porte_id UUID REFERENCES public.cartas_porte(id) ON DELETE CASCADE,
  uuid_cfdi TEXT NOT NULL,
  rfc_emisor TEXT NOT NULL,
  rfc_receptor TEXT,
  motivo_cancelacion TEXT NOT NULL CHECK (motivo_cancelacion IN ('01', '02', '03', '04')),
  folio_sustitucion TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'cancelado', 'rechazado', 'error')),
  acuse_cancelacion TEXT,
  mensaje_error TEXT,
  codigo_respuesta TEXT,
  requiere_aceptacion BOOLEAN DEFAULT false,
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_procesamiento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_solicitudes_cancelacion_user ON public.solicitudes_cancelacion_cfdi(user_id);
CREATE INDEX idx_solicitudes_cancelacion_uuid ON public.solicitudes_cancelacion_cfdi(uuid_cfdi);
CREATE INDEX idx_solicitudes_cancelacion_estado ON public.solicitudes_cancelacion_cfdi(estado);
CREATE INDEX idx_solicitudes_cancelacion_carta_porte ON public.solicitudes_cancelacion_cfdi(carta_porte_id);

-- RLS policies
ALTER TABLE public.solicitudes_cancelacion_cfdi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias solicitudes de cancelación"
ON public.solicitudes_cancelacion_cfdi FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear solicitudes de cancelación"
ON public.solicitudes_cancelacion_cfdi FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias solicitudes"
ON public.solicitudes_cancelacion_cfdi FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_solicitudes_cancelacion_updated_at
BEFORE UPDATE ON public.solicitudes_cancelacion_cfdi
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Agregar campos de cancelación a cartas_porte si no existen
ALTER TABLE public.cartas_porte 
ADD COLUMN IF NOT EXISTS cancelable TEXT,
ADD COLUMN IF NOT EXISTS estatus_cancelacion TEXT,
ADD COLUMN IF NOT EXISTS fecha_cancelacion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT;