
-- Verificar y crear políticas RLS para la tabla suscripciones
-- Habilitar RLS si no está habilitado
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

-- Crear política para que los usuarios puedan ver sus propias suscripciones (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'suscripciones' 
        AND policyname = 'Users can view own subscriptions'
    ) THEN
        CREATE POLICY "Users can view own subscriptions" ON public.suscripciones
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Crear política para que los usuarios puedan insertar sus propias suscripciones (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'suscripciones' 
        AND policyname = 'Users can insert own subscriptions'
    ) THEN
        CREATE POLICY "Users can insert own subscriptions" ON public.suscripciones
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Crear política para que los usuarios puedan actualizar sus propias suscripciones (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'suscripciones' 
        AND policyname = 'Users can update own subscriptions'
    ) THEN
        CREATE POLICY "Users can update own subscriptions" ON public.suscripciones
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Verificar y crear políticas RLS para la tabla planes_suscripcion
-- Habilitar RLS si no está habilitado
ALTER TABLE public.planes_suscripcion ENABLE ROW LEVEL SECURITY;

-- Crear política para que usuarios autenticados puedan ver todos los planes (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'planes_suscripcion' 
        AND policyname = 'Authenticated users can view all plans'
    ) THEN
        CREATE POLICY "Authenticated users can view all plans" ON public.planes_suscripcion
          FOR SELECT TO authenticated USING (true);
    END IF;
END $$;
