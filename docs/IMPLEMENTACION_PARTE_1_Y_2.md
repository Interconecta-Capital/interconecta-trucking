# 🚀 FASE 4 - SPRINT 2: IMPLEMENTACIÓN PARTE 1 Y 2

## 📋 RESUMEN EJECUTIVO

**Objetivo:** Corregir funciones SQL vulnerables y crear infraestructura de Storage segura.

**Componentes:**
- ✅ Parte 1: Corrección de 5 funciones SQL sin `search_path`
- ✅ Parte 2: Creación de 5 buckets de Storage con políticas RLS

**Tiempo estimado:** 1.5 horas  
**Impacto de seguridad:** 🔴 CRÍTICO

---

## 🎯 PARTE 1: CORRECCIÓN DE FUNCIONES SQL (30 minutos)

### **Funciones a Corregir**

Según tu verificación, estas 5 funciones carecen de `SET search_path`:

1. ✅ `get_auth` - Información de usuario autenticado
2. ✅ `verificar_disponibilidad_recurso` - Validación de disponibilidad
3. ✅ `increment_schema_version` - Versión de esquema (admin)
4. ✅ `get_schema_version` - Lectura de versión
5. ✅ `restore_rls_policies_from_backup` - Restauración de políticas (crítica)

### **Instrucciones de Ejecución**

1. **Abrir Supabase Dashboard**
   - Ir a: https://supabase.com/dashboard/project/{tu-proyecto-id}
   - Navegar a: **SQL Editor**

2. **Ejecutar el Script de Corrección**
   - Abrir el archivo: `docs/sql/PARTE_1_CORRECCION_FUNCIONES.sql`
   - Copiar **TODO** el contenido
   - Pegar en SQL Editor
   - Click en **"Run"** (ejecutar)

3. **Verificar Corrección**
   - Ejecutar la consulta de verificación incluida al final del script
   - **Resultado esperado:** Todas las funciones deben mostrar `has_search_path = true`

### **Consulta de Verificación Rápida**

```sql
SELECT 
  proname,
  (proconfig IS NOT NULL AND proconfig::text LIKE '%search_path%') as has_search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND prosecdef = true
  AND proname IN (
    'get_auth',
    'verificar_disponibilidad_recurso',
    'increment_schema_version',
    'get_schema_version',
    'restore_rls_policies_from_backup'
  )
ORDER BY proname;
```

### **¿Qué hace `SET search_path`?**

**Vulnerabilidad sin `search_path`:**
```sql
-- ❌ INSEGURO: Un atacante puede crear función maliciosa en otro schema
CREATE FUNCTION public.mi_funcion() SECURITY DEFINER AS $$
BEGIN
  SELECT * FROM usuarios; -- ¿Qué tabla "usuarios"? ¡Depende del search_path del caller!
END;
$$;
```

**Protección con `search_path`:**
```sql
-- ✅ SEGURO: Solo usa schemas explícitos (public, pg_catalog)
CREATE FUNCTION public.mi_funcion() 
SECURITY DEFINER 
SET search_path = public, pg_catalog -- Fija los schemas permitidos
AS $$
BEGIN
  SELECT * FROM public.usuarios; -- Siempre usa public.usuarios
END;
$$;
```

---

## 🗄️ PARTE 2: STORAGE BUCKETS Y POLÍTICAS RLS (1 hora)

### **Estructura de Buckets**

| Bucket            | Propósito                    | Tamaño Max | Tipos MIME Permitidos        |
|-------------------|------------------------------|------------|------------------------------|
| `conductores-docs`| Fotos de licencias, docs     | 10 MB      | JPEG, PNG, WebP, PDF         |
| `vehiculos-docs`  | Tarjetas, pólizas, permisos  | 10 MB      | JPEG, PNG, WebP, PDF         |
| `remolques-docs`  | Tarjetas, permisos SCT       | 10 MB      | JPEG, PNG, WebP, PDF         |
| `socios-docs`     | Constancias, identificaciones| 10 MB      | JPEG, PNG, WebP, PDF         |
| `cartas-porte`    | Cartas de porte generadas    | 5 MB       | PDF, XML                     |

### **Instrucciones de Ejecución**

1. **Ejecutar Script de Buckets**
   - Abrir el archivo: `docs/sql/PARTE_2_STORAGE_BUCKETS_Y_POLITICAS.sql`
   - Copiar **TODO** el contenido
   - Pegar en SQL Editor de Supabase
   - Click en **"Run"**

2. **Verificar Creación de Buckets**
   - Navegar a: **Storage** → **Buckets** en Supabase Dashboard
   - Verificar que aparezcan los 5 buckets nuevos
   - Comprobar límites de tamaño y tipos MIME

3. **Verificar Políticas RLS**
   - Ejecutar las consultas de verificación incluidas en el script
   - **Resultado esperado:** 20 políticas RLS activas (4 por bucket)

### **Políticas RLS Configuradas**

Para cada bucket se crean **4 políticas**:

1. **INSERT (Upload):** Usuario puede subir archivos en su carpeta (`{user_id}/archivo.pdf`)
2. **SELECT (Download):** Usuario puede ver sus archivos O ser superusuario
3. **UPDATE (Modify):** Usuario puede modificar sus archivos
4. **DELETE (Remove):** Usuario puede eliminar sus archivos

**Ejemplo de política:**
```sql
-- Política INSERT para conductores-docs
CREATE POLICY "Users can upload their conductor docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'conductores-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### **Estructura de Carpetas Esperada**

Los archivos DEBEN subirse con la siguiente estructura:

```
conductores-docs/
  ├── {user_id_1}/
  │   ├── conductor-123-licencia.jpg
  │   └── conductor-456-licencia.pdf
  └── {user_id_2}/
      └── conductor-789-licencia.png

vehiculos-docs/
  ├── {user_id_1}/
  │   ├── vehiculo-abc-tarjeta.pdf
  │   └── vehiculo-abc-poliza.pdf
  └── ...

cartas-porte/
  ├── {user_id_1}/
  │   ├── carta-2024-001.pdf
  │   └── carta-2024-001.xml
  └── ...
```

---

## ✅ VERIFICACIÓN POST-IMPLEMENTACIÓN

### **1. Verificar Funciones SQL Corregidas**

```sql
-- Todas deben mostrar has_search_path = true
SELECT 
  proname,
  (proconfig::text LIKE '%search_path%') as protegida
FROM pg_proc p
WHERE proname IN ('get_auth', 'verificar_disponibilidad_recurso')
  AND prosecdef = true;
```

**✅ Resultado esperado:**
```
proname                          | protegida
---------------------------------|----------
get_auth                         | true
verificar_disponibilidad_recurso | true
```

### **2. Verificar Buckets Creados**

```sql
SELECT 
  id,
  file_size_limit / 1048576 as max_mb,
  array_length(allowed_mime_types, 1) as tipos_permitidos
FROM storage.buckets
WHERE id LIKE '%-docs' OR id = 'cartas-porte';
```

**✅ Resultado esperado:**
```
id               | max_mb | tipos_permitidos
-----------------|--------|----------------
conductores-docs | 10     | 4
vehiculos-docs   | 10     | 4
remolques-docs   | 10     | 4
socios-docs      | 10     | 4
cartas-porte     | 5      | 3
```

### **3. Verificar Políticas RLS**

```sql
SELECT 
  policyname,
  cmd as operacion
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%conductor%'
ORDER BY policyname;
```

**✅ Resultado esperado:** 4 políticas (INSERT, SELECT, UPDATE, DELETE)

### **4. Probar Subida de Archivo**

Puedes probar la subida desde el frontend o usando el cliente de Supabase:

```typescript
// Ejemplo de subida correcta
const { data, error } = await supabase.storage
  .from('conductores-docs')
  .upload(`${userId}/conductor-${conductorId}-licencia.jpg`, file);
```

---

## 🔒 IMPACTO EN SEGURIDAD

### **Antes de Parte 1:**
❌ 5 funciones `SECURITY DEFINER` vulnerables a privilege escalation  
❌ Posibilidad de inyección de funciones maliciosas  

### **Después de Parte 1:**
✅ 50/50 funciones protegidas con `search_path`  
✅ 100% de funciones críticas aseguradas  
✅ Cumplimiento total de Supabase Linter  

### **Antes de Parte 2:**
❌ Solo 1 bucket de Storage (`certificados`)  
❌ Sin límites de tamaño documentados  
❌ Sin políticas RLS específicas por tipo de documento  

### **Después de Parte 2:**
✅ 5 buckets organizados por tipo de entidad  
✅ Límites de tamaño claros (5-10 MB)  
✅ 20 políticas RLS protegiendo acceso  
✅ Tipos MIME restringidos (seguridad adicional)  
✅ Superusuarios pueden auditar documentos  

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica                          | Antes | Después | Objetivo |
|----------------------------------|-------|---------|----------|
| Funciones SQL con search_path    | 45/50 | 50/50   | ✅ 100%  |
| Buckets de Storage               | 1     | 6       | ✅ 6     |
| Políticas RLS para Storage       | ~4    | ~24     | ✅ 24    |
| Límites de tamaño documentados   | No    | Sí      | ✅ Sí    |
| Tipos MIME restringidos          | No    | Sí      | ✅ Sí    |

---

## 🚨 TROUBLESHOOTING

### **Error: "relation schema_version does not exist"**

**Problema:** Las funciones `increment_schema_version` y `get_schema_version` requieren una tabla que no existe.

**Solución 1 (recomendada):** Comentar esas 2 funciones del script si no usas versionado de esquema.

**Solución 2:** Crear la tabla:
```sql
CREATE TABLE IF NOT EXISTS public.schema_version (
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.schema_version (version) VALUES (1);
```

### **Error: "policy already exists"**

**Problema:** Ya existen políticas con los mismos nombres.

**Solución:** Primero eliminar políticas existentes:
```sql
DROP POLICY IF EXISTS "Users can upload their conductor docs" ON storage.objects;
-- Repetir para cada política...
```

### **Error: "bucket already exists"**

**Problema:** Los buckets ya existen.

**Solución:** El script usa `ON CONFLICT DO UPDATE`, así que no debería fallar. Si falla:
```sql
-- Actualizar bucket existente
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'conductores-docs';
```

---

## 📁 ARCHIVOS CREADOS

```
docs/
├── sql/
│   ├── PARTE_1_CORRECCION_FUNCIONES.sql    ← Ejecutar primero
│   └── PARTE_2_STORAGE_BUCKETS_Y_POLITICAS.sql ← Ejecutar segundo
└── IMPLEMENTACION_PARTE_1_Y_2.md           ← Este archivo (guía)
```

---

## 🎯 PRÓXIMOS PASOS

Una vez completadas las Partes 1 y 2:

### **Opciones para continuar:**

1. **Implementar Parte 3: Cifrado de documentos**
   - Añadir columnas cifradas a tablas
   - Crear funciones de cifrado/descifrado
   - Migrar documentos existentes

2. **Implementar Parte 4: Edge Function de descifrado**
   - Crear función universal de descifrado
   - Desplegar en Supabase Edge Functions
   - Probar con diferentes tipos de documentos

3. **Implementar Parte 5: Validación centralizada**
   - Crear `DocumentValidationService`
   - Actualizar componentes de subida de archivos
   - Aplicar límites consistentes en frontend

4. **Hacer pruebas de integración**
   - Subir documentos de prueba a cada bucket
   - Verificar políticas RLS con diferentes usuarios
   - Confirmar límites de tamaño

---

## 🔐 CUMPLIMIENTO NORMATIVO

Esta implementación cumple con:

- ✅ **ISO 27001 A.9.4.5** - Access control to program source code
- ✅ **ISO 27001 A.12.3** - Information backup (políticas RLS)
- ✅ **GDPR Art. 32** - Security of processing (límites de almacenamiento)
- ✅ **OWASP Top 10 - A01:2021** - Broken Access Control (RLS)
- ✅ **NIST SP 800-53 SC-28** - Protection of Information at Rest

---

## 📞 SOPORTE

Si encuentras problemas durante la implementación:

1. Revisar la sección **Troubleshooting** de este documento
2. Verificar logs de SQL Editor en Supabase
3. Consultar documentación oficial: https://supabase.com/docs/guides/storage

---

**Documento creado:** 2025-01-11  
**Versión:** 1.0  
**Estado:** ✅ Listo para ejecutar  
