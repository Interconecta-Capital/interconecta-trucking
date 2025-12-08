# Foreign Keys

## Lista Completa de Foreign Keys

### Formato
```
tabla.columna → esquema.tabla_referencia.columna [ON DELETE acción]
```

---

## Usuarios y Autenticación

```sql
-- Profiles
profiles.id → auth.users.id [ON DELETE CASCADE]

-- User Roles
user_roles.user_id → auth.users.id [ON DELETE CASCADE]

-- Superusuarios
superusuarios.user_id → auth.users.id [ON DELETE CASCADE]

-- Usuarios (multi-tenant)
usuarios.auth_user_id → auth.users.id [ON DELETE CASCADE]
usuarios.tenant_id → public.tenants.id [ON DELETE SET NULL]
```

---

## Suscripciones y Créditos

```sql
-- Subscriptions
subscriptions.user_id → auth.users.id [ON DELETE CASCADE]
subscriptions.plan_id → public.planes.id [ON DELETE SET NULL]

-- Créditos
creditos_usuarios.user_id → auth.users.id [ON DELETE CASCADE]

-- Transacciones
transacciones_creditos.user_id → auth.users.id [ON DELETE CASCADE]

-- Bloqueos
bloqueos_usuario.user_id → auth.users.id [ON DELETE CASCADE]
```

---

## Recursos de Transporte

```sql
-- Conductores
conductores.user_id → auth.users.id [ON DELETE CASCADE]
conductores.vehiculo_asignado_id → public.vehiculos.id [ON DELETE SET NULL]
conductores.viaje_actual_id → public.viajes.id [ON DELETE SET NULL]

-- Vehículos
vehiculos.user_id → auth.users.id [ON DELETE CASCADE]

-- Remolques
remolques.user_id → auth.users.id [ON DELETE CASCADE]

-- Socios
socios.user_id → auth.users.id [ON DELETE CASCADE]
```

---

## Viajes

```sql
-- Viajes
viajes.user_id → auth.users.id [ON DELETE CASCADE]
viajes.conductor_id → public.conductores.id [ON DELETE SET NULL]
viajes.vehiculo_id → public.vehiculos.id [ON DELETE SET NULL]
viajes.remolque_id → public.remolques.id [ON DELETE SET NULL]
viajes.socio_id → public.socios.id [ON DELETE SET NULL]
viajes.carta_porte_id → public.cartas_porte.id [ON DELETE SET NULL]

-- Eventos de Viaje
eventos_viaje.viaje_id → public.viajes.id [ON DELETE CASCADE]

-- Costos de Viaje
costos_viaje.viaje_id → public.viajes.id [ON DELETE CASCADE]
costos_viaje.user_id → auth.users.id [ON DELETE CASCADE]

-- Análisis de Viajes
analisis_viajes.viaje_id → public.viajes.id [ON DELETE SET NULL]
analisis_viajes.user_id → auth.users.id [ON DELETE CASCADE]
```

---

## Cartas Porte (CFDI)

```sql
-- Cartas Porte
cartas_porte.usuario_id → auth.users.id [ON DELETE CASCADE]
cartas_porte.tenant_id → public.tenants.id [ON DELETE SET NULL]
cartas_porte.viaje_id → public.viajes.id [ON DELETE SET NULL]
cartas_porte.factura_id → public.facturas.id [ON DELETE SET NULL]
cartas_porte.borrador_origen_id → public.borradores_carta_porte.id [ON DELETE SET NULL]

-- Ubicaciones
ubicaciones.carta_porte_id → public.cartas_porte.id [ON DELETE CASCADE]

-- Mercancías
mercancias.carta_porte_id → public.cartas_porte.id [ON DELETE CASCADE]

-- Cantidad Transporta
cantidad_transporta.mercancia_id → public.mercancias.id [ON DELETE CASCADE]

-- Figuras Transporte
figuras_transporte.carta_porte_id → public.cartas_porte.id [ON DELETE CASCADE]

-- Autotransporte
autotransporte.carta_porte_id → public.cartas_porte.id [ON DELETE CASCADE]

-- Documentos
carta_porte_documentos.carta_porte_id → public.cartas_porte.id [ON DELETE CASCADE]

-- Documentación Aduanera
documentacion_aduanera.mercancia_id → public.mercancias.id [ON DELETE CASCADE]
```

---

## Facturas

```sql
-- Facturas
facturas.user_id → auth.users.id [ON DELETE CASCADE]
facturas.viaje_id → public.viajes.id [ON DELETE SET NULL]
facturas.carta_porte_id → public.cartas_porte.id [ON DELETE SET NULL]
```

---

## Borradores y Plantillas

```sql
-- Borradores Carta Porte
borradores_carta_porte.user_id → auth.users.id [ON DELETE CASCADE]
borradores_carta_porte.viaje_id → public.viajes.id [ON DELETE SET NULL]
```

---

## Certificados

```sql
-- Certificados Digitales
certificados_digitales.user_id → auth.users.id [ON DELETE CASCADE]

-- Certificados Activos
certificados_activos.user_id → auth.users.id [ON DELETE CASCADE]
certificados_activos.certificado_id → public.certificados_digitales.id [ON DELETE SET NULL]
```

---

## Configuración

```sql
-- Configuración Empresa
configuracion_empresa.user_id → auth.users.id [ON DELETE CASCADE]

-- Configuraciones Reportes
configuraciones_reportes.user_id → auth.users.id [ON DELETE CASCADE]
```

---

## Multi-Tenant

```sql
-- Tenants
tenants.plan_id → public.planes.id [ON DELETE SET NULL]

-- Clientes/Proveedores
clientes_proveedores.tenant_id → public.tenants.id [ON DELETE SET NULL]

-- Figuras Frecuentes
figuras_frecuentes.tenant_id → public.tenants.id [ON DELETE SET NULL]

-- Ubicaciones Frecuentes
ubicaciones_frecuentes.tenant_id → public.tenants.id [ON DELETE SET NULL]

-- Mercancías Frecuentes
mercancias_frecuentes.tenant_id → public.tenants.id [ON DELETE SET NULL]
```

---

## Calendario y Eventos

```sql
-- Calendar Events
calendar_events.user_id → auth.users.id [ON DELETE CASCADE]

-- Eventos Calendario
eventos_calendario.user_id → auth.users.id [ON DELETE CASCADE]
eventos_calendario.carta_porte_id → public.cartas_porte.id [ON DELETE SET NULL]
```

---

## Calificaciones

```sql
-- Calificaciones Conductores
calificaciones_conductores.user_id → auth.users.id [ON DELETE CASCADE]
calificaciones_conductores.conductor_id → public.conductores.id [ON DELETE SET NULL]
```

---

## Cotizaciones

```sql
-- Cotizaciones
cotizaciones.user_id → auth.users.id [ON DELETE CASCADE]
cotizaciones.cliente_existente_id → public.clientes_proveedores.id [ON DELETE SET NULL]
cotizaciones.conductor_id → public.conductores.id [ON DELETE SET NULL]
cotizaciones.vehiculo_id → public.vehiculos.id [ON DELETE SET NULL]
```

---

## Índices para Foreign Keys

Es importante crear índices en las columnas de foreign keys para optimizar JOINs:

```sql
-- Ejemplo de índices recomendados
CREATE INDEX idx_viajes_user_id ON viajes(user_id);
CREATE INDEX idx_viajes_conductor_id ON viajes(conductor_id);
CREATE INDEX idx_viajes_vehiculo_id ON viajes(vehiculo_id);
CREATE INDEX idx_cartas_porte_usuario_id ON cartas_porte(usuario_id);
CREATE INDEX idx_cartas_porte_viaje_id ON cartas_porte(viaje_id);
CREATE INDEX idx_ubicaciones_carta_porte_id ON ubicaciones(carta_porte_id);
CREATE INDEX idx_mercancias_carta_porte_id ON mercancias(carta_porte_id);
```
