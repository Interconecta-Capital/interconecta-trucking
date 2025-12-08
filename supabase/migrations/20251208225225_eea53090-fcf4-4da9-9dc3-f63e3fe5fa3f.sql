-- Fix remaining 4 functions without fixed search_path

-- 1. get_viaje_completo_para_timbrado
CREATE OR REPLACE FUNCTION public.get_viaje_completo_para_timbrado(p_viaje_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  resultado jsonb;
BEGIN
  SELECT jsonb_build_object(
    'viaje', to_jsonb(v.*),
    'conductor', to_jsonb(c.*),
    'vehiculo', to_jsonb(vh.*),
    'remolque', to_jsonb(r.*),
    'socio', to_jsonb(s.*),
    'config_empresa', to_jsonb(ce.*),
    'carta_porte', to_jsonb(cp.*),
    'ubicaciones', (
      SELECT COALESCE(jsonb_agg(to_jsonb(u.*) ORDER BY u.orden_secuencia), '[]'::jsonb)
      FROM ubicaciones u 
      WHERE u.carta_porte_id = cp.id
    ),
    'mercancias', (
      SELECT COALESCE(jsonb_agg(to_jsonb(m.*)), '[]'::jsonb)
      FROM mercancias m 
      WHERE m.carta_porte_id = cp.id
    ),
    'figuras', (
      SELECT COALESCE(jsonb_agg(to_jsonb(f.*)), '[]'::jsonb)
      FROM figuras_transporte f 
      WHERE f.carta_porte_id = cp.id
    ),
    'autotransporte', (
      SELECT to_jsonb(a.*)
      FROM autotransporte a
      WHERE a.carta_porte_id = cp.id
      LIMIT 1
    )
  ) INTO resultado
  FROM viajes v
  LEFT JOIN conductores c ON v.conductor_id = c.id
  LEFT JOIN vehiculos vh ON v.vehiculo_id = vh.id
  LEFT JOIN remolques r ON v.remolque_id = r.id
  LEFT JOIN socios s ON v.socio_id = s.id
  LEFT JOIN configuracion_empresa ce ON v.user_id = ce.user_id
  LEFT JOIN cartas_porte cp ON (v.carta_porte_id = cp.id OR cp.viaje_id = v.id)
  WHERE v.id = p_viaje_id
  AND v.user_id = auth.uid();
  
  IF resultado IS NULL THEN
    RAISE EXCEPTION 'Viaje no encontrado o no autorizado';
  END IF;
  
  RETURN resultado;
END;
$function$;

-- 2. update_subscriptions_meta_updated_at
CREATE OR REPLACE FUNCTION public.update_subscriptions_meta_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. validar_configuracion_fiscal_completa
CREATE OR REPLACE FUNCTION public.validar_configuracion_fiscal_completa(config_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  config RECORD;
  errores jsonb := '[]'::jsonb;
BEGIN
  SELECT * INTO config FROM configuracion_empresa WHERE id = config_id;
  
  IF NOT FOUND THEN
    errores := errores || '["Configuración no encontrada"]'::jsonb;
    RETURN jsonb_build_object('completa', false, 'errores', errores);
  END IF;
  
  -- Validar RFC Emisor
  IF config.rfc_emisor IS NULL OR config.rfc_emisor = '' THEN
    errores := errores || '["RFC Emisor es obligatorio"]'::jsonb;
  END IF;
  
  -- Validar Razón Social
  IF config.razon_social IS NULL OR config.razon_social = '' THEN
    errores := errores || '["Razón Social es obligatoria"]'::jsonb;
  END IF;
  
  -- Validar Régimen Fiscal
  IF config.regimen_fiscal IS NULL OR config.regimen_fiscal = '' THEN
    errores := errores || '["Régimen Fiscal es obligatorio"]'::jsonb;
  END IF;
  
  -- Validar Código Postal en domicilio_fiscal
  IF config.domicilio_fiscal IS NULL OR 
     config.domicilio_fiscal->>'codigo_postal' IS NULL OR 
     config.domicilio_fiscal->>'codigo_postal' = '' THEN
    errores := errores || '["Código Postal del domicilio fiscal es obligatorio"]'::jsonb;
  END IF;
  
  -- Validar Estado
  IF config.domicilio_fiscal->>'estado' IS NULL OR 
     config.domicilio_fiscal->>'estado' = '' THEN
    errores := errores || '["Estado del domicilio fiscal es obligatorio"]'::jsonb;
  END IF;
  
  -- Validar País (debe ser clave SAT válida)
  IF config.pais IS NULL OR config.pais = '' THEN
    errores := errores || '["País es obligatorio"]'::jsonb;
  END IF;
  
  -- Actualizar flag de configuración completa
  UPDATE configuracion_empresa 
  SET configuracion_completa = (jsonb_array_length(errores) = 0)
  WHERE id = config_id;
  
  RETURN jsonb_build_object(
    'completa', jsonb_array_length(errores) = 0,
    'errores', errores
  );
END;
$function$;

-- 4. verificar_config_fiscal_antes_carta_porte
CREATE OR REPLACE FUNCTION public.verificar_config_fiscal_antes_carta_porte()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $function$
DECLARE
  config RECORD;
  validacion jsonb;
BEGIN
  -- Obtener configuración fiscal del usuario
  SELECT * INTO config 
  FROM configuracion_empresa 
  WHERE user_id = NEW.usuario_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Debe configurar datos fiscales en Administración > Datos Fiscales antes de crear cartas porte';
  END IF;
  
  -- Validar configuración completa
  validacion := validar_configuracion_fiscal_completa(config.id);
  
  IF NOT (validacion->>'completa')::boolean THEN
    RAISE EXCEPTION 'Configuración fiscal incompleta: %', validacion->>'errores';
  END IF;
  
  -- Auto-poblar datos del emisor desde configuración
  NEW.rfc_emisor := config.rfc_emisor;
  NEW.nombre_emisor := config.razon_social;
  NEW.regimen_fiscal_emisor := config.regimen_fiscal;
  NEW.domicilio_fiscal_emisor := config.domicilio_fiscal;
  
  RETURN NEW;
END;
$function$;