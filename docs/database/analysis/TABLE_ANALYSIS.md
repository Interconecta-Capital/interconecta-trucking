# Análisis Detallado de Tablas

## Resumen

Este documento analiza las 96 tablas de la base de datos, categorizadas por dominio y con recomendaciones de acción.

### Leyenda de Estados

| Estado | Significado |
|--------|-------------|
| ✅ MANTENER | Tabla esencial, no modificar |
| 🔄 CONSOLIDAR | Unificar con otra tabla |
| ⚠️ REVISAR | Evaluar necesidad real |
| ❌ ELIMINAR | Tabla sin uso, candidata a eliminación |
| 🚀 DYNAMO | Migrar a DynamoDB |

---

## 1. Tablas de Negocio Principal (35 tablas)

### 1.1 Viajes y Transporte

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `viajes` | Alto | ✅🚀 | Migrar a DynamoDB | Tabla principal, PK: `USER#userId` |
| `eventos_viaje` | Alto | ✅🚀 | Migrar a DynamoDB | SK: `VIAJE#viajeId#EVENT#timestamp` |
| `costos_viaje` | Medio | 🔄🚀 | Embed en viajes | Considerar como atributo JSONB de viajes |
| `analisis_viajes` | Bajo | 🔄🚀 | Embed en viajes | Métricas pueden ser atributos |
| `cotizaciones` | Medio | ✅🚀 | Migrar a DynamoDB | Entidad separada, relacionada a viajes |

**Justificación viajes:**
- Tabla más consultada del sistema
- Patrón de acceso: siempre por `user_id`
- Ideal para DynamoDB single-table design

### 1.2 Conductores

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `conductores` | Medio | ✅🚀 | Migrar a DynamoDB | SK: `CONDUCTOR#conductorId` |
| `calificaciones_conductores` | Bajo | 🔄🚀 | Embed en conductores | Usar JSONB en campo `historial_performance` |
| `metricas_conductor` | 0 | ❌ | Eliminar | Sin uso, datos en `historial_performance` |

**Justificación conductores:**
- Cada usuario tiene pocos conductores (<100)
- Calificaciones raramente consultadas individualmente
- Mejor como embedded document

### 1.3 Vehículos y Remolques

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `vehiculos` | Medio | ✅🚀 | Migrar a DynamoDB | SK: `VEHICULO#vehiculoId` |
| `remolques` | Medio | ✅🚀 | Migrar a DynamoDB | SK: `REMOLQUE#remolqueId` |
| `mantenimientos` | Medio | ✅🚀 | Migrar a DynamoDB | SK: `VEHICULO#id#MANT#fecha` |
| `permisos_semarnat` | 0 | 🔄 | Embed en vehículos | Campo JSONB `permisos` |

### 1.4 Cartas Porte (Fiscal)

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `cartas_porte` | Alto | ✅🚀 | Migrar a DynamoDB | PK: `USER#userId`, SK: `CARTA#cartaId` |
| `ubicaciones` | Alto | ✅🚀 | Embed en carta | Array JSONB de ubicaciones |
| `mercancias` | Alto | ✅🚀 | Embed en carta | Array JSONB de mercancías |
| `figuras_transporte` | Medio | ✅🚀 | Embed en carta | Array JSONB |
| `autotransporte` | Medio | 🔄🚀 | Embed en carta | Objeto JSONB único |
| `cantidad_transporta` | Medio | 🔄🚀 | Embed en mercancías | Parte del objeto mercancía |
| `documentacion_aduanera` | Bajo | 🔄🚀 | Embed en mercancías | Campo opcional |
| `borradores_carta_porte` | Medio | ✅🚀 | Migrar a DynamoDB | SK: `BORRADOR#borradorId` |
| `carta_porte_documentos` | Medio | ✅🚀 | Migrar a DynamoDB | SK: `CARTA#id#DOC#tipo` |
| `esquemas_xml_sat` | 10 | ✅ | Mantener PostgreSQL | Configuración global, read-only |

**Justificación cartas_porte:**
- Estructura compleja ideal para documento NoSQL
- Ubicaciones y mercancías siempre se leen juntas
- Elimina necesidad de JOINs costosos

### 1.5 Facturación

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `facturas` | Medio | ✅🚀 | Migrar a DynamoDB | SK: `FACTURA#facturaId` |
| `conceptos_factura` | Medio | 🔄🚀 | Embed en factura | Array JSONB |

### 1.6 Clientes y Proveedores

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `clientes_proveedores` | Medio | ✅🚀 | Migrar a DynamoDB | SK: `CLIENTE#clienteId` |

---

## 2. Catálogos SAT (16 tablas)

> ⚠️ **DECISIÓN**: Mantener TODOS los catálogos en PostgreSQL/Aurora

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `cat_estado` | 32 | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_municipio` | 2,469 | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_localidad` | 6,500+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_colonia` | 150,000+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_codigo_postal` | 40,000+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_pais` | 250 | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_clave_unidad` | 2,300+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_clave_prod_serv_cp` | 50,000+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_material_peligroso` | 3,500+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_tipo_embalaje` | 80+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_config_autotransporte` | 50+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_subtipo_remolque` | 30+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_tipo_permiso` | 20+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_figura_transporte` | 10+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_via_entrada_salida` | 10+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `cat_registro_istmo` | 5+ | ✅ | Mantener PostgreSQL | Catálogo oficial SAT |
| `codigos_postales_mexico` | 150,000+ | ✅ | Mantener PostgreSQL | Catálogo SEPOMEX extendido |

**Justificación catálogos:**
1. **Read-only**: Nunca se modifican por usuarios
2. **Joins frecuentes**: Validaciones requieren cruzar datos
3. **Volumen fijo**: No crecen con usuarios
4. **Consultas SQL**: Búsquedas LIKE, filtros complejos
5. **Sin RLS**: No requieren seguridad por usuario

---

## 3. Gestión de Usuarios (12 tablas)

### 3.1 Autenticación y Perfiles

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `profiles` | Medio | ✅ | Mantener Supabase | Sincronizado con auth.users |
| `user_roles` | Medio | ✅ | Mantener Supabase | Roles del sistema |
| `usuarios` | Medio | ⚠️ | Revisar duplicación | Posible duplicado de profiles |

### 3.2 Suscripciones y Créditos

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `subscriptions` | Medio | ✅ | Mantener Supabase | Integración Stripe |
| `subscription_history` | Medio | 🔄 | Consolidar en subscriptions | Historial como JSONB |
| `creditos_usuarios` | Medio | ✅ | Mantener Supabase | Balance de timbres |
| `transacciones_creditos` | Alto | ✅🚀 | Migrar a DynamoDB | Alto volumen, append-only |

### 3.3 Configuración de Usuario

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `configuracion_empresa` | Medio | ✅🚀 | Migrar a DynamoDB | SK: `CONFIG#empresa` |
| `certificados_digitales` | Bajo | ✅🚀 | Migrar a DynamoDB | SK: `CERT#certId` |
| `certificados_activos` | Bajo | 🔄 | Eliminar | Usar flag en certificados_digitales |
| `user_settings` | Bajo | 🔄🚀 | Embed en profile | Configuración de usuario |
| `bloqueos_usuario` | Bajo | ✅ | Mantener Supabase | Seguridad crítica |

---

## 4. Auditoría y Logs (5 tablas)

### Propuesta: Consolidar en 1 tabla

| Tabla Actual | Registros | Estado | Destino |
|--------------|-----------|--------|---------|
| `audit_log` | Alto | 🔄 | → `audit_events` |
| `security_audit_log` | Medio | 🔄 | → `audit_events` |
| `data_deletion_audit` | Bajo | 🔄 | → `audit_events` |
| `login_audit_log` | Medio | 🔄 | → `audit_events` |
| `timbrado_logs` | Alto | 🔄 | → `audit_events` |

**Nueva estructura `audit_events`:**

```sql
CREATE TABLE audit_events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'login', 'security', 'deletion', 'timbrado', 'general'
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices por tipo y fecha
CREATE INDEX idx_audit_events_type_date ON audit_events(event_type, created_at DESC);
CREATE INDEX idx_audit_events_user ON audit_events(user_id, created_at DESC);
```

---

## 5. Logs de Operación (4 tablas)

### Propuesta: Consolidar en 1 tabla

| Tabla Actual | Registros | Estado | Destino |
|--------------|-----------|--------|---------|
| `sw_api_logs` | Alto | 🔄 | → `operation_logs` |
| `webhook_logs` | Medio | 🔄 | → `operation_logs` |
| `operation_logs` | Medio | ✅ | Base de consolidación |
| `sync_logs` | Bajo | 🔄 | → `operation_logs` |

**Nueva estructura `operation_logs`:**

```sql
CREATE TABLE operation_logs (
  id UUID PRIMARY KEY,
  log_type TEXT NOT NULL, -- 'api_call', 'webhook', 'sync', 'general'
  service TEXT, -- 'smartweb', 'stripe', 'mapbox', etc.
  operation TEXT NOT NULL,
  status TEXT, -- 'success', 'error', 'pending'
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  duration_ms INTEGER,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Items Frecuentes/Favoritos (4 tablas)

### Propuesta: Consolidar en 1 tabla

| Tabla Actual | Registros | Estado | Destino |
|--------------|-----------|--------|---------|
| `ubicaciones_frecuentes` | Medio | 🔄 | → `user_favorites` |
| `mercancias_frecuentes` | Medio | 🔄 | → `user_favorites` |
| `clientes_frecuentes` | Bajo | 🔄 | → `user_favorites` |
| `productos_frecuentes` | Bajo | 🔄 | → `user_favorites` |

**Nueva estructura `user_favorites`:**

```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'ubicacion', 'mercancia', 'cliente', 'producto'
  entity_data JSONB NOT NULL,
  use_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Para DynamoDB: PK=USER#userId, SK=FAV#entityType#entityId
```

---

## 7. Calendario y Eventos (3 tablas)

### Propuesta: Consolidar en 1 tabla

| Tabla Actual | Registros | Estado | Destino |
|--------------|-----------|--------|---------|
| `calendar_events` | Bajo | ✅ | Base de consolidación |
| `eventos_calendario` | Bajo | 🔄 | → `calendar_events` |
| `recordatorios` | Bajo | 🔄 | → `calendar_events` |

---

## 8. Tablas Analíticas (8 tablas)

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `analisis_viajes` | Bajo | 🔄 | Embed en viajes | Métricas del viaje |
| `metricas_conductor` | 0 | ❌ | Eliminar | Sin uso |
| `metricas_tiempo_real` | 0 | ⚠️ | Evaluar | Usar para dashboards |
| `dashboard_cache` | 0 | ⚠️ | Evaluar | Cache de dashboards |
| `configuraciones_reportes` | Bajo | ✅🚀 | Migrar a DynamoDB | Config de reportes |
| `reportes_generados` | Medio | ✅🚀 | Migrar a DynamoDB | Historial de reportes |

---

## 9. Documentos y Storage (3 tablas)

| Tabla | Registros | Estado | Recomendación | Notas |
|-------|-----------|--------|---------------|-------|
| `documentos_entidades` | Medio | ✅🚀 | Migrar a DynamoDB | Metadatos de archivos |
| `documentos_procesados` | Medio | ✅🚀 | Migrar a DynamoDB | OCR y procesamiento |
| `carta_porte_documentos` | Medio | ✅🚀 | Migrar a DynamoDB | PDFs y XMLs |

---

## 10. Tablas Sin Uso (Candidatas a Eliminación)

| Tabla | Registros | Última Modificación | Recomendación |
|-------|-----------|---------------------|---------------|
| `metricas_conductor` | 0 | Nunca | ❌ Eliminar |
| `metricas_tiempo_real` | 0 | Nunca | ⚠️ Evaluar propósito |
| `dashboard_cache` | 0 | Nunca | ⚠️ Evaluar propósito |
| `permisos_semarnat` | 0 | Nunca | 🔄 Embed en vehículos |

---

## Resumen de Acciones

| Acción | Cantidad | Tablas |
|--------|----------|--------|
| ✅ Mantener en PostgreSQL | 20 | Catálogos + auth + config global |
| 🚀 Migrar a DynamoDB | 40 | Datos de usuario |
| 🔄 Consolidar | 20 | Auditoría, logs, favoritos, calendario |
| ⚠️ Revisar | 8 | Tablas vacías o duplicadas |
| ❌ Eliminar | 4 | Sin uso confirmado |

### Resultado Final Esperado

- **PostgreSQL**: ~20 tablas (catálogos + auth)
- **DynamoDB**: 1 tabla single-design (~40 entidades)
- **Eliminadas**: ~4 tablas
- **Total reducción**: De 96 a ~60 entidades lógicas
