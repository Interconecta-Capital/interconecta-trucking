-- Crear tabla de RFCs de prueba oficiales del SAT
CREATE TABLE IF NOT EXISTS public.rfc_pruebas_sat (
  rfc TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('fisica', 'moral')),
  regimen_fiscal TEXT NOT NULL,
  codigo_postal TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar RFCs de prueba oficiales del SAT
INSERT INTO public.rfc_pruebas_sat (rfc, nombre, tipo, regimen_fiscal, codigo_postal, descripcion)
VALUES 
  ('EKU9003173C9', 'ESCUELA KEMPER URGATE', 'moral', '601', '86035', 'RFC de prueba oficial SAT - Persona Moral (Emisor)'),
  ('CACX7605101P8', 'XOCHILT CASAS CHAVEZ', 'fisica', '605', '65000', 'RFC de prueba oficial SAT - Persona Física (Receptor)')
ON CONFLICT (rfc) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.rfc_pruebas_sat ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (cualquier usuario autenticado puede leer)
CREATE POLICY "rfc_pruebas_sat_read_policy" 
  ON public.rfc_pruebas_sat
  FOR SELECT
  TO authenticated
  USING (true);

-- Comentario para documentación
COMMENT ON TABLE public.rfc_pruebas_sat IS 'RFCs de prueba oficiales del SAT para uso en ambiente sandbox';
COMMENT ON COLUMN public.rfc_pruebas_sat.rfc IS 'RFC oficial de prueba del SAT';
COMMENT ON COLUMN public.rfc_pruebas_sat.nombre IS 'Nombre/Razón Social oficial asociado al RFC de prueba';