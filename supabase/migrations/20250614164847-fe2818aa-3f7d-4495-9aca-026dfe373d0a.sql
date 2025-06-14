
-- Migración simplificada: Solo agregar campos nuevos a las tablas existentes
ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS perm_sct character varying,
ADD COLUMN IF NOT EXISTS num_permiso_sct character varying,
ADD COLUMN IF NOT EXISTS asegura_resp_civil character varying,
ADD COLUMN IF NOT EXISTS poliza_resp_civil character varying,
ADD COLUMN IF NOT EXISTS asegura_med_ambiente character varying,
ADD COLUMN IF NOT EXISTS poliza_med_ambiente character varying,
ADD COLUMN IF NOT EXISTS numero_serie_vin character varying,
ADD COLUMN IF NOT EXISTS capacidad_carga numeric,
ADD COLUMN IF NOT EXISTS tipo_carroceria character varying,
ADD COLUMN IF NOT EXISTS peso_bruto_vehicular numeric,
ADD COLUMN IF NOT EXISTS dimensiones jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vigencia_permiso date,
ADD COLUMN IF NOT EXISTS numero_permisos_adicionales text[];

-- Actualizar tabla conductores con campos SAT
ALTER TABLE public.conductores 
ADD COLUMN IF NOT EXISTS operador_sct boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS residencia_fiscal character varying DEFAULT 'MEX',
ADD COLUMN IF NOT EXISTS num_reg_id_trib character varying;

-- Actualizar tabla socios para direccion_fiscal completa
ALTER TABLE public.socios 
ADD COLUMN IF NOT EXISTS direccion_fiscal jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS regimen_fiscal character varying,
ADD COLUMN IF NOT EXISTS uso_cfdi character varying DEFAULT 'G03';
