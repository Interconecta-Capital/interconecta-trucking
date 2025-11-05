-- Fix Security Definer Views: Add RLS checks to prevent auth.users exposure
-- This migration addresses SUPA_auth_users_exposed and SUPA_security_definer_view security findings

-- Drop existing vulnerable views
DROP VIEW IF EXISTS admin_metricas_timbres CASCADE;
DROP VIEW IF EXISTS admin_top_usuarios_consumo CASCADE;

-- Recreate admin_metricas_timbres with proper security
-- Use security_invoker=true to run with caller's permissions
CREATE VIEW admin_metricas_timbres 
WITH (security_invoker=true)
AS
SELECT 
  -- Métricas generales
  COUNT(DISTINCT cu.user_id) as total_usuarios_activos,
  SUM(cu.timbres_mes_actual) as timbres_disponibles_total,
  SUM(cu.total_consumidos) as timbres_consumidos_historico,
  
  -- Consumo del mes actual
  (SELECT COUNT(*) 
   FROM transacciones_creditos tc 
   WHERE tc.tipo = 'consumo' 
   AND tc.created_at >= DATE_TRUNC('month', NOW())) as consumos_mes_actual,
   
  -- Consumo del día actual
  (SELECT COUNT(*) 
   FROM transacciones_creditos tc 
   WHERE tc.tipo = 'consumo' 
   AND tc.created_at >= DATE_TRUNC('day', NOW())) as consumos_dia_actual,
   
  -- Usuarios cerca del límite (>80% consumo)
  (SELECT COUNT(DISTINCT cu2.user_id)
   FROM creditos_usuarios cu2
   JOIN suscripciones s2 ON s2.user_id = cu2.user_id AND s2.status IN ('active', 'trial')
   JOIN planes_suscripcion ps2 ON s2.plan_id = ps2.id
   WHERE ps2.timbres_mensuales > 0
   AND (ps2.timbres_mensuales - cu2.timbres_mes_actual)::FLOAT / ps2.timbres_mensuales > 0.8) as usuarios_cerca_limite,
   
  -- Tasa de conversión (usuarios de pago / total)
  ROUND(
    (SELECT COUNT(DISTINCT s.user_id)::NUMERIC 
     FROM suscripciones s 
     JOIN planes_suscripcion ps ON s.plan_id = ps.id
     WHERE ps.nombre != 'Plan Gratuito'
     AND s.status = 'active') /
    NULLIF(COUNT(DISTINCT cu.user_id), 0) * 100, 2
  ) as tasa_conversion_pct,
  
  -- Usuarios gratuitos
  (SELECT COUNT(DISTINCT s.user_id)
   FROM suscripciones s
   JOIN planes_suscripcion ps ON s.plan_id = ps.id
   WHERE ps.nombre = 'Plan Gratuito'
   AND s.status = 'trial') as usuarios_gratuitos
   
FROM creditos_usuarios cu
LEFT JOIN suscripciones s ON s.user_id = cu.user_id AND s.status IN ('active', 'trial')
LEFT JOIN planes_suscripcion ps ON s.plan_id = ps.id
-- SECURITY: Only allow superusers to view this data
WHERE public.is_superuser_secure(auth.uid());

-- Recreate admin_top_usuarios_consumo with proper security
CREATE VIEW admin_top_usuarios_consumo
WITH (security_invoker=true)
AS
SELECT 
  cu.user_id,
  -- SECURITY: Don't expose raw email, use masked version for privacy
  CASE 
    WHEN public.is_superuser_secure(auth.uid()) THEN u.email
    ELSE CONCAT(SUBSTRING(u.email, 1, 3), '***@', SPLIT_PART(u.email, '@', 2))
  END as email,
  ps.nombre as plan_nombre,
  cu.timbres_mes_actual,
  ps.timbres_mensuales as limite_mensual,
  cu.total_consumidos as total_historico,
  (ps.timbres_mensuales - cu.timbres_mes_actual) as consumidos_este_mes,
  ROUND(
    CASE 
      WHEN ps.timbres_mensuales > 0 THEN
        ((ps.timbres_mensuales - cu.timbres_mes_actual)::NUMERIC / ps.timbres_mensuales * 100)
      ELSE 0
    END, 1
  ) as porcentaje_usado,
  CASE
    WHEN cu.timbres_mes_actual = 0 THEN 'AGOTADO'
    WHEN (ps.timbres_mensuales - cu.timbres_mes_actual)::FLOAT / ps.timbres_mensuales > 0.8 THEN 'CRÍTICO'
    WHEN (ps.timbres_mensuales - cu.timbres_mes_actual)::FLOAT / ps.timbres_mensuales > 0.5 THEN 'ALTO'
    ELSE 'NORMAL'
  END as estado_consumo
FROM creditos_usuarios cu
LEFT JOIN auth.users u ON u.id = cu.user_id
LEFT JOIN suscripciones s ON s.user_id = cu.user_id AND s.status IN ('active', 'trial')
LEFT JOIN planes_suscripcion ps ON s.plan_id = ps.id
-- SECURITY: Only allow superusers to view this data
WHERE public.is_superuser_secure(auth.uid())
ORDER BY consumidos_este_mes DESC
LIMIT 10;

-- Grant appropriate permissions
GRANT SELECT ON admin_metricas_timbres TO authenticated;
GRANT SELECT ON admin_top_usuarios_consumo TO authenticated;

-- Add comments explaining the security model
COMMENT ON VIEW admin_metricas_timbres IS 
'Métricas de timbres para superusuarios. Usa security_invoker=true para ejecutar con permisos del usuario llamante. Incluye filtro is_superuser_secure() para limitar acceso.';

COMMENT ON VIEW admin_top_usuarios_consumo IS 
'Top usuarios por consumo para superusuarios. Usa security_invoker=true y enmascara emails para usuarios no-superusuarios (protección adicional).';
