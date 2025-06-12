
-- Actualizar los planes existentes con los nuevos nombres y límites
UPDATE public.planes_suscripcion 
SET 
  nombre = 'Plan Esencial SAT',
  precio_mensual = 149,
  descripcion = 'Ideal para empresas pequeñas que inician con cumplimiento SAT',
  limite_cartas_porte = 50,
  limite_conductores = 5,
  limite_vehiculos = 10,
  limite_socios = 10,
  puede_cancelar_cfdi = false,
  puede_generar_xml = true,
  puede_timbrar = true,
  puede_tracking = false
WHERE nombre = 'Básico';

UPDATE public.planes_suscripcion 
SET 
  nombre = 'Plan Gestión IA',
  precio_mensual = 299,
  descripcion = 'Para empresas en crecimiento que buscan automatización',
  limite_cartas_porte = 200,
  limite_conductores = 15,
  limite_vehiculos = 25,
  limite_socios = 25,
  puede_cancelar_cfdi = true,
  puede_generar_xml = true,
  puede_timbrar = true,
  puede_tracking = true
WHERE nombre = 'Profesional';

UPDATE public.planes_suscripcion 
SET 
  nombre = 'Plan Automatización Total',
  precio_mensual = 499,
  descripcion = 'Solución completa para empresas establecidas',
  limite_cartas_porte = NULL, -- Ilimitado
  limite_conductores = NULL, -- Ilimitado
  limite_vehiculos = NULL, -- Ilimitado
  limite_socios = NULL, -- Ilimitado
  puede_cancelar_cfdi = true,
  puede_generar_xml = true,
  puede_timbrar = true,
  puede_tracking = true
WHERE nombre = 'Empresarial';

-- Insertar el nuevo plan Enterprise si no existe
INSERT INTO public.planes_suscripcion (
  nombre,
  descripcion,
  precio_mensual,
  limite_cartas_porte,
  limite_conductores,
  limite_vehiculos,
  limite_socios,
  puede_cancelar_cfdi,
  puede_generar_xml,
  puede_timbrar,
  puede_tracking,
  activo
) 
SELECT 
  'Plan Enterprise Sin Límites',
  'Solución personalizada para grandes empresas',
  999,
  NULL, -- Sin límite
  NULL, -- Sin límite
  NULL, -- Sin límite
  NULL, -- Sin límite
  true,
  true,
  true,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.planes_suscripcion 
  WHERE nombre = 'Plan Enterprise Sin Límites'
);

-- Agregar nuevas columnas de permisos si no existen
ALTER TABLE public.planes_suscripcion 
ADD COLUMN IF NOT EXISTS puede_acceder_administracion boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS puede_acceder_funciones_avanzadas boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS puede_acceder_enterprise boolean DEFAULT false;

-- Configurar permisos según los planes
UPDATE public.planes_suscripcion 
SET 
  puede_acceder_administracion = false,
  puede_acceder_funciones_avanzadas = false,
  puede_acceder_enterprise = false
WHERE nombre = 'Plan Esencial SAT';

UPDATE public.planes_suscripcion 
SET 
  puede_acceder_administracion = true,
  puede_acceder_funciones_avanzadas = false,
  puede_acceder_enterprise = false
WHERE nombre = 'Plan Gestión IA';

UPDATE public.planes_suscripcion 
SET 
  puede_acceder_administracion = true,
  puede_acceder_funciones_avanzadas = true,
  puede_acceder_enterprise = false
WHERE nombre = 'Plan Automatización Total';

UPDATE public.planes_suscripcion 
SET 
  puede_acceder_administracion = true,
  puede_acceder_funciones_avanzadas = true,
  puede_acceder_enterprise = true
WHERE nombre = 'Plan Enterprise Sin Límites';
