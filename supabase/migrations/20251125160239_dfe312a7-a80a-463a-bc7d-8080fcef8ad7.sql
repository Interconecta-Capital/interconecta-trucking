-- ============================================
-- FASE 1: Funciones para validación de catálogos SAT
-- Eliminar todas las versiones existentes primero
-- ============================================

-- Agregar extensión unaccent si no existe
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Eliminar TODAS las versiones de las funciones
DROP FUNCTION IF EXISTS public.buscar_codigo_postal_completo(text);
DROP FUNCTION IF EXISTS public.buscar_codigo_postal_completo(varchar);
DROP FUNCTION IF EXISTS public.validar_correlacion_cp(text, text, text);
DROP FUNCTION IF EXISTS public.validar_correlacion_cp(varchar, varchar, varchar);
DROP FUNCTION IF EXISTS public.sugerir_codigos_similares(text);
DROP FUNCTION IF EXISTS public.sugerir_codigos_similares(varchar);

-- Función para buscar código postal con información completa
CREATE FUNCTION public.buscar_codigo_postal_completo(cp_input text)
RETURNS TABLE (
  codigo_postal text,
  estado text,
  estado_clave text,
  municipio text,
  municipio_clave text,
  localidad text,
  ciudad text,
  zona text,
  total_colonias integer,
  colonias jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Primero buscar en codigos_postales_mexico (tiene nombres completos)
  RETURN QUERY
  SELECT 
    cpm.codigo_postal::text,
    cpm.estado::text,
    cpm.estado_clave::text,
    cpm.municipio::text,
    cpm.municipio_clave::text,
    COALESCE(cpm.localidad, cpm.ciudad)::text,
    cpm.ciudad::text,
    cpm.zona::text,
    COUNT(*)::integer as total_colonias,
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'nombre', cpm.colonia,
        'tipo', COALESCE(cpm.tipo_asentamiento, 'Colonia')
      )
    ) as colonias
  FROM codigos_postales_mexico cpm
  WHERE cpm.codigo_postal = cp_input
  GROUP BY 
    cpm.codigo_postal, 
    cpm.estado, 
    cpm.estado_clave, 
    cpm.municipio, 
    cpm.municipio_clave, 
    cpm.localidad, 
    cpm.ciudad, 
    cpm.zona
  LIMIT 1;
  
  -- Si hay resultados, retornar
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Fallback a cat_codigo_postal (solo tiene claves)
  RETURN QUERY
  SELECT 
    ccp.codigo_postal::text,
    COALESCE(ce.descripcion, ccp.estado_clave)::text,
    ccp.estado_clave::text,
    COALESCE(cm.descripcion, ccp.municipio_clave)::text,
    ccp.municipio_clave::text,
    ccp.localidad_clave::text,
    NULL::text,
    NULL::text,
    COALESCE((SELECT COUNT(*)::integer FROM cat_colonia cc WHERE cc.codigo_postal = cp_input), 0),
    COALESCE(
      (SELECT JSONB_AGG(
        JSONB_BUILD_OBJECT('nombre', cc.descripcion, 'tipo', 'Colonia')
      ) FROM cat_colonia cc WHERE cc.codigo_postal = cp_input),
      '[]'::jsonb
    )
  FROM cat_codigo_postal ccp
  LEFT JOIN cat_estado ce ON ce.clave_estado = ccp.estado_clave AND ce.pais_clave = 'MEX'
  LEFT JOIN cat_municipio cm ON cm.estado_clave = ccp.estado_clave AND cm.clave_municipio = ccp.municipio_clave
  WHERE ccp.codigo_postal = cp_input
  LIMIT 1;
END;
$$;

-- Función para validar correlación CP ↔ Estado ↔ Municipio
CREATE FUNCTION public.validar_correlacion_cp(
  cp_input text,
  estado_input text,
  municipio_input text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cp_data RECORD;
  estado_normalizado text;
  municipio_normalizado text;
  cp_estado_normalizado text;
  cp_municipio_normalizado text;
  estado_match boolean := FALSE;
  municipio_match boolean := FALSE;
BEGIN
  -- Buscar el CP
  SELECT * INTO cp_data 
  FROM buscar_codigo_postal_completo(cp_input);
  
  -- Si no existe el CP
  IF cp_data.codigo_postal IS NULL THEN
    RETURN JSONB_BUILD_OBJECT(
      'isValid', FALSE,
      'errors', JSONB_BUILD_ARRAY(
        FORMAT('Código postal %s no encontrado en catálogos SAT', cp_input)
      ),
      'warnings', '[]'::jsonb,
      'details', JSONB_BUILD_OBJECT(
        'cpExists', FALSE,
        'estadoMatch', FALSE,
        'municipioMatch', FALSE
      )
    );
  END IF;
  
  -- Normalizar strings para comparación (minúsculas, sin acentos)
  estado_normalizado := LOWER(unaccent(COALESCE(estado_input, '')));
  municipio_normalizado := LOWER(unaccent(COALESCE(municipio_input, '')));
  cp_estado_normalizado := LOWER(unaccent(COALESCE(cp_data.estado, '')));
  cp_municipio_normalizado := LOWER(unaccent(COALESCE(cp_data.municipio, '')));
  
  -- Validar estado (por nombre o clave)
  estado_match := (
    cp_estado_normalizado = estado_normalizado OR
    LOWER(cp_data.estado_clave) = estado_normalizado OR
    cp_data.estado_clave = estado_input
  );
  
  -- Validar municipio (por nombre o clave)
  municipio_match := (
    cp_municipio_normalizado = municipio_normalizado OR
    LOWER(cp_data.municipio_clave) = municipio_normalizado OR
    cp_data.municipio_clave = municipio_input
  );
  
  -- Construir resultado
  RETURN JSONB_BUILD_OBJECT(
    'isValid', estado_match AND municipio_match,
    'errors', CASE 
      WHEN NOT estado_match AND NOT municipio_match THEN JSONB_BUILD_ARRAY(
        FORMAT('El CP %s pertenece al estado "%s" (%s), pero se indicó "%s"', 
               cp_input, cp_data.estado, cp_data.estado_clave, estado_input),
        FORMAT('El CP %s pertenece al municipio "%s" (%s), pero se indicó "%s"', 
               cp_input, cp_data.municipio, cp_data.municipio_clave, municipio_input)
      )
      WHEN NOT estado_match THEN JSONB_BUILD_ARRAY(
        FORMAT('El CP %s pertenece al estado "%s" (%s), pero se indicó "%s"', 
               cp_input, cp_data.estado, cp_data.estado_clave, estado_input)
      )
      WHEN NOT municipio_match THEN JSONB_BUILD_ARRAY(
        FORMAT('El CP %s pertenece al municipio "%s" (%s), pero se indicó "%s"', 
               cp_input, cp_data.municipio, cp_data.municipio_clave, municipio_input)
      )
      ELSE '[]'::jsonb
    END,
    'warnings', '[]'::jsonb,
    'details', JSONB_BUILD_OBJECT(
      'cpExists', TRUE,
      'estadoMatch', estado_match,
      'municipioMatch', municipio_match,
      'expectedEstado', cp_data.estado,
      'expectedMunicipio', cp_data.municipio,
      'actualEstado', estado_input,
      'actualMunicipio', municipio_input
    )
  );
END;
$$;

-- Función para sugerir códigos postales similares
CREATE FUNCTION public.sugerir_codigos_similares(cp_input text)
RETURNS TABLE (
  codigo_postal text,
  ubicacion text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefijo text;
BEGIN
  prefijo := LEFT(cp_input, 3);
  
  -- Primero buscar en codigos_postales_mexico
  RETURN QUERY
  SELECT DISTINCT
    cpm.codigo_postal::text,
    FORMAT('%s, %s, %s', 
           cpm.colonia, 
           cpm.municipio, 
           cpm.estado)::text
  FROM codigos_postales_mexico cpm
  WHERE cpm.codigo_postal LIKE prefijo || '%'
  ORDER BY cpm.codigo_postal::text
  LIMIT 10;
  
  -- Si hay resultados, retornar
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Fallback a cat_codigo_postal
  RETURN QUERY
  SELECT DISTINCT
    ccp.codigo_postal::text,
    FORMAT('%s, %s', 
           COALESCE(cm.descripcion, ccp.municipio_clave), 
           COALESCE(ce.descripcion, ccp.estado_clave))::text
  FROM cat_codigo_postal ccp
  LEFT JOIN cat_estado ce ON ce.clave_estado = ccp.estado_clave
  LEFT JOIN cat_municipio cm ON cm.estado_clave = ccp.estado_clave 
                            AND cm.clave_municipio = ccp.municipio_clave
  WHERE ccp.codigo_postal LIKE prefijo || '%'
  ORDER BY ccp.codigo_postal::text
  LIMIT 10;
END;
$$;

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_cp_mexico_codigo ON codigos_postales_mexico(codigo_postal);
CREATE INDEX IF NOT EXISTS idx_cp_mexico_estado ON codigos_postales_mexico(estado_clave);
CREATE INDEX IF NOT EXISTS idx_cp_mexico_municipio ON codigos_postales_mexico(estado_clave, municipio_clave);
CREATE INDEX IF NOT EXISTS idx_cat_cp_codigo ON cat_codigo_postal(codigo_postal);
CREATE INDEX IF NOT EXISTS idx_cat_cp_estado ON cat_codigo_postal(estado_clave);
CREATE INDEX IF NOT EXISTS idx_cat_colonia_cp ON cat_colonia(codigo_postal);

-- Comentarios
COMMENT ON FUNCTION buscar_codigo_postal_completo IS 'Busca información completa de un código postal incluyendo colonias';
COMMENT ON FUNCTION validar_correlacion_cp IS 'Valida que el CP corresponda al Estado y Municipio indicados según catálogos SAT';
COMMENT ON FUNCTION sugerir_codigos_similares IS 'Sugiere códigos postales similares cuando no se encuentra el solicitado';