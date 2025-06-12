
-- Crear tabla para documentos de entidades
CREATE TABLE IF NOT EXISTS public.documentos_entidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entidad_tipo TEXT NOT NULL CHECK (entidad_tipo IN ('vehiculo', 'conductor', 'socio')),
  entidad_id UUID NOT NULL,
  tipo_documento TEXT NOT NULL,
  nombre_archivo TEXT NOT NULL,
  ruta_archivo TEXT NOT NULL,
  fecha_vencimiento DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar campos GPS a tabla vehiculos (solo si no existen)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehiculos' AND column_name='id_equipo_gps') THEN
    ALTER TABLE public.vehiculos ADD COLUMN id_equipo_gps TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehiculos' AND column_name='fecha_instalacion_gps') THEN
    ALTER TABLE public.vehiculos ADD COLUMN fecha_instalacion_gps DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehiculos' AND column_name='acta_instalacion_gps') THEN
    ALTER TABLE public.vehiculos ADD COLUMN acta_instalacion_gps TEXT;
  END IF;
END $$;

-- Crear tabla para historial de estados
CREATE TABLE IF NOT EXISTS public.historial_estados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entidad_tipo TEXT NOT NULL CHECK (entidad_tipo IN ('vehiculo', 'conductor', 'socio', 'viaje')),
  entidad_id UUID NOT NULL,
  estado_anterior TEXT,
  estado_nuevo TEXT NOT NULL,
  motivo TEXT,
  observaciones TEXT,
  fecha_cambio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cambiado_por UUID REFERENCES auth.users,
  automatico BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users NOT NULL
);

-- Crear tabla para programaciones/mantenimientos
CREATE TABLE IF NOT EXISTS public.programaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entidad_tipo TEXT NOT NULL CHECK (entidad_tipo IN ('vehiculo', 'conductor')),
  entidad_id UUID NOT NULL,
  tipo_programacion TEXT NOT NULL CHECK (tipo_programacion IN ('mantenimiento', 'revision', 'verificacion', 'seguro', 'licencia')),
  descripcion TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  sin_fecha_fin BOOLEAN NOT NULL DEFAULT false,
  estado TEXT NOT NULL DEFAULT 'programado' CHECK (estado IN ('programado', 'en_proceso', 'completado', 'cancelado')),
  observaciones TEXT,
  costo DECIMAL(10,2),
  proveedor TEXT,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar campos de estado a vehiculos (solo si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehiculos' AND column_name='estado') THEN
    ALTER TABLE public.vehiculos ADD COLUMN estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'en_viaje', 'mantenimiento', 'revision', 'fuera_servicio'));
  END IF;
END $$;

-- Agregar campos de estado a conductores (solo si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conductores' AND column_name='estado') THEN
    ALTER TABLE public.conductores ADD COLUMN estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'en_viaje', 'descanso', 'vacaciones', 'baja_temporal', 'fuera_servicio'));
  END IF;
END $$;

-- Agregar campos de estado a socios (solo si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='socios' AND column_name='estado') THEN
    ALTER TABLE public.socios ADD COLUMN estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'bloqueado', 'revision'));
  END IF;
END $$;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.documentos_entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programaciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para documentos_entidades
DROP POLICY IF EXISTS "Users can manage their own entity documents" ON public.documentos_entidades;
CREATE POLICY "Users can manage their own entity documents" ON public.documentos_entidades
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para historial_estados
DROP POLICY IF EXISTS "Users can view their own state history" ON public.historial_estados;
CREATE POLICY "Users can view their own state history" ON public.historial_estados
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para programaciones
DROP POLICY IF EXISTS "Users can manage their own schedules" ON public.programaciones;
CREATE POLICY "Users can manage their own schedules" ON public.programaciones
  FOR ALL USING (auth.uid() = user_id);

-- Función para crear notificación automática
CREATE OR REPLACE FUNCTION public.crear_notificacion_estado()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notificaciones (
    user_id,
    tipo,
    titulo,
    mensaje,
    entidad_tipo,
    entidad_id
  ) VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.estado_nuevo IN ('mantenimiento', 'revision', 'fuera_servicio') THEN 'warning'
      WHEN NEW.estado_nuevo = 'disponible' THEN 'success'
      ELSE 'info'
    END,
    'Cambio de Estado',
    format('%s cambió de %s a %s', 
      CASE NEW.entidad_tipo 
        WHEN 'vehiculo' THEN 'Vehículo'
        WHEN 'conductor' THEN 'Conductor'
        WHEN 'socio' THEN 'Socio'
        ELSE 'Entidad'
      END,
      COALESCE(NEW.estado_anterior, 'N/A'),
      NEW.estado_nuevo
    ),
    NEW.entidad_tipo,
    NEW.entidad_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificaciones automáticas de cambio de estado
DROP TRIGGER IF EXISTS trigger_notificacion_estado ON public.historial_estados;
CREATE TRIGGER trigger_notificacion_estado
  AFTER INSERT ON public.historial_estados
  FOR EACH ROW
  EXECUTE FUNCTION public.crear_notificacion_estado();
