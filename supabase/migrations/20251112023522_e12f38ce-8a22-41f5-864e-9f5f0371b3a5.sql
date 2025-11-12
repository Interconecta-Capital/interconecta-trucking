-- FASE 6: Sistema de métricas de cartas porte
-- Agregar campos de conteo a la tabla profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cartas_porte_creadas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS timbres_consumidos INTEGER DEFAULT 0;

-- Crear función para incrementar contador de cartas porte creadas
CREATE OR REPLACE FUNCTION public.increment_cartas_creadas()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET cartas_porte_creadas = cartas_porte_creadas + 1
  WHERE id = NEW.usuario_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger para auto-incrementar al crear carta porte
DROP TRIGGER IF EXISTS trigger_increment_cartas ON public.cartas_porte;
CREATE TRIGGER trigger_increment_cartas
AFTER INSERT ON public.cartas_porte
FOR EACH ROW
EXECUTE FUNCTION public.increment_cartas_creadas();

-- Crear función para incrementar contador de timbres consumidos
CREATE OR REPLACE FUNCTION public.increment_timbres_consumidos()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo incrementar si el estado cambia a 'timbrado'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'timbrado' THEN
    UPDATE public.profiles 
    SET timbres_consumidos = timbres_consumidos + 1
    WHERE id = NEW.usuario_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger para auto-incrementar al timbrar
DROP TRIGGER IF EXISTS trigger_increment_timbres ON public.cartas_porte;
CREATE TRIGGER trigger_increment_timbres
AFTER UPDATE ON public.cartas_porte
FOR EACH ROW
EXECUTE FUNCTION public.increment_timbres_consumidos();

-- Comentarios para documentación
COMMENT ON COLUMN public.profiles.cartas_porte_creadas IS 'Contador total de cartas porte creadas (incluye borradores y timbradas)';
COMMENT ON COLUMN public.profiles.timbres_consumidos IS 'Contador de timbres fiscales consumidos (solo cartas timbradas)';