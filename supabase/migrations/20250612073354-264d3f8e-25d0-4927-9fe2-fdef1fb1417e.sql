
-- Agregar columnas faltantes a la tabla profiles para el tracking de trial
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS plan_type VARCHAR DEFAULT 'trial';

-- Actualizar usuarios existentes para establecer la fecha de fin de trial basada en su fecha de creación
UPDATE public.profiles 
SET trial_end_date = created_at + INTERVAL '14 days'
WHERE trial_end_date IS NULL;
