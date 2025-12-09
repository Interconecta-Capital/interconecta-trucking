# Roadmap de Migración a DynamoDB

## Visión General

Este roadmap detalla la estrategia de migración en fases desde PostgreSQL (Supabase) hacia una arquitectura híbrida DynamoDB + PostgreSQL.

---

## Timeline General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ROADMAP DE MIGRACIÓN                                 │
│                         (11 semanas total)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SEMANA   1    2    3    4    5    6    7    8    9   10   11              │
│           │    │    │    │    │    │    │    │    │    │    │              │
│  FASE 0   ████████                                                         │
│  Prep     │ Consolidación PostgreSQL                                       │
│           │                                                                 │
│  FASE 1             ████████████████                                       │
│  Core               │ viajes, cartas_porte, conductores                    │
│                     │ vehiculos (dual-write)                               │
│                     │                                                       │
│  FASE 2                               ████████                             │
│  Operación                            │ facturas, cotizaciones             │
│                                       │ clientes                           │
│                                       │                                     │
│  FASE 3                                       ████                         │
│  Auxiliar                                     │ documentos, favoritos      │
│                                               │                             │
│  FASE 4                                             ████                   │
│  Analytics                                          │ reportes, calendar   │
│                                                     │                       │
│  FASE 5                                                   ████             │
│  Cutover                                                  │ Limpieza final │
│                                                           │                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 0: Preparación y Consolidación (Semanas 1-2)

### Objetivos
- Consolidar tablas fragmentadas
- Limpiar tablas sin uso
- Preparar infraestructura AWS

### Tareas

#### Semana 1: Consolidación de Tablas

| Tarea | Descripción | Responsable | Estado |
|-------|-------------|-------------|--------|
| Backup completo | Snapshot de toda la base de datos | DBA | ⬜ |
| Crear `audit_events` | Migrar 5 tablas de auditoría | Backend | ⬜ |
| Crear `operation_logs` | Migrar 4 tablas de logs | Backend | ⬜ |
| Crear `user_favorites` | Migrar 4 tablas de favoritos | Backend | ⬜ |
| Consolidar `calendar_events` | Unificar 3 tablas | Backend | ⬜ |
| Eliminar `certificados_activos` | Migrar a campo en certificados | Backend | ⬜ |
| Eliminar tablas vacías | metricas_conductor, etc. | DBA | ⬜ |

#### Semana 2: Infraestructura AWS

| Tarea | Descripción | Responsable | Estado |
|-------|-------------|-------------|--------|
| Crear cuenta AWS | Si no existe | DevOps | ⬜ |
| Configurar IAM | Roles y políticas | DevOps | ⬜ |
| Crear tabla DynamoDB | `transporte-app-main` | DevOps | ⬜ |
| Configurar GSIs | GSI1, GSI2, GSI3 | DevOps | ⬜ |
| Setup Lambda functions | Base de funciones | Backend | ⬜ |
| Configurar Cognito | User Pools para auth | DevOps | ⬜ |
| Setup API Gateway | Endpoints REST | DevOps | ⬜ |

### Entregables
- ✅ Base de datos PostgreSQL consolidada (82 → 68 tablas)
- ✅ Infraestructura AWS lista
- ✅ CI/CD pipeline configurado

---

## Fase 1: Migración Core (Semanas 3-6)

### Objetivos
- Migrar tablas críticas del negocio
- Implementar dual-write
- Validar consistencia

### Tablas a Migrar

| Tabla | Registros Est. | Complejidad | Prioridad |
|-------|----------------|-------------|-----------|
| `viajes` | 50,000+ | Alta | P0 |
| `eventos_viaje` | 200,000+ | Media | P0 |
| `costos_viaje` | 50,000+ | Baja | P0 |
| `cartas_porte` | 30,000+ | Muy Alta | P0 |
| `ubicaciones` | 100,000+ | Media | P0 (embed) |
| `mercancias` | 150,000+ | Media | P0 (embed) |
| `conductores` | 5,000+ | Baja | P0 |
| `vehiculos` | 3,000+ | Baja | P0 |

### Semana 3: Viajes y Eventos

```javascript
// Orden de migración
1. conductores      → CONDUCTOR#*
2. vehiculos        → VEHICULO#*
3. remolques        → REMOLQUE#*
4. viajes           → VIAJE#*
5. eventos_viaje    → VIAJE#*#EVENT#*
6. costos_viaje     → (embebido en viajes)
```

### Semana 4: Cartas Porte

```javascript
// Migración de documento completo
1. cartas_porte     → CARTA#*
2. ubicaciones      → (embebido en carta)
3. mercancias       → (embebido en carta)
4. figuras_transporte → (embebido en carta)
5. autotransporte   → (embebido en carta)
```

### Semanas 5-6: Dual-Write y Validación

| Tarea | Descripción |
|-------|-------------|
| Implementar dual-write | Escribir en PostgreSQL Y DynamoDB |
| Sync checker | Job que valida consistencia |
| Métricas | Latencia, errores, divergencias |
| Rollback plan | Procedimiento documentado |

### Código Dual-Write Ejemplo

```typescript
// services/ViajeService.ts
async function createViaje(data: ViajeInput): Promise<Viaje> {
  // 1. Escribir en PostgreSQL (fuente de verdad)
  const pgViaje = await supabase
    .from('viajes')
    .insert(data)
    .select()
    .single();

  // 2. Escribir en DynamoDB (async, con retry)
  try {
    await dynamoClient.put({
      TableName: 'transporte-app-main',
      Item: transformToDynamo(pgViaje.data)
    });
  } catch (error) {
    // Log para reconciliación posterior
    await logSyncError('viajes', pgViaje.data.id, error);
  }

  return pgViaje.data;
}
```

### Entregables Fase 1
- ✅ Dual-write funcionando para viajes y cartas
- ✅ Validación de consistencia <0.1% divergencia
- ✅ Dashboard de monitoreo

---

## Fase 2: Operación Diaria (Semanas 7-8)

### Objetivos
- Migrar tablas de operación comercial
- Mantener dual-write
- Optimizar queries

### Tablas a Migrar

| Tabla | Registros Est. | Destino |
|-------|----------------|---------|
| `facturas` | 20,000+ | FACTURA#* |
| `conceptos_factura` | 60,000+ | (embed en factura) |
| `cotizaciones` | 10,000+ | COTIZACION#* |
| `clientes_proveedores` | 5,000+ | CLIENTE#* |

### Semana 7: Facturas y Cotizaciones

```javascript
// Migración
1. clientes_proveedores → CLIENTE#*
2. cotizaciones         → COTIZACION#*
3. facturas            → FACTURA#*
4. conceptos_factura   → (embebido en factura)
```

### Semana 8: Validación y Optimización

| Tarea | Métrica Objetivo |
|-------|------------------|
| Query performance | <10ms p99 |
| Consistencia | <0.01% divergencia |
| Cost analysis | <$50/mes DynamoDB |

---

## Fase 3: Datos Auxiliares (Semana 9)

### Tablas a Migrar

| Tabla | Destino |
|-------|---------|
| `mantenimientos` | VEHICULO#*#MANT#* |
| `documentos_entidades` | DOC#* |
| `documentos_procesados` | DOC#*#PROCESSED |
| `configuracion_empresa` | CONFIG#empresa |
| `certificados_digitales` | CERT#* |
| `user_favorites` | FAV#* |

### Tareas

```javascript
// Migración directa (datos de menor volumen)
1. configuracion_empresa → CONFIG#empresa
2. certificados_digitales → CERT#*
3. user_favorites → FAV#tipo#*
4. mantenimientos → VEHICULO#id#MANT#fecha
5. documentos_* → DOC#*
```

---

## Fase 4: Analytics y Calendario (Semana 10)

### Tablas a Migrar

| Tabla | Destino |
|-------|---------|
| `calendar_events` | CALENDAR#* |
| `configuraciones_reportes` | CONFIG#reportes |
| `reportes_generados` | REPORT#* |
| `analisis_viajes` | (embed en viajes) |

### Consideraciones
- Reportes históricos: mantener en PostgreSQL para queries complejas
- Eventos calendario: migrar solo eventos futuros
- Analíticas: considerar Amazon Timestream para series temporales

---

## Fase 5: Cutover Final (Semana 11)

### Objetivos
- Cambiar lecturas a DynamoDB
- Desactivar escrituras a PostgreSQL
- Limpieza final

### Plan de Cutover

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAN DE CUTOVER                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DÍA 1: Preparación                                        │
│  ├── Final sync check (divergencia <0.001%)                │
│  ├── Backup completo PostgreSQL                            │
│  ├── Feature flags preparados                              │
│  └── Equipo on-call listo                                  │
│                                                             │
│  DÍA 2: Cambio de Lecturas (Blue-Green)                    │
│  ├── 10% tráfico → DynamoDB                                │
│  ├── Monitorear errores y latencia                         │
│  ├── 50% tráfico → DynamoDB                                │
│  ├── Validar métricas                                      │
│  └── 100% tráfico → DynamoDB                               │
│                                                             │
│  DÍA 3: Desactivar Dual-Write                              │
│  ├── Mantener PostgreSQL read-only (backup)                │
│  ├── Remover dual-write code                               │
│  └── Actualizar documentación                              │
│                                                             │
│  DÍA 4-5: Limpieza                                         │
│  ├── Archivar tablas migradas                              │
│  ├── Actualizar Supabase types                             │
│  └── Eliminar código legacy                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Rollback Plan

```
SI errores > 1% O latencia p99 > 100ms:
  1. Revertir feature flag a PostgreSQL
  2. Re-sincronizar datos de DynamoDB → PostgreSQL
  3. Investigar causa raíz
  4. Planificar nuevo intento
```

---

## Arquitectura Final

### Distribución de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                  ARQUITECTURA POST-MIGRACIÓN                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    DYNAMODB                          │   │
│  │               (Single Table Design)                  │   │
│  │                                                      │   │
│  │  Entidades:                                         │   │
│  │  • USER#* (config, favoritos)                       │   │
│  │  • VIAJE#* (+ eventos, costos)                      │   │
│  │  • CARTA#* (+ ubicaciones, mercancías)              │   │
│  │  • FACTURA#* (+ conceptos)                          │   │
│  │  • CONDUCTOR#*, VEHICULO#*, REMOLQUE#*              │   │
│  │  • CLIENTE#*, COTIZACION#*                          │   │
│  │  • DOC#*, CERT#*, CALENDAR#*                        │   │
│  │                                                      │   │
│  │  GSIs:                                              │   │
│  │  • GSI1: Por estado y fecha                         │   │
│  │  • GSI2: Por entidad relacionada                    │   │
│  │  • GSI3: Por fecha global (admin)                   │   │
│  │                                                      │   │
│  │  Volumen: ~70% del tráfico                          │   │
│  │  Latencia: <5ms p99                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              POSTGRESQL (Aurora/Supabase)            │   │
│  │                                                      │   │
│  │  Tablas:                                            │   │
│  │  • auth.users (Supabase Auth)                       │   │
│  │  • profiles, user_roles                             │   │
│  │  • subscriptions, creditos_usuarios                 │   │
│  │  • cat_* (16 catálogos SAT)                         │   │
│  │  • codigos_postales_mexico                          │   │
│  │  • audit_events, operation_logs                     │   │
│  │                                                      │   │
│  │  Volumen: ~30% del tráfico                          │   │
│  │  Casos de uso: Auth, catálogos, auditoría           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    LAMBDA + API GATEWAY              │   │
│  │                                                      │   │
│  │  Funciones:                                         │   │
│  │  • viajes-api (CRUD viajes)                         │   │
│  │  • cartas-porte-api (CRUD + timbrado)               │   │
│  │  • facturas-api (CRUD + cancelación)                │   │
│  │  • catalogs-api (búsqueda en PostgreSQL)            │   │
│  │                                                      │   │
│  │  Auth: Cognito + JWT                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Métricas de Éxito

### KPIs de Migración

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Latencia lecturas | <10ms p99 | CloudWatch |
| Latencia escrituras | <20ms p99 | CloudWatch |
| Disponibilidad | >99.9% | CloudWatch |
| Consistencia | <0.001% divergencia | Custom checker |
| Costo mensual | <$100 | AWS Cost Explorer |
| Errores | <0.1% | CloudWatch Alarms |

### Comparación Antes/Después

| Aspecto | PostgreSQL | DynamoDB |
|---------|------------|----------|
| Latencia lectura | ~20-50ms | ~5-10ms |
| Latencia escritura | ~30-100ms | ~10-20ms |
| Escalabilidad | Vertical (costosa) | Horizontal (automática) |
| Costo base | ~$50/mes | ~$10/mes |
| Mantenimiento | Alto | Bajo |
| JOINs carta porte | 6 queries | 1 GetItem |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos | Baja | Crítico | Backup antes de cada fase, dual-write |
| Inconsistencia | Media | Alto | Sync checker continuo, alertas |
| Performance degradada | Media | Alto | Pruebas de carga, rollback plan |
| Costos inesperados | Baja | Medio | Monitoreo de costos, alertas de billing |
| Downtime | Baja | Alto | Blue-green deployment, feature flags |

---

## Checklist Final

### Pre-Migración
- [ ] Backup completo de PostgreSQL
- [ ] Infraestructura AWS configurada
- [ ] CI/CD pipeline funcionando
- [ ] Tests de integración pasando
- [ ] Equipo capacitado en DynamoDB

### Durante Migración
- [ ] Monitoreo 24/7
- [ ] Sync checker activo
- [ ] Alertas configuradas
- [ ] Comunicación con stakeholders
- [ ] Rollback plan probado

### Post-Migración
- [ ] Validación de datos completa
- [ ] Performance dentro de SLAs
- [ ] Costos dentro de presupuesto
- [ ] Documentación actualizada
- [ ] Código legacy eliminado
