
-- Agregar columna rol_especial a la tabla usuarios si no existe
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS rol_especial character varying;

-- Crear restricción única en auth_user_id solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuarios_auth_user_id_key' 
        AND table_name = 'usuarios'
    ) THEN
        ALTER TABLE public.usuarios 
        ADD CONSTRAINT usuarios_auth_user_id_key UNIQUE (auth_user_id);
    END IF;
END $$;

-- Crear restricción única en user_id para suscripciones solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'suscripciones_user_id_key' 
        AND table_name = 'suscripciones'
    ) THEN
        ALTER TABLE public.suscripciones 
        ADD CONSTRAINT suscripciones_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Convertir cuenta arrebolcorporation@gmail.com a superusuario
DO $$
DECLARE
    tenant_uuid uuid;
    plan_uuid uuid;
BEGIN
    -- 1. Crear tenant para tu empresa si no existe
    INSERT INTO public.tenants (nombre_empresa, rfc_empresa)
    VALUES ('Arrebol Corporation', 'ARREBOL001')
    ON CONFLICT DO NOTHING;
    
    -- Obtener tenant_id
    SELECT id INTO tenant_uuid FROM public.tenants WHERE nombre_empresa = 'Arrebol Corporation';
    
    -- Obtener plan_id del plan más premium disponible
    SELECT id INTO plan_uuid FROM public.planes_suscripcion 
    ORDER BY precio_mensual DESC NULLS LAST, created_at DESC LIMIT 1;
    
    -- Insertar o actualizar usuario
    INSERT INTO public.usuarios (
        auth_user_id, 
        email, 
        nombre, 
        tenant_id, 
        rol, 
        rol_especial
    )
    VALUES (
        '403b8b1c-032e-4355-8e6b-91a6bce3b04d'::uuid,
        'arrebolcorporation@gmail.com',
        'Arrebol Corporation Admin',
        tenant_uuid,
        'admin',
        'superuser'
    )
    ON CONFLICT (auth_user_id) DO UPDATE SET
        rol_especial = 'superuser',
        rol = 'admin';
    
    -- Crear o actualizar suscripción Enterprise permanente
    INSERT INTO public.suscripciones (
        user_id,
        plan_id,
        status,
        fecha_inicio,
        fecha_vencimiento,
        fecha_fin_prueba
    )
    VALUES (
        '403b8b1c-032e-4355-8e6b-91a6bce3b04d'::uuid,
        plan_uuid,
        'active',
        now(),
        now() + interval '100 years',
        now() - interval '1 day'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan_id = plan_uuid,
        status = 'active',
        fecha_vencimiento = now() + interval '100 years';
END $$;
