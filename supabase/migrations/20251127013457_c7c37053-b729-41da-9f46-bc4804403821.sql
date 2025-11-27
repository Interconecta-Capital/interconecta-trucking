-- Migración para sincronizar planes con la landing page
-- Planes: Gratuito, Operador ($349), Flota ($799), Business ($1499)

-- 1. Desactivar planes antiguos que no están en la landing
UPDATE planes_suscripcion SET activo = false 
WHERE nombre IN ('Plan Gestión IA', 'Plan Automatización Total', 'Plan Enterprise Sin Límites')
  AND activo = true;

-- 2. Actualizar "Plan Gratuito (Beta)" a "Plan Gratuito"
UPDATE planes_suscripcion 
SET nombre = 'Plan Gratuito',
    descripcion = 'Para probar la plataforma',
    timbres_mensuales = 5,
    precio_mensual = 0,
    precio_anual = 0,
    dias_prueba = 999,
    limite_conductores = 1,
    limite_vehiculos = 2,
    limite_socios = 1,
    limite_cartas_porte = 5,
    puede_timbrar = true,
    puede_generar_xml = true,
    puede_cancelar_cfdi = false,
    puede_tracking = false,
    puede_acceder_funciones_avanzadas = false,
    puede_acceder_administracion = false,
    activo = true
WHERE nombre = 'Plan Gratuito (Beta)';

-- 3. Actualizar "Plan Esencial SAT" a "Plan Operador"
UPDATE planes_suscripcion 
SET nombre = 'Plan Operador',
    descripcion = 'Acceso al Software completo',
    timbres_mensuales = 50,
    precio_mensual = 349.00,
    precio_anual = 3350.00,
    dias_prueba = 14,
    limite_conductores = 10,
    limite_vehiculos = 10,
    limite_socios = 5,
    limite_cartas_porte = NULL,
    puede_timbrar = true,
    puede_generar_xml = true,
    puede_cancelar_cfdi = true,
    puede_tracking = false,
    puede_acceder_funciones_avanzadas = true,
    puede_acceder_administracion = true,
    activo = true
WHERE nombre = 'Plan Esencial SAT';

-- 4. Verificar si existe Plan Flota, si no crearlo
INSERT INTO planes_suscripcion (
  nombre, 
  descripcion, 
  precio_mensual, 
  precio_anual, 
  timbres_mensuales,
  dias_prueba, 
  limite_conductores, 
  limite_vehiculos, 
  limite_socios,
  limite_cartas_porte, 
  puede_timbrar, 
  puede_generar_xml, 
  puede_cancelar_cfdi,
  puede_tracking, 
  puede_acceder_funciones_avanzadas, 
  puede_acceder_administracion,
  puede_acceder_enterprise,
  activo
) 
SELECT 
  'Plan Flota', 
  'Inteligencia de Negocios', 
  799.00, 
  7670.00, 
  200,
  14, 
  NULL, 
  NULL, 
  NULL,
  NULL, 
  true, 
  true, 
  true,
  true, 
  true, 
  true,
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM planes_suscripcion WHERE nombre = 'Plan Flota'
);

-- 5. Actualizar Plan Flota si ya existe
UPDATE planes_suscripcion 
SET descripcion = 'Inteligencia de Negocios',
    timbres_mensuales = 200,
    precio_mensual = 799.00,
    precio_anual = 7670.00,
    dias_prueba = 14,
    limite_conductores = NULL,
    limite_vehiculos = NULL,
    limite_socios = NULL,
    limite_cartas_porte = NULL,
    puede_timbrar = true,
    puede_generar_xml = true,
    puede_cancelar_cfdi = true,
    puede_tracking = true,
    puede_acceder_funciones_avanzadas = true,
    puede_acceder_administracion = true,
    puede_acceder_enterprise = false,
    activo = true
WHERE nombre = 'Plan Flota';

-- 6. Actualizar Plan Business con los valores correctos
UPDATE planes_suscripcion 
SET descripcion = 'Para grandes operaciones',
    timbres_mensuales = 500,
    precio_mensual = 1499.00,
    precio_anual = 14390.00,
    dias_prueba = 14,
    limite_conductores = NULL,
    limite_vehiculos = NULL,
    limite_socios = NULL,
    limite_cartas_porte = NULL,
    puede_timbrar = true,
    puede_generar_xml = true,
    puede_cancelar_cfdi = true,
    puede_tracking = true,
    puede_acceder_funciones_avanzadas = true,
    puede_acceder_administracion = true,
    puede_acceder_enterprise = true,
    activo = true
WHERE nombre = 'Plan Business';