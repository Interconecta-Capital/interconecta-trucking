
-- Create the mantenimientos_programados table
CREATE TABLE public.mantenimientos_programados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID REFERENCES public.vehiculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tipo_mantenimiento VARCHAR(50) NOT NULL CHECK (tipo_mantenimiento IN ('preventivo', 'correctivo', 'revision', 'emergencia')),
  descripcion TEXT NOT NULL,
  kilometraje_programado INTEGER,
  kilometraje_actual INTEGER,
  fecha_programada DATE NOT NULL,
  fecha_realizada DATE,
  costo_estimado DECIMAL(10,2),
  costo_real DECIMAL(10,2),
  taller_id UUID,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
  notas TEXT,
  documentos JSONB DEFAULT '[]'::jsonb,
  proximidad_alerta INTEGER DEFAULT 500, -- km antes de alertar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create talleres table for certified workshop network
CREATE TABLE public.talleres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  rfc VARCHAR(13),
  direccion JSONB NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(255),
  especialidades TEXT[] DEFAULT '{}',
  certificaciones TEXT[] DEFAULT '{}',
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  precios_promedio JSONB DEFAULT '{}'::jsonb,
  horarios JSONB DEFAULT '{}'::jsonb,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews_talleres table for workshop ratings
CREATE TABLE public.reviews_talleres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID REFERENCES public.talleres(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mantenimiento_id UUID REFERENCES public.mantenimientos_programados(id),
  calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  aspectos_calificados JSONB DEFAULT '{}'::jsonb, -- precio, calidad, tiempo, atencion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for mantenimientos_programados
ALTER TABLE public.mantenimientos_programados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own maintenance records"
ON public.mantenimientos_programados FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for talleres (public read, admin write)
ALTER TABLE public.talleres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view talleres"
ON public.talleres FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage talleres"
ON public.talleres FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Add RLS policies for reviews_talleres
ALTER TABLE public.reviews_talleres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reviews"
ON public.reviews_talleres FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view reviews"
ON public.reviews_talleres FOR SELECT
USING (true);

-- Create function to update taller ratings
CREATE OR REPLACE FUNCTION public.update_taller_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.talleres 
  SET 
    calificacion_promedio = (
      SELECT AVG(calificacion)::DECIMAL(3,2) 
      FROM public.reviews_talleres 
      WHERE taller_id = COALESCE(NEW.taller_id, OLD.taller_id)
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews_talleres 
      WHERE taller_id = COALESCE(NEW.taller_id, OLD.taller_id)
    )
  WHERE id = COALESCE(NEW.taller_id, OLD.taller_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update ratings
CREATE TRIGGER update_taller_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews_talleres
  FOR EACH ROW EXECUTE FUNCTION public.update_taller_rating();

-- Create function for maintenance alerts
CREATE OR REPLACE FUNCTION public.check_maintenance_alerts(p_user_id UUID)
RETURNS TABLE(
  vehiculo_id UUID,
  placa VARCHAR,
  tipo_alerta VARCHAR,
  descripcion TEXT,
  dias_restantes INTEGER,
  kilometros_restantes INTEGER,
  urgencia VARCHAR
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as vehiculo_id,
    v.placa,
    CASE 
      WHEN mp.fecha_programada <= CURRENT_DATE + INTERVAL '7 days' THEN 'fecha_proxima'
      WHEN (v.kilometraje_actual + 500) >= mp.kilometraje_programado THEN 'kilometraje_proximo'
      WHEN v.vigencia_seguro <= CURRENT_DATE + INTERVAL '30 days' THEN 'seguro_vence'
      WHEN v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '30 days' THEN 'verificacion_vence'
      ELSE 'general'
    END as tipo_alerta,
    CASE 
      WHEN mp.fecha_programada <= CURRENT_DATE + INTERVAL '7 days' THEN 
        'Mantenimiento ' || mp.tipo_mantenimiento || ' programado para ' || TO_CHAR(mp.fecha_programada, 'DD/MM/YYYY')
      WHEN (v.kilometraje_actual + 500) >= mp.kilometraje_programado THEN 
        'Próximo a alcanzar kilometraje de mantenimiento (' || mp.kilometraje_programado || ' km)'
      WHEN v.vigencia_seguro <= CURRENT_DATE + INTERVAL '30 days' THEN 
        'Seguro vence el ' || TO_CHAR(v.vigencia_seguro::date, 'DD/MM/YYYY')
      WHEN v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '30 days' THEN 
        'Verificación vence el ' || TO_CHAR(v.verificacion_vigencia::date, 'DD/MM/YYYY')
      ELSE mp.descripcion
    END as descripcion,
    COALESCE(
      EXTRACT(days FROM mp.fecha_programada - CURRENT_DATE)::INTEGER,
      EXTRACT(days FROM v.vigencia_seguro::date - CURRENT_DATE)::INTEGER,
      EXTRACT(days FROM v.verificacion_vigencia::date - CURRENT_DATE)::INTEGER,
      0
    ) as dias_restantes,
    COALESCE(
      mp.kilometraje_programado - v.kilometraje_actual,
      0
    ) as kilometros_restantes,
    CASE 
      WHEN mp.fecha_programada <= CURRENT_DATE + INTERVAL '3 days' OR 
           (v.kilometraje_actual + 100) >= mp.kilometraje_programado OR
           v.vigencia_seguro <= CURRENT_DATE + INTERVAL '7 days' OR
           v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgente'
      WHEN mp.fecha_programada <= CURRENT_DATE + INTERVAL '7 days' OR 
           (v.kilometraje_actual + 300) >= mp.kilometraje_programado OR
           v.vigencia_seguro <= CURRENT_DATE + INTERVAL '15 days' OR
           v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '15 days' THEN 'pronto'
      ELSE 'normal'
    END as urgencia
  FROM public.vehiculos v
  LEFT JOIN public.mantenimientos_programados mp ON v.id = mp.vehiculo_id AND mp.estado = 'pendiente'
  WHERE v.user_id = p_user_id 
    AND v.activo = true
    AND (
      mp.fecha_programada <= CURRENT_DATE + INTERVAL '30 days' OR
      (v.kilometraje_actual + 500) >= COALESCE(mp.kilometraje_programado, 999999) OR
      v.vigencia_seguro <= CURRENT_DATE + INTERVAL '30 days' OR
      v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '30 days'
    )
  ORDER BY 
    CASE 
      WHEN urgencia = 'urgente' THEN 1
      WHEN urgencia = 'pronto' THEN 2
      ELSE 3
    END,
    dias_restantes ASC;
END;
$$;
