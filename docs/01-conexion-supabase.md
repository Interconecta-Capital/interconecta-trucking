# 🔌 Conexión Completa a Supabase

Este documento detalla toda la configuración de Supabase para el proyecto **Interconecta Trucking**.

## 📋 Tabla de Contenidos

- [Información del Proyecto](#-información-del-proyecto)
- [Configuración del Cliente](#-configuración-del-cliente)
- [Variables de Entorno](#-variables-de-entorno)
- [Esquema de Base de Datos](#-esquema-de-base-de-datos)
- [Políticas RLS](#-políticas-rls)
- [Storage](#-storage)
- [Autenticación](#-autenticación)
- [Edge Functions](#-edge-functions)
- [Webhooks y Triggers](#-webhooks-y-triggers)
- [Ejemplos de Queries](#-ejemplos-de-queries)
- [Seguridad](#-seguridad)

---

## 📊 Información del Proyecto

### Datos de Conexión

| Parámetro | Valor |
|-----------|-------|
| **Project ID** | `qulhweffinppyjpfkknh` |
| **API URL** | `https://qulhweffinppyjpfkknh.supabase.co` |
| **Región** | `us-east-1` |
| **PostgreSQL Version** | 15 |

### URLs de Servicios

| Servicio | URL |
|----------|-----|
| API REST | `https://qulhweffinppyjpfkknh.supabase.co/rest/v1/` |
| Auth | `https://qulhweffinppyjpfkknh.supabase.co/auth/v1/` |
| Storage | `https://qulhweffinppyjpfkknh.supabase.co/storage/v1/` |
| Realtime | `wss://qulhweffinppyjpfkknh.supabase.co/realtime/v1/` |
| Edge Functions | `https://qulhweffinppyjpfkknh.supabase.co/functions/v1/` |

---

## ⚙️ Configuración del Cliente

### Archivo de Cliente

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qulhweffinppyjpfkknh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY
);
```

### Uso en Componentes

```typescript
import { supabase } from "@/integrations/supabase/client";

// Ejemplo de query
const { data, error } = await supabase
  .from('viajes')
  .select('*')
  .eq('user_id', userId);
```

---

## 🔐 Variables de Entorno

### Claves Públicas (Frontend)

| Variable | Descripción | Seguridad |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL del proyecto | Pública |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima | Pública (limitada por RLS) |

### Claves Privadas (Backend/Edge Functions)

| Variable | Descripción | Seguridad |
|----------|-------------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio | ⚠️ Secreta |
| `SW_TOKEN` | Token del PAC SmartWeb | ⚠️ Secreta |
| `SW_USER` | Usuario PAC | ⚠️ Secreta |
| `SW_PASSWORD` | Contraseña PAC | ⚠️ Secreta |
| `GOOGLE_MAPS_API_KEY` | API Key Google | ⚠️ Secreta |

### Configurar Secretos en Edge Functions

En Supabase Dashboard → Settings → Edge Functions → Secrets:

```
SW_TOKEN=tu_token_pac
SW_USER=tu_usuario_pac
SW_PASSWORD=tu_password_pac
GOOGLE_MAPS_API_KEY=tu_api_key
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### Usuarios y Perfiles

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuario (extensión de auth.users) |
| `usuarios` | Información extendida de usuarios |
| `user_roles` | Roles asignados a usuarios |
| `tenants` | Multi-tenancy |

#### Flota

| Tabla | Descripción |
|-------|-------------|
| `vehiculos` | Registro de vehículos |
| `conductores` | Registro de conductores |
| `remolques` | Registro de remolques |

#### Operaciones

| Tabla | Descripción |
|-------|-------------|
| `viajes` | Viajes programados y realizados |
| `facturas` | Facturas CFDI 4.0 |
| `cartas_porte` | Complementos Carta Porte 3.1 |
| `borradores_carta_porte` | Borradores en edición |

#### Catálogos SAT

| Tabla | Descripción |
|-------|-------------|
| `cat_estado` | Estados de México |
| `cat_municipio` | Municipios |
| `cat_codigo_postal` | Códigos postales |
| `cat_clave_prod_serv_cp` | Productos y servicios |
| `cat_clave_unidad` | Unidades de medida |
| `cat_config_autotransporte` | Configuraciones vehiculares |

### Diagrama de Relaciones

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   usuarios  │───────│    viajes   │───────│  facturas   │
└─────────────┘       └─────────────┘       └─────────────┘
      │                     │                     │
      │                     │                     │
      ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  vehiculos  │       │ conductores │       │ cartas_porte│
└─────────────┘       └─────────────┘       └─────────────┘
      │                     │
      │                     │
      ▼                     ▼
┌─────────────┐       ┌─────────────┐
│  remolques  │       │   socios    │
└─────────────┘       └─────────────┘
```

---

## 🛡️ Políticas RLS

### Concepto

Row Level Security (RLS) restringe el acceso a filas individuales basándose en el usuario autenticado.

### Políticas Comunes

#### Tabla `viajes`

```sql
-- Ver solo viajes propios
CREATE POLICY "Users can view own viajes"
ON public.viajes
FOR SELECT
USING (auth.uid() = user_id);

-- Crear viajes propios
CREATE POLICY "Users can create own viajes"
ON public.viajes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Actualizar viajes propios
CREATE POLICY "Users can update own viajes"
ON public.viajes
FOR UPDATE
USING (auth.uid() = user_id);

-- Eliminar viajes propios
CREATE POLICY "Users can delete own viajes"
ON public.viajes
FOR DELETE
USING (auth.uid() = user_id);
```

#### Tabla `vehiculos`

```sql
-- Ver solo vehículos propios
CREATE POLICY "Users can view own vehiculos"
ON public.vehiculos
FOR SELECT
USING (auth.uid() = user_id);

-- CRUD completo para propietarios
CREATE POLICY "Users can manage own vehiculos"
ON public.vehiculos
FOR ALL
USING (auth.uid() = user_id);
```

### Verificar Políticas

```sql
-- Ver todas las políticas de una tabla
SELECT * FROM pg_policies WHERE tablename = 'viajes';
```

---

## 📁 Storage

### Buckets Configurados

| Bucket | Propósito | Acceso |
|--------|-----------|--------|
| `certificados` | CSD (.cer, .key) | Privado |
| `documentos` | PDFs generados | Privado |
| `avatars` | Fotos de perfil | Público |
| `vehiculos` | Fotos de vehículos | Privado |

### Políticas de Storage

```sql
-- Usuarios pueden subir a su carpeta
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documentos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuarios pueden ver sus archivos
CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documentos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Uso en Código

```typescript
// Subir archivo
const { data, error } = await supabase.storage
  .from('documentos')
  .upload(`${userId}/factura-${uuid}.pdf`, pdfBlob);

// Obtener URL pública
const { data } = supabase.storage
  .from('documentos')
  .getPublicUrl(`${userId}/factura-${uuid}.pdf`);

// Descargar archivo
const { data, error } = await supabase.storage
  .from('documentos')
  .download(`${userId}/factura-${uuid}.pdf`);
```

---

## 🔑 Autenticación

### Métodos Habilitados

| Método | Estado |
|--------|--------|
| Email/Password | ✅ Activo |
| Magic Link | ✅ Activo |
| Google OAuth | ⚠️ Configurar |
| GitHub OAuth | ⚠️ Configurar |

### Flujo de Autenticación

```typescript
// Registro
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@ejemplo.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'Nombre Usuario'
    }
  }
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@ejemplo.com',
  password: 'password123'
});

// Logout
await supabase.auth.signOut();

// Obtener usuario actual
const { data: { user } } = await supabase.auth.getUser();

// Escuchar cambios de auth
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Usuario logueado:', session.user);
  }
});
```

### Configurar OAuth

En Supabase Dashboard → Authentication → Providers:

1. **Google OAuth**
   - Client ID: `tu_client_id.apps.googleusercontent.com`
   - Client Secret: `tu_client_secret`
   - Redirect URL: `https://qulhweffinppyjpfkknh.supabase.co/auth/v1/callback`

---

## ⚡ Edge Functions

### Funciones Disponibles

| Función | Propósito | Auth |
|---------|-----------|------|
| `timbrar-con-sw` | Timbrar CFDI con PAC | JWT |
| `cancelar-cfdi-sw` | Cancelar CFDI | JWT |
| `generar-pdf-cfdi` | Generar PDF oficial | JWT |
| `validar-pre-timbrado` | Validación previa | JWT |
| `google-directions` | Calcular rutas | JWT |
| `poblar-catalogos-cp` | Poblar catálogos SAT | Sin Auth |
| `check-expirations` | Verificar vencimientos | Sin Auth |

### Invocar Edge Function

```typescript
// Con autenticación
const { data, error } = await supabase.functions.invoke('timbrar-con-sw', {
  body: {
    viaje_id: 'uuid-del-viaje',
    ambiente: 'sandbox'
  }
});

// Sin autenticación (funciones públicas)
const { data, error } = await supabase.functions.invoke('check-expirations');
```

### Estructura de Edge Function

```typescript
// supabase/functions/mi-funcion/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener token JWT
    const authHeader = req.headers.get('Authorization')
    
    // Crear cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Lógica de la función
    const { data } = await req.json()
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 🔄 Webhooks y Triggers

### Triggers de Base de Datos

| Trigger | Tabla | Evento | Acción |
|---------|-------|--------|--------|
| `increment_cartas_creadas` | `cartas_porte` | INSERT | Incrementa contador en profiles |
| `increment_timbres_consumidos` | `cartas_porte` | UPDATE (timbrado) | Registra consumo de timbres |
| `actualizar_metricas_tiempo_real` | `viajes` | UPDATE | Actualiza estado de recursos |
| `sync_carta_porte_fields` | `cartas_porte` | INSERT/UPDATE | Sincroniza campos JSON |

### Ejemplo de Trigger

```sql
-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_viajes_updated_at
BEFORE UPDATE ON public.viajes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

### Funciones de Base de Datos

| Función | Propósito |
|---------|-----------|
| `get_viaje_completo(uuid)` | Obtener viaje con todas sus relaciones |
| `buscar_codigo_postal(text)` | Buscar CP en catálogo |
| `validar_configuracion_fiscal_completa(uuid)` | Validar config fiscal |
| `check_maintenance_alerts(uuid)` | Verificar alertas de mantenimiento |

---

## 📝 Ejemplos de Queries

### Queries Básicas

```typescript
// Obtener todos los viajes del usuario
const { data: viajes } = await supabase
  .from('viajes')
  .select('*')
  .order('created_at', { ascending: false });

// Obtener viaje con relaciones
const { data: viaje } = await supabase
  .from('viajes')
  .select(`
    *,
    conductor:conductores(*),
    vehiculo:vehiculos(*),
    socio:socios(*)
  `)
  .eq('id', viajeId)
  .single();

// Buscar código postal
const { data } = await supabase
  .rpc('buscar_codigo_postal', { cp_input: '06600' });
```

### Queries con Filtros

```typescript
// Viajes en un rango de fechas
const { data } = await supabase
  .from('viajes')
  .select('*')
  .gte('fecha_inicio_programada', '2024-01-01')
  .lte('fecha_inicio_programada', '2024-12-31')
  .eq('estado', 'completado');

// Vehículos disponibles
const { data } = await supabase
  .from('vehiculos')
  .select('*')
  .eq('estado', 'disponible')
  .eq('activo', true);
```

### Inserts y Updates

```typescript
// Crear viaje
const { data, error } = await supabase
  .from('viajes')
  .insert({
    origen: 'CDMX',
    destino: 'Guadalajara',
    fecha_inicio_programada: new Date().toISOString(),
    user_id: userId
  })
  .select()
  .single();

// Actualizar estado
const { error } = await supabase
  .from('viajes')
  .update({ estado: 'en_transito' })
  .eq('id', viajeId);
```

---

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca exponer `SERVICE_ROLE_KEY`** en el frontend
2. **Siempre usar RLS** en tablas con datos de usuarios
3. **Validar datos** antes de insertar/actualizar
4. **Usar Edge Functions** para operaciones sensibles

### Auditoría

```sql
-- Tabla de auditoría
SELECT * FROM security_audit_log
WHERE user_id = 'uuid-usuario'
ORDER BY created_at DESC
LIMIT 100;
```

### Monitoreo

- Supabase Dashboard → Logs → API Logs
- Supabase Dashboard → Logs → Postgres Logs
- Edge Functions → Logs

---

## 🔗 Links Útiles

- [Supabase Dashboard](https://supabase.com/dashboard/project/qulhweffinppyjpfkknh)
- [SQL Editor](https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/sql/new)
- [Auth Settings](https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/auth/providers)
- [Edge Functions](https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/functions)
- [Storage](https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/storage/buckets)
