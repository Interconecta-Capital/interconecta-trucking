# Seguridad de Base de Datos

## Índice

| Archivo | Descripción |
|---------|-------------|
| [RLS_POLICIES.md](./RLS_POLICIES.md) | Políticas Row Level Security detalladas |
| [ACCESS_PATTERNS.md](./ACCESS_PATTERNS.md) | Patrones de acceso por rol |
| [AUDIT_LOGGING.md](./AUDIT_LOGGING.md) | Sistema de auditoría |

## Resumen de Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

```sql
ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;
```

### Principios de Seguridad

1. **Mínimo privilegio**: Los usuarios solo acceden a sus propios datos
2. **Defense in depth**: Múltiples capas de validación
3. **SECURITY DEFINER**: Funciones específicas para bypass controlado de RLS
4. **Auditoría**: Logging de acciones sensibles

### Roles del Sistema

| Rol | Descripción | Función de verificación |
|-----|-------------|------------------------|
| Usuario | Acceso a datos propios | `auth.uid() = user_id` |
| Admin | Acceso a datos del tenant | `has_role(auth.uid(), 'admin')` |
| Superusuario | Acceso global | `is_superuser_secure(auth.uid())` |

### Patrones de Política RLS

#### Ownership (más común)
```sql
CREATE POLICY "Users access own data"
  ON tabla FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Con Superusuario
```sql
CREATE POLICY "Users and superusers access"
  ON tabla FOR ALL
  USING (auth.uid() = user_id OR is_superuser_secure(auth.uid()));
```

#### Acceso Público (catálogos)
```sql
CREATE POLICY "Public read access"
  ON cat_tabla FOR SELECT
  USING (true);
```

#### Multi-tenant
```sql
CREATE POLICY "Tenant isolation"
  ON tabla FOR ALL
  USING (EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.tenant_id = tabla.tenant_id
      AND usuarios.auth_user_id = auth.uid()
  ));
```

### Tablas Sensibles

| Tabla | Sensibilidad | Protección |
|-------|--------------|------------|
| certificados_digitales | Alta | RLS + Vault para passwords |
| superusuarios | Alta | RLS + función SECURITY DEFINER |
| user_roles | Alta | Solo admins pueden modificar |
| security_audit_log | Alta | Solo lectura para admins |
| configuracion_empresa | Media | RLS por user_id |
| creditos_usuarios | Media | RLS + funciones controladas |

### Funciones de Seguridad

```sql
-- Verificar superusuario
is_superuser_secure(user_id UUID) → BOOLEAN

-- Verificar rol
has_role(user_id UUID, role TEXT) → BOOLEAN

-- Verificar admin o superusuario
is_admin_or_superuser(user_id UUID) → BOOLEAN

-- Verificar ownership
check_user_ownership(table_name TEXT, record_id UUID, user_id UUID) → BOOLEAN
```

### Mejores Prácticas

1. **Nunca confiar en el cliente**
   - Validar siempre en el servidor/RLS
   - No exponer IDs internos sensibles

2. **Evitar recursión en RLS**
   - Usar funciones SECURITY DEFINER
   - No consultar la misma tabla en la política

3. **Logging de seguridad**
   - Registrar accesos a datos sensibles
   - Monitorear patrones anómalos

4. **Rotación de secretos**
   - Passwords de certificados en Vault
   - Tokens de API con expiración
