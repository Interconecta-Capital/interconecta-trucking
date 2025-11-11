-- ============================================================================
-- FASE 4 - SPRINT 2 - PARTE 2: STORAGE BUCKETS Y POLÍTICAS RLS
-- ============================================================================
-- Objetivo: Crear buckets de Storage seguros con límites y políticas RLS
-- Buckets: conductores-docs, vehiculos-docs, remolques-docs, socios-docs, cartas-porte
-- ============================================================================

-- PASO 1: CREAR BUCKETS DE STORAGE
-- ============================================================================

-- Bucket para documentos de conductores (fotos de licencia, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'conductores-docs',
  'conductores-docs',
  false, -- No público (requiere autenticación)
  10485760, -- 10MB (10 * 1024 * 1024 bytes)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE storage.buckets IS 'Bucket conductores-docs: Documentos de conductores (max 10MB)';

-- ============================================================================

-- Bucket para documentos de vehículos (tarjeta circulación, póliza, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehiculos-docs',
  'vehiculos-docs',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE storage.buckets IS 'Bucket vehiculos-docs: Documentos de vehículos (max 10MB)';

-- ============================================================================

-- Bucket para documentos de remolques
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'remolques-docs',
  'remolques-docs',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE storage.buckets IS 'Bucket remolques-docs: Documentos de remolques (max 10MB)';

-- ============================================================================

-- Bucket para documentos de socios (constancias fiscales, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'socios-docs',
  'socios-docs',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE storage.buckets IS 'Bucket socios-docs: Documentos de socios (max 10MB)';

-- ============================================================================

-- Bucket para Cartas Porte generadas (PDFs y XMLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cartas-porte',
  'cartas-porte',
  false,
  5242880, -- 5MB (5 * 1024 * 1024 bytes)
  ARRAY['application/pdf', 'application/xml', 'text/xml']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE storage.buckets IS 'Bucket cartas-porte: Cartas de porte generadas (max 5MB)';

-- ============================================================================
-- PASO 2: POLÍTICAS RLS PARA STORAGE - CONDUCTORES-DOCS
-- ============================================================================

-- Política INSERT: Los usuarios pueden subir documentos de sus conductores
CREATE POLICY "Users can upload their conductor docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'conductores-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política SELECT: Los usuarios pueden ver sus propios documentos o superusuarios pueden ver todos
CREATE POLICY "Users can view their conductor docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'conductores-docs' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_superuser_secure(auth.uid())
  )
);

-- Política UPDATE: Los usuarios pueden actualizar sus propios documentos
CREATE POLICY "Users can update their conductor docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'conductores-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'conductores-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política DELETE: Los usuarios pueden eliminar sus propios documentos
CREATE POLICY "Users can delete their conductor docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'conductores-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PASO 3: POLÍTICAS RLS PARA STORAGE - VEHICULOS-DOCS
-- ============================================================================

CREATE POLICY "Users can upload their vehiculo docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehiculos-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their vehiculo docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vehiculos-docs' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text 
    OR public.is_superuser_secure(auth.uid())
  )
);

CREATE POLICY "Users can update their vehiculo docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehiculos-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'vehiculos-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their vehiculo docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehiculos-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PASO 4: POLÍTICAS RLS PARA STORAGE - REMOLQUES-DOCS
-- ============================================================================

CREATE POLICY "Users can upload their remolque docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'remolques-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their remolque docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'remolques-docs' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text 
    OR public.is_superuser_secure(auth.uid())
  )
);

CREATE POLICY "Users can update their remolque docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'remolques-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'remolques-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their remolque docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'remolques-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PASO 5: POLÍTICAS RLS PARA STORAGE - SOCIOS-DOCS
-- ============================================================================

CREATE POLICY "Users can upload their socio docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'socios-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their socio docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'socios-docs' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text 
    OR public.is_superuser_secure(auth.uid())
  )
);

CREATE POLICY "Users can update their socio docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'socios-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'socios-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their socio docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'socios-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PASO 6: POLÍTICAS RLS PARA STORAGE - CARTAS-PORTE
-- ============================================================================

-- Política INSERT: Los usuarios pueden subir sus cartas de porte generadas
CREATE POLICY "Users can upload cartas porte"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cartas-porte' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política SELECT: Usuarios autenticados pueden ver cartas de porte
-- (más restrictiva: solo propietario o superuser)
CREATE POLICY "Users can view their cartas porte"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cartas-porte'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_superuser_secure(auth.uid())
  )
);

-- Política UPDATE: Los usuarios pueden actualizar sus propias cartas
CREATE POLICY "Users can update their cartas porte"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cartas-porte' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'cartas-porte' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política DELETE: Los usuarios pueden eliminar sus cartas
CREATE POLICY "Users can delete their cartas porte"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cartas-porte' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PASO 7: VERIFICACIÓN DE CONFIGURACIÓN
-- ============================================================================

-- Verificar buckets creados
SELECT 
  id as bucket_name,
  public as is_public,
  file_size_limit / 1048576 as max_size_mb,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN (
  'conductores-docs',
  'vehiculos-docs',
  'remolques-docs',
  'socios-docs',
  'cartas-porte'
)
ORDER BY id;

-- Verificar políticas RLS para cada bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%conductor%' 
     OR policyname LIKE '%vehiculo%'
     OR policyname LIKE '%remolque%'
     OR policyname LIKE '%socio%'
     OR policyname LIKE '%carta%porte%'
ORDER BY tablename, policyname;

-- ============================================================================
-- PASO 8: AUDITORÍA DE SEGURIDAD
-- ============================================================================

-- Registrar configuración de buckets en auditoría
INSERT INTO public.security_audit_log (
  event_type,
  event_data,
  severity
) VALUES (
  'storage_buckets_configured',
  jsonb_build_object(
    'buckets_created', ARRAY[
      'conductores-docs',
      'vehiculos-docs', 
      'remolques-docs',
      'socios-docs',
      'cartas-porte'
    ],
    'total_policies', 20, -- 4 políticas por bucket × 5 buckets
    'max_file_sizes', jsonb_build_object(
      'docs_generales', '10MB',
      'cartas_porte', '5MB'
    ),
    'configured_at', NOW(),
    'compliance', 'ISO 27001 A.12.3, GDPR Art. 32'
  ),
  'info'
);

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ 5 buckets creados con límites de tamaño y tipos MIME
-- ✅ 20 políticas RLS configuradas (4 por bucket: INSERT, SELECT, UPDATE, DELETE)
-- ✅ Acceso restringido por usuario (folder structure: user_id/filename)
-- ✅ Superusuarios pueden ver todos los documentos
-- ✅ Auditoría registrada
-- ============================================================================

-- NOTAS DE SEGURIDAD
-- ============================================================================
-- 1. Los archivos DEBEN subirse en carpetas con el user_id: {user_id}/document.pdf
-- 2. Los límites de tamaño se aplican a nivel de bucket (no por archivo individual)
-- 3. Los tipos MIME se validan automáticamente por Supabase Storage
-- 4. Las políticas RLS previenen acceso no autorizado incluso con URLs directas
-- 5. Los superusuarios tienen acceso de lectura a todos los buckets (auditoría)
-- ============================================================================
