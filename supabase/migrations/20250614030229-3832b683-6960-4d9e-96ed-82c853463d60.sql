
-- Agregar campo datos_formulario JSONB para almacenar el estado completo del formulario
ALTER TABLE public.cartas_porte 
ADD COLUMN datos_formulario JSONB DEFAULT '{}';

-- Agregar campo status si no existe (para drafts/borradores)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cartas_porte' AND column_name = 'status') THEN
        ALTER TABLE public.cartas_porte 
        ADD COLUMN status VARCHAR DEFAULT 'borrador';
    END IF;
END $$;

-- Crear índice para búsquedas eficientes en el JSON
CREATE INDEX IF NOT EXISTS idx_cartas_porte_datos_formulario 
ON public.cartas_porte USING gin (datos_formulario);

-- Crear función para sincronizar campos individuales desde el JSON
CREATE OR REPLACE FUNCTION sync_carta_porte_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar campos básicos desde datos_formulario
    IF NEW.datos_formulario IS NOT NULL THEN
        NEW.rfc_emisor = COALESCE(
            NEW.datos_formulario->>'rfcEmisor',
            NEW.datos_formulario->'configuracion'->'emisor'->>'rfc',
            NEW.rfc_emisor
        );
        
        NEW.nombre_emisor = COALESCE(
            NEW.datos_formulario->>'nombreEmisor',
            NEW.datos_formulario->'configuracion'->'emisor'->>'nombre',
            NEW.nombre_emisor
        );
        
        NEW.rfc_receptor = COALESCE(
            NEW.datos_formulario->>'rfcReceptor',
            NEW.datos_formulario->'configuracion'->'receptor'->>'rfc',
            NEW.rfc_receptor
        );
        
        NEW.nombre_receptor = COALESCE(
            NEW.datos_formulario->>'nombreReceptor',
            NEW.datos_formulario->'configuracion'->'receptor'->>'nombre',
            NEW.nombre_receptor
        );
        
        -- Sincronizar campos de transporte internacional
        NEW.transporte_internacional = COALESCE(
            (NEW.datos_formulario->>'transporteInternacional')::boolean,
            NEW.transporte_internacional
        );
        
        NEW.registro_istmo = COALESCE(
            (NEW.datos_formulario->>'registroIstmo')::boolean,
            NEW.registro_istmo
        );
        
        -- Sincronizar tipo de CFDI
        NEW.tipo_cfdi = COALESCE(
            NEW.datos_formulario->>'tipoCfdi',
            NEW.tipo_cfdi
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para auto-sincronización
DROP TRIGGER IF EXISTS trigger_sync_carta_porte_fields ON public.cartas_porte;
CREATE TRIGGER trigger_sync_carta_porte_fields
    BEFORE INSERT OR UPDATE ON public.cartas_porte
    FOR EACH ROW
    EXECUTE FUNCTION sync_carta_porte_fields();

-- Migrar datos existentes al nuevo formato JSON (solo los que no tienen datos_formulario)
UPDATE public.cartas_porte 
SET datos_formulario = jsonb_build_object(
    'tipoCreacion', 'manual',
    'tipoCfdi', COALESCE(tipo_cfdi, 'T'),
    'rfcEmisor', COALESCE(rfc_emisor, ''),
    'nombreEmisor', COALESCE(nombre_emisor, ''),
    'rfcReceptor', COALESCE(rfc_receptor, ''),
    'nombreReceptor', COALESCE(nombre_receptor, ''),
    'transporteInternacional', COALESCE(transporte_internacional, false),
    'registroIstmo', COALESCE(registro_istmo, false),
    'cartaPorteVersion', '3.1',
    'configuracion', jsonb_build_object(
        'version', '3.1',
        'tipoComprobante', COALESCE(tipo_cfdi, 'T'),
        'emisor', jsonb_build_object(
            'rfc', COALESCE(rfc_emisor, ''),
            'nombre', COALESCE(nombre_emisor, ''),
            'regimenFiscal', ''
        ),
        'receptor', jsonb_build_object(
            'rfc', COALESCE(rfc_receptor, ''),
            'nombre', COALESCE(nombre_receptor, '')
        )
    ),
    'ubicaciones', '[]'::jsonb,
    'mercancias', '[]'::jsonb,
    'autotransporte', jsonb_build_object(
        'placaVm', '',
        'configuracionVehicular', '',
        'seguro', jsonb_build_object(
            'aseguradora', '',
            'poliza', '',
            'vigencia', ''
        )
    ),
    'figuras', '[]'::jsonb
)
WHERE datos_formulario IS NULL OR datos_formulario = '{}';
