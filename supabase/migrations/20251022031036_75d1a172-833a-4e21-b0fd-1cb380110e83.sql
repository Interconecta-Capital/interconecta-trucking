-- ================================================
-- FASE 1: Crear tabla configuracion_empresa
-- ================================================

-- Crear tabla configuracion_empresa con estructura completa
CREATE TABLE IF NOT EXISTS public.configuracion_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Datos Fiscales Obligatorios
  razon_social VARCHAR(254) NOT NULL DEFAULT '',
  rfc_emisor VARCHAR(13) NOT NULL DEFAULT '',
  regimen_fiscal VARCHAR(3) NOT NULL DEFAULT '',
  
  -- Domicilio Fiscal Completo (JSONB para flexibilidad)
  domicilio_fiscal JSONB NOT NULL DEFAULT '{
    "calle": "",
    "numero_exterior": "",
    "numero_interior": "",
    "colonia": "",
    "localidad": "",
    "municipio": "",
    "estado": "",
    "pais": "MEX",
    "codigo_postal": "",
    "referencia": ""
  }'::jsonb,
  
  -- Configuración de Documentos
  serie_carta_porte VARCHAR(10) DEFAULT 'CP',
  folio_inicial INTEGER DEFAULT 1,
  folio_actual INTEGER DEFAULT 1,
  
  -- Seguros (JSONB para estructura flexible)
  seguro_resp_civil JSONB DEFAULT '{
    "aseguradora": "",
    "poliza": "",
    "vigencia_inicio": null,
    "vigencia_fin": null
  }'::jsonb,
  
  seguro_carga JSONB DEFAULT '{}'::jsonb,
  seguro_ambiental JSONB DEFAULT '{}'::jsonb,
  
  -- Permisos SCT (Array de objetos JSON)
  permisos_sct JSONB DEFAULT '[]'::jsonb,
  
  -- Configuración de Timbrado (SEGURIDAD CRÍTICA)
  proveedor_timbrado VARCHAR(50) DEFAULT 'fiscal_api',
  modo_pruebas BOOLEAN DEFAULT TRUE,
  
  -- Estado de Configuración
  configuracion_completa BOOLEAN DEFAULT FALSE,
  validado_sat BOOLEAN DEFAULT FALSE,
  fecha_ultima_validacion TIMESTAMPTZ,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) - SEGURIDAD MÁXIMA
ALTER TABLE public.configuracion_empresa ENABLE ROW LEVEL SECURITY;

-- Política: Usuario solo puede ver/editar SU propia configuración
CREATE POLICY "Users manage own empresa config"
  ON public.configuracion_empresa
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índice para búsqueda rápida por user_id
CREATE INDEX IF NOT EXISTS idx_configuracion_empresa_user_id 
  ON public.configuracion_empresa(user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_configuracion_empresa_updated_at
  BEFORE UPDATE ON public.configuracion_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- MIGRACIÓN DE DATOS EXISTENTES
-- ================================================

-- Migrar datos de profiles a configuracion_empresa
INSERT INTO public.configuracion_empresa (
  user_id, 
  razon_social, 
  rfc_emisor, 
  regimen_fiscal
)
SELECT 
  id, 
  COALESCE(empresa, ''), 
  COALESCE(rfc, ''), 
  ''
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.configuracion_empresa 
  WHERE user_id = profiles.id
)
ON CONFLICT (user_id) DO NOTHING;