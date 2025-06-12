
-- Crear tabla de planes de suscripción
CREATE TABLE public.planes_suscripcion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  descripcion TEXT,
  precio_mensual DECIMAL(10,2) NOT NULL,
  precio_anual DECIMAL(10,2),
  dias_prueba INTEGER DEFAULT 7,
  limite_cartas_porte INTEGER, -- NULL = ilimitado
  limite_conductores INTEGER,
  limite_vehiculos INTEGER,
  limite_socios INTEGER,
  puede_cancelar_cfdi BOOLEAN DEFAULT false,
  puede_generar_xml BOOLEAN DEFAULT false,
  puede_timbrar BOOLEAN DEFAULT false,
  puede_tracking BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de suscripciones de usuarios
CREATE TABLE public.suscripciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_id UUID REFERENCES public.planes_suscripcion NOT NULL,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'trial', -- 'trial', 'active', 'past_due', 'canceled', 'suspended'
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  fecha_fin_prueba TIMESTAMP WITH TIME ZONE,
  dias_gracia INTEGER DEFAULT 3,
  ultimo_pago TIMESTAMP WITH TIME ZONE,
  proximo_pago TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Crear tabla de historial de pagos
CREATE TABLE public.pagos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  suscripcion_id UUID REFERENCES public.suscripciones NOT NULL,
  stripe_payment_intent_id VARCHAR,
  monto DECIMAL(10,2) NOT NULL,
  moneda VARCHAR DEFAULT 'MXN',
  status VARCHAR NOT NULL, -- 'pending', 'succeeded', 'failed', 'canceled'
  metodo_pago VARCHAR,
  fecha_pago TIMESTAMP WITH TIME ZONE,
  periodo_inicio TIMESTAMP WITH TIME ZONE,
  periodo_fin TIMESTAMP WITH TIME ZONE,
  factura_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de bloqueos por falta de pago
CREATE TABLE public.bloqueos_usuario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  motivo VARCHAR NOT NULL, -- 'falta_pago', 'suspension_manual', etc.
  fecha_bloqueo TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_desbloqueo TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT true,
  mensaje_bloqueo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índice único parcial para bloqueos activos (solo un bloqueo activo por usuario)
CREATE UNIQUE INDEX idx_bloqueos_usuario_activo 
ON public.bloqueos_usuario (user_id) 
WHERE activo = true;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.planes_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueos_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas para planes (públicos para lectura)
CREATE POLICY "Anyone can view active plans" 
  ON public.planes_suscripcion 
  FOR SELECT 
  USING (activo = true);

-- Políticas para suscripciones
CREATE POLICY "Users can view their own subscription" 
  ON public.suscripciones 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.suscripciones 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage all subscriptions" 
  ON public.suscripciones 
  FOR ALL 
  USING (true);

-- Políticas para pagos
CREATE POLICY "Users can view their own payments" 
  ON public.pagos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage all payments" 
  ON public.pagos 
  FOR ALL 
  USING (true);

-- Políticas para bloqueos
CREATE POLICY "Users can view their own blocks" 
  ON public.bloqueos_usuario 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage all blocks" 
  ON public.bloqueos_usuario 
  FOR ALL 
  USING (true);

-- Insertar planes básicos
INSERT INTO public.planes_suscripcion (nombre, descripcion, precio_mensual, precio_anual, dias_prueba, limite_cartas_porte, limite_conductores, limite_vehiculos, limite_socios, puede_cancelar_cfdi, puede_generar_xml, puede_timbrar, puede_tracking) VALUES
('Básico', 'Plan básico para pequeñas empresas', 299.00, 2990.00, 7, 50, 5, 10, 10, false, true, false, false),
('Profesional', 'Plan profesional para empresas medianas', 799.00, 7990.00, 7, 200, 20, 50, 50, true, true, true, true),
('Empresarial', 'Plan empresarial sin límites', 1499.00, 14990.00, 14, NULL, NULL, NULL, NULL, true, true, true, true);

-- Función para crear suscripción automática al registrarse
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear suscripción de prueba con plan básico
  INSERT INTO public.suscripciones (
    user_id, 
    plan_id, 
    status, 
    fecha_fin_prueba,
    fecha_vencimiento
  ) 
  SELECT 
    NEW.id,
    id,
    'trial',
    now() + INTERVAL '7 days',
    now() + INTERVAL '7 days'
  FROM public.planes_suscripcion 
  WHERE nombre = 'Básico' 
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear suscripción automática
CREATE TRIGGER on_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_trial_subscription();

-- Función para verificar vencimientos y crear bloqueos
CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
RETURNS void AS $$
BEGIN
  -- Bloquear usuarios con suscripciones vencidas
  INSERT INTO public.bloqueos_usuario (user_id, motivo, mensaje_bloqueo)
  SELECT 
    s.user_id,
    'falta_pago',
    'Su suscripción ha vencido. Para continuar usando la plataforma, realice el pago correspondiente.'
  FROM public.suscripciones s
  WHERE s.fecha_vencimiento < now()
    AND s.status IN ('trial', 'past_due')
    AND NOT EXISTS (
      SELECT 1 FROM public.bloqueos_usuario b 
      WHERE b.user_id = s.user_id AND b.activo = true
    );
    
  -- Actualizar status de suscripciones vencidas
  UPDATE public.suscripciones 
  SET status = 'past_due', updated_at = now()
  WHERE fecha_vencimiento < now() 
    AND status = 'trial';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
