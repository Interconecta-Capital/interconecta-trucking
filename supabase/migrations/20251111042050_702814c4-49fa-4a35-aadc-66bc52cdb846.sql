-- ============================================================================
-- FASE 4 - SPRINT 2 - PARTE 2: STORAGE BUCKETS Y POLÍTICAS RLS (CORREGIDO)
-- ============================================================================

-- CREAR BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('conductores-docs', 'conductores-docs', false, 10485760, 
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('vehiculos-docs', 'vehiculos-docs', false, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('remolques-docs', 'remolques-docs', false, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('socios-docs', 'socios-docs', false, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('cartas-porte', 'cartas-porte', false, 5242880,
   ARRAY['application/pdf', 'application/xml', 'text/xml'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- POLÍTICAS RLS CONDUCTORES-DOCS
CREATE POLICY "Users can upload their conductor docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'conductores-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their conductor docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'conductores-docs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_superuser_secure(auth.uid())));

CREATE POLICY "Users can update their conductor docs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'conductores-docs' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'conductores-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their conductor docs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'conductores-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- POLÍTICAS RLS VEHICULOS-DOCS
CREATE POLICY "Users can upload their vehiculo docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vehiculos-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their vehiculo docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'vehiculos-docs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_superuser_secure(auth.uid())));

CREATE POLICY "Users can update their vehiculo docs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vehiculos-docs' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'vehiculos-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their vehiculo docs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vehiculos-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- POLÍTICAS RLS REMOLQUES-DOCS
CREATE POLICY "Users can upload their remolque docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'remolques-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their remolque docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'remolques-docs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_superuser_secure(auth.uid())));

CREATE POLICY "Users can update their remolque docs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'remolques-docs' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'remolques-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their remolque docs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'remolques-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- POLÍTICAS RLS SOCIOS-DOCS
CREATE POLICY "Users can upload their socio docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'socios-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their socio docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'socios-docs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_superuser_secure(auth.uid())));

CREATE POLICY "Users can update their socio docs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'socios-docs' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'socios-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their socio docs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'socios-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- POLÍTICAS RLS CARTAS-PORTE
CREATE POLICY "Users can upload cartas porte"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'cartas-porte' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their cartas porte"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'cartas-porte' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_superuser_secure(auth.uid())));

CREATE POLICY "Users can update their cartas porte"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'cartas-porte' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'cartas-porte' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their cartas porte"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cartas-porte' AND (storage.foldername(name))[1] = auth.uid()::text);

-- AUDITORÍA (sin columna severity)
INSERT INTO public.security_audit_log (event_type, event_data)
VALUES (
  'storage_buckets_configured',
  jsonb_build_object(
    'buckets_created', ARRAY['conductores-docs', 'vehiculos-docs', 'remolques-docs', 'socios-docs', 'cartas-porte'],
    'total_policies', 20,
    'max_file_sizes', jsonb_build_object('docs_generales', '10MB', 'cartas_porte', '5MB'),
    'configured_at', NOW(),
    'compliance', 'ISO 27001 A.12.3, GDPR Art. 32'
  )
);