-- ============================================
-- FASE 3: Configurar Cron Job para Actualización de Catálogos SAT
-- ============================================
-- Ejecuta automáticamente la función actualizar-catalogos-sat diariamente a las 2 AM

-- Habilitar extensiones necesarias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Eliminar cron job previo si existe (para evitar duplicados)
SELECT cron.unschedule('actualizar-catalogos-sat-diario')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'actualizar-catalogos-sat-diario'
);

-- Crear cron job para actualizar catálogos diariamente a las 2 AM
SELECT cron.schedule(
  'actualizar-catalogos-sat-diario',
  '0 2 * * *', -- Cron expression: Diariamente a las 2:00 AM (hora del servidor)
  $$
  SELECT net.http_post(
    url := 'https://qulhweffinppyjpfkknh.supabase.co/functions/v1/actualizar-catalogos-sat',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bGh3ZWZmaW5wcHlqcGZra25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTg3ODEsImV4cCI6MjA2NTE5NDc4MX0.7MwqHsoSSdlzizarradrdMGUHG9QuXyIGFXd0imNrMM'
    ),
    body := jsonb_build_object(
      'trigger', 'cron_job',
      'timestamp', now(),
      'descripcion', 'Actualización automática diaria de catálogos SAT'
    )
  ) AS request_id;
  $$
);

-- Registrar en auditoría
INSERT INTO public.security_audit_log (
  user_id,
  event_type,
  event_data
) VALUES (
  NULL,
  'cron_job_configurado',
  jsonb_build_object(
    'job_name', 'actualizar-catalogos-sat-diario',
    'schedule', '0 2 * * *',
    'descripcion', 'Actualización automática diaria de catálogos SAT a las 2 AM',
    'timestamp', now(),
    'fase', 'FASE_3_PLAN_IMPLEMENTACION'
  )
);

-- Verificar que el cron job fue creado correctamente
DO $$
DECLARE
  job_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO job_count 
  FROM cron.job 
  WHERE jobname = 'actualizar-catalogos-sat-diario';
  
  IF job_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ FASE 3 COMPLETADA: Cron Job Configurado';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Nombre: actualizar-catalogos-sat-diario';
    RAISE NOTICE 'Horario: Diariamente a las 2:00 AM';
    RAISE NOTICE 'Función: actualizar-catalogos-sat';
    RAISE NOTICE 'Estado: Activo y programado';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
  ELSE
    RAISE WARNING 'No se pudo crear el cron job. Verifica permisos.';
  END IF;
END $$;