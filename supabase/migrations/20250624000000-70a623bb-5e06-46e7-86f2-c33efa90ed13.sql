-- Mejora de rendimiento para programaciones
-- Agregar índice para acelerar la búsqueda por usuario
CREATE INDEX IF NOT EXISTS idx_programaciones_user_id ON public.programaciones(user_id);
