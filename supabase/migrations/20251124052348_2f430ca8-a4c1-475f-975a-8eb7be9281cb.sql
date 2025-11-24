-- Agregar campo domicilio_fiscal_receptor a tabla facturas
-- Este campo es OBLIGATORIO según CFDI 4.0 para el timbrado

ALTER TABLE public.facturas
ADD COLUMN IF NOT EXISTS domicilio_fiscal_receptor VARCHAR(5);

COMMENT ON COLUMN public.facturas.domicilio_fiscal_receptor IS 
'Código postal del domicilio fiscal del receptor (5 dígitos). Campo obligatorio para CFDI 4.0';

-- Crear índice para mejorar performance en consultas de timbrado
CREATE INDEX IF NOT EXISTS idx_facturas_domicilio_fiscal_receptor 
ON public.facturas(domicilio_fiscal_receptor) 
WHERE domicilio_fiscal_receptor IS NOT NULL;