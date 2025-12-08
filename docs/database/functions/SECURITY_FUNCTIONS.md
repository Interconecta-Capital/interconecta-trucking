# Funciones de Seguridad

## Verificación de Roles

### is_superuser_secure

Verifica si un usuario es superusuario activo.

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

**Uso en RLS:**
```sql
CREATE POLICY "Superusers can access all"
  ON tabla FOR ALL
  USING (is_superuser_secure(auth.uid()));
```

---

### has_role

Verifica si un usuario tiene un rol específico.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
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
      AND role::text = _role
  )
$$;
```

**Uso:**
```sql
-- En política RLS
USING (has_role(auth.uid(), 'admin'))

-- En query
SELECT * FROM tabla WHERE has_role(auth.uid(), 'moderator');
```

---

### is_admin_or_superuser

Combina verificación de admin y superusuario.

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

---

## Verificación de Ownership

### check_user_ownership

Verifica que un recurso pertenece al usuario.

```sql
CREATE OR REPLACE FUNCTION public.check_user_ownership(
  _table_name TEXT,
  _record_id UUID,
  _user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  EXECUTE format(
    'SELECT EXISTS(SELECT 1 FROM %I WHERE id = $1 AND user_id = $2)',
    _table_name
  ) INTO result USING _record_id, _user_id;
  
  RETURN COALESCE(result, false);
END;
$$;
```

---

### can_access_via_tenant

Verifica acceso a través de tenant.

```sql
CREATE OR REPLACE FUNCTION public.can_access_via_tenant(
  _tenant_id UUID,
  _user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE auth_user_id = _user_id
      AND tenant_id = _tenant_id
      AND activo = true
  )
$$;
```

---

## Verificación de Suscripción

### check_subscription_active

Verifica si el usuario tiene suscripción activa.

```sql
CREATE OR REPLACE FUNCTION public.check_subscription_active(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = _user_id
      AND status IN ('active', 'trial')
      AND (fecha_fin IS NULL OR fecha_fin > now())
  )
$$;
```

---

### check_user_blocked

Verifica si el usuario está bloqueado.

```sql
CREATE OR REPLACE FUNCTION public.check_user_blocked(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bloqueos_usuario
    WHERE user_id = _user_id
      AND activo = true
  )
$$;
```

---

## Verificación de Límites

### verificar_limite_recurso

Verifica si el usuario ha alcanzado el límite de un recurso.

```sql
CREATE OR REPLACE FUNCTION public.verificar_limite_recurso(
  _user_id UUID,
  _recurso TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  limite INTEGER;
  usado INTEGER;
  resultado JSONB;
BEGIN
  -- Obtener límite del plan
  SELECT 
    CASE _recurso
      WHEN 'conductores' THEN p.limite_conductores
      WHEN 'vehiculos' THEN p.limite_vehiculos
      WHEN 'socios' THEN p.limite_socios
      WHEN 'cartas_porte' THEN p.limite_cartas_porte
    END INTO limite
  FROM subscriptions s
  JOIN planes p ON s.plan_id = p.id
  WHERE s.user_id = _user_id
    AND s.status IN ('active', 'trial')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- NULL = ilimitado
  IF limite IS NULL THEN
    RETURN jsonb_build_object(
      'puede_crear', true,
      'limite', null,
      'usado', 0,
      'disponible', null
    );
  END IF;
  
  -- Contar uso actual
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE user_id = $1 AND activo = true',
    _recurso
  ) INTO usado USING _user_id;
  
  RETURN jsonb_build_object(
    'puede_crear', usado < limite,
    'limite', limite,
    'usado', usado,
    'disponible', limite - usado
  );
END;
$$;
```

---

## Auditoría de Seguridad

### log_security_event

Registra eventos de seguridad.

```sql
CREATE OR REPLACE FUNCTION public.log_security_event(
  _user_id UUID,
  _action_type TEXT,
  _resource_type TEXT,
  _resource_id UUID,
  _details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action_type,
    resource_type,
    resource_id,
    details,
    ip_address,
    success
  ) VALUES (
    _user_id,
    _action_type,
    _resource_type,
    _resource_id,
    _details,
    inet_client_addr(),
    true
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;
```

---

## Uso en Políticas RLS

### Patrón Estándar

```sql
-- Política básica de ownership
CREATE POLICY "Users can access own data"
  ON tabla FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política con superusuario
CREATE POLICY "Users and superusers can access"
  ON tabla FOR ALL
  USING (auth.uid() = user_id OR is_superuser_secure(auth.uid()));

-- Política con roles
CREATE POLICY "Admins can access all"
  ON tabla FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Política con tenant
CREATE POLICY "Tenant isolation"
  ON tabla FOR ALL
  USING (can_access_via_tenant(tenant_id, auth.uid()));
```

### Evitar Recursión

⚠️ **IMPORTANTE**: Nunca consultar la misma tabla en una política RLS.

```sql
-- ❌ INCORRECTO - Causa recursión infinita
CREATE POLICY "Bad policy" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ✅ CORRECTO - Usar función SECURITY DEFINER
CREATE POLICY "Good policy" ON profiles
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR auth.uid() = id
  );
```
