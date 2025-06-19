
-- FASE 1: Normalización de la Base de Datos para Carta Porte
-- Corrección de campos faltantes y inconsistencias críticas

-- 1. Agregar campos críticos faltantes en cartas_porte
ALTER TABLE public.cartas_porte 
ADD COLUMN IF NOT EXISTS id_ccp character varying(36),
ADD COLUMN IF NOT EXISTS version_carta_porte character varying(3) DEFAULT '3.1',
ADD COLUMN IF NOT EXISTS regimenes_aduaneros jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS peso_bruto_total numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS distancia_total numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS numero_total_mercancias integer DEFAULT 0;

-- 2. Agregar campos faltantes en ubicaciones
ALTER TABLE public.ubicaciones 
ADD COLUMN IF NOT EXISTS coordenadas jsonb,
ADD COLUMN IF NOT EXISTS kilometro numeric,
ADD COLUMN IF NOT EXISTS numero_estacion character varying,
ADD COLUMN IF NOT EXISTS tipo_estacion character varying;

-- 3. Agregar campos críticos en autotransporte
ALTER TABLE public.autotransporte 
ADD COLUMN IF NOT EXISTS peso_bruto_vehicular numeric,
ADD COLUMN IF NOT EXISTS tipo_carroceria character varying,
ADD COLUMN IF NOT EXISTS carga_maxima numeric,
ADD COLUMN IF NOT EXISTS tarjeta_circulacion character varying,
ADD COLUMN IF NOT EXISTS vigencia_tarjeta_circulacion date;

-- 4. Agregar campos faltantes en mercancias para v3.1
ALTER TABLE public.mercancias 
ADD COLUMN IF NOT EXISTS tipo_embalaje character varying,
ADD COLUMN IF NOT EXISTS dimensiones jsonb,
ADD COLUMN IF NOT EXISTS numero_piezas integer,
ADD COLUMN IF NOT EXISTS regimen_aduanero character varying;

-- 5. Crear tabla para remolques (separada de autotransporte)
CREATE TABLE IF NOT EXISTS public.remolques_ccp (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  autotransporte_id uuid REFERENCES public.autotransporte(id) ON DELETE CASCADE,
  placa character varying NOT NULL,
  subtipo_rem character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_cartas_porte_id_ccp ON public.cartas_porte(id_ccp);
CREATE INDEX IF NOT EXISTS idx_cartas_porte_version ON public.cartas_porte(version_carta_porte);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_coordenadas ON public.ubicaciones USING GIN(coordenadas);
CREATE INDEX IF NOT EXISTS idx_mercancias_material_peligroso ON public.mercancias(material_peligroso);
CREATE INDEX IF NOT EXISTS idx_autotransporte_peso_bruto ON public.autotransporte(peso_bruto_vehicular);

-- 7. Actualizar trigger de sincronización para incluir nuevos campos
CREATE OR REPLACE FUNCTION public.sync_carta_porte_fields_enhanced()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Sincronizar campos básicos desde datos_formulario
    IF NEW.datos_formulario IS NOT NULL THEN
        -- Campos existentes
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
        
        -- Nuevos campos críticos
        NEW.version_carta_porte = COALESCE(
            NEW.datos_formulario->>'cartaPorteVersion',
            NEW.datos_formulario->'configuracion'->>'version',
            NEW.version_carta_porte,
            '3.1'
        );
        
        NEW.id_ccp = COALESCE(
            NEW.datos_formulario->>'cartaPorteId',
            NEW.id_ccp,
            gen_random_uuid()::text
        );
        
        -- Sincronizar campos de transporte
        NEW.transporte_internacional = COALESCE(
            (NEW.datos_formulario->>'transporteInternacional')::boolean,
            NEW.transporte_internacional
        );
        
        NEW.registro_istmo = COALESCE(
            (NEW.datos_formulario->>'registroIstmo')::boolean,
            NEW.registro_istmo
        );
        
        NEW.tipo_cfdi = COALESCE(
            NEW.datos_formulario->>'tipoCfdi',
            NEW.tipo_cfdi
        );
        
        -- Calcular totales automáticamente
        IF NEW.datos_formulario->'mercancias' IS NOT NULL THEN
            NEW.numero_total_mercancias = jsonb_array_length(NEW.datos_formulario->'mercancias');
            
            -- Calcular peso total de mercancías
            SELECT COALESCE(SUM((mercancia->>'peso_kg')::numeric), 0)
            INTO NEW.peso_bruto_total
            FROM jsonb_array_elements(NEW.datos_formulario->'mercancias') AS mercancia
            WHERE mercancia->>'peso_kg' IS NOT NULL;
        END IF;
        
        -- Calcular distancia total de ubicaciones
        IF NEW.datos_formulario->'ubicaciones' IS NOT NULL THEN
            SELECT COALESCE(SUM((ubicacion->>'distancia_recorrida')::numeric), 0)
            INTO NEW.distancia_total
            FROM jsonb_array_elements(NEW.datos_formulario->'ubicaciones') AS ubicacion
            WHERE ubicacion->>'distancia_recorrida' IS NOT NULL;
        END IF;
    END IF;
    
    -- Asegurar que id_ccp siempre tenga un valor
    IF NEW.id_ccp IS NULL THEN
        NEW.id_ccp = gen_random_uuid()::text;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 8. Actualizar el trigger existente
DROP TRIGGER IF EXISTS sync_carta_porte_fields_trigger ON public.cartas_porte;
CREATE TRIGGER sync_carta_porte_fields_trigger
    BEFORE INSERT OR UPDATE ON public.cartas_porte
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_carta_porte_fields_enhanced();

-- 9. Crear función para validar datos de Carta Porte v3.1
CREATE OR REPLACE FUNCTION public.validate_carta_porte_v31(carta_porte_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
    errores text[] := '{}';
    ubicaciones_count integer;
    mercancias_count integer;
BEGIN
    -- Validar ubicaciones mínimas
    ubicaciones_count := jsonb_array_length(carta_porte_data->'ubicaciones');
    IF ubicaciones_count < 2 THEN
        errores := array_append(errores, 'Se requieren al menos 2 ubicaciones (origen y destino)');
    END IF;
    
    -- Validar mercancías
    mercancias_count := jsonb_array_length(carta_porte_data->'mercancias');
    IF mercancias_count = 0 THEN
        errores := array_append(errores, 'Se requiere al menos una mercancía');
    END IF;
    
    -- Validar autotransporte
    IF carta_porte_data->'autotransporte'->>'placa_vm' IS NULL THEN
        errores := array_append(errores, 'La placa del vehículo es obligatoria');
    END IF;
    
    -- Validar figuras de transporte
    IF jsonb_array_length(carta_porte_data->'figuras') = 0 THEN
        errores := array_append(errores, 'Se requiere al menos una figura de transporte');
    END IF;
    
    -- Validaciones específicas para v3.1
    IF carta_porte_data->>'cartaPorteVersion' = '3.1' THEN
        -- Validar fracción arancelaria obligatoria en v3.1
        IF EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(carta_porte_data->'mercancias') AS mercancia
            WHERE mercancia->>'fraccion_arancelaria' IS NULL
        ) THEN
            errores := array_append(errores, 'Fracción arancelaria es obligatoria en versión 3.1');
        END IF;
    END IF;
    
    RETURN jsonb_build_object(
        'valido', array_length(errores, 1) IS NULL,
        'errores', errores
    );
END;
$function$;

-- 10. Actualizar datos existentes para agregar id_ccp donde falte
UPDATE public.cartas_porte 
SET id_ccp = gen_random_uuid()::text 
WHERE id_ccp IS NULL;

-- 11. Crear políticas RLS para las nuevas tablas
ALTER TABLE public.remolques_ccp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "remolques_ccp_access_policy" 
  ON public.remolques_ccp 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.autotransporte a
      JOIN public.cartas_porte cp ON cp.id = a.carta_porte_id
      WHERE a.id = remolques_ccp.autotransporte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.autotransporte a
      JOIN public.cartas_porte cp ON cp.id = a.carta_porte_id
      WHERE a.id = remolques_ccp.autotransporte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  );
