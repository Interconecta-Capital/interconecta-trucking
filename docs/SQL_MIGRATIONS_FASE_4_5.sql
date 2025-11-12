-- ============================================
-- FASE 4: FUNCIÓN DE INCREMENTO DE TIMBRES
-- ============================================

-- Crear función para incrementar timbres consumidos
CREATE OR REPLACE FUNCTION public.increment_timbres_consumidos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Obtener el ID del usuario actual
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Incrementar contador de timbres
  UPDATE public.profiles
  SET 
    timbres_consumidos = COALESCE(timbres_consumidos, 0) + 1,
    updated_at = now()
  WHERE id = user_uuid;
  
  -- Registrar transacción
  INSERT INTO public.transacciones_creditos (
    user_id,
    tipo,
    cantidad,
    descripcion,
    metadata
  ) VALUES (
    user_uuid,
    'consumo',
    1,
    'Timbrado de documento',
    jsonb_build_object(
      'timestamp', now(),
      'tipo_documento', 'carta_porte'
    )
  );
  
  -- Log de auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    user_uuid,
    'timbre_consumido',
    jsonb_build_object(
      'nuevo_total', (SELECT timbres_consumidos FROM public.profiles WHERE id = user_uuid),
      'timestamp', now()
    )
  );
END;
$$;

-- ============================================
-- FASE 5: MÓDULO DE ADMINISTRACIÓN FISCAL
-- ============================================

-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS public.facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos fiscales básicos
  uuid_fiscal TEXT UNIQUE,
  tipo_comprobante VARCHAR(1) CHECK (tipo_comprobante IN ('I', 'E', 'N', 'P', 'T')),
  serie VARCHAR(25),
  folio VARCHAR(40),
  fecha_expedicion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_timbrado TIMESTAMPTZ,
  
  -- Emisor y Receptor
  rfc_emisor VARCHAR(13) NOT NULL,
  nombre_emisor TEXT NOT NULL,
  regimen_fiscal_emisor VARCHAR(3),
  rfc_receptor VARCHAR(13) NOT NULL,
  nombre_receptor TEXT NOT NULL,
  domicilio_fiscal_receptor VARCHAR(5),
  regimen_fiscal_receptor VARCHAR(3),
  uso_cfdi VARCHAR(5),
  
  -- Montos
  subtotal NUMERIC(18, 6) NOT NULL DEFAULT 0,
  descuento NUMERIC(18, 6) DEFAULT 0,
  total NUMERIC(18, 6) NOT NULL DEFAULT 0,
  moneda VARCHAR(3) DEFAULT 'MXN',
  tipo_cambio NUMERIC(12, 6) DEFAULT 1,
  
  -- Impuestos
  total_impuestos_trasladados NUMERIC(18, 6) DEFAULT 0,
  total_impuestos_retenidos NUMERIC(18, 6) DEFAULT 0,
  
  -- Complementos
  tiene_carta_porte BOOLEAN DEFAULT FALSE,
  carta_porte_id UUID REFERENCES public.cartas_porte(id),
  tiene_pago BOOLEAN DEFAULT FALSE,
  
  -- Datos técnicos
  xml_generado TEXT,
  xml_url TEXT,
  pdf_url TEXT,
  cadena_original TEXT,
  sello_digital TEXT,
  sello_sat TEXT,
  certificado_sat VARCHAR(20),
  
  -- Estado
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'timbrado', 'cancelado', 'pagado')),
  motivo_cancelacion TEXT,
  fecha_cancelacion TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notas TEXT,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna factura_id en cartas_porte si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cartas_porte' 
    AND column_name = 'factura_id'
  ) THEN
    ALTER TABLE public.cartas_porte 
    ADD COLUMN factura_id UUID REFERENCES public.facturas(id);
  END IF;
END $$;

-- Índices para facturas
CREATE INDEX IF NOT EXISTS idx_facturas_user ON public.facturas(user_id);
CREATE INDEX IF NOT EXISTS idx_facturas_uuid ON public.facturas(uuid_fiscal);
CREATE INDEX IF NOT EXISTS idx_facturas_status ON public.facturas(status);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON public.facturas(fecha_expedicion);
CREATE INDEX IF NOT EXISTS idx_facturas_tipo ON public.facturas(tipo_comprobante);
CREATE INDEX IF NOT EXISTS idx_facturas_carta_porte ON public.facturas(carta_porte_id);

-- RLS para facturas
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven sus propias facturas
CREATE POLICY "usuarios_ven_sus_facturas" ON public.facturas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden crear sus propias facturas
CREATE POLICY "usuarios_crean_sus_facturas" ON public.facturas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias facturas
CREATE POLICY "usuarios_actualizan_sus_facturas" ON public.facturas
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Solo superusuarios pueden eliminar facturas
CREATE POLICY "superuser_elimina_facturas" ON public.facturas
  FOR DELETE
  USING (is_superuser_secure(auth.uid()));

-- Trigger para updated_at en facturas
CREATE OR REPLACE FUNCTION update_facturas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER facturas_updated_at
  BEFORE UPDATE ON public.facturas
  FOR EACH ROW
  EXECUTE FUNCTION update_facturas_updated_at();

-- Vista para estadísticas de facturas por usuario
CREATE OR REPLACE VIEW facturas_stats AS
SELECT 
  user_id,
  COUNT(*) as total_facturas,
  COUNT(*) FILTER (WHERE status = 'timbrado') as facturas_timbradas,
  COUNT(*) FILTER (WHERE status = 'cancelado') as facturas_canceladas,
  SUM(total) FILTER (WHERE status = 'timbrado' AND tipo_comprobante = 'I') as ingresos_totales,
  SUM(total) FILTER (WHERE status = 'timbrado' AND tipo_comprobante = 'E') as egresos_totales,
  MAX(fecha_expedicion) as ultima_factura
FROM public.facturas
GROUP BY user_id;

-- Comentarios
COMMENT ON TABLE public.facturas IS 'Tabla para almacenar facturas electrónicas (CFDI 4.0)';
COMMENT ON COLUMN public.facturas.tipo_comprobante IS 'I=Ingreso, E=Egreso, T=Traslado, N=Nómina, P=Pago';
COMMENT ON COLUMN public.facturas.tiene_carta_porte IS 'Indica si la factura tiene complemento Carta Porte vinculado';
COMMENT ON FUNCTION increment_timbres_consumidos() IS 'Incrementa el contador de timbres consumidos del usuario actual';

-- Función auxiliar para obtener resumen de facturas
CREATE OR REPLACE FUNCTION get_facturas_resumen(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resumen JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'timbradas', COUNT(*) FILTER (WHERE status = 'timbrado'),
    'borrador', COUNT(*) FILTER (WHERE status = 'draft'),
    'canceladas', COUNT(*) FILTER (WHERE status = 'cancelado'),
    'ingresos', SUM(total) FILTER (WHERE tipo_comprobante = 'I' AND status = 'timbrado'),
    'egresos', SUM(total) FILTER (WHERE tipo_comprobante = 'E' AND status = 'timbrado'),
    'con_carta_porte', COUNT(*) FILTER (WHERE tiene_carta_porte = true)
  )
  INTO resumen
  FROM public.facturas
  WHERE user_id = p_user_id;
  
  RETURN resumen;
END;
$$;
