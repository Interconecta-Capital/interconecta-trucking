# Diagrama de Entidad-Relación

## Diagrama Principal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SISTEMA DE TRANSPORTE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐                                                               │
│  │  auth.users  │                                                               │
│  │  (Supabase)  │                                                               │
│  └──────┬───────┘                                                               │
│         │                                                                       │
│         │ 1:1                                                                   │
│         ▼                                                                       │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐              │
│  │   profiles   │        │ subscriptions│        │   planes     │              │
│  │              │        │              │───────►│              │              │
│  └──────────────┘        └──────────────┘        └──────────────┘              │
│         │                       │                                               │
│         │                       │                                               │
│         ▼                       ▼                                               │
│  ┌──────────────┐        ┌──────────────┐                                      │
│  │configuracion_│        │  creditos_   │                                      │
│  │   empresa    │        │  usuarios    │                                      │
│  └──────────────┘        └──────────────┘                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RECURSOS DE TRANSPORTE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐              │
│  │  conductores │        │   vehiculos  │        │  remolques   │              │
│  │              │        │              │        │              │              │
│  └──────┬───────┘        └──────┬───────┘        └──────┬───────┘              │
│         │                       │                       │                       │
│         │                       │                       │                       │
│         └───────────────────────┼───────────────────────┘                       │
│                                 │                                               │
│                                 ▼                                               │
│                          ┌──────────────┐                                       │
│                          │    viajes    │                                       │
│                          │              │                                       │
│                          └──────┬───────┘                                       │
│                                 │                                               │
│         ┌───────────────────────┼───────────────────────┐                       │
│         │                       │                       │                       │
│         ▼                       ▼                       ▼                       │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐              │
│  │eventos_viaje │        │ costos_viaje │        │analisis_viaje│              │
│  └──────────────┘        └──────────────┘        └──────────────┘              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DOCUMENTOS FISCALES                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                          ┌──────────────┐                                       │
│                          │ cartas_porte │                                       │
│                          └──────┬───────┘                                       │
│                                 │                                               │
│         ┌───────────┬───────────┼───────────┬───────────┐                       │
│         │           │           │           │           │                       │
│         ▼           ▼           ▼           ▼           ▼                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ubicaciones│ │mercancias│ │ figuras_ │ │autotrans-│ │carta_porte│             │
│  │          │ │          │ │transporte│ │  porte   │ │documentos │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                    │                                                            │
│                    ▼                                                            │
│             ┌──────────────┐                                                    │
│             │  cantidad_   │                                                    │
│             │  transporta  │                                                    │
│             └──────────────┘                                                    │
│                                                                                 │
│                          ┌──────────────┐                                       │
│                          │   facturas   │                                       │
│                          │              │                                       │
│                          └──────────────┘                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Relaciones Detalladas

### Usuario Central

```
auth.users (id: UUID)
    │
    ├── profiles (id = auth.users.id) [1:1]
    │
    ├── subscriptions (user_id → auth.users.id) [1:N]
    │       └── planes (plan_id → planes.id) [N:1]
    │
    ├── configuracion_empresa (user_id → auth.users.id) [1:1]
    │
    ├── creditos_usuarios (user_id → auth.users.id) [1:1]
    │
    ├── certificados_digitales (user_id → auth.users.id) [1:N]
    │
    ├── conductores (user_id → auth.users.id) [1:N]
    │
    ├── vehiculos (user_id → auth.users.id) [1:N]
    │
    ├── remolques (user_id → auth.users.id) [1:N]
    │
    ├── socios (user_id → auth.users.id) [1:N]
    │
    ├── viajes (user_id → auth.users.id) [1:N]
    │
    ├── cartas_porte (usuario_id → auth.users.id) [1:N]
    │
    └── facturas (user_id → auth.users.id) [1:N]
```

### Viaje

```
viajes (id: UUID)
    │
    ├── user_id → auth.users.id [N:1]
    │
    ├── conductor_id → conductores.id [N:1] (nullable)
    │
    ├── vehiculo_id → vehiculos.id [N:1] (nullable)
    │
    ├── remolque_id → remolques.id [N:1] (nullable)
    │
    ├── socio_id → socios.id [N:1] (nullable)
    │
    ├── carta_porte_id → cartas_porte.id [N:1] (nullable)
    │
    ├── eventos_viaje (viaje_id → viajes.id) [1:N]
    │
    ├── costos_viaje (viaje_id → viajes.id) [1:1]
    │
    └── analisis_viajes (viaje_id → viajes.id) [1:1]
```

### Carta Porte

```
cartas_porte (id: UUID)
    │
    ├── usuario_id → auth.users.id [N:1]
    │
    ├── tenant_id → tenants.id [N:1] (nullable)
    │
    ├── viaje_id → viajes.id [N:1] (nullable)
    │
    ├── factura_id → facturas.id [N:1] (nullable)
    │
    ├── borrador_origen_id → borradores_carta_porte.id [N:1]
    │
    ├── ubicaciones (carta_porte_id → cartas_porte.id) [1:N]
    │
    ├── mercancias (carta_porte_id → cartas_porte.id) [1:N]
    │       └── cantidad_transporta (mercancia_id → mercancias.id) [1:N]
    │
    ├── figuras_transporte (carta_porte_id → cartas_porte.id) [1:N]
    │
    ├── autotransporte (carta_porte_id → cartas_porte.id) [1:1]
    │
    └── carta_porte_documentos (carta_porte_id → cartas_porte.id) [1:N]
```

### Multi-Tenant

```
tenants (id: UUID)
    │
    ├── usuarios (tenant_id → tenants.id) [1:N]
    │       └── auth_user_id → auth.users.id [N:1]
    │
    ├── clientes_proveedores (tenant_id → tenants.id) [1:N]
    │
    ├── cartas_porte (tenant_id → tenants.id) [1:N]
    │
    ├── figuras_frecuentes (tenant_id → tenants.id) [1:N]
    │
    └── ubicaciones_frecuentes (tenant_id → tenants.id) [1:N]
```

## Cardinalidades

| Relación | Cardinalidad | Obligatoria |
|----------|--------------|-------------|
| users → profiles | 1:1 | Sí |
| users → subscriptions | 1:N | Sí (al menos trial) |
| users → viajes | 1:N | No |
| users → cartas_porte | 1:N | No |
| viajes → cartas_porte | 1:1 | No |
| cartas_porte → ubicaciones | 1:N | Sí (mínimo 2) |
| cartas_porte → mercancias | 1:N | Sí (mínimo 1) |
| cartas_porte → figuras_transporte | 1:N | Sí (mínimo 1) |
| cartas_porte → autotransporte | 1:1 | Sí |
| mercancias → cantidad_transporta | 1:N | No |
