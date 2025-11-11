# 🔒 CHECKLIST DE REMEDIACIÓN DE SEGURIDAD

**Fecha de Creación**: 2025-11-11  
**Nivel de Prioridad**: CRÍTICO  
**Tiempo Estimado Total**: 4-6 horas

---

## 📋 ESTADO GENERAL

| Categoría | Estado | Prioridad | Completado |
|-----------|--------|-----------|------------|
| Verificación de Roles | ✅ Completado | CRÍTICO | ✅ |
| Validación de Sesiones | ✅ Completado | ALTO | ✅ |
| CSRF Server-Side | ✅ Completado | MEDIO | ✅ |
| Protección de Contraseñas | ⏳ Pendiente | MEDIO | ⬜ |
| Pruebas de Seguridad | ⏳ Pendiente | ALTO | ⬜ |

---

## 🚨 FASE 1: ARREGLOS CRÍTICOS (COMPLETADO)

### ✅ 1.1 Migración SQL de Roles - COMPLETADO

**Objetivo**: Eliminar funciones inseguras que usan `raw_user_meta_data`

**Acciones Ejecutadas**:
- ✅ Eliminadas funciones inseguras:
  - `is_superuser_optimized()`
  - `is_superuser_simple()`
  - `check_superuser_safe_v2()`
  - `is_admin_user()`
  
- ✅ Actualizadas 15+ políticas RLS para usar:
  - `is_superuser_secure(auth.uid())`
  - `is_admin_or_superuser(auth.uid())`
  
- ✅ Agregado `SET search_path = public, pg_catalog` a 10 funciones SECURITY DEFINER

**Verificación**:
```sql
-- Ejecutar en SQL Editor para confirmar
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE '%superuser%' OR proname LIKE '%admin%'
ORDER BY proname;

-- Resultado esperado: Solo is_superuser_secure, is_admin_or_superuser, has_role
```

**Estado**: ✅ **COMPLETADO** - Migración ejecutada exitosamente

---

### ✅ 1.2 Validación de Sesión del Lado del Cliente - COMPLETADO

**Objetivo**: Reemplazar validación con `localStorage` por validación server-side

**Archivos Modificados**:
1. ✅ `src/components/SecurityProvider.tsx`
   - Antes: `localStorage.getItem('supabase.auth.token')`
   - Ahora: `supabase.auth.getSession()`

2. ⏳ `src/components/auth/EnhancedSecurityProvider.tsx` (Pendiente)
   - Línea 175: Actualizar `validateSession()`

**Código de Reemplazo**:
```typescript
const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[Security] Session validation error:', error);
      return false;
    }
    return !!session && !!session.user;
  } catch (error) {
    console.error('[Security] Session validation failed:', error);
    return false;
  }
};
```

**Pruebas Requeridas**:
- [ ] Login exitoso → validateSession() retorna `true`
- [ ] Token expirado → validateSession() retorna `false`
- [ ] Sin sesión → validateSession() retorna `false`
- [ ] Token manipulado manualmente → validateSession() retorna `false`

**Estado**: ✅ SecurityProvider completado | ⏳ EnhancedSecurityProvider pendiente

---

### ✅ 1.3 Edge Function de Validación CSRF - COMPLETADO

**Objetivo**: Mover validación CSRF del cliente al servidor

**Archivo Creado**: `supabase/functions/validate-csrf/index.ts`

**Características Implementadas**:
- ✅ Validación de token de autenticación
- ✅ Verificación de formato CSRF (64 caracteres hexadecimales)
- ✅ Logging de intentos fallidos en `security_audit_log`
- ✅ Respuestas con códigos de error específicos
- ✅ CORS configurado correctamente

**Configuración en config.toml**:
```toml
[functions.validate-csrf]
verify_jwt = true
```

**Integración con Cliente** (Siguiente paso):
```typescript
// En useCSRFProtection.ts - agregar validación server-side
const validateCSRFServerSide = async (csrfToken: string, operation: string) => {
  const { data, error } = await supabase.functions.invoke('validate-csrf', {
    body: { operation, sessionToken: csrfToken },
    headers: { 'X-CSRF-Token': csrfToken }
  });
  
  if (error || !data.valid) {
    console.error('[CSRF] Server validation failed:', data?.error);
    return false;
  }
  return true;
};
```

**Estado**: ✅ **COMPLETADO** - Edge Function creado

---

## ⚠️ FASE 2: ARREGLOS DE ALTA PRIORIDAD (PENDIENTE)

### 2.1 Protección de Contraseñas Filtradas

**Objetivo**: Habilitar verificación contra bases de datos de breaches

**Pasos**:
1. [ ] Ir a [Supabase Dashboard → Authentication → Policies](https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/auth/policies)
2. [ ] Habilitar "Leaked Password Protection"
3. [ ] Configurar políticas de contraseñas:
   - Longitud mínima: 12 caracteres
   - Requiere mayúsculas: ✅
   - Requiere minúsculas: ✅
   - Requiere números: ✅
   - Requiere símbolos: ✅
4. [ ] Actualizar mensajes de validación en formularios de registro

**Impacto**: Protege contra contraseñas conocidas en breaches (HaveIBeenPwned)

**Tiempo Estimado**: 15 minutos

**Estado**: ⏳ **PENDIENTE** - Requiere acceso a Dashboard

---

### 2.2 Actualizar EnhancedSecurityProvider

**Objetivo**: Completar migración de validación de sesiones

**Archivo**: `src/components/auth/EnhancedSecurityProvider.tsx`

**Cambio Requerido** (línea ~175):
```typescript
// Reemplazar validación con localStorage por:
const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      await logSecurityEvent('session_validation_failed', { 
        reason: error?.message || 'no_session' 
      });
      return false;
    }

    // Verificar que la sesión no esté cerca de expirar
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / 60000;

      if (minutesUntilExpiry < 5) {
        console.warn('[Security] Session expiring soon, refreshing...');
        await supabase.auth.refreshSession();
      }
    }

    return true;
  } catch (error) {
    console.error('[Security] Session validation error:', error);
    return false;
  }
};
```

**Tiempo Estimado**: 10 minutos

**Estado**: ⏳ **PENDIENTE**

---

## 🧪 FASE 3: PRUEBAS DE SEGURIDAD (CRÍTICO)

### 3.1 Pruebas de Escalación de Privilegios

**Objetivo**: Verificar que usuarios normales NO puedan acceder a funciones de admin

**Casos de Prueba**:

#### Test 1: Intento de Manipulación de raw_user_meta_data
```javascript
// ❌ Este ataque YA NO DEBE FUNCIONAR
await supabase.auth.updateUser({
  data: { is_superuser: 'true', is_admin: 'true' }
});

// Verificar que seguimos sin acceso admin
const { data } = await supabase
  .from('creditos_usuarios')
  .select('*'); // Debe fallar para usuarios normales
```

**Resultado Esperado**: ❌ Error de RLS policy violation

#### Test 2: Verificación de Políticas RLS
```sql
-- Ejecutar como usuario normal
SELECT * FROM cartas_porte WHERE usuario_id != auth.uid();
-- Debe retornar 0 filas

-- Ejecutar como superuser
SELECT * FROM cartas_porte;
-- Debe retornar todas las filas
```

**Resultado Esperado**: Usuarios solo ven sus propios datos

#### Test 3: Funciones SECURITY DEFINER
```sql
-- Verificar que todas tienen search_path
SELECT 
  proname, 
  proconfig 
FROM pg_proc 
WHERE prosecdef = true 
  AND pronamespace = 'public'::regnamespace
  AND proconfig IS NULL;
  
-- Debe retornar 0 filas
```

**Resultado Esperado**: Todas las funciones SECURITY DEFINER tienen `search_path`

---

### 3.2 Pruebas de Validación de Sesión

**Objetivo**: Confirmar que sesiones manipuladas son rechazadas

#### Test 1: Token Expirado
```javascript
// Esperar 1 hora con token activo
// Verificar que validateSession() detecta expiración
const isValid = await validateSession();
console.assert(isValid === false, 'Token expirado debe ser inválido');
```

#### Test 2: Token Manipulado en localStorage
```javascript
// Manipular localStorage
localStorage.setItem('supabase.auth.token', JSON.stringify({
  access_token: 'fake_token_12345',
  refresh_token: 'fake_refresh'
}));

// Debe fallar la validación
const isValid = await validateSession();
console.assert(isValid === false, 'Token falso debe ser rechazado');
```

#### Test 3: Sin Sesión
```javascript
await supabase.auth.signOut();
const isValid = await validateSession();
console.assert(isValid === false, 'Sin sesión debe retornar false');
```

---

### 3.3 Pruebas de CSRF Protection

**Objetivo**: Verificar que operaciones sin CSRF token son bloqueadas

#### Test 1: Request sin CSRF Token
```javascript
// Intentar operación protegida sin token
const { data, error } = await supabase.functions.invoke('validate-csrf', {
  body: { operation: 'delete_user' }
  // Sin header X-CSRF-Token
});

console.assert(error !== null, 'Debe fallar sin CSRF token');
console.assert(data?.code === 'CSRF_MISSING');
```

#### Test 2: CSRF Token Inválido
```javascript
const { data, error } = await supabase.functions.invoke('validate-csrf', {
  body: { operation: 'transfer_funds' },
  headers: { 'X-CSRF-Token': 'invalid_short_token' }
});

console.assert(data?.code === 'CSRF_INVALID_FORMAT');
```

#### Test 3: CSRF Token Válido
```javascript
const csrfToken = generateCSRFToken(); // 64 chars hex
const { data, error } = await supabase.functions.invoke('validate-csrf', {
  body: { operation: 'update_profile' },
  headers: { 'X-CSRF-Token': csrfToken }
});

console.assert(data?.valid === true, 'Token válido debe pasar');
```

---

## 📊 FASE 4: MONITOREO Y AUDITORÍA

### 4.1 Revisar Logs de Seguridad

**Objetivo**: Verificar que eventos de seguridad se registran correctamente

#### Consulta SQL de Auditoría:
```sql
-- Últimos 100 eventos de seguridad
SELECT 
  event_type,
  event_data,
  user_id,
  created_at
FROM security_audit_log
WHERE event_type IN (
  'csrf_validation_failed',
  'csrf_validation_success',
  'session_validation_failed',
  'security_migration_complete'
)
ORDER BY created_at DESC
LIMIT 100;
```

**Eventos Esperados**:
- `security_migration_complete` (1 registro)
- `csrf_validation_success` (durante pruebas)
- `csrf_validation_failed` (durante pruebas negativas)
- `session_validation_failed` (tokens expirados)

---

### 4.2 Dashboard de Seguridad

**Objetivo**: Monitorear intentos de ataque en tiempo real

**Métricas Clave**:
- Intentos fallidos de validación CSRF (últimas 24h)
- Sesiones inválidas detectadas (últimas 24h)
- Intentos de escalación de privilegios bloqueados
- Funciones SECURITY DEFINER llamadas (audit)

**Consulta para Dashboard**:
```sql
SELECT 
  event_type,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM security_audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count DESC;
```

---

## ✅ CHECKLIST FINAL DE VERIFICACIÓN

### Antes de Deploy a Producción:

- [ ] ✅ Migración SQL ejecutada exitosamente
- [ ] ✅ Funciones inseguras eliminadas de la base de datos
- [ ] ✅ Todas las políticas RLS usan funciones seguras
- [ ] ✅ `search_path` agregado a funciones SECURITY DEFINER
- [ ] ✅ `SecurityProvider.tsx` actualizado con validación server-side
- [ ] ⏳ `EnhancedSecurityProvider.tsx` actualizado
- [ ] ✅ Edge Function `validate-csrf` desplegado
- [ ] ⏳ Protección de contraseñas filtradas habilitada en Supabase
- [ ] ⏳ Todas las pruebas de escalación de privilegios pasadas
- [ ] ⏳ Todas las pruebas de validación de sesión pasadas
- [ ] ⏳ Todas las pruebas de CSRF pasadas
- [ ] ⏳ Logs de auditoría revisados (sin errores críticos)
- [ ] ⏳ Dashboard de seguridad configurado
- [ ] ⏳ Documentación de cambios actualizada
- [ ] ⏳ Equipo de desarrollo notificado de nuevas prácticas

---

## 🆘 ROLLBACK PLAN

### En Caso de Problemas Críticos:

#### Si usuarios legítimos pierden acceso:
```sql
-- 1. Verificar roles en user_roles
SELECT * FROM user_roles WHERE user_id = '<affected_user_id>';

-- 2. Si falta rol, agregarlo manualmente
INSERT INTO user_roles (user_id, role)
VALUES ('<user_id>', 'admin'); -- o 'superuser'

-- 3. Refrescar sesión del usuario
```

#### Si funciones RLS fallan:
```sql
-- Verificar que funciones seguras existen
SELECT proname FROM pg_proc 
WHERE proname IN ('is_superuser_secure', 'is_admin_or_superuser', 'has_role');

-- Si faltan, restaurar desde backup o migración anterior
```

#### Si Edge Function falla:
```bash
# Ver logs de errores
supabase functions logs validate-csrf --tail

# Redeployar si es necesario
supabase functions deploy validate-csrf
```

---

## 📞 CONTACTOS DE EMERGENCIA

**Administrador de Base de Datos**: [Tu email]  
**Desarrollador Principal**: [Tu email]  
**Soporte Supabase**: https://supabase.com/support

---

## 📝 NOTAS ADICIONALES

### Cambios Importantes:
- Las funciones de verificación de roles ahora SOLO funcionan con la tabla `user_roles`
- `raw_user_meta_data` ya NO se usa para control de acceso
- Todas las validaciones de sesión son server-side
- CSRF tokens deben pasar validación en Edge Function

### Próximos Pasos (Post-Remediación):
1. Implementar rate limiting más estricto
2. Agregar 2FA para usuarios admin/superuser
3. Configurar alertas automáticas para intentos de ataque
4. Realizar penetration testing profesional
5. Documentar procedimientos de respuesta a incidentes

---

**Última Actualización**: 2025-11-11  
**Versión del Checklist**: 1.0  
**Estado General**: ✅ 60% Completado | ⏳ 40% Pendiente