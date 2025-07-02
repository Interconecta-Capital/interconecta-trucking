
-- Crear tabla para restricciones urbanas mexicanas
CREATE TABLE public.restricciones_urbanas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ciudad VARCHAR(100) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  tipo_restriccion VARCHAR(50) NOT NULL, -- 'horaria', 'peso', 'dimension', 'ambiental'
  descripcion TEXT NOT NULL,
  horario_inicio TIME,
  horario_fin TIME,
  dias_semana INTEGER[], -- [1,2,3,4,5] lun-vie
  peso_maximo INTEGER, -- toneladas
  altura_maxima DECIMAL(4,2), -- metros
  aplica_configuraciones TEXT[], -- ['T3S2', 'T3S3']
  multa_promedio DECIMAL(10,2),
  vigencia_desde DATE NOT NULL DEFAULT CURRENT_DATE,
  vigencia_hasta DATE,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.restricciones_urbanas ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública de restricciones
CREATE POLICY "Restricciones urbanas son de lectura pública"
  ON public.restricciones_urbanas
  FOR SELECT
  USING (true);

-- Solo administradores pueden modificar restricciones
CREATE POLICY "Solo administradores pueden modificar restricciones"
  ON public.restricciones_urbanas
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Insertar datos principales de restricciones
INSERT INTO public.restricciones_urbanas (
  ciudad, estado, tipo_restriccion, descripcion, 
  horario_inicio, horario_fin, dias_semana, peso_maximo,
  aplica_configuraciones, multa_promedio
) VALUES 
-- Ciudad de México
('Ciudad de México', 'Ciudad de México', 'horaria', 
 'Restricción de circulación para vehículos de carga mayor a 3.8 toneladas en horarios pico',
 '06:00:00', '10:00:00', ARRAY[1,2,3,4,5], 4,
 ARRAY['C3', 'T2S1', 'T3S2', 'T3S3'], 15000.00),

('Ciudad de México', 'Ciudad de México', 'horaria', 
 'Restricción vespertina para vehículos de carga mayor a 3.8 toneladas',
 '18:00:00', '20:00:00', ARRAY[1,2,3,4,5], 4,
 ARRAY['C3', 'T2S1', 'T3S2', 'T3S3'], 15000.00),

-- Guadalajara
('Guadalajara', 'Jalisco', 'horaria',
 'Restricción en centro histórico para vehículos pesados en horarios pico matutino',
 '07:00:00', '09:00:00', ARRAY[1,2,3,4,5], 3,
 ARRAY['C3', 'T2S1', 'T3S2', 'T3S3'], 8000.00),

('Guadalajara', 'Jalisco', 'horaria',
 'Restricción en centro histórico para vehículos pesados en horarios pico vespertino',
 '19:00:00', '21:00:00', ARRAY[1,2,3,4,5], 3,
 ARRAY['C3', 'T2S1', 'T3S2', 'T3S3'], 8000.00),

-- Monterrey  
('Monterrey', 'Nuevo León', 'dimension',
 'Restricción para dobles remolques en zona centro',
 NULL, NULL, ARRAY[1,2,3,4,5,6,7], NULL,
 ARRAY['T3S2', 'T3S3'], 12000.00),

-- Tijuana
('Tijuana', 'Baja California', 'peso',
 'Restricción fronteriza para vehículos de carga pesada',
 '22:00:00', '06:00:00', ARRAY[1,2,3,4,5,6,7], 25,
 ARRAY['T2S1', 'T3S2', 'T3S3'], 5000.00),

-- Restricciones ambientales CDMX
('Ciudad de México', 'Ciudad de México', 'ambiental',
 'Restricción ambiental para vehículos sin verificación vigente',
 NULL, NULL, ARRAY[1,2,3,4,5], NULL,
 ARRAY['C2', 'C3', 'T2S1', 'T3S2', 'T3S3'], 20000.00);

-- Índices para optimizar consultas
CREATE INDEX idx_restricciones_urbanas_ciudad_estado ON public.restricciones_urbanas(ciudad, estado);
CREATE INDEX idx_restricciones_urbanas_tipo ON public.restricciones_urbanas(tipo_restriccion);
CREATE INDEX idx_restricciones_urbanas_activa ON public.restricciones_urbanas(activa) WHERE activa = true;
CREATE INDEX idx_restricciones_urbanas_vigencia ON public.restricciones_urbanas(vigencia_desde, vigencia_hasta);
