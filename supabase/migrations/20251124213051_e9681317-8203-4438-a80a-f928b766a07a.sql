-- FASE 1: Hacer RFC opcional en profiles
ALTER TABLE profiles ALTER COLUMN rfc DROP NOT NULL;

-- FASE 2: Agregar campo para tracking de consentimiento Google
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  google_onboarding_completed BOOLEAN DEFAULT FALSE;

-- FASE 3: Agregar campo CURP a socios si no existe
ALTER TABLE socios ADD COLUMN IF NOT EXISTS 
  curp VARCHAR(18);

-- FASE 4: Agregar CURP a conductores si no existe (verificar)
-- Ya existe en conductores, pero aseguramos que sea nullable
ALTER TABLE conductores ALTER COLUMN curp DROP NOT NULL;

-- FASE 5: Crear índice para búsqueda de usuarios pendientes de onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_google_onboarding 
ON profiles(id) WHERE google_onboarding_completed = FALSE;

-- FASE 6: Agregar campo pais a configuracion_empresa si no existe
ALTER TABLE configuracion_empresa ADD COLUMN IF NOT EXISTS
  pais VARCHAR(3) DEFAULT 'MEX';

-- FASE 7: Comentarios explicativos
COMMENT ON COLUMN profiles.rfc IS 'RFC opcional del usuario. El RFC para timbrado se configura en configuracion_empresa';
COMMENT ON COLUMN profiles.google_onboarding_completed IS 'Indica si el usuario ha completado el proceso de onboarding después de registrarse con Google';
COMMENT ON COLUMN socios.curp IS 'CURP del socio, requerido para algunas figuras de transporte';
COMMENT ON COLUMN configuracion_empresa.pais IS 'Código de país según catálogo SAT (MEX, USA, CAN, etc.)';