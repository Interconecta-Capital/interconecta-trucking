-- Crear tabla para rutas frecuentes
CREATE TABLE IF NOT EXISTS rutas_frecuentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_ruta TEXT NOT NULL,
  descripcion TEXT,
  ubicacion_origen JSONB NOT NULL,
  ubicacion_destino JSONB NOT NULL,
  distancia_km NUMERIC,
  tiempo_estimado_minutos INTEGER,
  uso_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE rutas_frecuentes ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias rutas
CREATE POLICY "Los usuarios pueden ver sus propias rutas frecuentes"
ON rutas_frecuentes
FOR SELECT
USING (auth.uid() = usuario_id);

-- Política: Los usuarios pueden crear sus propias rutas
CREATE POLICY "Los usuarios pueden crear sus propias rutas frecuentes"
ON rutas_frecuentes
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- Política: Los usuarios pueden actualizar sus propias rutas
CREATE POLICY "Los usuarios pueden actualizar sus propias rutas frecuentes"
ON rutas_frecuentes
FOR UPDATE
USING (auth.uid() = usuario_id);

-- Política: Los usuarios pueden eliminar sus propias rutas
CREATE POLICY "Los usuarios pueden eliminar sus propias rutas frecuentes"
ON rutas_frecuentes
FOR DELETE
USING (auth.uid() = usuario_id);

-- Índices para mejorar rendimiento
CREATE INDEX idx_rutas_frecuentes_usuario ON rutas_frecuentes(usuario_id);
CREATE INDEX idx_rutas_frecuentes_uso_count ON rutas_frecuentes(uso_count DESC);
CREATE INDEX idx_rutas_frecuentes_created ON rutas_frecuentes(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_rutas_frecuentes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rutas_frecuentes_updated_at
BEFORE UPDATE ON rutas_frecuentes
FOR EACH ROW
EXECUTE FUNCTION update_rutas_frecuentes_updated_at();