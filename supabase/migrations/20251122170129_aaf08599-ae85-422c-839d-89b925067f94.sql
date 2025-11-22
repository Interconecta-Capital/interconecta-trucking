-- ============================================
-- FASE 1: MIGRAR RÉGIMEN FISCAL PARA FACTURAS EXISTENTES
-- ============================================

-- Función para migrar régimen fiscal desde socios
CREATE OR REPLACE FUNCTION public.migrar_regimen_fiscal_facturas()
RETURNS TABLE(facturas_actualizadas INTEGER, facturas_con_default INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER := 0;
  default_count INTEGER := 0;
BEGIN
  -- Actualizar facturas con régimen fiscal del socio
  UPDATE public.facturas f
  SET regimen_fiscal_receptor = s.regimen_fiscal
  FROM public.viajes v
  JOIN public.socios s ON s.id = v.socio_id
  WHERE f.id IN (
    SELECT f2.id FROM public.facturas f2
    LEFT JOIN public.viajes v2 ON v2.id = f2.viaje_id
    LEFT JOIN public.socios s2 ON s2.id = v2.socio_id
    WHERE f2.regimen_fiscal_receptor IS NULL
      AND s2.regimen_fiscal IS NOT NULL
  )
  AND f.viaje_id = v.id
  AND f.regimen_fiscal_receptor IS NULL
  AND s.regimen_fiscal IS NOT NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Actualizar facturas restantes con valor por defecto '616' (Sin obligaciones fiscales)
  UPDATE public.facturas
  SET regimen_fiscal_receptor = '616'
  WHERE regimen_fiscal_receptor IS NULL;
  
  GET DIAGNOSTICS default_count = ROW_COUNT;
  
  -- Log de auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    NULL, -- Sistema
    'regimen_fiscal_migration',
    jsonb_build_object(
      'facturas_actualizadas', updated_count,
      'facturas_con_default', default_count,
      'timestamp', now()
    )
  );
  
  RETURN QUERY SELECT updated_count, default_count;
END;
$$;

-- Ejecutar migración
SELECT * FROM public.migrar_regimen_fiscal_facturas();

-- Agregar constraint NOT NULL con default para prevenir futuros NULL
ALTER TABLE public.facturas
ALTER COLUMN regimen_fiscal_receptor SET DEFAULT '616';

-- Solo agregar NOT NULL si todas las facturas tienen valor
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.facturas WHERE regimen_fiscal_receptor IS NULL
  ) THEN
    ALTER TABLE public.facturas
    ALTER COLUMN regimen_fiscal_receptor SET NOT NULL;
  END IF;
END $$;

-- ============================================
-- FASE 2: FOREIGN KEYS CON ELIMINACIÓN EN CASCADA
-- ============================================

-- Agregar columna viaje_id en facturas si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'facturas' 
    AND column_name = 'viaje_id'
  ) THEN
    ALTER TABLE public.facturas 
    ADD COLUMN viaje_id UUID REFERENCES public.viajes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Eliminar constraint existente si existe
ALTER TABLE public.facturas
DROP CONSTRAINT IF EXISTS fk_facturas_viaje;

-- Agregar foreign key con ON DELETE CASCADE en facturas
ALTER TABLE public.facturas
ADD CONSTRAINT fk_facturas_viaje
FOREIGN KEY (viaje_id)
REFERENCES public.viajes(id)
ON DELETE CASCADE;

-- Agregar índice para mejorar performance de eliminación
CREATE INDEX IF NOT EXISTS idx_facturas_viaje_id ON public.facturas(viaje_id);

-- Agregar columna viaje_id en borradores_carta_porte si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'borradores_carta_porte' 
    AND column_name = 'viaje_id'
  ) THEN
    ALTER TABLE public.borradores_carta_porte 
    ADD COLUMN viaje_id UUID REFERENCES public.viajes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Eliminar constraint existente si existe
ALTER TABLE public.borradores_carta_porte
DROP CONSTRAINT IF EXISTS fk_borradores_viaje;

-- Agregar foreign key con ON DELETE CASCADE en borradores
ALTER TABLE public.borradores_carta_porte
ADD CONSTRAINT fk_borradores_viaje
FOREIGN KEY (viaje_id)
REFERENCES public.viajes(id)
ON DELETE CASCADE;

-- Índice para borradores
CREATE INDEX IF NOT EXISTS idx_borradores_viaje_id ON public.borradores_carta_porte(viaje_id);

-- Eliminar constraint existente si existe en cartas_porte
ALTER TABLE public.cartas_porte
DROP CONSTRAINT IF EXISTS fk_cartas_porte_viaje;

-- Agregar foreign key con ON DELETE CASCADE en cartas_porte
ALTER TABLE public.cartas_porte
ADD CONSTRAINT fk_cartas_porte_viaje
FOREIGN KEY (viaje_id)
REFERENCES public.viajes(id)
ON DELETE CASCADE;

-- Índice para cartas_porte
CREATE INDEX IF NOT EXISTS idx_cartas_porte_viaje_id ON public.cartas_porte(viaje_id);

-- ============================================
-- FASE 4: FUNCIÓN PARA LIMPIAR DOCUMENTOS HUÉRFANOS
-- ============================================

-- Función para identificar y limpiar documentos huérfanos
CREATE OR REPLACE FUNCTION public.limpiar_documentos_huerfanos()
RETURNS TABLE(
  facturas_eliminadas INTEGER,
  borradores_eliminados INTEGER,
  cartas_eliminadas INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  facturas_count INTEGER := 0;
  borradores_count INTEGER := 0;
  cartas_count INTEGER := 0;
BEGIN
  -- Eliminar facturas huérfanas
  DELETE FROM public.facturas
  WHERE viaje_id IS NOT NULL
    AND viaje_id NOT IN (SELECT id FROM public.viajes);
  
  GET DIAGNOSTICS facturas_count = ROW_COUNT;
  
  -- Eliminar borradores huérfanos
  DELETE FROM public.borradores_carta_porte
  WHERE viaje_id IS NOT NULL
    AND viaje_id NOT IN (SELECT id FROM public.viajes);
  
  GET DIAGNOSTICS borradores_count = ROW_COUNT;
  
  -- Eliminar cartas porte huérfanas
  DELETE FROM public.cartas_porte
  WHERE viaje_id IS NOT NULL
    AND viaje_id NOT IN (SELECT id FROM public.viajes);
  
  GET DIAGNOSTICS cartas_count = ROW_COUNT;
  
  -- Log de auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    NULL,
    'orphan_cleanup',
    jsonb_build_object(
      'facturas_eliminadas', facturas_count,
      'borradores_eliminados', borradores_count,
      'cartas_eliminadas', cartas_count,
      'timestamp', now()
    )
  );
  
  RETURN QUERY SELECT facturas_count, borradores_count, cartas_count;
END;
$$;

-- Ejecutar limpieza de huérfanos
SELECT * FROM public.limpiar_documentos_huerfanos();

-- ============================================
-- VERIFICACIÓN Y COMENTARIOS
-- ============================================

COMMENT ON FUNCTION public.migrar_regimen_fiscal_facturas() IS 'Migra el régimen fiscal desde socios a facturas existentes';
COMMENT ON FUNCTION public.limpiar_documentos_huerfanos() IS 'Elimina facturas, borradores y cartas porte sin viaje asociado';
COMMENT ON CONSTRAINT fk_facturas_viaje ON public.facturas IS 'Eliminación en cascada: al eliminar viaje se elimina factura';
COMMENT ON CONSTRAINT fk_borradores_viaje ON public.borradores_carta_porte IS 'Eliminación en cascada: al eliminar viaje se elimina borrador';
COMMENT ON CONSTRAINT fk_cartas_porte_viaje ON public.cartas_porte IS 'Eliminación en cascada: al eliminar viaje se elimina carta porte';