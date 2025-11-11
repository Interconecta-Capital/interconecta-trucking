# 🚀 FASE 4 - SPRINT 2: Cifrado y Penetration Testing

**Fecha de Inicio:** 11 Noviembre 2025  
**Duración Estimada:** 2-3 semanas  
**Estado:** 📋 PLANIFICADO

---

## 🎯 **OBJETIVOS DEL SPRINT**

1. **Cifrado de Datos Sensibles** 🔐
   - Cifrar fotos de licencias de conductores
   - Implementar descifrado seguro en Edge Functions
   - Gestión de claves de cifrado en Vault

2. **Penetration Testing** 🛡️
   - Análisis de vulnerabilidades con OWASP ZAP
   - Tests de seguridad automatizados
   - Corrección de vulnerabilidades encontradas

3. **Documentación Técnica** 📚
   - API Documentation completa
   - Database Schema Documentation
   - RLS Policies Documentation
   - Security Architecture

---

## 📊 **TAREAS DETALLADAS**

### **TAREA 1: Cifrado de Fotos de Licencias** ⏱️ 8-10 horas

#### **1.1 Preparación de Base de Datos**

**Objetivo:** Añadir columna cifrada y funciones de cifrado/descifrado.

**Migración SQL:**
```sql
-- Añadir columna para datos cifrados
ALTER TABLE public.conductores 
ADD COLUMN foto_licencia_encrypted BYTEA;

-- Crear índice para búsqueda eficiente
CREATE INDEX idx_conductores_foto_encrypted 
ON public.conductores(id) 
WHERE foto_licencia_encrypted IS NOT NULL;
```

**Funciones de Cifrado:**
```sql
-- Función para cifrar foto de licencia
CREATE OR REPLACE FUNCTION public.encrypt_conductor_photo(
  conductor_id UUID,
  photo_data TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Obtener clave del Vault
  encryption_key := public.get_secret('ENCRYPTION_KEY');
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Clave de cifrado no configurada en Vault';
  END IF;

  -- Cifrar y guardar
  UPDATE public.conductores
  SET 
    foto_licencia_encrypted = pgp_sym_encrypt(photo_data, encryption_key),
    foto_licencia_url = NULL  -- Eliminar URL sin cifrar
  WHERE id = conductor_id
    AND user_id = auth.uid();  -- Seguridad: solo el propietario
  
  -- Registrar en auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    auth.uid(),
    'photo_encrypted',
    jsonb_build_object(
      'conductor_id', conductor_id,
      'timestamp', now()
    )
  );

  RETURN FOUND;
END;
$$;

-- Función para descifrar foto de licencia
CREATE OR REPLACE FUNCTION public.decrypt_conductor_photo(
  conductor_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  encryption_key TEXT;
  decrypted_data TEXT;
BEGIN
  -- Verificar autorización
  IF NOT EXISTS (
    SELECT 1 FROM public.conductores
    WHERE id = conductor_id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para acceder a esta foto';
  END IF;

  -- Obtener clave del Vault
  encryption_key := public.get_secret('ENCRYPTION_KEY');
  
  -- Descifrar
  SELECT pgp_sym_decrypt(foto_licencia_encrypted, encryption_key)
  INTO decrypted_data
  FROM public.conductores
  WHERE id = conductor_id;

  -- Registrar acceso en auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    auth.uid(),
    'photo_decrypted',
    jsonb_build_object(
      'conductor_id', conductor_id,
      'timestamp', now()
    )
  );

  RETURN decrypted_data;
END;
$$;
```

#### **1.2 Edge Function para Descifrado**

**Archivo:** `supabase/functions/decrypt-photo/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { conductorId } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Llamar a función de descifrado
    const { data, error } = await supabaseClient
      .rpc('decrypt_conductor_photo', { conductor_id: conductorId });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        photoData: data 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
```

#### **1.3 Migración de Datos Existentes**

**Script de migración:**
```sql
-- Migrar fotos existentes a formato cifrado
-- EJECUTAR EN HORARIO DE BAJO TRÁFICO

DO $$
DECLARE
  conductor_record RECORD;
  encryption_key TEXT;
  migrated_count INTEGER := 0;
BEGIN
  -- Obtener clave de cifrado
  SELECT decrypted_secret INTO encryption_key
  FROM vault.decrypted_secrets
  WHERE name = 'ENCRYPTION_KEY'
  LIMIT 1;

  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Clave de cifrado no disponible';
  END IF;

  -- Migrar cada conductor con foto
  FOR conductor_record IN 
    SELECT id, foto_licencia_url
    FROM public.conductores
    WHERE foto_licencia_url IS NOT NULL
      AND foto_licencia_encrypted IS NULL
  LOOP
    -- Cifrar y guardar
    UPDATE public.conductores
    SET 
      foto_licencia_encrypted = pgp_sym_encrypt(
        conductor_record.foto_licencia_url, 
        encryption_key
      ),
      foto_licencia_url = NULL  -- Eliminar URL sin cifrar
    WHERE id = conductor_record.id;

    migrated_count := migrated_count + 1;

    -- Log de progreso cada 100 registros
    IF migrated_count % 100 = 0 THEN
      RAISE NOTICE 'Migrados % conductores...', migrated_count;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migración completada: % conductores cifrados', migrated_count;
END;
$$;
```

---

### **TAREA 2: Penetration Testing** ⏱️ 6-8 horas

#### **2.1 Setup de OWASP ZAP**

**Instalación:**
```bash
# Mac
brew install zaproxy

# Ubuntu/Debian
sudo apt install zaproxy

# Windows
# Descargar de https://www.zaproxy.org/download/
```

**Configuración:**
```yaml
# zap-config.yaml
context:
  name: "Interconecta Trucking"
  urls:
    - "https://your-app.lovable.app"
  authentication:
    method: "jwt"
    loginUrl: "https://your-app.lovable.app/login"

scanner:
  scanPolicy: "Default Policy"
  alertThreshold: "medium"
  
rules:
  - id: 40012
    name: "Cross Site Scripting (Reflected)"
    enabled: true
  - id: 40014
    name: "Cross Site Scripting (Persistent)"
    enabled: true
  - id: 40018
    name: "SQL Injection"
    enabled: true
```

#### **2.2 Escaneo Automatizado**

**Script de escaneo:**
```bash
#!/bin/bash
# penetration-test.sh

APP_URL="https://your-app.lovable.app"
REPORT_DIR="./security-reports"

# Crear directorio de reportes
mkdir -p $REPORT_DIR

# Ejecutar ZAP en modo headless
zap-cli quick-scan \
  --spider \
  --ajax-spider \
  --scanners all \
  --recursive \
  --self-contained \
  $APP_URL

# Generar reporte HTML
zap-cli report \
  -o "$REPORT_DIR/zap-report-$(date +%Y%m%d).html" \
  -f html

# Generar reporte JSON
zap-cli report \
  -o "$REPORT_DIR/zap-report-$(date +%Y%m%d).json" \
  -f json

echo "✅ Penetration testing completado"
echo "📊 Reportes guardados en: $REPORT_DIR"
```

#### **2.3 Tests de Seguridad Específicos**

**Test 1: SQL Injection**
```bash
# Test de SQL injection en búsqueda de códigos postales
curl -X POST "https://your-app.lovable.app/api/search" \
  -H "Content-Type: application/json" \
  -d '{"cp": "12345'\'' OR '\''1'\''='\''1"}'
```

**Test 2: XSS (Cross-Site Scripting)**
```bash
# Test de XSS en formulario de conductor
curl -X POST "https://your-app.lovable.app/api/conductores" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "<script>alert('\''XSS'\'')</script>"}'
```

**Test 3: CSRF (Cross-Site Request Forgery)**
```html
<!-- csrf-test.html -->
<html>
  <body>
    <form action="https://your-app.lovable.app/api/conductores" method="POST">
      <input type="hidden" name="nombre" value="Conductor Malicioso" />
      <input type="submit" value="Click aquí" />
    </form>
  </body>
</html>
```

**Test 4: Authentication Bypass**
```bash
# Intentar acceder a endpoint protegido sin auth
curl -X GET "https://your-app.lovable.app/api/admin/users"

# Intentar con token manipulado
curl -X GET "https://your-app.lovable.app/api/admin/users" \
  -H "Authorization: Bearer fake.token.here"
```

---

### **TAREA 3: Documentación Técnica** ⏱️ 10-14 horas

#### **3.1 API Documentation**

**Archivo:** `docs/API_DOCUMENTATION.md`

```markdown
# 📡 API Documentation - Interconecta Trucking

## Base URL
```
https://your-app.lovable.app/api
```

## Authentication
Todas las rutas requieren JWT token en header:
```
Authorization: Bearer <token>
```

## Endpoints

### Conductores

#### GET /conductores
Obtener lista de conductores del usuario autenticado.

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "nombre_completo": "string",
      "licencia_numero": "string",
      "estado": "disponible" | "en_viaje" | "ocupado"
    }
  ]
}
\`\`\`

#### POST /conductores
Crear nuevo conductor.

**Request Body:**
\`\`\`json
{
  "nombre_completo": "string",
  "licencia_numero": "string",
  "fecha_nacimiento": "date"
}
\`\`\`

### Edge Functions

#### POST /functions/v1/decrypt-photo
Descifrar foto de licencia de conductor.

**Request:**
\`\`\`json
{
  "conductorId": "uuid"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "photoData": "base64_string"
}
\`\`\`
```

#### **3.2 Database Schema Documentation**

**Archivo:** `docs/DATABASE_SCHEMA.md`

(Ver contenido en archivo separado)

#### **3.3 RLS Policies Documentation**

**Archivo:** `docs/RLS_POLICIES.md`

```markdown
# 🔒 Row Level Security Policies

## conductores

### SELECT Policy
```sql
CREATE POLICY "Users can view own conductores"
ON public.conductores FOR SELECT
USING (auth.uid() = user_id);
```

### INSERT Policy
```sql
CREATE POLICY "Users can create own conductores"
ON public.conductores FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Superuser Override
```sql
CREATE POLICY "Superusers can view all conductores"
ON public.conductores FOR SELECT
USING (is_superuser_secure(auth.uid()));
```
```

---

## 📅 **CRONOGRAMA**

| Semana | Tarea | Horas | Responsable |
|--------|-------|-------|-------------|
| **Semana 1** |
| Día 1-2 | Cifrado BD + Funciones | 8h | Backend |
| Día 3 | Edge Function descifrado | 4h | Backend |
| Día 4-5 | Migración de datos | 6h | Backend |
| **Semana 2** |
| Día 1-2 | Setup OWASP ZAP + Escaneo | 6h | Security |
| Día 3 | Corrección vulnerabilidades | 8h | Full Stack |
| **Semana 3** |
| Día 1-3 | Documentación técnica | 12h | Tech Writer |
| Día 4-5 | Review y validación | 4h | Team |

**Total:** ~48 horas (2-3 semanas con equipo pequeño)

---

## ✅ **CRITERIOS DE ÉXITO**

### **Cifrado:**
- ✅ Todas las fotos de licencias cifradas con AES-256
- ✅ Edge Function de descifrado funcional
- ✅ 0 fotos sin cifrar en producción
- ✅ Performance: descifrado < 200ms

### **Penetration Testing:**
- ✅ Escaneo OWASP ZAP completado
- ✅ 0 vulnerabilidades críticas
- ✅ 0 vulnerabilidades altas sin mitigar
- ✅ Reporte de seguridad generado

### **Documentación:**
- ✅ API docs al 100%
- ✅ Database schema documentado
- ✅ RLS policies explicadas
- ✅ Runbooks operacionales creados

---

## 🚧 **RIESGOS Y MITIGACIONES**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos en migración | Baja | Alto | Backup completo antes de migrar |
| Performance de descifrado | Media | Medio | Cachear fotos descifradas temporalmente |
| Vulnerabilidades no detectadas | Media | Alto | Contratar auditoría externa |
| Documentación desactualizada | Alta | Bajo | Automatizar con CI/CD |

---

**Preparado por:** Sistema Lovable AI  
**Revisado por:** [Pendiente]  
**Aprobado por:** [Pendiente]  
**Fecha:** 11 Noviembre 2025
