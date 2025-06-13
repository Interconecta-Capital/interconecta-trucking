
-- Mejorar la función de búsqueda de códigos postales para obtener TODAS las colonias
DROP FUNCTION IF EXISTS public.buscar_codigo_postal_completo(text);

CREATE OR REPLACE FUNCTION public.buscar_codigo_postal_completo(cp_input TEXT)
RETURNS TABLE(
    codigo_postal TEXT,
    estado TEXT,
    estado_clave TEXT,
    municipio TEXT,
    municipio_clave TEXT,
    localidad TEXT,
    ciudad TEXT,
    zona TEXT,
    total_colonias INTEGER,
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
        COUNT(cp.colonia)::INTEGER as total_colonias,
        json_agg(
            json_build_object(
                'nombre', cp.colonia,
                'tipo', COALESCE(cp.tipo_asentamiento, 'Colonia')
            ) ORDER BY cp.colonia
        )::JSONB as colonias
    FROM public.codigos_postales_mexico cp
    WHERE cp.codigo_postal = cp_input
    GROUP BY cp.codigo_postal, cp.estado, cp.estado_clave, cp.municipio, 
             cp.municipio_clave, cp.localidad, cp.ciudad, cp.zona
    LIMIT 1;
END;
$$;
