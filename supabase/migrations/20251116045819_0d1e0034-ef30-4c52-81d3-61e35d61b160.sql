-- =====================================================
-- CORRECCIÓN: Security Definer View (ERROR)
-- =====================================================
-- La vista facturas_stats no tiene security_invoker=true configurado,
-- lo que significa que se ejecuta con los permisos del creador de la vista
-- en lugar de los permisos del usuario que la consulta.
--
-- Esto representa un riesgo de seguridad porque bypasea las políticas RLS
-- del usuario que consulta la vista.
--
-- Solución: Alteramos la vista para que use security_invoker=true

-- Alterar la vista facturas_stats para que respete los permisos del usuario que consulta
ALTER VIEW facturas_stats SET (security_invoker = true);

-- Verificar que el cambio se aplicó correctamente
-- (Esta query es solo para verificación, no afecta la base de datos)
COMMENT ON VIEW facturas_stats IS 'Vista de estadísticas de facturas por usuario. Configurada con security_invoker=true para respetar las políticas RLS del usuario consultante.';