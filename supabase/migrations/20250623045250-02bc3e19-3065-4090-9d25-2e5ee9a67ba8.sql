
-- Agregar campos adicionales al formulario de vehículos
ALTER TABLE vehiculos 
ADD COLUMN rendimiento NUMERIC,
ADD COLUMN tipo_combustible CHARACTER VARYING;

-- Actualizar comentarios para documentar los nuevos campos
COMMENT ON COLUMN vehiculos.rendimiento IS 'Rendimiento del vehículo en km/l';
COMMENT ON COLUMN vehiculos.tipo_combustible IS 'Tipo de combustible: Gasolina, Diésel, Eléctrico, Híbrido';
