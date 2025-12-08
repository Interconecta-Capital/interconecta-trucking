# Gestión de Usuarios y Roles

## Arquitectura de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE AUTH                            │
│                    (auth.users)                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ auth.uid()
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    ESQUEMA PUBLIC                           │
├───────────────┬─────────────────┬───────────────────────────┤
│   profiles    │   user_roles    │   superusuarios           │
│   (1:1 user)  │   (N:1 user)    │   (admin global)          │
└───────────────┴─────────────────┴───────────────────────────┘
```

---

## profiles

Perfil extendido de usuarios.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos básicos
  full_name VARCHAR,
  avatar_url TEXT,
  email VARCHAR,
  phone VARCHAR,
  
  -- Preferencias
  preferred_language VARCHAR DEFAULT 'es',
  timezone VARCHAR DEFAULT 'America/Mexico_City',
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  first_login_at TIMESTAMPTZ,
  
  -- Notificaciones
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### RLS Policies
```sql
-- Usuarios solo ven su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## user_roles

Sistema de roles (separado del perfil para evitar privilege escalation).

```sql
-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  
  -- Constraint único
  UNIQUE (user_id, role),
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Función de Verificación de Roles
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### RLS Policies
```sql
-- Solo admins pueden ver roles
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Solo admins pueden asignar roles
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

---

## superusuarios

Superusuarios con acceso global (tabla separada para mayor seguridad).

```sql
CREATE TABLE public.superusuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  
  -- Permisos específicos
  puede_gestionar_usuarios BOOLEAN DEFAULT true,
  puede_ver_metricas BOOLEAN DEFAULT true,
  puede_gestionar_planes BOOLEAN DEFAULT true,
  puede_gestionar_creditos BOOLEAN DEFAULT true,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Función de Verificación de Superusuario
```sql
CREATE OR REPLACE FUNCTION public.is_superuser_secure(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.superusuarios
    WHERE user_id = _user_id
      AND activo = true
  )
$$;
```

---

## usuarios

Usuarios dentro del contexto de tenants (multi-tenant).

```sql
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  
  -- Datos
  email VARCHAR,
  nombre VARCHAR,
  
  -- Rol dentro del tenant
  rol_tenant VARCHAR DEFAULT 'usuario',
  -- Roles: admin_tenant, usuario, visor
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## tenants

Multi-tenancy para empresas.

```sql
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  nombre VARCHAR NOT NULL,
  slug VARCHAR UNIQUE,
  
  -- Datos fiscales
  rfc VARCHAR,
  razon_social VARCHAR,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Plan
  plan_id UUID REFERENCES planes(id),
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## subscriptions

Suscripciones de usuarios a planes.

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES planes(id),
  
  -- Estado
  status VARCHAR DEFAULT 'trial',
  -- Estados: trial, active, past_due, canceled, expired
  
  -- Fechas
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  
  -- Trial
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  
  -- Stripe
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## planes

Planes de suscripción disponibles.

```sql
CREATE TABLE public.planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  nombre VARCHAR NOT NULL,
  slug VARCHAR UNIQUE,
  descripcion TEXT,
  
  -- Precios
  precio_mensual NUMERIC DEFAULT 0,
  precio_anual NUMERIC,
  moneda VARCHAR DEFAULT 'MXN',
  
  -- Límites
  limite_cartas_porte INTEGER, -- NULL = ilimitado
  limite_conductores INTEGER,
  limite_vehiculos INTEGER,
  limite_socios INTEGER,
  timbres_incluidos INTEGER DEFAULT 0,
  
  -- Funcionalidades
  funcionalidades JSONB DEFAULT '{}'::jsonb,
  -- Ejemplo: {
  --   "cancelar_cfdi": true,
  --   "tracking": true,
  --   "reportes_avanzados": false
  -- }
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  visible BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  
  -- Stripe
  stripe_price_id_mensual VARCHAR,
  stripe_price_id_anual VARCHAR,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## creditos_usuarios

Balance de créditos/timbres.

```sql
CREATE TABLE public.creditos_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  
  -- Balances
  balance_disponible INTEGER DEFAULT 0,
  total_comprados INTEGER DEFAULT 0,
  total_consumidos INTEGER DEFAULT 0,
  timbres_mes_actual INTEGER DEFAULT 0,
  
  -- Renovación
  fecha_renovacion DATE,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## bloqueos_usuario

Bloqueos de cuenta por falta de pago u otras razones.

```sql
CREATE TABLE public.bloqueos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Motivo
  motivo VARCHAR NOT NULL,
  mensaje_bloqueo TEXT,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Fechas
  fecha_bloqueo TIMESTAMPTZ DEFAULT now(),
  fecha_desbloqueo TIMESTAMPTZ,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Funciones Auxiliares

### is_admin_or_superuser
```sql
CREATE OR REPLACE FUNCTION public.is_admin_or_superuser(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT 
    is_superuser_secure(_user_id) OR
    has_role(_user_id, 'admin')
$$;
```

### get_user_plan_limits
```sql
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'limite_cartas_porte', p.limite_cartas_porte,
    'limite_conductores', p.limite_conductores,
    'limite_vehiculos', p.limite_vehiculos,
    'limite_socios', p.limite_socios,
    'timbres_incluidos', p.timbres_incluidos,
    'funcionalidades', p.funcionalidades
  ) INTO result
  FROM subscriptions s
  JOIN planes p ON s.plan_id = p.id
  WHERE s.user_id = _user_id
    AND s.status IN ('active', 'trial')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;
```
