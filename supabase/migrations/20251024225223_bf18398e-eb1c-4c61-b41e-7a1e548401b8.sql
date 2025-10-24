-- Configurar cron job para verificación automática de vencimientos
-- Se ejecutará diariamente a las 8:00 AM hora de México (14:00 UTC)

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Crear o reemplazar el cron job
SELECT cron.schedule(
  'check-expirations-daily',
  '0 14 * * *', -- 14:00 UTC = 8:00 AM Ciudad de México (UTC-6)
  $$
  SELECT
    net.http_post(
        url:='https://qulhweffinppyjpfkknh.supabase.co/functions/v1/check-expirations',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bGh3ZWZmaW5wcHlqcGZra25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTg3ODEsImV4cCI6MjA2NTE5NDc4MX0.7MwqHsoSSdlzizarradrdMGUHG9QuXyIGFXd0imNrMM"}'::jsonb,
        body:='{"trigger": "cron", "timestamp": "' || now()::text || '"}'::jsonb
    ) as request_id;
  $$
);

-- Verificar que el cron job fue creado correctamente
SELECT jobid, schedule, command 
FROM cron.job 
WHERE jobname = 'check-expirations-daily';
