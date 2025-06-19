
-- Agregar campos obligatorios faltantes en cartas_porte
ALTER TABLE cartas_porte 
ADD COLUMN IF NOT EXISTS uso_cfdi VARCHAR,
ADD COLUMN IF NOT EXISTS regimen_fiscal_emisor VARCHAR,
ADD COLUMN IF NOT EXISTS regimen_fiscal_receptor VARCHAR,
ADD COLUMN IF NOT EXISTS domicilio_fiscal_emisor JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS domicilio_fiscal_receptor JSONB DEFAULT '{}';

-- Hacer obligatorio el peso_bruto_vehicular en autotransporte
ALTER TABLE autotransporte 
ALTER COLUMN peso_bruto_vehicular SET NOT NULL,
ADD COLUMN IF NOT EXISTS numero_serie_vin VARCHAR,
ADD COLUMN IF NOT EXISTS vigencia_resp_civil DATE,
ADD COLUMN IF NOT EXISTS vigencia_med_ambiente DATE,
ADD COLUMN IF NOT EXISTS asegura_carga VARCHAR,
ADD COLUMN IF NOT EXISTS poliza_carga VARCHAR;

-- Agregar campos obligatorios en mercancias para v3.1
ALTER TABLE mercancias 
ADD COLUMN IF NOT EXISTS descripcion_detallada TEXT,
ADD COLUMN IF NOT EXISTS peso_bruto_total NUMERIC,
ADD COLUMN IF NOT EXISTS unidad_peso_bruto VARCHAR DEFAULT 'KGM',
ADD COLUMN IF NOT EXISTS peso_neto_total NUMERIC,
ADD COLUMN IF NOT EXISTS documentacion_aduanera JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS especie_protegida BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requiere_cites BOOLEAN DEFAULT FALSE;

-- Agregar campos obligatorios en figuras_transporte
ALTER TABLE figuras_transporte 
ADD COLUMN IF NOT EXISTS operador_sct BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tipo_licencia VARCHAR,
ADD COLUMN IF NOT EXISTS vigencia_licencia DATE,
ADD COLUMN IF NOT EXISTS curp VARCHAR;

-- Crear tabla para documentación aduanera
CREATE TABLE IF NOT EXISTS documentacion_aduanera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mercancia_id UUID REFERENCES mercancias(id) ON DELETE CASCADE,
  tipo_documento VARCHAR NOT NULL,
  folio_documento VARCHAR NOT NULL,
  rfc_importador VARCHAR,
  fecha_expedicion DATE,
  aduana_despacho VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla para permisos SEMARNAT (fauna silvestre)
CREATE TABLE IF NOT EXISTS permisos_semarnat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mercancia_id UUID REFERENCES mercancias(id) ON DELETE CASCADE,
  tipo_permiso VARCHAR NOT NULL CHECK (tipo_permiso IN ('traslado', 'aprovechamiento', 'legal_procedencia')),
  numero_permiso VARCHAR NOT NULL,
  fecha_expedicion DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  autoridad_expedidora VARCHAR DEFAULT 'SEMARNAT',
  observaciones TEXT,
  vigente BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla para regímenes aduaneros v3.1 (hasta 10 regímenes)
CREATE TABLE IF NOT EXISTS regimenes_aduaneros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carta_porte_id UUID REFERENCES cartas_porte(id) ON DELETE CASCADE,
  clave_regimen VARCHAR NOT NULL,
  descripcion VARCHAR,
  orden_secuencia INTEGER CHECK (orden_secuencia BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(carta_porte_id, orden_secuencia)
);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_documentacion_aduanera_mercancia ON documentacion_aduanera(mercancia_id);
CREATE INDEX IF NOT EXISTS idx_permisos_semarnat_mercancia ON permisos_semarnat(mercancia_id);
CREATE INDEX IF NOT EXISTS idx_permisos_semarnat_vigencia ON permisos_semarnat(fecha_vencimiento) WHERE vigente = true;
CREATE INDEX IF NOT EXISTS idx_regimenes_aduaneros_carta ON regimenes_aduaneros(carta_porte_id);

-- Función para validar peso total vs capacidad vehicular
CREATE OR REPLACE FUNCTION validate_peso_vs_capacidad()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que el peso total no exceda la capacidad del vehículo
  IF (
    SELECT SUM(COALESCE(peso_bruto_total, peso_kg * cantidad))
    FROM mercancias 
    WHERE carta_porte_id = NEW.carta_porte_id
  ) > (
    SELECT COALESCE(peso_bruto_vehicular, carga_maxima, 0)
    FROM autotransporte 
    WHERE carta_porte_id = NEW.carta_porte_id
  ) THEN
    RAISE EXCEPTION 'El peso total de mercancías excede la capacidad del vehículo';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar peso en inserts/updates
DROP TRIGGER IF EXISTS trigger_validate_peso ON mercancias;
CREATE TRIGGER trigger_validate_peso
  AFTER INSERT OR UPDATE ON mercancias
  FOR EACH ROW
  EXECUTE FUNCTION validate_peso_vs_capacidad();

-- Función para validar descripción detallada de fauna silvestre
CREATE OR REPLACE FUNCTION validate_fauna_silvestre()
RETURNS TRIGGER AS $$
BEGIN
  -- Si es especie protegida, debe tener descripción detallada y permisos
  IF NEW.especie_protegida = TRUE THEN
    IF NEW.descripcion_detallada IS NULL OR LENGTH(TRIM(NEW.descripcion_detallada)) < 50 THEN
      RAISE EXCEPTION 'Especies protegidas requieren descripción detallada (mínimo 50 caracteres)';
    END IF;
    
    -- Verificar que tenga al menos un permiso SEMARNAT vigente
    IF NOT EXISTS (
      SELECT 1 FROM permisos_semarnat 
      WHERE mercancia_id = NEW.id 
      AND vigente = TRUE 
      AND fecha_vencimiento >= CURRENT_DATE
    ) THEN
      RAISE EXCEPTION 'Especies protegidas requieren permisos SEMARNAT vigentes';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar fauna silvestre
DROP TRIGGER IF EXISTS trigger_validate_fauna ON mercancias;
CREATE TRIGGER trigger_validate_fauna
  AFTER INSERT OR UPDATE ON mercancias
  FOR EACH ROW
  EXECUTE FUNCTION validate_fauna_silvestre();

-- Función actualizada para sincronización v3.1
CREATE OR REPLACE FUNCTION sync_carta_porte_fields_v31()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar campos v3.1 desde datos_formulario
    IF NEW.datos_formulario IS NOT NULL THEN
        -- Campos existentes mejorados
        NEW.rfc_emisor = COALESCE(
            NEW.datos_formulario->>'rfcEmisor',
            NEW.datos_formulario->'configuracion'->'emisor'->>'rfc',
            NEW.rfc_emisor
        );
        
        NEW.uso_cfdi = COALESCE(
            NEW.datos_formulario->>'uso_cfdi',
            NEW.datos_formulario->'configuracion'->'receptor'->>'uso_cfdi',
            'S01'
        );
        
        -- Nuevos campos v3.1
        NEW.regimen_fiscal_emisor = COALESCE(
            NEW.datos_formulario->'configuracion'->'emisor'->>'regimenFiscal',
            NEW.regimen_fiscal_emisor
        );
        
        NEW.domicilio_fiscal_emisor = COALESCE(
            NEW.datos_formulario->'configuracion'->'emisor'->'domicilio',
            NEW.domicilio_fiscal_emisor,
            '{}'::jsonb
        );
        
        -- Asegurar versión 3.1
        NEW.version_carta_porte = '3.1';
        
        -- Validar y corregir IdCCP (debe ser 36 caracteres)
        IF NEW.id_ccp IS NULL OR LENGTH(NEW.id_ccp) != 36 THEN
            NEW.id_ccp = gen_random_uuid()::text;
        END IF;
        
        -- Calcular totales v3.1
        IF NEW.datos_formulario->'mercancias' IS NOT NULL THEN
            -- Peso bruto total mejorado
            SELECT COALESCE(SUM(
                CASE 
                    WHEN (mercancia->>'peso_bruto_total')::numeric > 0 
                    THEN (mercancia->>'peso_bruto_total')::numeric
                    ELSE (mercancia->>'peso_kg')::numeric * (mercancia->>'cantidad')::numeric
                END
            ), 0)
            INTO NEW.peso_bruto_total
            FROM jsonb_array_elements(NEW.datos_formulario->'mercancias') AS mercancia;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Actualizar trigger principal
DROP TRIGGER IF EXISTS sync_carta_porte_fields_enhanced ON cartas_porte;
CREATE TRIGGER sync_carta_porte_fields_v31_trigger
    BEFORE INSERT OR UPDATE ON cartas_porte
    FOR EACH ROW
    EXECUTE FUNCTION sync_carta_porte_fields_v31();

-- Función para validar cumplimiento SAT v3.1
CREATE OR REPLACE FUNCTION validate_carta_porte_v31_compliance(carta_porte_data jsonb)
RETURNS jsonb AS $$
DECLARE
    errores text[] := '{}';
    warnings text[] := '{}';
    ubicaciones_count integer;
    mercancias_count integer;
    peso_total numeric;
    capacidad_vehicular numeric;
BEGIN
    -- Validaciones obligatorias v3.1
    
    -- Validar ubicaciones
    ubicaciones_count := jsonb_array_length(carta_porte_data->'ubicaciones');
    IF ubicaciones_count < 2 THEN
        errores := array_append(errores, 'Se requieren mínimo 2 ubicaciones (origen y destino)');
    END IF;
    
    -- Validar formato IDUbicacion
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(carta_porte_data->'ubicaciones') AS ubicacion
        WHERE ubicacion->>'tipo_ubicacion' = 'Origen' 
        AND NOT (ubicacion->>'id_ubicacion' ~ '^OR\d{6}$')
    ) THEN
        errores := array_append(errores, 'ID de ubicación origen debe tener formato OR000001');
    END IF;
    
    -- Validar distancia recorrida en destino
    IF NOT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(carta_porte_data->'ubicaciones') AS ubicacion
        WHERE ubicacion->>'tipo_ubicacion' = 'Destino' 
        AND (ubicacion->>'distancia_recorrida')::numeric > 0
    ) THEN
        errores := array_append(errores, 'Ubicación destino debe tener distancia recorrida mayor a 0');
    END IF;
    
    -- Validar mercancías
    mercancias_count := jsonb_array_length(carta_porte_data->'mercancias');
    IF mercancias_count = 0 THEN
        errores := array_append(errores, 'Se requiere al menos una mercancía');
    END IF;
    
    -- Validar peso vs capacidad
    SELECT 
        COALESCE(SUM((mercancia->>'peso_bruto_total')::numeric), 0),
        COALESCE((carta_porte_data->'autotransporte'->>'peso_bruto_vehicular')::numeric, 0)
    INTO peso_total, capacidad_vehicular
    FROM jsonb_array_elements(carta_porte_data->'mercancias') AS mercancia;
    
    IF peso_total > capacidad_vehicular AND capacidad_vehicular > 0 THEN
        warnings := array_append(warnings, 'Peso total excede capacidad del vehículo');
    END IF;
    
    -- Validar especies protegidas
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(carta_porte_data->'mercancias') AS mercancia
        WHERE (mercancia->>'especie_protegida')::boolean = true
        AND (mercancia->>'descripcion_detallada' IS NULL OR LENGTH(mercancia->>'descripcion_detallada') < 50)
    ) THEN
        errores := array_append(errores, 'Especies protegidas requieren descripción detallada (mínimo 50 caracteres)');
    END IF;
    
    RETURN jsonb_build_object(
        'valido', array_length(errores, 1) IS NULL,
        'errores', errores,
        'warnings', warnings,
        'score', CASE WHEN array_length(errores, 1) IS NULL THEN 100 ELSE 0 END
    );
END;
$$ LANGUAGE plpgsql;
