# Fase 5: Crear Bucket de Storage para Facturas

## 🗄️ Objetivo

Crear el bucket `facturas` en Supabase Storage para almacenar PDFs y XMLs de facturas timbradas.

---

## 📝 Pasos Manuales

### 1. Crear Bucket

1. Ve a: **Supabase Dashboard** → **Storage** → **"New bucket"**
2. Nombre: `facturas`
3. Public: ✅ **Sí** (para permitir descargas públicas)
4. Click **"Create bucket"**

---

### 2. Configurar Políticas RLS

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase:

```sql
-- Política de INSERT: Solo el usuario puede subir sus propios archivos
CREATE POLICY "usuarios_pueden_subir_sus_facturas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'facturas' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política de SELECT: Solo el usuario puede ver sus propios archivos
CREATE POLICY "usuarios_pueden_ver_sus_facturas"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'facturas' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política de DELETE: Solo el usuario puede eliminar sus propios archivos
CREATE POLICY "usuarios_pueden_eliminar_sus_facturas"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'facturas' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 🔍 Verificación

### Comprobar que el bucket existe:

```sql
SELECT * FROM storage.buckets WHERE name = 'facturas';
```

### Comprobar políticas:

```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%facturas%';
```

---

## 📂 Estructura de Carpetas

Los archivos se organizarán así:

```
facturas/
├── pdfs/
│   └── {user_id}/
│       └── factura_{folio}_{timestamp}.pdf
└── xmls/
    └── {user_id}/
        └── factura_{folio}_{timestamp}.xml
```

**Ejemplo:**
```
facturas/pdfs/550e8400-e29b-41d4-a716-446655440000/factura_A001_1234567890.pdf
facturas/xmls/550e8400-e29b-41d4-a716-446655440000/factura_A001_1234567890.xml
```

---

## ⚙️ Configuración de Límites (Opcional)

Si quieres limitar el tamaño de archivos:

```sql
-- Limitar tamaño de archivos a 10MB
UPDATE storage.buckets 
SET file_size_limit = 10485760 
WHERE name = 'facturas';

-- Permitir solo PDFs y XMLs
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['application/pdf', 'application/xml', 'text/xml']
WHERE name = 'facturas';
```

---

## 🚨 Troubleshooting

### Error: "new row violates row-level security policy"

**Solución:** Verifica que las políticas RLS estén creadas correctamente:

```sql
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### Error: "bucket not found"

**Solución:** Verifica que el bucket existe:

```sql
SELECT * FROM storage.buckets WHERE name = 'facturas';
```

Si no existe, créalo desde el Dashboard o con SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('facturas', 'facturas', true);
```

---

## ✅ Checklist de Validación

```
[ ] Bucket 'facturas' creado en Supabase Dashboard
[ ] Bucket configurado como público
[ ] Política de INSERT creada y activa
[ ] Política de SELECT creada y activa
[ ] Política de DELETE creada y activa
[ ] Verificación con consultas SQL exitosa
[ ] Edge function generar-pdf-factura puede subir archivos
[ ] Descarga de PDF desde Facturas.tsx funciona
```

---

## 🔗 Enlaces Útiles

- **Dashboard Storage:** https://supabase.com/dashboard/project/qulhweffinppyjpfkknh/storage/buckets
- **Documentación Supabase Storage:** https://supabase.com/docs/guides/storage
- **Políticas RLS Storage:** https://supabase.com/docs/guides/storage/security/access-control
