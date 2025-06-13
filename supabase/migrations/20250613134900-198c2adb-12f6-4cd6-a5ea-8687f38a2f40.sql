
-- Crear tabla completa para códigos postales de México
CREATE TABLE IF NOT EXISTS public.codigos_postales_mexico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_postal VARCHAR(5) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    estado_clave VARCHAR(2) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    municipio_clave VARCHAR(5) NOT NULL,
    localidad VARCHAR(100),
    colonia VARCHAR(150) NOT NULL,
    tipo_asentamiento VARCHAR(50),
    zona VARCHAR(10), -- urbana/rural
    ciudad VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(codigo_postal, colonia) -- Restricción única para evitar duplicados
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_codigo_postal ON public.codigos_postales_mexico(codigo_postal);
CREATE INDEX IF NOT EXISTS idx_estado_clave ON public.codigos_postales_mexico(estado_clave);
CREATE INDEX IF NOT EXISTS idx_municipio_clave ON public.codigos_postales_mexico(municipio_clave);

-- Habilitar RLS para seguridad
ALTER TABLE public.codigos_postales_mexico ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (códigos postales son información pública)
CREATE POLICY "Códigos postales son de lectura pública" 
    ON public.codigos_postales_mexico 
    FOR SELECT 
    USING (true);

-- Función para buscar código postal con todas las colonias
CREATE OR REPLACE FUNCTION public.buscar_codigo_postal(cp_input TEXT)
RETURNS TABLE(
    codigo_postal TEXT,
    estado TEXT,
    estado_clave TEXT,
    municipio TEXT,
    municipio_clave TEXT,
    localidad TEXT,
    ciudad TEXT,
    zona TEXT,
    colonias JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.codigo_postal::TEXT,
        cp.estado::TEXT,
        cp.estado_clave::TEXT,
        cp.municipio::TEXT,
        cp.municipio_clave::TEXT,
        cp.localidad::TEXT,
        cp.ciudad::TEXT,
        cp.zona::TEXT,
        json_agg(
            json_build_object(
                'colonia', cp.colonia,
                'tipo_asentamiento', cp.tipo_asentamiento
            ) ORDER BY cp.colonia
        )::JSONB as colonias
    FROM public.codigos_postales_mexico cp
    WHERE cp.codigo_postal = cp_input
    GROUP BY cp.codigo_postal, cp.estado, cp.estado_clave, cp.municipio, 
             cp.municipio_clave, cp.localidad, cp.ciudad, cp.zona
    LIMIT 1;
END;
$$;

-- Función para sugerir códigos postales similares
CREATE OR REPLACE FUNCTION public.sugerir_codigos_similares(cp_input TEXT)
RETURNS TABLE(codigo_postal TEXT, ubicacion TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prefijo TEXT;
BEGIN
    -- Obtener prefijo de 2-3 dígitos para buscar similares
    prefijo := substring(cp_input, 1, 2);
    
    RETURN QUERY
    SELECT DISTINCT 
        cp.codigo_postal::TEXT,
        (cp.municipio || ', ' || cp.estado)::TEXT as ubicacion
    FROM public.codigos_postales_mexico cp
    WHERE cp.codigo_postal LIKE (prefijo || '%')
      AND cp.codigo_postal != cp_input
    ORDER BY cp.codigo_postal
    LIMIT 10;
END;
$$;

-- Insertar datos de muestra para pruebas (los más comunes)
INSERT INTO public.codigos_postales_mexico (
    codigo_postal, estado, estado_clave, municipio, municipio_clave,
    localidad, colonia, tipo_asentamiento, zona, ciudad
) VALUES 
-- CDMX
('06600', 'Ciudad de México', '09', 'Cuauhtémoc', '015', 'Ciudad de México', 'Roma Norte', 'Colonia', 'urbana', 'Ciudad de México'),
('06600', 'Ciudad de México', '09', 'Cuauhtémoc', '015', 'Ciudad de México', 'Juárez', 'Colonia', 'urbana', 'Ciudad de México'),
('06700', 'Ciudad de México', '09', 'Cuauhtémoc', '015', 'Ciudad de México', 'Roma Sur', 'Colonia', 'urbana', 'Ciudad de México'),
('03100', 'Ciudad de México', '09', 'Benito Juárez', '014', 'Ciudad de México', 'Del Valle Centro', 'Colonia', 'urbana', 'Ciudad de México'),
('03200', 'Ciudad de México', '09', 'Benito Juárez', '014', 'Ciudad de México', 'Del Valle Norte', 'Colonia', 'urbana', 'Ciudad de México'),
('11000', 'Ciudad de México', '09', 'Miguel Hidalgo', '016', 'Ciudad de México', 'Lomas de Chapultepec', 'Colonia', 'urbana', 'Ciudad de México'),

-- Guadalajara, Jalisco
('44100', 'Jalisco', '14', 'Guadalajara', '039', 'Guadalajara', 'Centro', 'Colonia', 'urbana', 'Guadalajara'),
('44100', 'Jalisco', '14', 'Guadalajara', '039', 'Guadalajara', 'Zona Centro', 'Colonia', 'urbana', 'Guadalajara'),
('44100', 'Jalisco', '14', 'Guadalajara', '039', 'Guadalajara', 'El Santuario', 'Colonia', 'urbana', 'Guadalajara'),
('44600', 'Jalisco', '14', 'Guadalajara', '039', 'Guadalajara', 'Lafayette', 'Colonia', 'urbana', 'Guadalajara'),
('44650', 'Jalisco', '14', 'Guadalajara', '039', 'Guadalajara', 'Americana', 'Colonia', 'urbana', 'Guadalajara'),
('45050', 'Jalisco', '14', 'Zapopan', '120', 'Zapopan', 'Ciudad Granja', 'Colonia', 'urbana', 'Zapopan'),

-- Monterrey, Nuevo León
('64000', 'Nuevo León', '19', 'Monterrey', '039', 'Monterrey', 'Centro', 'Colonia', 'urbana', 'Monterrey'),
('66220', 'Nuevo León', '19', 'San Pedro Garza García', '046', 'San Pedro Garza García', 'Del Valle', 'Colonia', 'urbana', 'San Pedro Garza García'),
('64720', 'Nuevo León', '19', 'Monterrey', '039', 'Monterrey', 'Residencial San Agustín', 'Colonia', 'urbana', 'Monterrey'),

-- Morelos (incluye el 62577)
('62577', 'Morelos', '17', 'Jiutepec', '012', 'Jiutepec', 'Ampliación Bugambilias', 'Colonia', 'urbana', 'Jiutepec'),
('62574', 'Morelos', '17', 'Jiutepec', '012', 'Jiutepec', 'Bugambilias', 'Colonia', 'urbana', 'Jiutepec'),
('62575', 'Morelos', '17', 'Jiutepec', '012', 'Jiutepec', 'Las Flores', 'Colonia', 'urbana', 'Jiutepec'),
('62576', 'Morelos', '17', 'Jiutepec', '012', 'Jiutepec', 'Jardines de Jiutepec', 'Fraccionamiento', 'urbana', 'Jiutepec'),

-- Mérida, Yucatán
('97000', 'Yucatán', '31', 'Mérida', '050', 'Mérida', 'Centro', 'Colonia', 'urbana', 'Mérida'),
('97070', 'Yucatán', '31', 'Mérida', '050', 'Mérida', 'Francisco de Montejo', 'Fraccionamiento', 'urbana', 'Mérida'),
('97100', 'Yucatán', '31', 'Mérida', '050', 'Mérida', 'Itzimná', 'Colonia', 'urbana', 'Mérida')

ON CONFLICT (codigo_postal, colonia) DO NOTHING;
