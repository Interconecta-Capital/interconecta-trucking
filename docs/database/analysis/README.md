# Análisis de Tablas - TransporteApp

## Índice de Documentación

Esta carpeta contiene el análisis completo de las 96 tablas de la base de datos PostgreSQL, con recomendaciones para consolidación y migración a DynamoDB.

### Documentos

| Archivo | Descripción |
|---------|-------------|
| [TABLE_ANALYSIS.md](./TABLE_ANALYSIS.md) | Análisis detallado de cada tabla |
| [CONSOLIDATION_PROPOSAL.md](./CONSOLIDATION_PROPOSAL.md) | Propuesta de unificación de tablas |
| [DYNAMODB_DESIGN.md](./DYNAMODB_DESIGN.md) | Diseño optimizado para DynamoDB |
| [DECISION_MATRIX.md](./DECISION_MATRIX.md) | Matriz de decisión por tabla |
| [MIGRATION_ROADMAP.md](./MIGRATION_ROADMAP.md) | Roadmap de migración en fases |

## Resumen Ejecutivo

### Estado Actual

| Métrica | Valor |
|---------|-------|
| **Total tablas** | 96 |
| **Tablas con datos** | ~60 |
| **Tablas vacías** | ~36 |
| **Catálogos SAT** | 16 |
| **Tablas de auditoría** | 5 |
| **Vistas materializadas** | 2 |

### Distribución por Dominio

```
┌─────────────────────────────────────────────────────────────┐
│                    96 TABLAS TOTALES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   NEGOCIO       │  │   CATÁLOGOS     │                  │
│  │   35 tablas     │  │   16 tablas     │                  │
│  │                 │  │                 │                  │
│  │ viajes          │  │ cat_estado      │                  │
│  │ conductores     │  │ cat_municipio   │                  │
│  │ vehiculos       │  │ cat_localidad   │                  │
│  │ remolques       │  │ cat_colonia     │                  │
│  │ cartas_porte    │  │ cat_codigo_post │                  │
│  │ facturas        │  │ ...             │                  │
│  │ ...             │  │                 │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   USUARIOS      │  │   AUDITORÍA     │                  │
│  │   12 tablas     │  │   5 tablas      │                  │
│  │                 │  │                 │                  │
│  │ profiles        │  │ audit_log       │                  │
│  │ user_roles      │  │ security_audit  │                  │
│  │ subscriptions   │  │ data_deletion   │                  │
│  │ creditos        │  │ ...             │                  │
│  │ ...             │  │                 │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   ANALÍTICAS    │  │   CALENDARIO    │                  │
│  │   8 tablas      │  │   3 tablas      │                  │
│  │                 │  │                 │                  │
│  │ analisis_viajes │  │ calendar_events │                  │
│  │ metricas_*      │  │ eventos_calend  │                  │
│  │ dashboard_*     │  │ recordatorios   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────┐               │
│  │            OTRAS (17 tablas)            │               │
│  │  documentos, configuraciones, logs...   │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Propuesta de Consolidación

| Consolidación | Tablas Actuales | Tabla Destino | Ahorro |
|---------------|-----------------|---------------|--------|
| Auditoría | 5 | `audit_events` | -4 |
| Logs operación | 4 | `operation_logs` | -3 |
| Frecuentes | 4 | `user_favorites` | -3 |
| Calendario | 3 | `calendar_events` | -2 |
| Certificados | 2 | `certificados_digitales` | -1 |
| Suscripciones | 2 | `subscriptions` | -1 |
| **TOTAL** | **20** | **6** | **-14** |

### Objetivo Post-Migración

| Métrica | Antes | Después |
|---------|-------|---------|
| Tablas PostgreSQL | 96 | ~20 (catálogos + auth) |
| Entidades DynamoDB | 0 | ~40 |
| Complejidad RLS | Alta | Nula |
| Latencia promedio | ~20ms | ~5ms |

## Criterios de Decisión

### ¿Mantener en PostgreSQL?

- ✅ Catálogos SAT (read-only, joins frecuentes)
- ✅ Datos de autenticación (auth.users)
- ✅ Tablas de configuración global

### ¿Migrar a DynamoDB?

- ✅ Datos por usuario (viajes, conductores, vehículos)
- ✅ Alto volumen de lecturas/escrituras
- ✅ Patrones de acceso predecibles (por user_id)

### ¿Consolidar?

- ✅ Tablas similares con estructura parecida
- ✅ Tablas vacías o con < 100 registros
- ✅ Tablas de logs/auditoría fragmentadas

## Próximos Pasos

1. **Fase 1**: Validar propuesta de consolidación con equipo
2. **Fase 2**: Ejecutar consolidación en PostgreSQL
3. **Fase 3**: Diseñar single-table DynamoDB
4. **Fase 4**: Migración paralela (dual-write)
5. **Fase 5**: Cutover a DynamoDB
