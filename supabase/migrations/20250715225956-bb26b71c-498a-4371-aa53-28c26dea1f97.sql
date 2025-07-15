-- Crear tabla para cotizaciones
CREATE TABLE public.cotizaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_cotizacion VARCHAR NOT NULL,
  folio_cotizacion VARCHAR UNIQUE NOT NULL DEFAULT 'COT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || LPAD(EXTRACT(HOUR FROM NOW())::TEXT, 2, '0') || LPAD(EXTRACT(MINUTE FROM NOW())::TEXT, 2, '0'),
  estado VARCHAR NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'aprobada', 'cancelada')),
  
  -- Información del cliente
  cliente_tipo VARCHAR NOT NULL DEFAULT 'nuevo' CHECK (cliente_tipo IN ('nuevo', 'existente')),
  cliente_existente_id UUID REFERENCES public.clientes_proveedores(id),
  cliente_nuevo_datos JSONB DEFAULT '{}',
  
  -- Información de la empresa (usuario)
  empresa_datos JSONB NOT NULL DEFAULT '{}',
  
  -- Datos de la ruta y viaje
  origen VARCHAR NOT NULL,
  destino VARCHAR NOT NULL,
  ubicaciones_intermedias JSONB DEFAULT '[]',
  distancia_total NUMERIC,
  tiempo_estimado INTEGER, -- en minutos
  mapa_datos JSONB DEFAULT '{}', -- coordenadas, geometría de ruta
  
  -- Recursos asignados
  vehiculo_id UUID REFERENCES public.vehiculos(id),
  conductor_id UUID REFERENCES public.conductores(id),
  remolque_id UUID,
  
  -- Datos de costos (internos)
  costos_internos JSONB NOT NULL DEFAULT '{}', -- combustible, casetas, salarios, etc.
  margen_ganancia NUMERIC NOT NULL DEFAULT 0, -- porcentaje de ganancia deseado
  costo_total_interno NUMERIC NOT NULL DEFAULT 0,
  precio_cotizado NUMERIC NOT NULL DEFAULT 0,
  
  -- Información adicional
  notas_internas TEXT,
  condiciones_comerciales TEXT,
  tiempo_validez_dias INTEGER DEFAULT 15,
  
  -- Metadatos
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_envio TIMESTAMP WITH TIME ZONE,
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  fecha_vencimiento TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can manage their own cotizaciones" 
ON public.cotizaciones 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_cotizaciones_updated_at
BEFORE UPDATE ON public.cotizaciones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejor rendimiento
CREATE INDEX idx_cotizaciones_user_id ON public.cotizaciones(user_id);
CREATE INDEX idx_cotizaciones_estado ON public.cotizaciones(estado);
CREATE INDEX idx_cotizaciones_folio ON public.cotizaciones(folio_cotizacion);
CREATE INDEX idx_cotizaciones_fecha ON public.cotizaciones(created_at);

-- Tabla para historial de estados de cotizaciones
CREATE TABLE public.historial_cotizaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cotizacion_id UUID NOT NULL REFERENCES public.cotizaciones(id) ON DELETE CASCADE,
  estado_anterior VARCHAR,
  estado_nuevo VARCHAR NOT NULL,
  comentarios TEXT,
  cambiado_por UUID NOT NULL,
  fecha_cambio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- RLS para historial
ALTER TABLE public.historial_cotizaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cotization history" 
ON public.historial_cotizaciones 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.cotizaciones c 
  WHERE c.id = historial_cotizaciones.cotizacion_id 
  AND c.user_id = auth.uid()
));

-- Trigger para registrar cambios de estado
CREATE OR REPLACE FUNCTION public.registrar_cambio_estado_cotizacion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO public.historial_cotizaciones (
      cotizacion_id, 
      estado_anterior, 
      estado_nuevo, 
      cambiado_por
    ) VALUES (
      NEW.id, 
      OLD.estado, 
      NEW.estado, 
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cambio_estado_cotizacion
AFTER UPDATE ON public.cotizaciones
FOR EACH ROW
EXECUTE FUNCTION public.registrar_cambio_estado_cotizacion();