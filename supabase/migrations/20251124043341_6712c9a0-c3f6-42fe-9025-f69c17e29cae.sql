-- ============================================================
-- CORRECCIÓN: Actualizar domicilio_fiscal_receptor en facturas
-- ============================================================
-- Error: CFDI40147 - Campo DomicilioFiscalReceptor obligatorio
-- Solución: Extraer código postal desde socios.direccion_fiscal
-- ============================================================

-- Actualizar facturas con el código postal del socio asociado
UPDATE facturas f
SET domicilio_fiscal_receptor = (
  SELECT (s.direccion_fiscal->>'codigoPostal')
  FROM viajes v
  INNER JOIN socios s ON v.socio_id = s.id
  WHERE v.id = f.viaje_id
    AND s.direccion_fiscal IS NOT NULL
    AND s.direccion_fiscal->>'codigoPostal' IS NOT NULL
)
WHERE f.user_id = 'b2c1cc60-6a63-453e-910d-69f66bd0f66f'
  AND f.domicilio_fiscal_receptor IS NULL
  AND f.viaje_id IS NOT NULL;

-- Verificar actualización
SELECT 
  f.id,
  f.folio,
  f.nombre_receptor,
  f.rfc_receptor,
  f.domicilio_fiscal_receptor as codigo_postal_receptor,
  s.rfc as socio_rfc,
  s.direccion_fiscal->>'codigoPostal' as socio_cp
FROM facturas f
LEFT JOIN viajes v ON f.viaje_id = v.id
LEFT JOIN socios s ON v.socio_id = s.id
WHERE f.user_id = 'b2c1cc60-6a63-453e-910d-69f66bd0f66f'
ORDER BY f.created_at DESC
LIMIT 5;