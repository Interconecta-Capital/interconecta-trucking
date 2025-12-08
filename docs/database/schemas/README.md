# Esquemas de Base de Datos

## Índice de Esquemas

Este directorio documenta todas las tablas del sistema organizadas por dominio funcional.

### Documentos

| Archivo | Descripción |
|---------|-------------|
| [CORE_TABLES.md](./CORE_TABLES.md) | Tablas principales del negocio (viajes, conductores, vehículos) |
| [SAT_CATALOGS.md](./SAT_CATALOGS.md) | Catálogos oficiales del SAT |
| [FISCAL_TABLES.md](./FISCAL_TABLES.md) | Tablas de CFDI, Carta Porte, Facturación |
| [USER_MANAGEMENT.md](./USER_MANAGEMENT.md) | Usuarios, roles, subscripciones |
| [ANALYTICS_TABLES.md](./ANALYTICS_TABLES.md) | Métricas, reportes, dashboards |

## Distribución de Tablas

```
┌─────────────────────────────────────────────────────────────┐
│                    ESQUEMA PUBLIC                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   CORE      │  │   FISCAL    │  │   CATÁLOGOS SAT     │ │
│  │ (20 tablas) │  │ (15 tablas) │  │   (20 tablas)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  USUARIOS   │  │ ANALYTICS   │  │   CONFIGURACIÓN     │ │
│  │ (12 tablas) │  │ (8 tablas)  │  │   (10 tablas)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Tipos de Datos Comunes

### UUIDs
Todas las tablas usan UUID como primary key:
```sql
id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY
```

### Timestamps
Patrón estándar para auditoría:
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

### JSONB
Usado para datos flexibles:
- `datos_formulario` - Formularios dinámicos
- `domicilio_fiscal` - Direcciones estructuradas
- `metadata` - Datos adicionales
- `configuracion` - Configuraciones de usuario

## Índices Importantes

| Tabla | Índice | Columnas |
|-------|--------|----------|
| `viajes` | `idx_viajes_user_estado` | `user_id, estado` |
| `cartas_porte` | `idx_cartas_usuario_status` | `usuario_id, status` |
| `conductores` | `idx_conductores_user_estado` | `user_id, estado` |
| `codigos_postales_mexico` | `idx_cp_codigo` | `codigo_postal` |
