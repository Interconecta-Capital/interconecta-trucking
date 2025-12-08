# Documentación de Base de Datos - TransporteApp

## Índice de Documentación

Esta carpeta contiene la documentación completa del esquema de base de datos PostgreSQL (Supabase) de la aplicación de gestión de transporte.

### Estructura

```
docs/database/
├── README.md                    # Este archivo
├── schemas/
│   ├── README.md               # Índice de esquemas
│   ├── CORE_TABLES.md          # Tablas principales del negocio
│   ├── SAT_CATALOGS.md         # Catálogos del SAT
│   ├── FISCAL_TABLES.md        # Tablas fiscales (CFDI, Carta Porte)
│   ├── USER_MANAGEMENT.md      # Gestión de usuarios y roles
│   └── ANALYTICS_TABLES.md     # Tablas de analíticas y reportes
├── relations/
│   ├── README.md               # Índice de relaciones
│   ├── ENTITY_RELATIONSHIPS.md # Diagrama ER y relaciones
│   └── FOREIGN_KEYS.md         # Detalle de foreign keys
├── functions/
│   ├── README.md               # Índice de funciones
│   ├── SECURITY_FUNCTIONS.md   # Funciones de seguridad
│   ├── BUSINESS_LOGIC.md       # Lógica de negocio
│   └── TRIGGERS.md             # Triggers y automatizaciones
├── security/
│   ├── README.md               # Índice de seguridad
│   ├── RLS_POLICIES.md         # Políticas Row Level Security
│   ├── ACCESS_PATTERNS.md      # Patrones de acceso por rol
│   └── AUDIT_LOGGING.md        # Auditoría y logging
└── migration/
    ├── README.md               # Índice de migración
    ├── DYNAMODB_MIGRATION.md   # Guía de migración a DynamoDB
    ├── DATA_MODELING.md        # Modelado NoSQL
    └── MIGRATION_SCRIPTS.md    # Scripts de migración
```

## Resumen del Sistema

| Métrica | Valor |
|---------|-------|
| **Total de tablas** | 102+ |
| **Catálogos SAT** | 20 tablas |
| **Tablas con RLS** | 102 |
| **Funciones SECURITY DEFINER** | 35+ |
| **Triggers activos** | 15+ |

## Stack Tecnológico

- **Base de datos**: PostgreSQL 15 (Supabase)
- **Autenticación**: Supabase Auth
- **RLS**: Row Level Security habilitado en todas las tablas
- **Storage**: Supabase Storage para archivos

## Convenciones de Nomenclatura

### Tablas
- Snake_case: `cartas_porte`, `configuracion_empresa`
- Catálogos SAT prefijados: `cat_*`
- Vistas admin prefijadas: `admin_*`

### Columnas
- UUIDs para PKs: `id UUID DEFAULT gen_random_uuid()`
- Foreign keys: `{entidad}_id`
- Timestamps: `created_at`, `updated_at`
- User ownership: `user_id`

### Funciones
- Verbos descriptivos: `is_*`, `has_*`, `get_*`, `check_*`
- Security definer para roles: `is_superuser_secure()`, `has_role()`

## Acceso Rápido

- [Esquemas de Tablas](./schemas/README.md)
- [Relaciones y FK](./relations/README.md)
- [Funciones y Triggers](./functions/README.md)
- [Seguridad y RLS](./security/README.md)
- [Migración a DynamoDB](./migration/README.md)
