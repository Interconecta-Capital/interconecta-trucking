# 🔒 FASE 1: Guía de Implementación ISO 27001/27701

## ✅ Migraciones Completadas

### 1. Migración RLS Segura
- **7 tablas actualizadas** con políticas seguras
- Función vulnerable `is_superuser_optimized()` → `is_superuser_secure()`
- Tablas afectadas:
  - `conductores`
  - `vehiculos`
  - `socios`
  - `cartas_porte`
  - `notificaciones`
  - `ubicaciones`
  - `mercancias`

### 2. Supabase Vault Implementado
- **3 funciones SECURITY DEFINER** creadas:
  - `get_pac_token(secret_name)` - Obtener token del PAC
  - `get_pac_credentials()` - Obtener todas las credenciales del PAC
  - `get_secret(secret_name)` - Obtener cualquier secreto
  - `admin_rotate_pac_token(new_token)` - Rotar token (solo superusuarios)

- **Tabla de metadatos** `secrets_metadata` para tracking de rotaciones

---

## 📋 PRÓXIMOS PASOS OBLIGATORIOS

### Paso 1: Migrar Secretos al Vault

Actualmente tienes secretos en variables de entorno que **DEBEN** migrarse al Vault:

#### 1.1. Accede al Supabase Dashboard
```
https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/settings/vault
```

#### 1.2. Crea los siguientes secretos:

| Nombre del Secreto | Valor Actual (de tu .env o config) | Tipo |
|-------------------|-------------------------------------|------|
| `SW_TOKEN` | Tu token actual del PAC | pac_credential |
| `SW_USER` | Tu usuario del PAC (si aplica) | pac_credential |
| `SW_PASSWORD` | Tu password del PAC (si aplica) | pac_credential |
| `SW_URL` | URL del PAC (ej: `https://api.fiscalapi.com`) | pac_credential |
| `FISCAL_API_KEY` | Tu API key de Fiscal API | api_key |

**⚠️ CRÍTICO**: Después de migrar al Vault:
1. **Elimina** estos valores de cualquier archivo `.env`
2. **Elimina** estos valores de variables de entorno en Supabase Dashboard
3. **Elimina** estos valores de cualquier código hardcodeado

---

### Paso 2: Actualizar Edge Function de Timbrado

El Edge Function `timbrar-invoice` debe actualizarse para usar Vault.

#### Cambio requerido en `supabase/functions/timbrar-invoice/index.ts`:

**ANTES** (Inseguro):
```typescript
const fiscalApiKey = Deno.env.get('FISCAL_API_KEY');
```

**DESPUÉS** (Seguro con Vault):
```typescript
// Usar la función get_secret() del Vault
const { data: fiscalApiKey, error } = await supabaseAdmin
  .rpc('get_secret', { secret_name: 'FISCAL_API_KEY' });

if (error || !fiscalApiKey) {
  throw new Error('No se pudo obtener FISCAL_API_KEY del Vault');
}
```

---

### Paso 3: Verificar Integración

#### 3.1. Probar acceso al Vault desde SQL Editor:
```sql
-- Verificar que los secretos existen
SELECT name FROM vault.secrets;

-- Probar función de obtención (como usuario autenticado)
SELECT get_secret('FISCAL_API_KEY');

-- Probar obtención de credenciales completas del PAC
SELECT get_pac_credentials();
```

#### 3.2. Probar desde Edge Function:
1. Despliega el Edge Function actualizado
2. Revisa los logs en: `https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/functions/timbrar-invoice/logs`
3. Busca errores relacionados con Vault

---

## 🔐 Uso de las Funciones del Vault

### Desde Edge Functions (TypeScript):

```typescript
import { createClient } from '@supabase/supabase-js';

// Usar la Service Role Key (solo en Edge Functions)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Obtener token del PAC
const { data: pacToken } = await supabaseAdmin
  .rpc('get_pac_token');

// Obtener todas las credenciales del PAC
const { data: credentials } = await supabaseAdmin
  .rpc('get_pac_credentials');
// Retorna: { SW_TOKEN: "xxx", SW_USER: "yyy", SW_PASSWORD: "zzz", SW_URL: "..." }

// Obtener cualquier secreto
const { data: apiKey } = await supabaseAdmin
  .rpc('get_secret', { secret_name: 'FISCAL_API_KEY' });
```

### Desde SQL (para triggers o funciones):

```sql
-- En una función de base de datos
CREATE FUNCTION mi_funcion_que_necesita_pac()
RETURNS VOID AS $$
DECLARE
  token TEXT;
BEGIN
  -- Obtener token
  SELECT get_pac_token() INTO token;
  
  -- Usar el token...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔄 Rotación de Secretos

### Rotar el Token del PAC (solo superusuarios):

```sql
-- Desde SQL Editor de Supabase (como superusuario)
SELECT admin_rotate_pac_token('nuevo_token_aqui');
```

### Tracking de Rotaciones:

```sql
-- Ver metadatos de secretos y próximas rotaciones
SELECT 
  secret_name,
  descripcion,
  ultima_rotacion,
  proxima_rotacion,
  CASE 
    WHEN proxima_rotacion < now() THEN '⚠️ VENCIDO'
    WHEN proxima_rotacion < now() + interval '7 days' THEN '⏰ PRÓXIMO'
    ELSE '✅ VIGENTE'
  END as estado
FROM secrets_metadata
WHERE activo = true
ORDER BY proxima_rotacion ASC;
```

---

## 📊 Auditoría

Todos los accesos a secretos se registran en `security_audit_log`:

```sql
-- Ver últimos 50 accesos a secretos
SELECT 
  user_id,
  event_type,
  event_data->>'secret_name' as secret_accedido,
  created_at
FROM security_audit_log
WHERE event_type IN ('secret_access', 'pac_credentials_access', 'secret_rotation')
ORDER BY created_at DESC
LIMIT 50;
```

---

## ⚠️ Advertencias de Seguridad Detectadas

El linter de Supabase detectó 11 advertencias (no críticas):

1. **Function Search Path Mutable** (9 funciones): Se recomienda fijar `search_path` en funciones SECURITY DEFINER
2. **Extension in Public**: Mover extensiones fuera del schema `public`
3. **Leaked Password Protection Disabled**: Habilitar protección contra contraseñas filtradas

**Acción recomendada**: Estas son advertencias menores y no bloquean la operación. Se pueden atender en Fase 2.

---

## ✅ Checklist de Verificación

Antes de considerar Fase 1 completada:

- [ ] Todos los secretos migrados a Vault
- [ ] Edge Function actualizado para usar `get_secret()` y `get_pac_credentials()`
- [ ] Secretos eliminados de `.env` y código
- [ ] Probado timbrado exitoso usando Vault
- [ ] Revisados logs de auditoría para confirmar accesos correctos
- [ ] Establecidos calendarios de rotación de secretos (revisar `secrets_metadata`)

---

## 🔗 Enlaces Útiles

- **Vault Dashboard**: https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/settings/vault
- **Edge Function Logs**: https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/functions/timbrar-invoice/logs
- **SQL Editor**: https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/sql/new
- **Security Audit Log**: Tabla `public.security_audit_log`

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Edge Function
2. Ejecuta las queries de verificación de la Sección 3.1
3. Revisa `security_audit_log` para ver qué usuario está accediendo a qué secretos

**Control ISO aplicado**: 27001 A.10.1 (Controles Criptográficos)
