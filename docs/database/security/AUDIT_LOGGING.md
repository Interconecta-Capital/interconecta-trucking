# Sistema de Auditoría

## Tablas de Auditoría

### audit_log

Log general de auditoría para cambios en datos.

```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla VARCHAR,
  accion VARCHAR, -- 'INSERT', 'UPDATE', 'DELETE'
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Solo admins/superusuarios pueden ver
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view"
  ON audit_log FOR SELECT
  USING (is_admin_or_superuser(auth.uid()));
```

---

### security_audit_log

Log específico de eventos de seguridad.

```sql
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type VARCHAR NOT NULL,
  resource_type VARCHAR,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsqueda
CREATE INDEX idx_security_log_user ON security_audit_log(user_id);
CREATE INDEX idx_security_log_action ON security_audit_log(action_type);
CREATE INDEX idx_security_log_date ON security_audit_log(created_at DESC);
```

---

### data_deletion_audit

Auditoría de eliminaciones de datos (GDPR compliance).

```sql
CREATE TABLE public.data_deletion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deletion_requested_at TIMESTAMPTZ NOT NULL,
  deletion_completed_at TIMESTAMPTZ,
  status VARCHAR DEFAULT 'pending',
  -- Estados: pending, in_progress, completed, failed
  tables_affected JSONB,
  records_deleted INTEGER,
  records_anonymized INTEGER,
  executed_by UUID,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Tipos de Eventos

### Eventos de Autenticación

| action_type | Descripción |
|-------------|-------------|
| LOGIN_SUCCESS | Login exitoso |
| LOGIN_FAILED | Intento de login fallido |
| LOGOUT | Cierre de sesión |
| PASSWORD_RESET | Restablecimiento de contraseña |
| EMAIL_CHANGE | Cambio de email |
| MFA_ENABLED | Activación de 2FA |
| MFA_DISABLED | Desactivación de 2FA |

### Eventos de Autorización

| action_type | Descripción |
|-------------|-------------|
| ACCESS_DENIED | Acceso denegado a recurso |
| ROLE_ASSIGNED | Rol asignado a usuario |
| ROLE_REMOVED | Rol removido de usuario |
| SUPERUSER_GRANTED | Acceso de superusuario otorgado |
| PERMISSION_CHANGED | Cambio de permisos |

### Eventos de Datos Sensibles

| action_type | Descripción |
|-------------|-------------|
| CERTIFICATE_UPLOADED | Certificado digital subido |
| CERTIFICATE_DELETED | Certificado eliminado |
| CFDI_GENERATED | CFDI/Carta Porte generada |
| CFDI_CANCELLED | CFDI cancelado |
| DATA_EXPORTED | Datos exportados |
| DATA_DELETED | Datos eliminados |

### Eventos Administrativos

| action_type | Descripción |
|-------------|-------------|
| USER_BLOCKED | Usuario bloqueado |
| USER_UNBLOCKED | Usuario desbloqueado |
| SUBSCRIPTION_CHANGED | Cambio de suscripción |
| CREDITS_ADJUSTED | Ajuste manual de créditos |
| CONFIG_CHANGED | Cambio de configuración |

---

## Funciones de Logging

### log_security_event

```sql
CREATE OR REPLACE FUNCTION public.log_security_event(
  _user_id UUID,
  _action_type TEXT,
  _resource_type TEXT DEFAULT NULL,
  _resource_id UUID DEFAULT NULL,
  _details JSONB DEFAULT '{}'::jsonb,
  _success BOOLEAN DEFAULT true,
  _error_message TEXT DEFAULT NULL
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
    ip_address,
    details,
    success,
    error_message
  ) VALUES (
    _user_id,
    _action_type,
    _resource_type,
    _resource_id,
    inet_client_addr(),
    _details,
    _success,
    _error_message
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;
```

**Uso:**
```sql
-- Login exitoso
SELECT log_security_event(
  auth.uid(),
  'LOGIN_SUCCESS',
  NULL,
  NULL,
  jsonb_build_object('method', 'email')
);

-- Acceso denegado
SELECT log_security_event(
  auth.uid(),
  'ACCESS_DENIED',
  'cartas_porte',
  'uuid-del-recurso',
  jsonb_build_object('reason', 'not_owner'),
  false,
  'User does not own this resource'
);
```

---

### log_data_change

```sql
CREATE OR REPLACE FUNCTION public.log_data_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO audit_log (tabla, accion, descripcion)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE TG_OP
      WHEN 'INSERT' THEN 'Created record ' || NEW.id
      WHEN 'UPDATE' THEN 'Updated record ' || NEW.id
      WHEN 'DELETE' THEN 'Deleted record ' || OLD.id
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar a tablas sensibles
CREATE TRIGGER audit_certificados
  AFTER INSERT OR UPDATE OR DELETE ON certificados_digitales
  FOR EACH ROW EXECUTE FUNCTION log_data_change();

CREATE TRIGGER audit_cartas_porte
  AFTER INSERT OR UPDATE OR DELETE ON cartas_porte
  FOR EACH ROW EXECUTE FUNCTION log_data_change();
```

---

## Consultas de Auditoría

### Últimos eventos de seguridad
```sql
SELECT 
  created_at,
  action_type,
  resource_type,
  success,
  details
FROM security_audit_log
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 50;
```

### Intentos fallidos de acceso
```sql
SELECT 
  created_at,
  user_id,
  action_type,
  resource_type,
  error_message
FROM security_audit_log
WHERE success = false
  AND created_at >= now() - interval '24 hours'
ORDER BY created_at DESC;
```

### Actividad por usuario
```sql
SELECT 
  action_type,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM security_audit_log
WHERE user_id = 'user-uuid'
  AND created_at >= now() - interval '30 days'
GROUP BY action_type
ORDER BY count DESC;
```

### Cambios en datos sensibles
```sql
SELECT 
  created_at,
  tabla,
  accion,
  descripcion
FROM audit_log
WHERE tabla IN ('certificados_digitales', 'superusuarios', 'user_roles')
ORDER BY created_at DESC
LIMIT 100;
```

---

## Retención de Logs

### Política de retención recomendada

| Tipo de log | Retención |
|-------------|-----------|
| security_audit_log | 1 año |
| audit_log | 6 meses |
| data_deletion_audit | 7 años (GDPR) |

### Limpieza automática

```sql
-- Función de limpieza
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Limpiar security_audit_log > 1 año
  DELETE FROM security_audit_log
  WHERE created_at < now() - interval '1 year';
  
  -- Limpiar audit_log > 6 meses
  DELETE FROM audit_log
  WHERE created_at < now() - interval '6 months';
  
  -- Archivar antes de eliminar (opcional)
  -- INSERT INTO archived_logs SELECT * FROM audit_log WHERE ...
END;
$$;

-- Ejecutar mensualmente con pg_cron
-- SELECT cron.schedule('cleanup-logs', '0 3 1 * *', 'SELECT cleanup_old_logs()');
```

---

## Alertas de Seguridad

### Patrones a monitorear

1. **Múltiples logins fallidos**
   - > 5 intentos en 5 minutos
   - Posible ataque de fuerza bruta

2. **Accesos denegados repetidos**
   - Usuario intentando acceder a recursos ajenos
   - Posible intento de escalamiento

3. **Cambios masivos de datos**
   - > 100 eliminaciones en 1 hora
   - Posible compromiso de cuenta

4. **Acceso desde IPs inusuales**
   - IPs de países no esperados
   - Posible cuenta comprometida

```sql
-- Ejemplo: Detectar logins fallidos
SELECT 
  user_id,
  COUNT(*) as failed_attempts,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt
FROM security_audit_log
WHERE action_type = 'LOGIN_FAILED'
  AND created_at >= now() - interval '5 minutes'
GROUP BY user_id
HAVING COUNT(*) >= 5;
```
