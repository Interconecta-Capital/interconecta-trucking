-- ========================================
-- AGREGAR COLUMNAS DE PAGO SEGÚN SAT CFDI 4.0
-- ========================================

-- 1. Agregar columna forma_pago
ALTER TABLE public.facturas 
ADD COLUMN IF NOT EXISTS forma_pago VARCHAR(2) DEFAULT '99';

-- 2. Agregar columna metodo_pago  
ALTER TABLE public.facturas 
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(3) DEFAULT 'PUE';

-- 3. Comentarios para documentación (ISO 27001 A.8.2.3)
COMMENT ON COLUMN public.facturas.forma_pago IS 
'Catálogo SAT c_FormaPago: 01=Efectivo, 03=Transferencia, 04=Tarjeta crédito, 28=Tarjeta débito, 99=Por definir';

COMMENT ON COLUMN public.facturas.metodo_pago IS 
'Catálogo SAT c_MetodoPago: PUE=Pago en Una Exhibición, PPD=Pago en Parcialidades o Diferido';

-- 4. Actualizar facturas existentes con valores por defecto
UPDATE public.facturas 
SET forma_pago = '99', 
    metodo_pago = 'PUE'
WHERE forma_pago IS NULL 
   OR metodo_pago IS NULL;

-- 5. Establecer como NOT NULL después de migrar datos
ALTER TABLE public.facturas 
ALTER COLUMN forma_pago SET NOT NULL;

ALTER TABLE public.facturas 
ALTER COLUMN metodo_pago SET NOT NULL;

-- 6. Agregar validación a nivel de BD según catálogo SAT
ALTER TABLE public.facturas
ADD CONSTRAINT chk_forma_pago_valida 
CHECK (forma_pago IN (
  '01', '02', '03', '04', '05', '06', '08', '12', '13', '14', '15', 
  '17', '23', '24', '25', '26', '27', '28', '29', '30', '31', '99'
));

ALTER TABLE public.facturas
ADD CONSTRAINT chk_metodo_pago_valido
CHECK (metodo_pago IN ('PUE', 'PPD'));

-- 7. Crear índices para mejorar performance en búsquedas
CREATE INDEX IF NOT EXISTS idx_facturas_forma_pago 
ON public.facturas(forma_pago);

CREATE INDEX IF NOT EXISTS idx_facturas_metodo_pago 
ON public.facturas(metodo_pago);