-- ============================================
-- FASE 1: ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices en viajes para JOINs frecuentes
CREATE INDEX IF NOT EXISTS idx_viajes_conductor_id ON viajes(conductor_id) WHERE conductor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_viajes_vehiculo_id ON viajes(vehiculo_id) WHERE vehiculo_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_viajes_remolque_id ON viajes(remolque_id) WHERE remolque_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_viajes_socio_id ON viajes(socio_id) WHERE socio_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_viajes_factura_id ON viajes(factura_id) WHERE factura_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_viajes_carta_porte_id ON viajes(carta_porte_id) WHERE carta_porte_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_viajes_user_estado ON viajes(user_id, estado) WHERE estado IN ('programado', 'en_transito', 'retrasado');

-- Índices en cartas_porte
CREATE INDEX IF NOT EXISTS idx_cartas_porte_conductor_principal ON cartas_porte(conductor_principal_id) WHERE conductor_principal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cartas_porte_vehiculo_principal ON cartas_porte(vehiculo_principal_id) WHERE vehiculo_principal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cartas_porte_viaje ON cartas_porte(viaje_id) WHERE viaje_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cartas_porte_usuario_status ON cartas_porte(usuario_id, status);

-- Índices en figuras_transporte para búsquedas
CREATE INDEX IF NOT EXISTS idx_figuras_rfc ON figuras_transporte(rfc_figura);
CREATE INDEX IF NOT EXISTS idx_figuras_carta_porte ON figuras_transporte(carta_porte_id);

-- Índices en socios para validaciones SAT
CREATE INDEX IF NOT EXISTS idx_socios_rfc ON socios(rfc);
CREATE INDEX IF NOT EXISTS idx_socios_user_activo ON socios(user_id) WHERE activo = true;

-- Índices en ubicaciones y mercancias
CREATE INDEX IF NOT EXISTS idx_ubicaciones_carta_porte ON ubicaciones(carta_porte_id);
CREATE INDEX IF NOT EXISTS idx_mercancias_carta_porte ON mercancias(carta_porte_id);

-- ============================================
-- FASE 2: FUNCIÓN DE VALIDACIÓN FISCAL
-- ============================================

CREATE OR REPLACE FUNCTION validar_configuracion_fiscal_completa(config_id uuid)
RETURNS jsonb AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FASE 3: TRIGGER PARA VALIDAR ANTES DE TIMBRAR
-- ============================================

CREATE OR REPLACE FUNCTION verificar_config_fiscal_antes_carta_porte()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Crear trigger (solo si no existe)
DROP TRIGGER IF EXISTS trg_verificar_config_fiscal ON cartas_porte;
CREATE TRIGGER trg_verificar_config_fiscal
BEFORE INSERT ON cartas_porte
FOR EACH ROW
EXECUTE FUNCTION verificar_config_fiscal_antes_carta_porte();

-- ============================================
-- FASE 4: FUNCIÓN RPC OPTIMIZADA PARA TIMBRADO
-- ============================================

CREATE OR REPLACE FUNCTION get_viaje_completo_para_timbrado(p_viaje_id uuid)
RETURNS jsonb AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FASE 5: AUDITORÍA Y LOGGING
-- ============================================

-- Registrar uso de la función de validación
INSERT INTO security_audit_log (
  user_id,
  event_type,
  event_data
) VALUES (
  NULL,
  'migration_applied',
  jsonb_build_object(
    'migration', 'comprehensive_data_relations_fix',
    'timestamp', now(),
    'components', jsonb_build_array(
      'indexes',
      'fiscal_validation',
      'carta_porte_trigger',
      'timbrado_rpc_function'
    )
  )
);