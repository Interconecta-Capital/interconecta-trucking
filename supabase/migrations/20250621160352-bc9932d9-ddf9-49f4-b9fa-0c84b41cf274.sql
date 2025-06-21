
-- =====================================================
-- BACKUP COMPLETO DE POLÍTICAS RLS - FASE 0 (CORRECCIÓN FINAL)
-- Fecha: 2025-06-21
-- Propósito: Capturar estado actual antes de refactorización
-- =====================================================

-- 1. Primero, limpiar cualquier intento anterior
DROP TABLE IF EXISTS public.rls_policies_backup CASCADE;
DROP TABLE IF EXISTS public.indices_backup CASCADE;
DROP TABLE IF EXISTS public.rls_refactor_audit CASCADE;
DROP VIEW IF EXISTS public.rls_analysis_view CASCADE;

-- 2. Crear tabla de backup para políticas existentes (corregida)
CREATE TABLE public.rls_policies_backup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  policy_command TEXT NOT NULL, -- SELECT, INSERT, UPDATE, DELETE, ALL
  policy_using TEXT, -- Cláusula USING (para SELECT, UPDATE, DELETE)
  policy_with_check TEXT, -- Cláusula WITH CHECK (para INSERT, UPDATE)
  is_permissive BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  backup_phase TEXT DEFAULT 'fase_0'
);

-- 3. Insertar todas las políticas actuales (capturando USING y WITH CHECK)
INSERT INTO public.rls_policies_backup (
  table_name, 
  policy_name, 
  policy_command, 
  policy_using, 
  policy_with_check,
  is_permissive
)
SELECT 
  schemaname||'.'||tablename as table_name,
  policyname as policy_name,
  cmd as policy_command,
  qual as policy_using, -- Puede ser NULL
  with_check as policy_with_check, -- Puede ser NULL
  (permissive = 'PERMISSIVE')::boolean as is_permissive -- Conversión correcta
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Crear función mejorada para restaurar políticas desde backup
CREATE OR REPLACE FUNCTION public.restore_rls_policies_from_backup()
RETURNS TEXT AS $$
DECLARE
  policy_record RECORD;
  restore_sql TEXT;
  result_text TEXT := '';
  using_clause TEXT := '';
  with_check_clause TEXT := '';
BEGIN
  FOR policy_record IN 
    SELECT * FROM public.rls_policies_backup 
    WHERE backup_phase = 'fase_0'
    ORDER BY table_name, policy_name
  LOOP
    -- Construir cláusula USING si existe
    IF policy_record.policy_using IS NOT NULL THEN
      using_clause := ' USING (' || policy_record.policy_using || ')';
    ELSE
      using_clause := '';
    END IF;
    
    -- Construir cláusula WITH CHECK si existe
    IF policy_record.policy_with_check IS NOT NULL THEN
      with_check_clause := ' WITH CHECK (' || policy_record.policy_with_check || ')';
    ELSE
      with_check_clause := '';
    END IF;
    
    restore_sql := format(
      'CREATE POLICY %I ON %s FOR %s%s%s;',
      policy_record.policy_name,
      policy_record.table_name,
      policy_record.policy_command,
      using_clause,
      with_check_clause
    );
    
    result_text := result_text || restore_sql || E'\n';
  END LOOP;
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear snapshot de índices actuales (simplificado para evitar errores)
CREATE TABLE public.indices_backup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  index_definition TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.indices_backup (index_name, table_name, index_definition)
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname NOT LIKE 'pg_%'
  AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- 6. Crear audit log para tracking de cambios
CREATE TABLE public.rls_refactor_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fase TEXT NOT NULL,
  accion TEXT NOT NULL,
  tabla_afectada TEXT,
  detalles JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID DEFAULT auth.uid()
);

-- 7. Registrar inicio de Fase 0 con estadísticas detalladas
INSERT INTO public.rls_refactor_audit (fase, accion, detalles)
VALUES ('fase_0', 'backup_completado', jsonb_build_object(
  'total_policies', (SELECT COUNT(*) FROM public.rls_policies_backup),
  'policies_with_using', (SELECT COUNT(*) FROM public.rls_policies_backup WHERE policy_using IS NOT NULL),
  'policies_with_check', (SELECT COUNT(*) FROM public.rls_policies_backup WHERE policy_with_check IS NOT NULL),
  'total_indices', (SELECT COUNT(*) FROM public.indices_backup),
  'backup_timestamp', NOW(),
  'tables_with_rls', (SELECT COUNT(DISTINCT table_name) FROM public.rls_policies_backup)
));

-- 8. Crear vista para análisis rápido de políticas
CREATE VIEW public.rls_analysis_view AS
SELECT 
  table_name,
  COUNT(*) as total_policies,
  COUNT(CASE WHEN policy_command = 'SELECT' THEN 1 END) as select_policies,
  COUNT(CASE WHEN policy_command = 'INSERT' THEN 1 END) as insert_policies,
  COUNT(CASE WHEN policy_command = 'UPDATE' THEN 1 END) as update_policies,
  COUNT(CASE WHEN policy_command = 'DELETE' THEN 1 END) as delete_policies,
  COUNT(CASE WHEN policy_command = 'ALL' THEN 1 END) as all_policies
FROM public.rls_policies_backup 
WHERE backup_phase = 'fase_0'
GROUP BY table_name
ORDER BY total_policies DESC;
