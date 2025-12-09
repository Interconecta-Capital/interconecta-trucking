# Propuesta de Consolidación de Tablas

## Resumen Ejecutivo

Esta propuesta detalla la consolidación de **20 tablas** en **6 tablas unificadas**, reduciendo la complejidad del esquema y facilitando la migración a DynamoDB.

---

## 1. Consolidación de Auditoría

### Estado Actual: 5 tablas

```
┌─────────────────────────────────────────────────────────────┐
│                    TABLAS DE AUDITORÍA                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   audit_log     │  │ security_audit  │                  │
│  │   ~10K rows     │  │   ~5K rows      │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
│           │                    │                            │
│           └──────────┬─────────┘                            │
│                      ▼                                      │
│  ┌─────────────────────────────────────────┐               │
│  │            audit_events                  │               │
│  │            (TABLA UNIFICADA)             │               │
│  └─────────────────────────────────────────┘               │
│                      ▲                                      │
│           ┌──────────┴─────────┐                            │
│           │                    │                            │
│  ┌────────┴────────┐  ┌────────┴────────┐                  │
│  │ data_deletion   │  │  timbrado_logs  │                  │
│  │   ~500 rows     │  │   ~20K rows     │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐                                       │
│  │ login_audit_log │                                       │
│  │   ~8K rows      │                                       │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Propuesta: 1 tabla unificada

```sql
-- Migración: Crear nueva tabla unificada
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clasificación
  event_type TEXT NOT NULL CHECK (event_type IN (
    'general',      -- De audit_log
    'security',     -- De security_audit_log
    'deletion',     -- De data_deletion_audit
    'timbrado',     -- De timbrado_logs
    'login'         -- De login_audit_log
  )),
  
  -- Contexto del evento
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,           -- 'viaje', 'carta_porte', 'factura', etc.
  entity_id UUID,
  
  -- Datos del cambio
  old_values JSONB,
  new_values JSONB,
  
  -- Metadata específica por tipo
  metadata JSONB,
  /*
    Para 'login': { ip_address, user_agent, success, failure_reason }
    Para 'timbrado': { uuid_fiscal, pac_response, xml_size }
    Para 'security': { severity, threat_type }
    Para 'deletion': { records_affected, tables_affected }
  */
  
  -- Trazabilidad
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices optimizados
CREATE INDEX idx_audit_events_type_date 
  ON audit_events(event_type, created_at DESC);
  
CREATE INDEX idx_audit_events_user_date 
  ON audit_events(user_id, created_at DESC);
  
CREATE INDEX idx_audit_events_entity 
  ON audit_events(entity_type, entity_id);

-- Política de retención (opcional)
-- Particionar por mes para facilitar eliminación de datos antiguos
```

### Script de Migración

```sql
-- 1. Migrar audit_log
INSERT INTO audit_events (event_type, action, entity_type, metadata, created_at)
SELECT 
  'general',
  accion,
  tabla,
  jsonb_build_object('descripcion', descripcion),
  created_at
FROM audit_log;

-- 2. Migrar security_audit_log
INSERT INTO audit_events (event_type, user_id, action, metadata, ip_address, created_at)
SELECT 
  'security',
  user_id,
  action,
  jsonb_build_object(
    'severity', severity,
    'resource', resource_type,
    'details', details
  ),
  ip_address::inet,
  created_at
FROM security_audit_log;

-- 3. Migrar timbrado_logs
INSERT INTO audit_events (event_type, user_id, action, entity_type, entity_id, metadata, created_at)
SELECT 
  'timbrado',
  user_id,
  CASE WHEN success THEN 'timbrado_exitoso' ELSE 'timbrado_fallido' END,
  'carta_porte',
  carta_porte_id,
  jsonb_build_object(
    'uuid_fiscal', uuid_fiscal,
    'pac_response', response_data,
    'error', error_message
  ),
  created_at
FROM timbrado_logs;

-- 4. Migrar login_audit_log
INSERT INTO audit_events (event_type, user_id, action, metadata, ip_address, user_agent, created_at)
SELECT 
  'login',
  user_id,
  CASE WHEN success THEN 'login_success' ELSE 'login_failed' END,
  jsonb_build_object('failure_reason', failure_reason),
  ip_address::inet,
  user_agent,
  created_at
FROM login_audit_log;

-- 5. Migrar data_deletion_audit
INSERT INTO audit_events (event_type, user_id, action, metadata, created_at)
SELECT 
  'deletion',
  user_id,
  status,
  jsonb_build_object(
    'records_deleted', records_deleted,
    'records_anonymized', records_anonymized,
    'tables_affected', tables_affected
  ),
  created_at
FROM data_deletion_audit;
```

---

## 2. Consolidación de Logs de Operación

### Estado Actual: 4 tablas

| Tabla | Propósito | Registros |
|-------|-----------|-----------|
| `sw_api_logs` | Llamadas a SmartWeb | Alto |
| `webhook_logs` | Webhooks recibidos | Medio |
| `operation_logs` | Operaciones generales | Medio |
| `sync_logs` | Sincronizaciones | Bajo |

### Propuesta: 1 tabla unificada

```sql
CREATE TABLE operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clasificación
  log_type TEXT NOT NULL CHECK (log_type IN (
    'api_call',     -- Llamadas a APIs externas
    'webhook',      -- Webhooks recibidos
    'sync',         -- Sincronizaciones
    'internal'      -- Operaciones internas
  )),
  
  -- Servicio y operación
  service TEXT NOT NULL,  -- 'smartweb', 'stripe', 'mapbox', 'google'
  operation TEXT NOT NULL,
  
  -- Estado
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'error', 'timeout')),
  status_code INTEGER,
  
  -- Request/Response
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  
  -- Performance
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  
  -- Contexto
  user_id UUID,
  entity_type TEXT,
  entity_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_operation_logs_service_date 
  ON operation_logs(service, created_at DESC);
  
CREATE INDEX idx_operation_logs_status 
  ON operation_logs(status, created_at DESC) 
  WHERE status = 'error';
```

---

## 3. Consolidación de Favoritos/Frecuentes

### Estado Actual: 4 tablas

```
ubicaciones_frecuentes  ─┐
mercancias_frecuentes   ─┼──► user_favorites
clientes_frecuentes     ─┤
productos_frecuentes    ─┘
```

### Propuesta: 1 tabla unificada

```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de entidad
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'ubicacion',
    'mercancia', 
    'cliente',
    'producto',
    'ruta'
  )),
  
  -- Datos de la entidad (esquema flexible)
  entity_data JSONB NOT NULL,
  /*
    Para 'ubicacion': { nombre, direccion, codigo_postal, coordenadas }
    Para 'mercancia': { bienes_transp, descripcion, clave_unidad, peso }
    Para 'cliente': { rfc, razon_social, uso_cfdi }
    Para 'producto': { clave_prod_serv, descripcion }
  */
  
  -- Métricas de uso
  use_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Metadatos
  alias TEXT,  -- Nombre personalizado
  is_pinned BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraint único por usuario y tipo
  UNIQUE(user_id, entity_type, (entity_data->>'id'))
);

-- Índices
CREATE INDEX idx_user_favorites_user_type 
  ON user_favorites(user_id, entity_type);
  
CREATE INDEX idx_user_favorites_most_used 
  ON user_favorites(user_id, use_count DESC);
```

### Migración

```sql
-- Migrar ubicaciones_frecuentes
INSERT INTO user_favorites (user_id, entity_type, entity_data, use_count, last_used_at, alias)
SELECT 
  user_id,
  'ubicacion',
  jsonb_build_object(
    'id', id,
    'nombre', nombre,
    'direccion', direccion,
    'codigo_postal', codigo_postal,
    'estado', estado,
    'municipio', municipio,
    'coordenadas', coordenadas
  ),
  uso_count,
  last_used_at,
  alias
FROM ubicaciones_frecuentes;

-- Similar para otras tablas...
```

---

## 4. Consolidación de Calendario

### Estado Actual: 3 tablas

| Tabla | Propósito |
|-------|-----------|
| `calendar_events` | Eventos genéricos |
| `eventos_calendario` | Eventos de carta porte |
| `recordatorios` | Recordatorios/alertas |

### Propuesta: 1 tabla unificada

```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  event_type TEXT NOT NULL CHECK (event_type IN (
    'viaje',
    'mantenimiento',
    'vencimiento',
    'recordatorio',
    'reunion',
    'otro'
  )),
  
  -- Datos del evento
  titulo TEXT NOT NULL,
  descripcion TEXT,
  
  -- Fechas
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  todo_el_dia BOOLEAN DEFAULT false,
  
  -- Recurrencia
  es_recurrente BOOLEAN DEFAULT false,
  regla_recurrencia JSONB,  -- { frequency: 'daily'|'weekly'|'monthly', interval: 1, until: date }
  
  -- Relaciones
  entity_type TEXT,  -- 'viaje', 'vehiculo', 'conductor', 'carta_porte'
  entity_id UUID,
  
  -- Recordatorios
  recordatorios JSONB,  -- [{ minutes_before: 30, type: 'email'|'push' }]
  
  -- Estado
  completado BOOLEAN DEFAULT false,
  cancelado BOOLEAN DEFAULT false,
  
  -- Integraciones
  google_event_id TEXT,
  
  -- Metadatos
  color TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_calendar_events_user_date 
  ON calendar_events(user_id, fecha_inicio);
  
CREATE INDEX idx_calendar_events_type 
  ON calendar_events(event_type, fecha_inicio);
```

---

## 5. Consolidación de Certificados

### Estado Actual: 2 tablas

```
certificados_digitales ◄─── certificados_activos (solo FK)
```

### Propuesta: Eliminar tabla intermedia

```sql
-- Agregar campo a certificados_digitales
ALTER TABLE certificados_digitales 
ADD COLUMN is_active BOOLEAN DEFAULT false;

-- Migrar datos
UPDATE certificados_digitales cd
SET is_active = true
WHERE EXISTS (
  SELECT 1 FROM certificados_activos ca 
  WHERE ca.certificado_id = cd.id
);

-- Crear constraint para un solo activo por usuario
CREATE UNIQUE INDEX idx_one_active_cert_per_user 
ON certificados_digitales(user_id) 
WHERE is_active = true;

-- Eliminar tabla redundante
DROP TABLE certificados_activos;
```

---

## 6. Consolidación de Suscripciones

### Estado Actual: 2 tablas

```
subscriptions ◄─── subscription_history
```

### Propuesta: Historial como JSONB

```sql
-- Agregar campo de historial
ALTER TABLE subscriptions 
ADD COLUMN history JSONB DEFAULT '[]'::jsonb;

-- Migrar historial existente
UPDATE subscriptions s
SET history = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'plan_id', sh.plan_id,
      'status', sh.status,
      'started_at', sh.started_at,
      'ended_at', sh.ended_at,
      'reason', sh.change_reason
    ) ORDER BY sh.started_at
  )
  FROM subscription_history sh
  WHERE sh.subscription_id = s.id
);

-- Crear función para agregar al historial
CREATE OR REPLACE FUNCTION add_subscription_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.plan_id != NEW.plan_id OR OLD.status != NEW.status THEN
    NEW.history = NEW.history || jsonb_build_object(
      'plan_id', OLD.plan_id,
      'status', OLD.status,
      'started_at', OLD.updated_at,
      'ended_at', now(),
      'reason', NEW.change_reason
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_subscription_history
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION add_subscription_history();

-- Eliminar tabla redundante
DROP TABLE subscription_history;
```

---

## Resumen de Impacto

### Antes vs Después

| Categoría | Tablas Antes | Tablas Después | Reducción |
|-----------|--------------|----------------|-----------|
| Auditoría | 5 | 1 | -4 |
| Logs | 4 | 1 | -3 |
| Favoritos | 4 | 1 | -3 |
| Calendario | 3 | 1 | -2 |
| Certificados | 2 | 1 | -1 |
| Suscripciones | 2 | 1 | -1 |
| **TOTAL** | **20** | **6** | **-14** |

### Beneficios

1. **Simplicidad**: Menos tablas = menos JOINs
2. **Flexibilidad**: JSONB permite evolución sin migrations
3. **Performance**: Índices consolidados más eficientes
4. **DynamoDB Ready**: Estructura compatible con single-table design
5. **Mantenibilidad**: Código más simple

### Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Pérdida de datos | Backup completo antes de migración |
| Queries rotas | Tests de regresión en queries |
| Performance JSONB | Índices GIN en campos JSONB frecuentes |
| Tamaño de rows | Monitorear tamaño promedio, particionar si necesario |

---

## Plan de Ejecución

### Fase 1: Preparación (1 semana)
- [ ] Backup completo de base de datos
- [ ] Crear tablas nuevas (sin eliminar antiguas)
- [ ] Scripts de migración en entorno de pruebas

### Fase 2: Migración (1 semana)
- [ ] Ejecutar scripts de migración
- [ ] Validar integridad de datos
- [ ] Actualizar código de aplicación

### Fase 3: Validación (1 semana)
- [ ] Tests de regresión completos
- [ ] Monitoreo de performance
- [ ] Rollback plan listo

### Fase 4: Limpieza (1 semana)
- [ ] Eliminar tablas antiguas
- [ ] Actualizar documentación
- [ ] Actualizar types de Supabase
