-- =============================================
-- MIGRACIÓN: Corregir trigger de conductores
-- =============================================
-- El trigger validar_curp_persona_fisica intenta acceder a NEW.tipo_persona
-- que solo existe en la tabla socios, no en conductores

-- Primero eliminamos el trigger problemático de conductores si existe
DROP TRIGGER IF EXISTS trg_validar_curp_conductores ON conductores;

-- Recrear la función con lógica correcta para cada tabla
CREATE OR REPLACE FUNCTION public.validar_curp_persona_fisica()
RETURNS TRIGGER AS $$
BEGIN
  -- Para tabla SOCIOS (tiene campo tipo_persona)
  IF TG_TABLE_NAME = 'socios' THEN
    -- Solo validar CURP si es persona física
    IF NEW.tipo_persona = 'fisica' THEN
      -- CURP obligatorio para personas físicas
      IF NEW.curp IS NULL OR NEW.curp = '' THEN
        RAISE EXCEPTION 'El CURP es obligatorio para personas físicas';
      END IF;
      -- Validar formato (18 caracteres)
      IF LENGTH(NEW.curp) != 18 THEN
        RAISE EXCEPTION 'El CURP debe tener exactamente 18 caracteres';
      END IF;
    END IF;
  END IF;
  
  -- Para tabla CONDUCTORES (siempre son personas físicas, pero CURP es opcional)
  IF TG_TABLE_NAME = 'conductores' THEN
    -- CURP es opcional para conductores, pero si se proporciona debe ser válido
    IF NEW.curp IS NOT NULL AND NEW.curp != '' THEN
      IF LENGTH(NEW.curp) != 18 THEN
        RAISE EXCEPTION 'El CURP debe tener exactamente 18 caracteres';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recrear el trigger para socios (mantener validación obligatoria)
DROP TRIGGER IF EXISTS trg_validar_curp_socios ON socios;
CREATE TRIGGER trg_validar_curp_socios
  BEFORE INSERT OR UPDATE ON socios
  FOR EACH ROW
  EXECUTE FUNCTION validar_curp_persona_fisica();

-- Recrear el trigger para conductores (validación opcional)
CREATE TRIGGER trg_validar_curp_conductores
  BEFORE INSERT OR UPDATE ON conductores
  FOR EACH ROW
  EXECUTE FUNCTION validar_curp_persona_fisica();

-- =============================================
-- MIGRACIÓN: Tablas para Stripe y Timbres
-- =============================================

-- Tabla para metadata de suscripciones (complementa suscripciones)
CREATE TABLE IF NOT EXISTS public.subscriptions_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan_key TEXT, -- 'gratuito', 'operador', 'flota', 'business'
  interval TEXT CHECK (interval IN ('monthly', 'annual')),
  included_timbres INT DEFAULT 0,
  last_reset TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  json_meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_subscription UNIQUE(user_id)
);

-- Tabla para timbres prepagados (compras one-time)
CREATE TABLE IF NOT EXISTS public.timbres_prepaid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id TEXT, -- Stripe payment intent ID
  quantity INT NOT NULL,
  remaining INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ -- NULL = no expira
);

-- Tabla para log de consumo de timbres
CREATE TABLE IF NOT EXISTS public.timbres_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  carta_porte_id UUID,
  source TEXT CHECK (source IN ('prepaid', 'plan', 'bonus')),
  pack_id UUID,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_subscriptions_meta_user ON subscriptions_meta(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_meta_status ON subscriptions_meta(status);
CREATE INDEX IF NOT EXISTS idx_timbres_prepaid_user ON timbres_prepaid(user_id);
CREATE INDEX IF NOT EXISTS idx_timbres_prepaid_remaining ON timbres_prepaid(remaining) WHERE remaining > 0;
CREATE INDEX IF NOT EXISTS idx_timbres_usage_log_user ON timbres_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_timbres_usage_log_carta ON timbres_usage_log(carta_porte_id);

-- RLS para subscriptions_meta
ALTER TABLE public.subscriptions_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription meta"
ON public.subscriptions_meta FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscription meta"
ON public.subscriptions_meta FOR ALL
USING (auth.uid() = user_id OR is_superuser_secure(auth.uid()));

-- RLS para timbres_prepaid
ALTER TABLE public.timbres_prepaid ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prepaid timbres"
ON public.timbres_prepaid FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage prepaid timbres"
ON public.timbres_prepaid FOR ALL
USING (is_superuser_secure(auth.uid()));

-- RLS para timbres_usage_log
ALTER TABLE public.timbres_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage log"
ON public.timbres_usage_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage log"
ON public.timbres_usage_log FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_superuser_secure(auth.uid()));

-- =============================================
-- MIGRACIÓN: Sincronizar planes con Landing Page
-- =============================================

-- Actualizar planes existentes para coincidir con landing page
UPDATE planes_suscripcion SET 
  timbres_mensuales = 5,
  precio_mensual = 0,
  precio_anual = 0,
  limite_conductores = 1,
  limite_vehiculos = 2,
  limite_socios = 1,
  limite_cartas_porte = 10,
  descripcion = 'Para probar la plataforma'
WHERE nombre ILIKE '%gratuito%' OR nombre ILIKE '%free%';

UPDATE planes_suscripcion SET 
  timbres_mensuales = 50,
  precio_mensual = 349,
  precio_anual = 3350, -- 349 * 12 * 0.8
  limite_conductores = 10,
  limite_vehiculos = 10,
  limite_socios = 5,
  limite_cartas_porte = 100,
  descripcion = 'Acceso al Software completo'
WHERE nombre ILIKE '%operador%' OR nombre ILIKE '%esencial%';

UPDATE planes_suscripcion SET 
  timbres_mensuales = 200,
  precio_mensual = 799,
  precio_anual = 7670, -- 799 * 12 * 0.8
  limite_conductores = NULL, -- Ilimitados
  limite_vehiculos = NULL,
  limite_socios = NULL,
  limite_cartas_porte = NULL,
  descripcion = 'Inteligencia de Negocios'
WHERE nombre ILIKE '%flota%' OR nombre ILIKE '%profesional%';

UPDATE planes_suscripcion SET 
  timbres_mensuales = 500,
  precio_mensual = 1499,
  precio_anual = 14390, -- 1499 * 12 * 0.8
  limite_conductores = NULL,
  limite_vehiculos = NULL,
  limite_socios = NULL,
  limite_cartas_porte = NULL,
  descripcion = 'Para grandes operaciones'
WHERE nombre ILIKE '%business%' OR nombre ILIKE '%enterprise%';

-- Insertar plan Business si no existe
INSERT INTO planes_suscripcion (
  nombre, 
  descripcion, 
  precio_mensual, 
  precio_anual,
  timbres_mensuales,
  limite_conductores,
  limite_vehiculos,
  limite_socios,
  limite_cartas_porte,
  activo
)
SELECT 
  'Plan Business',
  'Para grandes operaciones',
  1499,
  14390,
  500,
  NULL,
  NULL,
  NULL,
  NULL,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM planes_suscripcion WHERE nombre ILIKE '%business%'
);

-- Trigger para actualizar updated_at en subscriptions_meta
CREATE OR REPLACE FUNCTION update_subscriptions_meta_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_meta_updated_at ON subscriptions_meta;
CREATE TRIGGER trg_subscriptions_meta_updated_at
  BEFORE UPDATE ON subscriptions_meta
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_meta_updated_at();