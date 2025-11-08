# 🔐 Mapeo Completo de Secretos - ISO 27001 A.10.1

**Última actualización**: 2025-11-07  
**Responsable**: Administrador de Seguridad  
**Control ISO**: 27001 A.10.1 (Controles Criptográficos)

---

## 📋 Índice

1. [Supabase Vault (Database Functions)](#supabase-vault)
2. [Edge Functions Secrets (Deno Runtime)](#edge-functions-secrets)
3. [Variables Públicas (Cliente React)](#variables-públicas)
4. [Rotación de Secretos](#rotación-de-secretos)
5. [Procedimiento de Emergencia](#procedimiento-de-emergencia)

---

## 🏦 Supabase Vault (Database Functions)

**Ubicación**: Supabase Dashboard → Vault  
**Acceso**: Solo funciones de base de datos (`SECURITY DEFINER`)  
**Cifrado**: AES-256-GCM (gestionado por Supabase)

| Secreto | Descripción | Función de Acceso | Usado Por | Rotación |
|---------|-------------|-------------------|-----------|----------|
| `SW_TOKEN` | Token del PAC Conectia | `get_pac_token()` | Triggers de timbrado automático | 90 días |
| `SW_USER` | Usuario del PAC | `get_pac_credentials()` | Sistema de timbrado legacy | 180 días |
| `SW_PASSWORD` | Password del PAC | `get_pac_credentials()` | Sistema de timbrado legacy | 180 días |
| `SW_URL` | URL del PAC productivo | `get_pac_credentials()` | Configuración del PAC | 365 días |
| `FISCAL_API_KEY` | API Key de Fiscal API | `get_secret('FISCAL_API_KEY')` | Edge Function `timbrar-invoice` | 180 días |

### Cómo acceder desde SQL:
```sql
-- Obtener token del PAC (requiere autenticación)
SELECT get_pac_token();

-- Obtener todas las credenciales del PAC
SELECT get_pac_credentials();

-- Obtener cualquier secreto
SELECT get_secret('FISCAL_API_KEY');
```

### Cómo rotar desde SQL:
```sql
-- Solo superusuarios
SELECT admin_rotate_pac_token('nuevo_token_aqui');
```

---

## ⚡ Edge Functions Secrets (Deno Runtime)

**Ubicación**: Supabase Dashboard → Edge Functions → Secrets  
**Acceso**: Todas las Edge Functions vía `Deno.env.get()`  
**Cifrado**: En tránsito (HTTPS), en reposo (cifrado del dashboard)

### Secretos del PAC

| Secreto | Descripción | Edge Functions | Ambiente | Rotación |
|---------|-------------|----------------|----------|----------|
| `SW_TOKEN` | Token del PAC Conectia | `timbrar-con-sw`, `cancelar-cfdi-sw` | Todos | 90 días |
| `SW_SANDBOX_URL` | URL del PAC (pruebas) | `timbrar-con-sw` | Development/Staging | 365 días |
| `SW_PRODUCTION_URL` | URL del PAC (producción) | `timbrar-con-sw` | Production | 365 días |

### Secretos de Servicios Externos

| Secreto | Descripción | Edge Functions | Rotación |
|---------|-------------|----------------|----------|
| `FISCAL_API_KEY` | API de timbrado | `timbrar-invoice`, `timbrar-carta-porte`, `cancelar-cfdi`, `consultar-estatus-cfdi`, `consultar-saldo-pac` | 180 días |
| `GOOGLE_MAPS_API_KEY` | Geocoding y Ruteo | `get-google-maps-key`, `google-directions` | 365 días |
| `STRIPE_SECRET_KEY` | Procesamiento de pagos | `create-checkout`, `create-credit-checkout`, `check-subscription`, `customer-portal`, `stripe-webhook` | 365 días |
| `STRIPE_WEBHOOK_SECRET` | Verificación de webhooks | `stripe-webhook` | 365 días |
| `GEMINI_API_KEY` | Asistente IA | `gemini-assistant` | 180 días |
| `CRON_SECRET` | Autenticación de Cron Jobs | `check-expirations`, `renovar-timbres-mensuales` | 90 días |
| `GOOGLE_CLIENT_ID` | OAuth Google | `google-oauth-callback` | 365 días |
| `GOOGLE_CLIENT_SECRET` | OAuth Google | `google-oauth-callback` | 365 días |
| `MAPBOX_ACCESS_TOKEN` | Mapas y rutas | `calculate-route` | 365 días |

### Secretos de Sistema Supabase (automáticos)

| Secreto | Descripción | Disponible en |
|---------|-------------|---------------|
| `SUPABASE_URL` | URL del proyecto | Todas las Edge Functions |
| `SUPABASE_ANON_KEY` | Anon Key para cliente | Todas las Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key | Todas las Edge Functions |

### Ejemplo de uso en Edge Functions:
```typescript
const fiscalApiKey = Deno.env.get('FISCAL_API_KEY');
const ambiente = Deno.env.get('AMBIENTE') || 'sandbox';
const swUrl = ambiente === 'production' 
  ? Deno.env.get('SW_PRODUCTION_URL')
  : Deno.env.get('SW_SANDBOX_URL');
```

---

## 🌐 Variables Públicas (Cliente React)

**Ubicación**: `src/config/publicKeys.ts`  
**Acceso**: Público (expuesto en el bundle de JavaScript)  
**⚠️ NUNCA colocar secretos aquí**

| Variable | Descripción | Usado En | Peligro si se expone |
|----------|-------------|----------|---------------------|
| `PUBLIC_CONFIG.supabase.url` | URL de Supabase | Cliente Supabase | ❌ No (público por diseño) |
| `PUBLIC_CONFIG.supabase.anonKey` | Anon Key de Supabase | Cliente Supabase | ❌ No (protegido por RLS) |
| `PUBLIC_CONFIG.mapbox.token` | Token público de Mapbox | `mapService.ts` | ⚠️ Bajo (puede tener restricciones de dominio) |
| `PUBLIC_CONFIG.here.apiKey` | API Key de HERE Maps | `ruteoComercial.ts` | ⚠️ Medio (uso limitado por IP/dominio recomendado) |

### Archivo `.env` (solo desarrollo local):
```env
# Solo para desarrollo local - NO subir a Git
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example
VITE_HERE_API_KEY=your_here_api_key_here
```

---

## 🔄 Rotación de Secretos

### Calendario de Rotación

| Tipo de Secreto | Frecuencia | Próxima Rotación | Responsable |
|-----------------|------------|------------------|-------------|
| PAC Token (`SW_TOKEN`) | 90 días | [Ver en `secrets_metadata`] | Equipo DevOps |
| FISCAL_API_KEY | 180 días | [Ver en `secrets_metadata`] | Equipo DevOps |
| Stripe Keys | 365 días | [Ver en `secrets_metadata`] | Administrador |
| GEMINI_API_KEY | 180 días | [Ver en `secrets_metadata`] | Equipo IA |
| CRON_SECRET | 90 días | [Ver en `secrets_metadata`] | Equipo DevOps |
| Google OAuth | 365 días | Manual | Administrador |

### Consultar próximas rotaciones:
```sql
SELECT 
  secret_name,
  descripcion,
  ultima_rotacion,
  proxima_rotacion,
  EXTRACT(days FROM proxima_rotacion - now()) as dias_restantes,
  CASE 
    WHEN proxima_rotacion < now() THEN '🔴 VENCIDO'
    WHEN proxima_rotacion < now() + interval '7 days' THEN '🟡 URGENTE'
    WHEN proxima_rotacion < now() + interval '30 days' THEN '🟠 PRÓXIMO'
    ELSE '🟢 VIGENTE'
  END as estado
FROM secrets_metadata
WHERE activo = true
ORDER BY proxima_rotacion ASC;
```

### Proceso de Rotación de PAC Token:
```sql
-- 1. Obtener nuevo token del proveedor PAC

-- 2. Rotar en Vault (Database Functions)
SELECT admin_rotate_pac_token('nuevo_token_sw_aqui');

-- 3. Actualizar en Edge Functions Secrets:
--    → Ir a Supabase Dashboard
--    → Edge Functions → Secrets
--    → Editar SW_TOKEN
--    → Guardar nuevo valor

-- 4. Verificar funcionamiento
--    → Intentar timbrar un CFDI de prueba
--    → Revisar logs de Edge Function
```

---

## 🚨 Procedimiento de Emergencia

### Si un secreto se compromete:

#### 1️⃣ **Respuesta Inmediata** (0-15 minutos)
- [ ] Rotar el secreto comprometido inmediatamente
- [ ] Revocar accesos del secreto anterior
- [ ] Registrar incidente en `security_audit_log`:
```sql
INSERT INTO security_audit_log (user_id, event_type, event_data, severity)
VALUES (
  auth.uid(),
  'secret_compromise',
  jsonb_build_object(
    'secret_name', 'SW_TOKEN',
    'compromise_date', now(),
    'action_taken', 'rotated',
    'control', 'ISO 27001 A.16.1'
  ),
  'critical'
);
```

#### 2️⃣ **Análisis de Impacto** (15-30 minutos)
- [ ] Revisar logs de acceso al secreto comprometido:
```sql
SELECT * FROM security_audit_log
WHERE event_data->>'secret_name' = 'SW_TOKEN'
AND created_at > now() - interval '7 days'
ORDER BY created_at DESC;
```
- [ ] Identificar sistemas afectados
- [ ] Evaluar si hubo uso indebido

#### 3️⃣ **Notificación** (30-60 minutos)
- [ ] Notificar al equipo de seguridad
- [ ] Documentar el incidente (ISO 27001 A.16.1)
- [ ] Actualizar plan de respuesta

#### 4️⃣ **Prevención Futura** (1-7 días)
- [ ] Revisar cómo se comprometió el secreto
- [ ] Actualizar políticas de acceso
- [ ] Capacitar al equipo
- [ ] Implementar controles adicionales

---

## 📞 Contactos de Emergencia

| Rol | Responsable | Contacto |
|-----|-------------|----------|
| Administrador de Seguridad | [Nombre] | [Email/Teléfono] |
| DevOps Lead | [Nombre] | [Email/Teléfono] |
| CTO/Responsable Técnico | [Nombre] | [Email/Teléfono] |

---

## 📚 Referencias

- **ISO 27001 A.10.1**: Política de uso de controles criptográficos
- **ISO 27001 A.10.1.1**: Política sobre el uso de controles criptográficos
- **ISO 27001 A.10.1.2**: Gestión de claves
- **Supabase Vault Docs**: https://supabase.com/docs/guides/database/vault
- **Supabase Edge Functions Secrets**: https://supabase.com/docs/guides/functions/secrets

---

**Última revisión**: 2025-11-07  
**Próxima revisión**: 2026-02-07 (trimestral)
