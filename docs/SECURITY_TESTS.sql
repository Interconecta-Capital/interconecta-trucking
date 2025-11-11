-- ============================================================================
-- PRUEBAS DE SEGURIDAD AUTOMATIZADAS
-- ============================================================================
-- Ejecutar estas queries para verificar la seguridad del sistema
-- Fecha: 2025-11-11
-- ============================================================================

-- =============================================================================
-- TEST 1: Verificar que funciones inseguras fueron eliminadas
-- =============================================================================
-- Resultado esperado: 0 filas
SELECT 
  proname as funcion_eliminada,
  '❌ CRÍTICO: Esta función no debería existir' as problema
FROM pg_proc 
WHERE proname IN (
  'is_superuser_optimized',
  'is_superuser_simple', 
  'check_superuser_safe_v2',
  'is_admin_user'
);

-- Si retorna filas, ejecutar:
-- DROP FUNCTION IF EXISTS is_superuser_optimized() CASCADE;
-- DROP FUNCTION IF EXISTS is_superuser_simple(uuid) CASCADE;
-- DROP FUNCTION IF EXISTS check_superuser_safe_v2(uuid) CASCADE;
-- DROP FUNCTION IF EXISTS is_admin_user() CASCADE;

-- =============================================================================
-- TEST 2: Verificar que funciones seguras existen
-- =============================================================================
-- Resultado esperado: 3 filas
SELECT 
  proname as funcion_segura,
  '✅ Función segura presente' as estado
FROM pg_proc 
WHERE proname IN (
  'is_superuser_secure',
  'is_admin_or_superuser',
  'has_role'
);

-- Si faltan funciones, revisar migración base

-- =============================================================================
-- TEST 3: Verificar search_path en funciones SECURITY DEFINER
-- =============================================================================
SELECT 
  proname as function_name,
  CASE 
    WHEN proconfig IS NULL THEN '❌ FALTA search_path'
    WHEN 'search_path=public' = ANY(proconfig) OR 'search_path=public, pg_catalog' = ANY(proconfig) 
      THEN '✅ Configurado correctamente'
    ELSE '⚠️ Revisar configuración'
  END as search_path_status,
  proconfig as configuracion
FROM pg_proc 
WHERE prosecdef = true 
  AND pronamespace = 'public'::regnamespace
ORDER BY search_path_status, proname;

-- =============================================================================
-- TEST 4: Verificar políticas RLS usan funciones seguras
-- =============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE
    WHEN qual LIKE '%is_superuser_optimized%' OR with_check LIKE '%is_superuser_optimized%' 
      THEN '❌ USA FUNCIÓN INSEGURA: is_superuser_optimized'
    WHEN qual LIKE '%is_superuser_simple%' OR with_check LIKE '%is_superuser_simple%' 
      THEN '❌ USA FUNCIÓN INSEGURA: is_superuser_simple'
    WHEN qual LIKE '%check_superuser_safe_v2%' OR with_check LIKE '%check_superuser_safe_v2%' 
      THEN '❌ USA FUNCIÓN INSEGURA: check_superuser_safe_v2'
    WHEN qual LIKE '%is_admin_user%' OR with_check LIKE '%is_admin_user%' 
      THEN '❌ USA FUNCIÓN INSEGURA: is_admin_user'
    WHEN qual LIKE '%raw_user_meta_data%' OR with_check LIKE '%raw_user_meta_data%' 
      THEN '❌ USA raw_user_meta_data DIRECTAMENTE'
    WHEN qual LIKE '%is_superuser_secure%' OR with_check LIKE '%is_superuser_secure%' 
      THEN '✅ USA is_superuser_secure'
    WHEN qual LIKE '%is_admin_or_superuser%' OR with_check LIKE '%is_admin_or_superuser%' 
      THEN '✅ USA is_admin_or_superuser'
    WHEN qual LIKE '%has_role%' OR with_check LIKE '%has_role%' 
      THEN '✅ USA has_role'
    ELSE '⚠️ Revisar manualmente'
  END as seguridad_status,
  substring(qual, 1, 100) as condicion_preview
FROM pg_policies 
WHERE schemaname = 'public'
  AND (
    qual LIKE '%superuser%' OR qual LIKE '%admin%' OR
    with_check LIKE '%superuser%' OR with_check LIKE '%admin%'
  )
ORDER BY seguridad_status, tablename;

-- =============================================================================
-- TEST 5: Verificar RLS habilitado en todas las tablas públicas
-- =============================================================================
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Habilitado'
    ELSE '❌ RLS DESHABILITADO - CRÍTICO'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT IN ('schema_version') -- Excluir tablas del sistema
ORDER BY rls_status, tablename;

-- =============================================================================
-- TEST 6: Detectar intentos de ataque en logs
-- =============================================================================
SELECT 
  event_type,
  COUNT(*) as total_intentos,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  MAX(created_at) as ultimo_intento,
  jsonb_agg(DISTINCT event_data->>'reason') as razones
FROM security_audit_log
WHERE created_at > NOW() - INTERVAL '7 days'
  AND event_type IN (
    'csrf_validation_failed',
    'session_validation_failed',
    'failed_login',
    'rate_limit_exceeded',
    'suspicious_activity'
  )
GROUP BY event_type
ORDER BY total_intentos DESC;

-- =============================================================================
-- TEST 7: Usuarios con intentos sospechosos repetidos
-- =============================================================================
SELECT 
  user_id,
  event_type,
  COUNT(*) as intentos_fallidos,
  MAX(created_at) as ultimo_intento,
  jsonb_agg(DISTINCT ip_address) as ips_origen
FROM security_audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND event_type IN (
    'csrf_validation_failed',
    'session_validation_failed',
    'failed_login'
  )
GROUP BY user_id, event_type
HAVING COUNT(*) > 5 -- Más de 5 intentos fallidos
ORDER BY intentos_fallidos DESC;

-- =============================================================================
-- TEST 8: Verificar que user_roles contiene los roles correctos
-- =============================================================================
SELECT 
  role,
  COUNT(*) as total_usuarios,
  jsonb_agg(user_id) as usuarios
FROM user_roles
GROUP BY role
ORDER BY role;

-- =============================================================================
-- TEST 9: Buscar políticas con auth.uid() sin user_id check
-- =============================================================================
-- Detectar políticas que podrían exponer datos sin verificar user_id
SELECT 
  schemaname,
  tablename,
  policyname,
  '⚠️ Política sin verificación de user_id' as alerta,
  qual as condicion
FROM pg_policies 
WHERE schemaname = 'public'
  AND (
    (qual NOT LIKE '%user_id%' AND qual NOT LIKE '%usuario_id%')
    OR qual = 'true'
  )
  AND cmd IN ('SELECT', 'UPDATE', 'DELETE')
ORDER BY tablename;

-- =============================================================================
-- TEST 10: Verificar integridad de cifrado de documentos
-- =============================================================================
SELECT 
  'conductores' as tabla,
  COUNT(*) as total_registros,
  COUNT(foto_licencia_url) as docs_licencia,
  COUNT(foto_licencia_encrypted) as docs_licencia_cifrados,
  COUNT(foto_identificacion_url) as docs_identificacion,
  COUNT(foto_identificacion_encrypted) as docs_identificacion_cifrados,
  CASE 
    WHEN COUNT(foto_licencia_url) = COUNT(foto_licencia_encrypted) 
      AND COUNT(foto_identificacion_url) = COUNT(foto_identificacion_encrypted)
    THEN '✅ Todos cifrados'
    ELSE '⚠️ Hay documentos sin cifrar'
  END as estado_cifrado
FROM conductores
WHERE activo = true

UNION ALL

SELECT 
  'vehiculos',
  COUNT(*),
  COUNT(tarjeta_circulacion_url),
  COUNT(tarjeta_circulacion_encrypted),
  COUNT(poliza_seguro_url),
  COUNT(poliza_seguro_encrypted),
  CASE 
    WHEN COUNT(tarjeta_circulacion_url) = COUNT(tarjeta_circulacion_encrypted)
      AND COUNT(poliza_seguro_url) = COUNT(poliza_seguro_encrypted)
    THEN '✅ Todos cifrados'
    ELSE '⚠️ Hay documentos sin cifrar'
  END
FROM vehiculos
WHERE activo = true

UNION ALL

SELECT 
  'socios',
  COUNT(*),
  COUNT(constancia_fiscal_url),
  COUNT(constancia_fiscal_encrypted),
  COUNT(identificacion_url),
  COUNT(identificacion_encrypted),
  CASE 
    WHEN COUNT(constancia_fiscal_url) = COUNT(constancia_fiscal_encrypted)
      AND COUNT(identificacion_url) = COUNT(identificacion_encrypted)
    THEN '✅ Todos cifrados'
    ELSE '⚠️ Hay documentos sin cifrar'
  END
FROM socios
WHERE activo = true;

-- =============================================================================
-- RESUMEN EJECUTIVO DE SEGURIDAD
-- =============================================================================
SELECT 
  'RESUMEN DE SEGURIDAD' as categoria,
  jsonb_build_object(
    'funciones_inseguras_eliminadas', (
      SELECT COUNT(*) = 0 FROM pg_proc 
      WHERE proname IN ('is_superuser_optimized', 'is_superuser_simple', 'check_superuser_safe_v2', 'is_admin_user')
    ),
    'funciones_seguras_presentes', (
      SELECT COUNT(*) = 3 FROM pg_proc 
      WHERE proname IN ('is_superuser_secure', 'is_admin_or_superuser', 'has_role')
    ),
    'tablas_con_rls', (
      SELECT COUNT(*) FROM pg_tables 
      WHERE schemaname = 'public' AND rowsecurity = true
    ),
    'intentos_ataque_7dias', (
      SELECT COUNT(*) FROM security_audit_log
      WHERE created_at > NOW() - INTERVAL '7 days'
        AND event_type IN ('csrf_validation_failed', 'session_validation_failed', 'failed_login')
    ),
    'ultima_migracion_seguridad', (
      SELECT MAX(created_at) FROM security_audit_log
      WHERE event_type = 'security_migration_complete'
    )
  ) as metricas
;

-- =============================================================================
-- INSTRUCCIONES DE USO
-- =============================================================================
-- 1. Copiar este archivo completo
-- 2. Ir a: https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/sql/new
-- 3. Pegar las queries
-- 4. Ejecutar cada bloque por separado
-- 5. Revisar resultados:
--    - ✅ = Todo correcto
--    - ⚠️ = Revisar manualmente
--    - ❌ = Requiere acción inmediata
--
-- 6. Documentar hallazgos en el checklist de remediación
-- ============================================================================