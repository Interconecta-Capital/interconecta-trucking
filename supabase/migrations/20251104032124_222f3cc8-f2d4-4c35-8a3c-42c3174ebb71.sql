-- ============================================
-- MIGRACIÓN: MODELO DE TIMBRES RENOVABLES MENSUALES
-- ============================================

-- 1. Agregar columna de timbres mensuales a planes
ALTER TABLE planes_suscripcion 
ADD COLUMN IF NOT EXISTS timbres_mensuales INT DEFAULT 0;

-- 2. Actualizar planes existentes con los nuevos límites
UPDATE planes_suscripcion 
SET timbres_mensuales = 0
WHERE nombre = 'Plan Gratuito';

UPDATE planes_suscripcion 
SET timbres_mensuales = 50,
    precio_mensual = 349.00
WHERE nombre = 'Plan Operador';

UPDATE planes_suscripcion 
SET timbres_mensuales = 200,
    precio_mensual = 799.00
WHERE nombre = 'Plan Flota';

UPDATE planes_suscripcion 
SET timbres_mensuales = 500,
    precio_mensual = 1499.00
WHERE nombre = 'Plan Enterprise' OR nombre = 'Plan Business';

-- 3. Agregar columnas para control de timbres mensuales en creditos_usuarios
ALTER TABLE creditos_usuarios 
ADD COLUMN IF NOT EXISTS timbres_mes_actual INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS fecha_renovacion DATE DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month');

-- 4. Migrar usuarios existentes: inicializar timbres según su plan actual
UPDATE creditos_usuarios cu
SET 
  timbres_mes_actual = COALESCE(
    (SELECT ps.timbres_mensuales 
     FROM suscripciones s 
     JOIN planes_suscripcion ps ON s.plan_id = ps.id 
     WHERE s.user_id = cu.user_id 
     AND s.status IN ('active', 'trial')
     LIMIT 1), 
    0
  ),
  fecha_renovacion = DATE_TRUNC('month', NOW() + INTERVAL '1 month')
WHERE EXISTS (
  SELECT 1 FROM suscripciones s 
  WHERE s.user_id = cu.user_id 
  AND s.status IN ('active', 'trial')
);

-- 5. Crear índices para optimizar consultas de renovación
CREATE INDEX IF NOT EXISTS idx_creditos_usuarios_fecha_renovacion 
ON creditos_usuarios(fecha_renovacion);

CREATE INDEX IF NOT EXISTS idx_planes_timbres_mensuales 
ON planes_suscripcion(timbres_mensuales);

-- 6. Crear vista para métricas de superusuarios
CREATE OR REPLACE VIEW admin_metricas_timbres AS
SELECT 
  -- Métricas generales
  COUNT(DISTINCT cu.user_id) as total_usuarios_activos,
  SUM(cu.timbres_mes_actual) as timbres_disponibles_total,
  SUM(cu.total_consumidos) as timbres_consumidos_historico,
  
  -- Consumo del mes actual
  (SELECT COUNT(*) 
   FROM transacciones_creditos tc 
   WHERE tc.tipo = 'consumo' 
   AND tc.created_at >= DATE_TRUNC('month', NOW())) as consumo_mes_actual,
  
  -- Consumo de la semana
  (SELECT COUNT(*) 
   FROM transacciones_creditos tc 
   WHERE tc.tipo = 'consumo' 
   AND tc.created_at >= DATE_TRUNC('week', NOW())) as consumo_semana_actual,
  
  -- Consumo del día
  (SELECT COUNT(*) 
   FROM transacciones_creditos tc 
   WHERE tc.tipo = 'consumo' 
   AND tc.created_at >= DATE_TRUNC('day', NOW())) as consumo_dia_actual,
  
  -- Usuarios cerca de agotar (menos del 20%)
  COUNT(CASE 
    WHEN cu.timbres_mes_actual > 0 
    AND (cu.timbres_mes_actual::FLOAT / NULLIF(ps.timbres_mensuales, 0)) < 0.2 
    THEN 1 
  END) as usuarios_cerca_agotar,
  
  -- Tasa de conversión (últimos 30 días)
  (SELECT COUNT(DISTINCT s.user_id)
   FROM suscripciones s
   JOIN planes_suscripcion ps ON s.plan_id = ps.id
   WHERE ps.nombre != 'Plan Gratuito'
   AND s.fecha_inicio >= NOW() - INTERVAL '30 days') as conversiones_ultimo_mes,
  
  -- Total de usuarios en trial
  (SELECT COUNT(DISTINCT s.user_id)
   FROM suscripciones s
   JOIN planes_suscripcion ps ON s.plan_id = ps.id
   WHERE ps.nombre = 'Plan Gratuito'
   AND s.status = 'trial') as usuarios_gratuitos
  
FROM creditos_usuarios cu
LEFT JOIN suscripciones s ON s.user_id = cu.user_id AND s.status IN ('active', 'trial')
LEFT JOIN planes_suscripcion ps ON s.plan_id = ps.id;

-- 7. Crear vista para top usuarios por consumo
CREATE OR REPLACE VIEW admin_top_usuarios_consumo AS
SELECT 
  cu.user_id,
  u.email,
  ps.nombre as plan_nombre,
  cu.timbres_mes_actual,
  ps.timbres_mensuales as limite_mensual,
  cu.total_consumidos as total_historico,
  (ps.timbres_mensuales - cu.timbres_mes_actual) as consumidos_este_mes,
  ROUND(
    ((ps.timbres_mensuales - cu.timbres_mes_actual)::FLOAT / NULLIF(ps.timbres_mensuales, 0) * 100)::NUMERIC, 
    2
  ) as porcentaje_usado,
  (SELECT COUNT(*) 
   FROM transacciones_creditos tc 
   WHERE tc.user_id = cu.user_id 
   AND tc.tipo = 'consumo'
   AND tc.created_at >= DATE_TRUNC('month', NOW())) as timbres_mes_actual_count
FROM creditos_usuarios cu
JOIN auth.users u ON u.id = cu.user_id
LEFT JOIN suscripciones s ON s.user_id = cu.user_id AND s.status IN ('active', 'trial')
LEFT JOIN planes_suscripcion ps ON s.plan_id = ps.id
WHERE ps.timbres_mensuales > 0
ORDER BY (ps.timbres_mensuales - cu.timbres_mes_actual) DESC
LIMIT 50;

-- 8. Función para calcular proyección de consumo
CREATE OR REPLACE FUNCTION calcular_proyeccion_consumo()
RETURNS TABLE (
  proyeccion_mensual NUMERIC,
  dias_transcurridos INT,
  promedio_diario NUMERIC,
  estimado_fin_mes NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::NUMERIC as proyeccion_mensual,
    EXTRACT(DAY FROM NOW() - DATE_TRUNC('month', NOW()))::INT as dias_transcurridos,
    (COUNT(*)::NUMERIC / NULLIF(EXTRACT(DAY FROM NOW() - DATE_TRUNC('month', NOW())), 0)) as promedio_diario,
    (COUNT(*)::NUMERIC / NULLIF(EXTRACT(DAY FROM NOW() - DATE_TRUNC('month', NOW())), 0) * 30) as estimado_fin_mes
  FROM transacciones_creditos
  WHERE tipo = 'consumo'
  AND created_at >= DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE planes_suscripcion IS 'Planes de suscripción con timbres mensuales renovables';
COMMENT ON COLUMN planes_suscripcion.timbres_mensuales IS 'Cantidad de timbres que se renuevan cada mes';
COMMENT ON COLUMN creditos_usuarios.timbres_mes_actual IS 'Timbres disponibles para el mes actual (se renuevan el día 1)';
COMMENT ON COLUMN creditos_usuarios.fecha_renovacion IS 'Fecha en que se renovarán los timbres mensuales';