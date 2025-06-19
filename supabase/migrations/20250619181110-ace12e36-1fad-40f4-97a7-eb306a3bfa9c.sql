
-- Crear tabla para almacenar certificados digitales
CREATE TABLE public.certificados_digitales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_certificado VARCHAR(255) NOT NULL,
  numero_certificado VARCHAR(20) NOT NULL,
  rfc_titular VARCHAR(13) NOT NULL,
  razon_social VARCHAR(255),
  fecha_inicio_vigencia TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin_vigencia TIMESTAMP WITH TIME ZONE NOT NULL,
  archivo_cer_path TEXT NOT NULL,
  archivo_key_path TEXT NOT NULL,
  archivo_key_encrypted BOOLEAN DEFAULT true,
  validado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para gestionar certificado activo por usuario
CREATE TABLE public.certificados_activos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  certificado_id UUID REFERENCES public.certificados_digitales(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en ambas tablas
ALTER TABLE public.certificados_digitales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados_activos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para certificados_digitales
CREATE POLICY "Users can view their own certificates" 
  ON public.certificados_digitales 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificates" 
  ON public.certificados_digitales 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificates" 
  ON public.certificados_digitales 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certificates" 
  ON public.certificados_digitales 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para certificados_activos
CREATE POLICY "Users can view their active certificate" 
  ON public.certificados_activos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their active certificate" 
  ON public.certificados_activos 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Crear bucket para almacenar archivos de certificados
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificados',
  'certificados', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/x-x509-ca-cert', 'application/octet-stream', 'application/pkcs8']
);

-- Políticas de storage para certificados
CREATE POLICY "Users can upload their certificates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificados' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their certificates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certificados' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their certificates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'certificados' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their certificates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'certificados' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Función para mantener solo un certificado activo por usuario
CREATE OR REPLACE FUNCTION public.enforce_single_active_certificate()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se marca un certificado como activo, desactivar todos los otros del usuario
  IF NEW.activo = true THEN
    UPDATE public.certificados_digitales 
    SET activo = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
    
    -- Actualizar o crear registro en certificados_activos
    INSERT INTO public.certificados_activos (user_id, certificado_id)
    VALUES (NEW.user_id, NEW.id)
    ON CONFLICT (user_id) 
    DO UPDATE SET certificado_id = NEW.id, updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para enforcer certificado único activo
CREATE TRIGGER enforce_single_active_certificate_trigger
  AFTER UPDATE ON public.certificados_digitales
  FOR EACH ROW
  WHEN (NEW.activo = true)
  EXECUTE FUNCTION public.enforce_single_active_certificate();

-- Función para obtener certificado activo del usuario
CREATE OR REPLACE FUNCTION public.get_active_certificate(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  nombre_certificado VARCHAR,
  numero_certificado VARCHAR,
  rfc_titular VARCHAR,
  razon_social VARCHAR,
  fecha_inicio_vigencia TIMESTAMP WITH TIME ZONE,
  fecha_fin_vigencia TIMESTAMP WITH TIME ZONE,
  archivo_cer_path TEXT,
  archivo_key_path TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cd.id,
    cd.nombre_certificado,
    cd.numero_certificado,
    cd.rfc_titular,
    cd.razon_social,
    cd.fecha_inicio_vigencia,
    cd.fecha_fin_vigencia,
    cd.archivo_cer_path,
    cd.archivo_key_path
  FROM public.certificados_digitales cd
  INNER JOIN public.certificados_activos ca ON cd.id = ca.certificado_id
  WHERE ca.user_id = user_uuid
    AND cd.activo = true
    AND cd.validado = true
    AND cd.fecha_fin_vigencia > now();
END;
$$;
