
-- Script para crear datos de prueba específicos para el Plan de Pruebas v1.1.2
-- Este script debe ejecutarse en el entorno de staging/testing

-- 1. CREAR USUARIOS DE PRUEBA CON DIFERENTES CONFIGURACIONES

-- Usuario Superuser
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'superuser@test.com',
  '{"is_superuser": true, "nombre": "Super User Test"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Usuario Trial Activo (registrado hace 5 días)
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'trial@test.com',
  NOW() - INTERVAL '5 days',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at;

-- Usuario con Plan Operador (límites bajos)
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'operador@test.com',
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Usuario con Plan Flota (límites medios)
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'flota@test.com',
  NOW() - INTERVAL '60 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Usuario Enterprise (límites personalizados)
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'enterprise@test.com',
  NOW() - INTERVAL '90 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. CREAR PERFILES PARA CADA USUARIO

INSERT INTO public.profiles (id, nombre, email, trial_end_date, plan_type)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Super User Test', 'superuser@test.com', NULL, 'paid'),
  ('00000000-0000-0000-0000-000000000002', 'Trial User Test', 'trial@test.com', NOW() + INTERVAL '9 days', 'trial'),
  ('00000000-0000-0000-0000-000000000003', 'Operador User Test', 'operador@test.com', NULL, 'paid'),
  ('00000000-0000-0000-0000-000000000004', 'Flota User Test', 'flota@test.com', NULL, 'paid'),
  ('00000000-0000-0000-0000-000000000005', 'Enterprise User Test', 'enterprise@test.com', NULL, 'paid')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  trial_end_date = EXCLUDED.trial_end_date,
  plan_type = EXCLUDED.plan_type;

-- 3. CREAR PLANES DE SUSCRIPCIÓN ESPECÍFICOS PARA TESTING

-- Plan Operador (límites bajos)
INSERT INTO public.planes_suscripcion (
  id, nombre, precio_mensual, limite_conductores, limite_vehiculos, 
  limite_socios, limite_cartas_porte, limite_almacenamiento_gb,
  puede_timbrar, puede_generar_xml, puede_cancelar_cfdi, puede_tracking,
  puede_acceder_administracion, puede_acceder_funciones_avanzadas, puede_acceder_enterprise
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Plan Operador',
  299.00,
  10, -- limite_conductores
  5,  -- limite_vehiculos
  3,  -- limite_socios
  50, -- limite_cartas_porte
  1,  -- limite_almacenamiento_gb
  true, true, true, true,
  false, false, false
) ON CONFLICT (id) DO UPDATE SET
  limite_conductores = EXCLUDED.limite_conductores,
  limite_vehiculos = EXCLUDED.limite_vehiculos,
  limite_socios = EXCLUDED.limite_socios,
  limite_cartas_porte = EXCLUDED.limite_cartas_porte,
  limite_almacenamiento_gb = EXCLUDED.limite_almacenamiento_gb;

-- Plan Flota (límites medios)
INSERT INTO public.planes_suscripcion (
  id, nombre, precio_mensual, limite_conductores, limite_vehiculos, 
  limite_socios, limite_cartas_porte, limite_almacenamiento_gb,
  puede_timbrar, puede_generar_xml, puede_cancelar_cfdi, puede_tracking,
  puede_acceder_administracion, puede_acceder_funciones_avanzadas, puede_acceder_enterprise
) VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Plan Flota',
  899.00,
  50, -- limite_conductores
  25, -- limite_vehiculos
  15, -- limite_socios
  200, -- limite_cartas_porte
  10,  -- limite_almacenamiento_gb
  true, true, true, true,
  true, true, false
) ON CONFLICT (id) DO UPDATE SET
  limite_conductores = EXCLUDED.limite_conductores,
  limite_vehiculos = EXCLUDED.limite_vehiculos,
  limite_socios = EXCLUDED.limite_socios,
  limite_cartas_porte = EXCLUDED.limite_cartas_porte,
  limite_almacenamiento_gb = EXCLUDED.limite_almacenamiento_gb;

-- Plan Enterprise (límites personalizados)
INSERT INTO public.planes_suscripcion (
  id, nombre, precio_mensual, limite_conductores, limite_vehiculos, 
  limite_socios, limite_cartas_porte, limite_almacenamiento_gb,
  puede_timbrar, puede_generar_xml, puede_cancelar_cfdi, puede_tracking,
  puede_acceder_administracion, puede_acceder_funciones_avanzadas, puede_acceder_enterprise
) VALUES (
  '10000000-0000-0000-0000-000000000003',
  'Plan Enterprise Custom',
  2999.00,
  500, -- limite_conductores (personalizado)
  250, -- limite_vehiculos (personalizado)
  100, -- limite_socios (personalizado)
  NULL, -- limite_cartas_porte (ilimitado)
  100,  -- limite_almacenamiento_gb (personalizado)
  true, true, true, true,
  true, true, true
) ON CONFLICT (id) DO UPDATE SET
  limite_conductores = EXCLUDED.limite_conductores,
  limite_vehiculos = EXCLUDED.limite_vehiculos,
  limite_socios = EXCLUDED.limite_socios,
  limite_cartas_porte = EXCLUDED.limite_cartas_porte,
  limite_almacenamiento_gb = EXCLUDED.limite_almacenamiento_gb;

-- 4. CREAR SUSCRIPCIONES PARA USUARIOS DE PRUEBA

-- Trial para usuario trial (activo)
INSERT INTO public.suscripciones (
  user_id, plan_id, status, fecha_inicio, fecha_fin_prueba, fecha_vencimiento
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM public.planes_suscripcion WHERE nombre = 'Plan Esencial SAT' LIMIT 1),
  'trial',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '9 days',
  NOW() + INTERVAL '9 days'
) ON CONFLICT (user_id) DO UPDATE SET
  status = EXCLUDED.status,
  fecha_fin_prueba = EXCLUDED.fecha_fin_prueba;

-- Suscripción Operador (cerca de límites)
INSERT INTO public.suscripciones (
  user_id, plan_id, status, fecha_inicio, fecha_vencimiento
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000001',
  'active',
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '30 days'
) ON CONFLICT (user_id) DO UPDATE SET
  plan_id = EXCLUDED.plan_id,
  status = EXCLUDED.status;

-- Suscripción Flota
INSERT INTO public.suscripciones (
  user_id, plan_id, status, fecha_inicio, fecha_vencimiento
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000002',
  'active',
  NOW() - INTERVAL '60 days',
  NOW() + INTERVAL '30 days'
) ON CONFLICT (user_id) DO UPDATE SET
  plan_id = EXCLUDED.plan_id,
  status = EXCLUDED.status;

-- Suscripción Enterprise
INSERT INTO public.suscripciones (
  user_id, plan_id, status, fecha_inicio, fecha_vencimiento
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000003',
  'active',
  NOW() - INTERVAL '90 days',
  NOW() + INTERVAL '365 days'
) ON CONFLICT (user_id) DO UPDATE SET
  plan_id = EXCLUDED.plan_id,
  status = EXCLUDED.status;

-- 5. SIMULAR USO CERCA DE LÍMITES PARA USUARIO OPERADOR

-- Crear 9 conductores (límite es 10)
INSERT INTO public.conductores (user_id, nombre, email, telefono, activo)
SELECT 
  '00000000-0000-0000-0000-000000000003',
  'Conductor Test ' || i,
  'conductor' || i || '@operador.test',
  '555-000-' || LPAD(i::text, 4, '0'),
  true
FROM generate_series(1, 9) AS i
ON CONFLICT DO NOTHING;

-- Crear 4 vehículos (límite es 5)
INSERT INTO public.vehiculos (user_id, placa, marca, modelo, anio, activo)
SELECT 
  '00000000-0000-0000-0000-000000000003',
  'TEST-' || LPAD(i::text, 3, '0'),
  'Marca Test',
  'Modelo Test ' || i,
  2020 + (i % 4),
  true
FROM generate_series(1, 4) AS i
ON CONFLICT DO NOTHING;

-- Crear 48 cartas de porte (límite es 50)
INSERT INTO public.cartas_porte (usuario_id, rfc_emisor, rfc_receptor, nombre_documento, status)
SELECT 
  '00000000-0000-0000-0000-000000000003',
  'TEST123456789',
  'RECV123456789',
  'Carta Porte Test ' || i,
  'borrador'
FROM generate_series(1, 48) AS i
ON CONFLICT DO NOTHING;

-- 6. SIMULAR USO DE ALMACENAMIENTO CERCA DEL LÍMITE (0.9 GB de 1 GB)
INSERT INTO public.usuario_almacenamiento (user_id, bytes_utilizados, archivos_count)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  966367641, -- 0.9 GB en bytes
  156        -- Número de archivos
) ON CONFLICT (user_id) DO UPDATE SET
  bytes_utilizados = EXCLUDED.bytes_utilizados,
  archivos_count = EXCLUDED.archivos_count;

-- Confirmar setup exitoso
SELECT 
  'Setup de datos de prueba completado exitosamente' as mensaje,
  COUNT(*) as usuarios_creados
FROM auth.users 
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005'
);
