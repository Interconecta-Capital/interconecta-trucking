
-- CORRECCIÓN COMPLETA: Eliminar todas las políticas dependientes primero
-- Error: varias tablas tienen políticas que dependen de funciones problemáticas

-- Paso 1: Eliminar TODAS las políticas de TODAS las tablas que usan funciones problemáticas
DO $$ 
DECLARE 
    policy_name text;
    table_name text;
    tables_to_clean text[] := ARRAY['usuarios', 'cartas_porte', 'conductores', 'vehiculos', 'socios', 'ubicaciones', 'mercancias', 'figuras_transporte', 'autotransporte', 'notificaciones', 'remolques_ccp'];
BEGIN
    -- Eliminar todas las políticas de todas las tablas problemáticas
    FOREACH table_name IN ARRAY tables_to_clean
    LOOP
        FOR policy_name IN 
            SELECT policyname FROM pg_policies WHERE tablename = table_name AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
        END LOOP;
    END LOOP;
END $$;

-- Paso 2: Ahora eliminar las funciones problemáticas con CASCADE
DROP FUNCTION IF EXISTS public.check_superuser_safe_v2(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_superuser(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_user_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_tenant_safe_v2(uuid) CASCADE;

-- Paso 3: Crear políticas SIMPLES solo para las tablas críticas
-- Política para usuarios - sin funciones complejas
CREATE POLICY "usuarios_simple" 
  ON public.usuarios 
  FOR ALL 
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Política para cartas de porte - sin funciones complejas
CREATE POLICY "cartas_porte_simple" 
  ON public.cartas_porte 
  FOR ALL 
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Política para conductores - sin funciones complejas
CREATE POLICY "conductores_simple" 
  ON public.conductores 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para vehículos - sin funciones complejas
CREATE POLICY "vehiculos_simple" 
  ON public.vehiculos 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para socios - sin funciones complejas
CREATE POLICY "socios_simple" 
  ON public.socios 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para notificaciones - sin funciones complejas
CREATE POLICY "notificaciones_simple" 
  ON public.notificaciones 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Paso 4: Limpiar logs para optimizar rendimiento
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '30 minutes';
