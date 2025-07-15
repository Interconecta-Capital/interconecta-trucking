-- Fase 1C: Políticas RLS, índices y funciones de automatización

-- 1. Crear políticas RLS
CREATE POLICY "Users can manage their own remolques" ON public.remolques
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own programaciones" ON public.programaciones
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own costos_viaje" ON public.costos_viaje
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_viajes_estado ON public.viajes(estado);
CREATE INDEX IF NOT EXISTS idx_viajes_conductor_vehiculo ON public.viajes(conductor_id, vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_viajes_fechas ON public.viajes(fecha_inicio_programada, fecha_fin_programada);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON public.vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_conductores_estado ON public.conductores(estado);
CREATE INDEX IF NOT EXISTS idx_remolques_estado ON public.remolques(estado);
CREATE INDEX IF NOT EXISTS idx_programaciones_fechas ON public.programaciones(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_programaciones_entidad ON public.programaciones(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_costos_viaje_viaje_id ON public.costos_viaje(viaje_id);

-- 3. Triggers para actualizar updated_at
CREATE TRIGGER update_remolques_updated_at
    BEFORE UPDATE ON public.remolques
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programaciones_updated_at
    BEFORE UPDATE ON public.programaciones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_costos_viaje_updated_at
    BEFORE UPDATE ON public.costos_viaje
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();