-- ============================================
-- SPRINT 1 CRÍTICO: Limpieza y Corrección
-- ============================================

-- 1. Crear función para verificar si usuario puede usar modo pruebas (solo superuser)
CREATE OR REPLACE FUNCTION public.puede_usar_modo_pruebas(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo superusuarios pueden usar modo pruebas
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = p_user_id 
      AND role = 'superuser'
  );
END;
$$;

-- 2. Actualizar proveedor_timbrado de 'fiscal_api' a 'smartweb' para todos los usuarios
UPDATE public.configuracion_empresa
SET proveedor_timbrado = 'smartweb'
WHERE proveedor_timbrado = 'fiscal_api' OR proveedor_timbrado IS NULL;

-- 3. Desactivar modo_pruebas para todos los usuarios NO superuser
UPDATE public.configuracion_empresa ce
SET modo_pruebas = false
WHERE ce.user_id NOT IN (
  SELECT ur.user_id 
  FROM public.user_roles ur 
  WHERE ur.role = 'superuser'
);

-- 4. Log de auditoría
INSERT INTO public.security_audit_log (
  user_id,
  event_type,
  event_data
) VALUES (
  NULL,
  'sprint1_cleanup',
  jsonb_build_object(
    'timestamp', now(),
    'action', 'cleaned_test_data_and_corrected_provider',
    'proveedor_updated', 'smartweb',
    'modo_pruebas_restricted', true
  )
);

-- 5. Comentarios para documentación
COMMENT ON FUNCTION public.puede_usar_modo_pruebas IS 'Verifica si un usuario (superuser) puede activar modo pruebas (sandbox). Usuarios regulares siempre usan producción.';
