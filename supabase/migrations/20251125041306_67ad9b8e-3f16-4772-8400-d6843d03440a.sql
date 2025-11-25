-- =============================================
-- Migración: Democratizar Modo Pruebas
-- Objetivo: Establecer modo_pruebas = true por defecto para nuevos usuarios
-- Fecha: 2025-01-18
-- =============================================

-- 1. Establecer valor por defecto en la tabla para nuevos registros
ALTER TABLE public.configuracion_empresa 
ALTER COLUMN modo_pruebas SET DEFAULT true;

-- 2. Actualizar registros existentes que no tienen configuración completa a modo pruebas
-- Esto ayuda a usuarios que ya existen pero nunca completaron su configuración
UPDATE public.configuracion_empresa
SET modo_pruebas = true
WHERE configuracion_completa = false
  AND modo_pruebas = false;

-- 3. Comentario explicativo
COMMENT ON COLUMN public.configuracion_empresa.modo_pruebas IS 
'Indica si el usuario está en modo pruebas (sandbox) o producción. 
Por defecto TRUE para facilitar onboarding y testing sin riesgo.
Los usuarios deben cambiar manualmente a FALSE cuando estén listos para producción.';