-- ============================================
-- FASE 1: Sistema de Créditos - Tablas Base
-- ============================================

-- 1.1 Tabla de balance de créditos por usuario
CREATE TABLE IF NOT EXISTS public.creditos_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_disponible INT NOT NULL DEFAULT 0,
  total_comprados INT NOT NULL DEFAULT 0,
  total_consumidos INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 1.2 Tabla de paquetes de créditos disponibles
CREATE TABLE IF NOT EXISTS public.paquetes_creditos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  cantidad_creditos INT NOT NULL,
  precio_mxn DECIMAL(10,2) NOT NULL,
  descuento_porcentaje INT DEFAULT 0,
  precio_por_credito DECIMAL(10,2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden INT DEFAULT 0,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.3 Tabla de registro de todas las transacciones de créditos
CREATE TABLE IF NOT EXISTS public.transacciones_creditos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('compra', 'consumo', 'ajuste', 'regalo')),
  cantidad INT NOT NULL,
  balance_anterior INT NOT NULL,
  balance_nuevo INT NOT NULL,
  paquete_id UUID REFERENCES public.paquetes_creditos(id),
  carta_porte_id UUID REFERENCES public.cartas_porte(id),
  stripe_payment_intent_id VARCHAR(255),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.4 Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_creditos_usuarios_user_id ON public.creditos_usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_creditos_user_id ON public.transacciones_creditos(user_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_creditos_tipo ON public.transacciones_creditos(tipo);
CREATE INDEX IF NOT EXISTS idx_transacciones_creditos_created_at ON public.transacciones_creditos(created_at DESC);

-- 1.5 Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_creditos_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_creditos_usuarios_updated_at
  BEFORE UPDATE ON public.creditos_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_creditos_usuarios_updated_at();

-- ============================================
-- FASE 1: RLS Policies para Créditos
-- ============================================

ALTER TABLE public.creditos_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paquetes_creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones_creditos ENABLE ROW LEVEL SECURITY;

-- Políticas para creditos_usuarios
CREATE POLICY "usuarios_ver_propios_creditos" 
  ON public.creditos_usuarios
  FOR SELECT 
  USING (auth.uid() = user_id OR is_superuser_optimized());

-- Políticas para paquetes_creditos (público para ver)
CREATE POLICY "todos_ver_paquetes_activos" 
  ON public.paquetes_creditos
  FOR SELECT 
  USING (activo = true);

-- Políticas para transacciones_creditos
CREATE POLICY "usuarios_ver_propias_transacciones" 
  ON public.transacciones_creditos
  FOR SELECT 
  USING (auth.uid() = user_id OR is_superuser_optimized());

-- ============================================
-- FASE 2: Reestructurar Planes (Remover Límite de Timbres)
-- ============================================

-- Actualizar Plan Gratuito (con 5 timbres de cortesía mensuales)
UPDATE public.planes_suscripcion 
SET 
  descripcion = 'Cuenta gratuita con acceso limitado. Incluye 5 timbres de cortesía mensuales.',
  precio_mensual = 0,
  precio_anual = 0,
  dias_prueba = 999,
  limite_cartas_porte = 5,
  limite_conductores = 1,
  limite_vehiculos = 2,
  limite_socios = 5,
  puede_timbrar = true,
  puede_generar_xml = false,
  puede_cancelar_cfdi = false,
  puede_tracking = false,
  puede_acceder_funciones_avanzadas = false,
  activo = true
WHERE nombre ILIKE '%gratuito%' OR nombre ILIKE '%free%' OR nombre ILIKE '%beta%';

-- Si no existe plan gratuito, crearlo
INSERT INTO public.planes_suscripcion (
  nombre, 
  descripcion, 
  precio_mensual, 
  precio_anual,
  dias_prueba,
  limite_cartas_porte,
  limite_conductores,
  limite_vehiculos,
  limite_socios,
  puede_timbrar,
  puede_generar_xml,
  puede_cancelar_cfdi,
  puede_tracking,
  activo
)
SELECT 
  'Plan Gratuito (Beta)',
  'Cuenta gratuita con acceso limitado. Incluye 5 timbres de cortesía mensuales.',
  0,
  0,
  999,
  5,
  1,
  2,
  5,
  true,
  false,
  false,
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.planes_suscripcion 
  WHERE nombre ILIKE '%gratuito%' OR nombre ILIKE '%free%' OR nombre ILIKE '%beta%'
);

-- Actualizar Plan Operador ($249) - SIN límite de timbres
UPDATE public.planes_suscripcion 
SET 
  precio_mensual = 249,
  precio_anual = 2490,
  descripcion = 'Acceso completo al software: IA Anti-Errores, Dashboard Básico, 3 Usuarios. Timbres se compran por separado.',
  limite_cartas_porte = NULL,
  limite_conductores = 10,
  limite_vehiculos = 10,
  limite_socios = 15,
  puede_timbrar = true,
  puede_generar_xml = true,
  puede_cancelar_cfdi = true,
  puede_tracking = false,
  puede_acceder_funciones_avanzadas = true
WHERE nombre ILIKE '%operador%' OR nombre ILIKE '%básico%' OR nombre ILIKE '%esencial%';

-- Actualizar Plan Flota ($599) - SIN límite de timbres
UPDATE public.planes_suscripcion 
SET 
  precio_mensual = 599,
  precio_anual = 5990,
  descripcion = 'Inteligencia de Negocios: Dashboard de Rentabilidad, Conexión GPS/API, Usuarios Ilimitados. Timbres se compran por separado.',
  limite_cartas_porte = NULL,
  limite_conductores = NULL,
  limite_vehiculos = NULL,
  limite_socios = NULL,
  puede_timbrar = true,
  puede_generar_xml = true,
  puede_cancelar_cfdi = true,
  puede_tracking = true,
  puede_acceder_funciones_avanzadas = true,
  puede_acceder_administracion = true
WHERE nombre ILIKE '%flota%' OR nombre ILIKE '%profesional%' OR nombre ILIKE '%premium%';

-- ============================================
-- FASE 2: Insertar Paquetes de Créditos
-- ============================================

INSERT INTO public.paquetes_creditos 
  (nombre, cantidad_creditos, precio_mxn, descuento_porcentaje, precio_por_credito, orden, descripcion) 
VALUES
  ('Paquete Básico', 50, 50.00, 0, 1.00, 1, 'Ideal para iniciar. 50 timbres a precio regular.'),
  ('Paquete Profesional', 150, 135.00, 10, 0.90, 2, 'Ahorra 10%. 150 timbres para operaciones medianas.'),
  ('Paquete Flota', 500, 425.00, 15, 0.85, 3, 'Ahorra 15%. 500 timbres para flotas en crecimiento.'),
  ('Paquete Corporativo', 1000, 750.00, 25, 0.75, 4, 'Ahorra 25%. 1000 timbres para operaciones de alto volumen.')
ON CONFLICT DO NOTHING;

-- ============================================
-- FASE 7: Migración - Otorgar Créditos de Bienvenida
-- ============================================

-- Crear cuentas de créditos para todos los usuarios existentes
INSERT INTO public.creditos_usuarios (user_id, balance_disponible, total_comprados)
SELECT DISTINCT
  u.id,
  CASE 
    WHEN s.status = 'trial' OR s.status IS NULL THEN 5
    WHEN p.precio_mensual = 0 THEN 5
    WHEN p.precio_mensual < 250 THEN 25
    WHEN p.precio_mensual < 500 THEN 50
    ELSE 100
  END,
  0
FROM auth.users u
LEFT JOIN public.suscripciones s ON s.user_id = u.id
LEFT JOIN public.planes_suscripcion p ON p.id = s.plan_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.creditos_usuarios WHERE user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Registrar transacciones de bienvenida
INSERT INTO public.transacciones_creditos (user_id, tipo, cantidad, balance_anterior, balance_nuevo, notas)
SELECT 
  cu.user_id,
  'regalo',
  cu.balance_disponible,
  0,
  cu.balance_disponible,
  '🎉 Créditos de bienvenida por migración al nuevo modelo híbrido'
FROM public.creditos_usuarios cu
WHERE cu.created_at > now() - interval '5 minutes'
  AND NOT EXISTS (
    SELECT 1 FROM public.transacciones_creditos tc 
    WHERE tc.user_id = cu.user_id AND tc.tipo = 'regalo'
  );

-- ============================================
-- FASE 8: Vista de Monitoreo para Admins
-- ============================================

CREATE OR REPLACE VIEW public.admin_creditos_dashboard AS
SELECT 
  COUNT(DISTINCT user_id) AS usuarios_con_creditos,
  SUM(balance_disponible) AS total_creditos_disponibles,
  SUM(total_comprados) AS total_creditos_vendidos,
  SUM(total_consumidos) AS total_creditos_consumidos,
  ROUND(AVG(balance_disponible), 2) AS promedio_balance_por_usuario,
  (SELECT COUNT(*) FROM public.transacciones_creditos WHERE tipo = 'compra' AND created_at > now() - interval '30 days') AS compras_ultimo_mes,
  (SELECT SUM(cantidad) FROM public.transacciones_creditos WHERE tipo = 'compra' AND created_at > now() - interval '30 days') AS creditos_vendidos_ultimo_mes
FROM public.creditos_usuarios;

-- Comentarios para documentación
COMMENT ON TABLE public.creditos_usuarios IS 'Balance de créditos (timbres) por usuario';
COMMENT ON TABLE public.paquetes_creditos IS 'Paquetes de créditos disponibles para compra';
COMMENT ON TABLE public.transacciones_creditos IS 'Registro completo de movimientos de créditos';
COMMENT ON VIEW public.admin_creditos_dashboard IS 'Dashboard de métricas de créditos para administradores';