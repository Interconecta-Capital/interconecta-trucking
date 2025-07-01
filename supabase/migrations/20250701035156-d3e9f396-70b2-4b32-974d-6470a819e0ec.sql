
-- Expandir tabla vehiculos con campos de costos operativos
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS costo_mantenimiento_km DECIMAL(8,4) DEFAULT 2.07;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS costo_llantas_km DECIMAL(8,4) DEFAULT 1.08;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS valor_vehiculo DECIMAL(12,2);
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS configuracion_ejes VARCHAR(10) DEFAULT 'T3S2';
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS factor_peajes DECIMAL(4,2) DEFAULT 2.0;

-- Agregar configuración de costos a la tabla profiles (empresa)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS configuracion_costos JSONB DEFAULT '{
  "modo_calculo": "profesional",
  "combustible": {
    "usar_rendimiento_vehiculo": true,
    "precio_fijo_litro": null,
    "sobrecargo_percentage": 0
  },
  "viaticos": {
    "tarifa_diaria": 1500,
    "incluir_hospedaje": true
  },
  "peajes": {
    "usar_calculo_automatico": true,
    "factor_adicional": 0
  },
  "costos_fijos": {
    "incluir_depreciacion": true,
    "incluir_seguros": true,
    "incluir_administracion": true
  },
  "margen_ganancia": {
    "porcentaje_minimo": 15,
    "porcentaje_objetivo": 25,
    "alertar_bajo_minimo": true
  }
}'::jsonb;

-- Migrar datos existentes con valores inteligentes por tipo de vehículo
UPDATE vehiculos SET 
  costo_mantenimiento_km = CASE 
    WHEN config_vehicular LIKE '%T3S2%' OR tipo_carroceria LIKE '%Semi%' THEN 2.50
    WHEN config_vehicular LIKE '%C2%' OR capacidad_carga <= 5000 THEN 1.50
    WHEN config_vehicular LIKE '%C3%' OR capacidad_carga <= 10000 THEN 1.80
    ELSE 2.07
  END,
  factor_peajes = CASE 
    WHEN config_vehicular LIKE '%T3S2%' OR tipo_carroceria LIKE '%Semi%' THEN 2.0
    WHEN config_vehicular LIKE '%C2%' OR capacidad_carga <= 5000 THEN 1.0
    WHEN config_vehicular LIKE '%C3%' OR capacidad_carga <= 10000 THEN 1.5
    ELSE 1.8
  END,
  configuracion_ejes = CASE 
    WHEN config_vehicular LIKE '%T3S2%' THEN 'T3S2'
    WHEN config_vehicular LIKE '%C2%' THEN 'C2'
    WHEN config_vehicular LIKE '%C3%' THEN 'C3'
    WHEN config_vehicular LIKE '%T2S1%' THEN 'T2S1'
    ELSE 'T3S2'
  END,
  costo_llantas_km = CASE 
    WHEN config_vehicular LIKE '%T3S2%' OR tipo_carroceria LIKE '%Semi%' THEN 1.25
    WHEN config_vehicular LIKE '%C2%' OR capacidad_carga <= 5000 THEN 0.80
    ELSE 1.08
  END
WHERE costo_mantenimiento_km IS NULL;

-- Llenar rendimiento por defecto si está vacío
UPDATE vehiculos SET 
  rendimiento = CASE 
    WHEN config_vehicular LIKE '%T3S2%' OR tipo_carroceria LIKE '%Semi%' THEN 3.2
    WHEN config_vehicular LIKE '%C2%' OR capacidad_carga <= 5000 THEN 4.5
    WHEN config_vehicular LIKE '%C3%' OR capacidad_carga <= 10000 THEN 3.8
    ELSE 3.5
  END,
  tipo_combustible = COALESCE(tipo_combustible, 'diesel')
WHERE rendimiento IS NULL OR rendimiento = 0;
