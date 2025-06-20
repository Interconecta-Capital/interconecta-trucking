
-- Fase 1: Habilitar RLS en tablas vacías sin políticas restrictivas
-- Esto resuelve los errores críticos de seguridad sin afectar funcionalidad

-- Habilitar RLS en documentacion_aduanera (tabla vacía)
ALTER TABLE public.documentacion_aduanera ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en permisos_semarnat (tabla vacía)
ALTER TABLE public.permisos_semarnat ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en regimenes_aduaneros (tabla vacía)
ALTER TABLE public.regimenes_aduaneros ENABLE ROW LEVEL SECURITY;

-- Comentario: No agregamos políticas restrictivas aún para evitar cualquier impacto
-- Las tablas permanecen funcionales pero ahora tienen RLS habilitado
-- Esto resuelve los 3 errores críticos de seguridad reportados por Supabase
