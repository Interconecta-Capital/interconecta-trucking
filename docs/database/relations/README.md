# Relaciones de Base de Datos

## Índice

| Archivo | Descripción |
|---------|-------------|
| [ENTITY_RELATIONSHIPS.md](./ENTITY_RELATIONSHIPS.md) | Diagrama ER y descripción de relaciones |
| [FOREIGN_KEYS.md](./FOREIGN_KEYS.md) | Detalle de todas las foreign keys |

## Resumen de Relaciones

### Dominio Principal

```
                    ┌─────────────────┐
                    │   auth.users    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    profiles     │ │  subscriptions  │ │ configuracion_  │
│   (1:1 user)    │ │   (N:1 user)    │ │    empresa      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Dominio de Transporte

```
┌─────────────────┐
│     viajes      │
├─────────────────┤
│ user_id (FK)    │──────────► auth.users
│ conductor_id    │──────────► conductores
│ vehiculo_id     │──────────► vehiculos
│ remolque_id     │──────────► remolques
│ socio_id        │──────────► socios
│ carta_porte_id  │──────────► cartas_porte
└─────────────────┘
```

### Dominio Fiscal

```
┌─────────────────┐       ┌─────────────────┐
│  cartas_porte   │◄──────│   ubicaciones   │
├─────────────────┤       └─────────────────┘
│ usuario_id (FK) │              
│ viaje_id (FK)   │       ┌─────────────────┐
│ factura_id (FK) │◄──────│   mercancias    │
└─────────────────┘       └─────────────────┘
         │
         │                ┌─────────────────┐
         ├───────────────►│figuras_transporte│
         │                └─────────────────┘
         │
         │                ┌─────────────────┐
         └───────────────►│  autotransporte │
                          └─────────────────┘
```

## Tipos de Relaciones

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| 1:1 | Uno a uno | `auth.users` ↔ `profiles` |
| 1:N | Uno a muchos | `users` → `viajes` |
| N:1 | Muchos a uno | `mercancias` → `cartas_porte` |
| N:M | Muchos a muchos | Via tabla intermedia |

## Cascade Behavior

| Tabla Padre | Tabla Hija | ON DELETE |
|-------------|------------|-----------|
| auth.users | profiles | CASCADE |
| auth.users | subscriptions | CASCADE |
| cartas_porte | ubicaciones | CASCADE |
| cartas_porte | mercancias | CASCADE |
| cartas_porte | figuras_transporte | CASCADE |
| viajes | eventos_viaje | CASCADE |
