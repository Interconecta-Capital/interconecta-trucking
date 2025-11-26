# 🔐 Variables de Entorno

Este documento detalla todas las variables de entorno necesarias para el proyecto **Interconecta Trucking**.

## 📋 Tabla de Contenidos

- [Resumen de Variables](#-resumen-de-variables)
- [Variables del Frontend](#-variables-del-frontend)
- [Variables del Backend](#-variables-del-backend)
- [Variables de Supabase](#-variables-de-supabase)
- [Variables del PAC SmartWeb](#-variables-del-pac-smartweb)
- [Variables de Google](#-variables-de-google)
- [Variables de PDF](#-variables-de-pdf)
- [Archivo .env.example](#-archivo-envexample)
- [Gestión Segura de Secretos](#-gestión-segura-de-secretos)

---

## 📊 Resumen de Variables

### Por Ubicación

| Ubicación | Variables | Propósito |
|-----------|-----------|-----------|
| `.env` (local) | Frontend públicas | Desarrollo local |
| Supabase Secrets | Backend privadas | Edge Functions |
| Vault | Credenciales críticas | CSD, PAC tokens |

### Por Sensibilidad

| Nivel | Variables | Exposición |
|-------|-----------|------------|
| 🟢 Público | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | OK en frontend |
| 🟡 Interno | `GOOGLE_MAPS_API_KEY` | Solo backend |
| 🔴 Secreto | `SW_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY` | Solo Edge Functions |

---

## 🖥️ Variables del Frontend

Variables que empiezan con `VITE_` están disponibles en el frontend.

### Supabase (Requeridas)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (pública) | `eyJhbGciOi...` |

### Mapas (Opcional)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_GOOGLE_MAPS_API_KEY` | API Key de Google Maps | `AIzaSy...` |
| `VITE_MAPBOX_TOKEN` | Token de Mapbox (alternativa) | `pk.eyJ1...` |

### Entorno

| Variable | Descripción | Valores |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development`, `production` |

### Uso en Código

```typescript
// Acceder a variables VITE_*
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Verificar entorno
if (import.meta.env.DEV) {
  console.log('Modo desarrollo');
}
```

> ⚠️ **Importante**: Las variables `VITE_*` se incluyen en el bundle de producción. No uses este prefijo para secretos.

---

## ⚡ Variables del Backend

Variables disponibles solo en Edge Functions (Deno).

### Supabase (Automáticas)

Supabase inyecta automáticamente estas variables en Edge Functions:

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto |
| `SUPABASE_ANON_KEY` | Clave anónima |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (admin) |
| `SUPABASE_DB_URL` | URL de conexión PostgreSQL |

### Uso en Edge Functions

```typescript
// Acceder a variables de entorno en Deno
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Crear cliente con permisos admin
const supabase = createClient(supabaseUrl, serviceRoleKey);
```

---

## 🗄️ Variables de Supabase

### Configuración del Proyecto

| Variable | Valor Actual | Descripción |
|----------|--------------|-------------|
| `SUPABASE_PROJECT_ID` | `qulhweffinppyjpfkknh` | ID del proyecto |
| `SUPABASE_URL` | `https://qulhweffinppyjpfkknh.supabase.co` | URL de la API |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Clave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | `[SECRETO]` | Clave admin |

### Configurar en Supabase Dashboard

1. Ir a **Settings** → **API**
2. Copiar las claves necesarias
3. Para Edge Functions: **Settings** → **Edge Functions** → **Secrets**

### URLs de Servicios

```env
# API REST
SUPABASE_REST_URL=https://qulhweffinppyjpfkknh.supabase.co/rest/v1/

# Auth
SUPABASE_AUTH_URL=https://qulhweffinppyjpfkknh.supabase.co/auth/v1/

# Storage
SUPABASE_STORAGE_URL=https://qulhweffinppyjpfkknh.supabase.co/storage/v1/

# Functions
SUPABASE_FUNCTIONS_URL=https://qulhweffinppyjpfkknh.supabase.co/functions/v1/
```

---

## 🧾 Variables del PAC SmartWeb

Variables para integración con el PAC de timbrado.

### Credenciales

| Variable | Descripción | Ubicación |
|----------|-------------|-----------|
| `SW_TOKEN` | Token de autenticación | Supabase Secrets |
| `SW_USER` | Usuario (opcional) | Supabase Secrets |
| `SW_PASSWORD` | Contraseña (opcional) | Supabase Secrets |
| `SW_URL` | URL base del servicio | Supabase Secrets |

### URLs por Ambiente

| Ambiente | URL |
|----------|-----|
| Sandbox | `https://services.test.sw.com.mx` |
| Producción | `https://services.sw.com.mx` |

### Configurar en Supabase

1. Ir a **Settings** → **Edge Functions** → **Secrets**
2. Agregar cada secreto:

```
SW_TOKEN = tu_token_de_smartweb
SW_USER = tu_usuario (opcional)
SW_PASSWORD = tu_password (opcional)
SW_URL = https://services.test.sw.com.mx
```

### Uso en Edge Functions

```typescript
// supabase/functions/timbrar-con-sw/index.ts
const token = Deno.env.get('SW_TOKEN');
const url = Deno.env.get('SW_URL') || 'https://services.test.sw.com.mx';

const response = await fetch(`${url}/cfdi40/issue`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ xml: xmlFirmado })
});
```

---

## 🗺️ Variables de Google

### Google Maps Platform

| Variable | Descripción | APIs Requeridas |
|----------|-------------|-----------------|
| `GOOGLE_MAPS_API_KEY` | API Key principal | Directions, Geocoding, Places |

### Configurar API Key

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto o seleccionar existente
3. Habilitar APIs:
   - Directions API
   - Geocoding API
   - Places API
4. Crear credencial → API Key
5. Restringir key:
   - Por IP (para backend)
   - Por referrer (para frontend, si aplica)

### Configurar en Supabase Secrets

```
GOOGLE_MAPS_API_KEY = AIzaSy...tu_api_key
```

### Uso

```typescript
// En Edge Function
const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

const response = await fetch(
  `https://maps.googleapis.com/maps/api/directions/json?` +
  `origin=${encodeURIComponent(origen)}&` +
  `destination=${encodeURIComponent(destino)}&` +
  `key=${apiKey}`
);
```

---

## 📄 Variables de PDF

### Configuración de Generación

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PDF_LOGO_PATH` | Ruta al logo de la empresa | `/assets/logo.png` |
| `PDF_FONT_SIZE` | Tamaño de fuente base | `10` |
| `PDF_PAGE_SIZE` | Tamaño de página | `LETTER` |

### QR de Verificación SAT

```env
# URL base para verificación (no cambiar)
SAT_VERIFICATION_URL=https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx
```

---

## 📝 Archivo .env.example

Crear este archivo en la raíz del proyecto:

```env
# ============================================
# INTERCONECTA TRUCKING - Variables de Entorno
# ============================================
# Copia este archivo a .env y configura los valores

# ============================================
# SUPABASE (REQUERIDO)
# ============================================
# URL del proyecto Supabase
VITE_SUPABASE_URL=https://qulhweffinppyjpfkknh.supabase.co

# Clave anónima de Supabase (pública, segura para frontend)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# GOOGLE MAPS (OPCIONAL)
# ============================================
# API Key de Google Maps Platform
# Obtener en: https://console.cloud.google.com/
VITE_GOOGLE_MAPS_API_KEY=

# ============================================
# MAPBOX (ALTERNATIVA A GOOGLE MAPS)
# ============================================
# Token de Mapbox
# Obtener en: https://www.mapbox.com/
VITE_MAPBOX_TOKEN=

# ============================================
# ENTORNO
# ============================================
# development | production | test
NODE_ENV=development

# ============================================
# VARIABLES SOLO PARA EDGE FUNCTIONS
# ============================================
# Las siguientes variables se configuran en:
# Supabase Dashboard → Settings → Edge Functions → Secrets
#
# SW_TOKEN          - Token del PAC SmartWeb
# SW_USER           - Usuario del PAC (opcional)
# SW_PASSWORD       - Contraseña del PAC (opcional)
# SW_URL            - URL del PAC (sandbox o producción)
# GOOGLE_MAPS_API_KEY - API Key de Google Maps

# ============================================
# NOTAS IMPORTANTES
# ============================================
# 1. NUNCA subas el archivo .env a Git
# 2. Las variables VITE_* se exponen en el frontend
# 3. Los secretos del PAC van en Supabase Secrets
# 4. Rota las credenciales periódicamente
```

---

## 🔒 Gestión Segura de Secretos

### Principios

1. **Nunca en código** - No hardcodear secretos
2. **Nunca en Git** - `.env` está en `.gitignore`
3. **Mínimo privilegio** - Solo acceso necesario
4. **Rotación** - Cambiar periódicamente
5. **Auditoría** - Registrar accesos

### Jerarquía de Almacenamiento

```
┌─────────────────────────────────────────────┐
│ NIVEL 1: Supabase Vault (Más seguro)        │
│ • Certificados CSD                          │
│ • Contraseñas de llaves privadas            │
├─────────────────────────────────────────────┤
│ NIVEL 2: Supabase Edge Function Secrets     │
│ • Tokens de PAC                             │
│ • API Keys de servicios externos            │
├─────────────────────────────────────────────┤
│ NIVEL 3: Variables de entorno               │
│ • Configuraciones no sensibles              │
│ • URLs públicas                             │
├─────────────────────────────────────────────┤
│ NIVEL 4: Código fuente                      │
│ • Constantes públicas                       │
│ • IDs de proyecto (no secretos)             │
└─────────────────────────────────────────────┘
```

### Configurar Secretos en Supabase

#### Via Dashboard

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto
3. **Settings** → **Edge Functions** → **Secrets**
4. **Add secret**
5. Ingresar nombre y valor

#### Via CLI

```bash
# Configurar secreto
supabase secrets set SW_TOKEN=tu_token_secreto

# Listar secretos (nombres, no valores)
supabase secrets list

# Eliminar secreto
supabase secrets unset SW_TOKEN
```

### Acceso a Vault (Certificados)

```sql
-- Almacenar secreto en Vault
INSERT INTO vault.secrets (name, secret)
VALUES ('mi_secreto', 'valor_encriptado');

-- Recuperar secreto (en función con SECURITY DEFINER)
SELECT decrypted_secret FROM vault.decrypted_secrets
WHERE name = 'mi_secreto';
```

### Rotación de Secretos

1. **Generar nuevo secreto** en el servicio externo
2. **Actualizar en Supabase** Secrets
3. **Verificar** que funciona
4. **Revocar** el secreto anterior
5. **Documentar** la rotación

### Checklist de Seguridad

- [ ] `.env` está en `.gitignore`
- [ ] No hay secretos en el código
- [ ] Secrets configurados en Supabase
- [ ] API Keys restringidas por IP/dominio
- [ ] Rotación programada (trimestral)
- [ ] Acceso auditado

---

## 🔗 Referencias

- [Supabase Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Supabase Vault](https://supabase.com/docs/guides/database/vault)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [12 Factor App: Config](https://12factor.net/config)
