
-- Fix Security Definer View issue
-- The admin_creditos_dashboard view is missing the security_invoker option
-- This causes it to run with SECURITY DEFINER behavior by default
-- We need to set security_invoker=true to ensure it runs with the querying user's permissions

-- Drop and recreate the view with security_invoker option
DROP VIEW IF EXISTS public.admin_creditos_dashboard;

CREATE VIEW public.admin_creditos_dashboard
WITH (security_invoker=true)
AS
SELECT 
  count(DISTINCT user_id) AS usuarios_con_creditos,
  sum(balance_disponible) AS total_creditos_disponibles,
  sum(total_comprados) AS total_creditos_vendidos,
  sum(total_consumidos) AS total_creditos_consumidos,
  round(avg(balance_disponible), 2) AS promedio_balance_por_usuario,
  (
    SELECT count(*) 
    FROM transacciones_creditos
    WHERE tipo::text = 'compra'::text 
      AND created_at > (now() - '30 days'::interval)
  ) AS compras_ultimo_mes,
  (
    SELECT sum(cantidad) 
    FROM transacciones_creditos
    WHERE tipo::text = 'compra'::text 
      AND created_at > (now() - '30 days'::interval)
  ) AS creditos_vendidos_ultimo_mes
FROM creditos_usuarios;
