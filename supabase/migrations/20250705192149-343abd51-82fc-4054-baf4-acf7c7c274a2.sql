
-- Ampliar tabla conductores con métricas de performance
ALTER TABLE conductores ADD COLUMN IF NOT EXISTS historial_performance JSONB DEFAULT '{
  "viajes_completados": 0,
  "km_totales": 0,
  "calificacion_promedio": 5.0,
  "incidentes": 0,
  "eficiencia_combustible": 0,
  "puntualidad_promedio": 95,
  "costo_promedio_viaje": 0
}'::jsonb;

ALTER TABLE conductores ADD COLUMN IF NOT EXISTS certificaciones JSONB DEFAULT '{
  "materiales_peligrosos": false,
  "carga_especializada": false,
  "primeros_auxilios": false,
  "manejo_defensivo": false,
  "vigencias": {}
}'::jsonb;

ALTER TABLE conductores ADD COLUMN IF NOT EXISTS preferencias JSONB DEFAULT '{
  "rutas_preferidas": [],
  "tipos_carga": [],
  "disponibilidad_horarios": {},
  "radio_operacion_km": 500
}'::jsonb;

-- Crear tabla para calificaciones de conductores
CREATE TABLE IF NOT EXISTS calificaciones_conductores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conductor_id UUID REFERENCES conductores(id) ON DELETE CASCADE,
  viaje_id UUID,
  cliente_id UUID,
  calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
  comentarios TEXT,
  tipo_calificacion VARCHAR(50) DEFAULT 'cliente_a_conductor', -- cliente_a_conductor, conductor_a_cliente
  criterios JSONB DEFAULT '{}', -- puntualidad, trato, cuidado_carga, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL
);

-- RLS para calificaciones
ALTER TABLE calificaciones_conductores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conductor ratings"
ON calificaciones_conductores FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Crear tabla para métricas de performance detalladas
CREATE TABLE IF NOT EXISTS metricas_conductor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conductor_id UUID REFERENCES conductores(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  km_recorridos NUMERIC DEFAULT 0,
  combustible_consumido NUMERIC DEFAULT 0,
  viajes_completados INTEGER DEFAULT 0,
  entregas_a_tiempo INTEGER DEFAULT 0,
  total_entregas INTEGER DEFAULT 0,
  incidentes INTEGER DEFAULT 0,
  costo_total NUMERIC DEFAULT 0,
  ingresos_total NUMERIC DEFAULT 0,
  tiempo_conduccion_horas NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL
);

-- RLS para métricas
ALTER TABLE metricas_conductor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conductor metrics"
ON metricas_conductor FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Función para calcular métricas de performance
CREATE OR REPLACE FUNCTION calcular_performance_conductor(p_conductor_id UUID, p_user_id UUID)
RETURNS TABLE(
  eficiencia_combustible NUMERIC,
  puntualidad NUMERIC,
  cuidado_vehiculo NUMERIC,
  satisfaccion_cliente NUMERIC,
  tendencia_mejora BOOLEAN,
  areas_mejora TEXT[],
  fortalezas TEXT[],
  recomendaciones_capacitacion TEXT[],
  rutas_optimas TEXT[],
  tipos_carga_ideales TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  efic_combustible NUMERIC;
  punt_promedio NUMERIC;
  calif_promedio NUMERIC;
  cuidado_vh NUMERIC;
  mejora_bool BOOLEAN;
  areas_arr TEXT[];
  fort_arr TEXT[];
  rec_cap TEXT[];
  rutas_arr TEXT[];
  carga_arr TEXT[];
BEGIN
  -- Calcular eficiencia de combustible (últimos 30 días)
  SELECT COALESCE(AVG(
    CASE WHEN combustible_consumido > 0 
    THEN km_recorridos / combustible_consumido 
    ELSE 0 END
  ), 0) INTO efic_combustible
  FROM metricas_conductor 
  WHERE conductor_id = p_conductor_id 
    AND fecha >= CURRENT_DATE - INTERVAL '30 days';

  -- Calcular puntualidad
  SELECT COALESCE(AVG(
    CASE WHEN total_entregas > 0 
    THEN (entregas_a_tiempo::NUMERIC / total_entregas) * 100 
    ELSE 95 END
  ), 95) INTO punt_promedio
  FROM metricas_conductor 
  WHERE conductor_id = p_conductor_id 
    AND fecha >= CURRENT_DATE - INTERVAL '30 days';

  -- Calcular satisfacción del cliente
  SELECT COALESCE(AVG(calificacion::NUMERIC), 5.0) INTO calif_promedio
  FROM calificaciones_conductores 
  WHERE conductor_id = p_conductor_id 
    AND tipo_calificacion = 'cliente_a_conductor'
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';

  -- Simular cuidado del vehículo (basado en incidentes)
  SELECT CASE 
    WHEN SUM(incidentes) = 0 THEN 5.0
    WHEN SUM(incidentes) <= 2 THEN 4.0
    WHEN SUM(incidentes) <= 5 THEN 3.0
    ELSE 2.0
  END INTO cuidado_vh
  FROM metricas_conductor 
  WHERE conductor_id = p_conductor_id 
    AND fecha >= CURRENT_DATE - INTERVAL '30 days';

  -- Determinar tendencia de mejora
  mejora_bool := (calif_promedio >= 4.0 AND punt_promedio >= 90);

  -- Definir áreas de mejora
  areas_arr := ARRAY[]::TEXT[];
  IF punt_promedio < 85 THEN
    areas_arr := array_append(areas_arr, 'Puntualidad');
  END IF;
  IF efic_combustible < 8 THEN
    areas_arr := array_append(areas_arr, 'Eficiencia de combustible');
  END IF;
  IF calif_promedio < 4.0 THEN
    areas_arr := array_append(areas_arr, 'Satisfacción del cliente');
  END IF;

  -- Definir fortalezas
  fort_arr := ARRAY[]::TEXT[];
  IF punt_promedio >= 95 THEN
    fort_arr := array_append(fort_arr, 'Excelente puntualidad');
  END IF;
  IF calif_promedio >= 4.5 THEN
    fort_arr := array_append(fort_arr, 'Alta satisfacción del cliente');
  END IF;
  IF efic_combustible >= 10 THEN
    fort_arr := array_append(fort_arr, 'Manejo eficiente');
  END IF;

  -- Recomendaciones de capacitación
  rec_cap := ARRAY[]::TEXT[];
  IF punt_promedio < 90 THEN
    rec_cap := array_append(rec_cap, 'Gestión del tiempo');
  END IF;
  IF efic_combustible < 9 THEN
    rec_cap := array_append(rec_cap, 'Manejo eco-eficiente');
  END IF;
  IF calif_promedio < 4.0 THEN
    rec_cap := array_append(rec_cap, 'Atención al cliente');
  END IF;

  -- Rutas óptimas y tipos de carga (simplificado)
  rutas_arr := ARRAY['Ruta Regional', 'Distribución Urbana'];
  carga_arr := ARRAY['Carga General', 'Productos Perecederos'];

  RETURN QUERY SELECT 
    efic_combustible,
    punt_promedio,
    cuidado_vh,
    calif_promedio,
    mejora_bool,
    areas_arr,
    fort_arr,
    rec_cap,
    rutas_arr,
    carga_arr;
END;
$$;
