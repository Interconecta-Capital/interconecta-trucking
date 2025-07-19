-- Fase 5: Conexión y Sincronización Total de Datos
-- Paso 1 y 2: Triggers automáticos y Foreign Keys

-- 1. Agregar foreign keys faltantes para mejorar integridad referencial
ALTER TABLE public.costos_viaje ADD CONSTRAINT fk_costos_viaje_viaje 
  FOREIGN KEY (viaje_id) REFERENCES public.viajes(id) ON DELETE CASCADE;

ALTER TABLE public.analisis_viajes ADD CONSTRAINT fk_analisis_viajes_viaje 
  FOREIGN KEY (viaje_id) REFERENCES public.viajes(id) ON DELETE CASCADE;

ALTER TABLE public.viajes ADD CONSTRAINT fk_viajes_conductor 
  FOREIGN KEY (conductor_id) REFERENCES public.conductores(id) ON DELETE SET NULL;

ALTER TABLE public.viajes ADD CONSTRAINT fk_viajes_vehiculo 
  FOREIGN KEY (vehiculo_id) REFERENCES public.vehiculos(id) ON DELETE SET NULL;

ALTER TABLE public.viajes ADD CONSTRAINT fk_viajes_remolque 
  FOREIGN KEY (remolque_id) REFERENCES public.remolques(id) ON DELETE SET NULL;

-- 2. Función para crear costos automáticamente cuando se crea un viaje
CREATE OR REPLACE FUNCTION public.crear_costos_viaje_automatico()
RETURNS TRIGGER AS $$
DECLARE
  combustible_est NUMERIC;
  peajes_est NUMERIC;
  salario_est NUMERIC;
  mantenimiento_est NUMERIC;
BEGIN
  -- Calcular costos estimados basados en distancia y tipo de vehículo
  combustible_est := COALESCE(NEW.distancia_km * 2.5, 1000); -- $2.5 por km
  peajes_est := COALESCE(NEW.distancia_km * 0.8, 400); -- $0.8 por km
  salario_est := COALESCE(NEW.tiempo_estimado_horas * 150, 1200); -- $150 por hora
  mantenimiento_est := COALESCE(NEW.distancia_km * 0.3, 200); -- $0.3 por km

  -- Insertar costos automáticamente
  INSERT INTO public.costos_viaje (
    viaje_id,
    user_id,
    combustible_estimado,
    peajes_estimados,
    casetas_estimadas,
    salario_conductor_estimado,
    mantenimiento_estimado,
    costo_total_estimado,
    margen_estimado,
    precio_cotizado
  ) VALUES (
    NEW.id,
    NEW.user_id,
    combustible_est,
    peajes_est,
    peajes_est * 0.5, -- casetas = 50% de peajes
    salario_est,
    mantenimiento_est,
    combustible_est + peajes_est + (peajes_est * 0.5) + salario_est + mantenimiento_est,
    (NEW.precio_cobrado - (combustible_est + peajes_est + (peajes_est * 0.5) + salario_est + mantenimiento_est)),
    NEW.precio_cobrado
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para crear costos automáticamente
CREATE TRIGGER trigger_crear_costos_viaje
  AFTER INSERT ON public.viajes
  FOR EACH ROW
  EXECUTE FUNCTION public.crear_costos_viaje_automatico();

-- 4. Función para generar análisis cuando un viaje se completa
CREATE OR REPLACE FUNCTION public.generar_analisis_viaje_automatico()
RETURNS TRIGGER AS $$
DECLARE
  costos_record RECORD;
  hash_ruta VARCHAR;
BEGIN
  -- Solo generar análisis cuando el viaje se completa
  IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
    
    -- Obtener costos del viaje
    SELECT * INTO costos_record 
    FROM public.costos_viaje 
    WHERE viaje_id = NEW.id;
    
    -- Generar hash de ruta
    hash_ruta := public.generar_hash_ruta(NEW.origen, NEW.destino);
    
    -- Insertar análisis
    INSERT INTO public.analisis_viajes (
      viaje_id,
      user_id,
      ruta_hash,
      fecha_viaje,
      precio_cobrado,
      costo_estimado,
      costo_real,
      tiempo_estimado,
      tiempo_real,
      margen_real,
      vehiculo_tipo
    ) VALUES (
      NEW.id,
      NEW.user_id,
      hash_ruta,
      COALESCE(NEW.fecha_inicio_real::date, NEW.fecha_inicio_programada::date),
      NEW.precio_cobrado,
      COALESCE(costos_record.costo_total_estimado, 0),
      COALESCE(costos_record.costo_total_real, costos_record.costo_total_estimado),
      COALESCE(NEW.tiempo_estimado_horas * 60, 480), -- convertir a minutos
      COALESCE(NEW.tiempo_real_horas * 60, NEW.tiempo_estimado_horas * 60, 480),
      COALESCE(costos_record.margen_real, costos_record.margen_estimado, 0),
      (SELECT tipo FROM public.vehiculos WHERE id = NEW.vehiculo_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para generar análisis automáticamente
CREATE TRIGGER trigger_generar_analisis_viaje
  AFTER UPDATE ON public.viajes
  FOR EACH ROW
  EXECUTE FUNCTION public.generar_analisis_viaje_automatico();

-- 6. Función para poblar datos faltantes en viajes existentes
CREATE OR REPLACE FUNCTION public.poblar_datos_viajes_existentes()
RETURNS TEXT AS $$
DECLARE
  viaje_record RECORD;
  costos_count INTEGER;
  analisis_count INTEGER;
  result_text TEXT := '';
BEGIN
  -- Procesar cada viaje existente que no tenga costos
  FOR viaje_record IN 
    SELECT v.* FROM public.viajes v 
    LEFT JOIN public.costos_viaje cv ON v.id = cv.viaje_id 
    WHERE cv.viaje_id IS NULL
  LOOP
    -- Crear costos para este viaje
    PERFORM public.crear_costos_viaje_automatico() FROM (
      SELECT viaje_record.* 
    ) AS NEW;
    
    result_text := result_text || 'Creados costos para viaje: ' || viaje_record.id || E'\n';
  END LOOP;
  
  -- Procesar viajes completados sin análisis
  FOR viaje_record IN 
    SELECT v.* FROM public.viajes v 
    LEFT JOIN public.analisis_viajes av ON v.id = av.viaje_id 
    WHERE av.viaje_id IS NULL AND v.estado = 'completado'
  LOOP
    -- Crear análisis para este viaje
    PERFORM public.generar_analisis_viaje_automatico() FROM (
      SELECT viaje_record.*, viaje_record.* 
    ) AS NEW, (SELECT viaje_record.*) AS OLD;
    
    result_text := result_text || 'Creado análisis para viaje: ' || viaje_record.id || E'\n';
  END LOOP;
  
  -- Contar resultados
  SELECT COUNT(*) INTO costos_count FROM public.costos_viaje;
  SELECT COUNT(*) INTO analisis_count FROM public.analisis_viajes;
  
  result_text := result_text || 'Total costos: ' || costos_count || E'\n';
  result_text := result_text || 'Total análisis: ' || analisis_count || E'\n';
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- 7. Función para actualizar métricas en tiempo real
CREATE OR REPLACE FUNCTION public.actualizar_metricas_tiempo_real()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estado de conductor si está asignado
  IF NEW.conductor_id IS NOT NULL THEN
    UPDATE public.conductores 
    SET viaje_actual_id = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
      ELSE NULL 
    END,
    estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'ocupado'
      ELSE 'disponible'
    END
    WHERE id = NEW.conductor_id;
  END IF;
  
  -- Actualizar estado de vehículo si está asignado
  IF NEW.vehiculo_id IS NOT NULL THEN
    UPDATE public.vehiculos 
    SET estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'en_uso'
      ELSE 'disponible'
    END
    WHERE id = NEW.vehiculo_id;
  END IF;
  
  -- Actualizar estado de remolque si está asignado
  IF NEW.remolque_id IS NOT NULL THEN
    UPDATE public.remolques 
    SET estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'en_uso'
      ELSE 'disponible'
    END
    WHERE id = NEW.remolque_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para actualizar métricas en tiempo real
CREATE TRIGGER trigger_actualizar_metricas_tiempo_real
  AFTER INSERT OR UPDATE ON public.viajes
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_metricas_tiempo_real();