# Matriz de Decisión por Tabla

## Criterios de Evaluación

| Criterio | Peso | Descripción |
|----------|------|-------------|
| **Criticidad** | 30% | Impacto en operación del negocio |
| **Volumen** | 20% | Cantidad de registros y crecimiento |
| **Complejidad** | 20% | Dificultad de migración |
| **Dependencias** | 15% | Relaciones con otras tablas |
| **Beneficio** | 15% | Ganancia post-migración |

### Escala de Puntuación

- **5**: Muy Alto / Crítico
- **4**: Alto
- **3**: Medio
- **2**: Bajo
- **1**: Muy Bajo / Insignificante

---

## 1. Tablas de Negocio Principal

| Tabla | Criticidad | Volumen | Complejidad | Dependencias | Beneficio | Score | Decisión |
|-------|------------|---------|-------------|--------------|-----------|-------|----------|
| `viajes` | 5 | 5 | 3 | 5 | 5 | 4.6 | 🚀 DynamoDB |
| `cartas_porte` | 5 | 4 | 4 | 4 | 5 | 4.5 | 🚀 DynamoDB |
| `conductores` | 5 | 3 | 2 | 4 | 4 | 3.8 | 🚀 DynamoDB |
| `vehiculos` | 5 | 3 | 2 | 4 | 4 | 3.8 | 🚀 DynamoDB |
| `facturas` | 5 | 4 | 3 | 3 | 4 | 4.0 | 🚀 DynamoDB |
| `cotizaciones` | 4 | 3 | 2 | 3 | 4 | 3.3 | 🚀 DynamoDB |
| `remolques` | 4 | 2 | 2 | 3 | 3 | 2.9 | 🚀 DynamoDB |
| `clientes_proveedores` | 4 | 3 | 2 | 3 | 4 | 3.3 | 🚀 DynamoDB |

### Justificación Tablas de Negocio

1. **viajes**: Tabla más consultada, patrón de acceso predecible por `user_id`
2. **cartas_porte**: Documento complejo ideal para NoSQL, elimina JOINs costosos
3. **conductores/vehiculos**: Datos por usuario, baja cardinalidad por tenant
4. **facturas**: Alto volumen, acceso secuencial por fecha

---

## 2. Tablas Relacionadas a Carta Porte

| Tabla | Criticidad | Volumen | Complejidad | Dependencias | Beneficio | Score | Decisión |
|-------|------------|---------|-------------|--------------|-----------|-------|----------|
| `ubicaciones` | 5 | 5 | 2 | 5 | 5 | 4.5 | 🔄 Embed en carta |
| `mercancias` | 5 | 5 | 2 | 5 | 5 | 4.5 | 🔄 Embed en carta |
| `figuras_transporte` | 4 | 4 | 2 | 4 | 4 | 3.6 | 🔄 Embed en carta |
| `autotransporte` | 4 | 4 | 2 | 4 | 4 | 3.6 | 🔄 Embed en carta |
| `cantidad_transporta` | 3 | 4 | 1 | 3 | 4 | 3.0 | 🔄 Embed en mercancías |
| `documentacion_aduanera` | 3 | 2 | 1 | 3 | 3 | 2.4 | 🔄 Embed en mercancías |
| `borradores_carta_porte` | 4 | 3 | 2 | 2 | 4 | 3.1 | 🚀 DynamoDB |

### Justificación Tablas Carta Porte

- **Embed vs Separate**: Ubicaciones, mercancías y figuras siempre se leen con la carta porte
- **Reducción JOINs**: De 6 JOINs a 1 GetItem
- **Consistencia**: Documento atómico en DynamoDB

---

## 3. Catálogos SAT

| Tabla | Criticidad | Volumen | Complejidad | Dependencias | Beneficio | Score | Decisión |
|-------|------------|---------|-------------|--------------|-----------|-------|----------|
| `cat_estado` | 5 | 1 | 1 | 5 | 1 | 2.8 | ✅ PostgreSQL |
| `cat_municipio` | 5 | 2 | 1 | 5 | 1 | 3.0 | ✅ PostgreSQL |
| `cat_localidad` | 4 | 3 | 1 | 4 | 1 | 2.7 | ✅ PostgreSQL |
| `cat_colonia` | 4 | 5 | 1 | 4 | 1 | 3.1 | ✅ PostgreSQL |
| `cat_codigo_postal` | 5 | 4 | 1 | 5 | 1 | 3.3 | ✅ PostgreSQL |
| `cat_clave_prod_serv_cp` | 5 | 5 | 1 | 3 | 1 | 3.1 | ✅ PostgreSQL |
| `cat_material_peligroso` | 4 | 4 | 1 | 2 | 1 | 2.5 | ✅ PostgreSQL |
| `cat_clave_unidad` | 5 | 3 | 1 | 3 | 1 | 2.7 | ✅ PostgreSQL |
| `cat_config_autotransporte` | 4 | 1 | 1 | 3 | 1 | 2.1 | ✅ PostgreSQL |
| `cat_tipo_permiso` | 4 | 1 | 1 | 3 | 1 | 2.1 | ✅ PostgreSQL |
| `cat_subtipo_remolque` | 3 | 1 | 1 | 2 | 1 | 1.7 | ✅ PostgreSQL |
| `cat_figura_transporte` | 3 | 1 | 1 | 2 | 1 | 1.7 | ✅ PostgreSQL |
| `cat_tipo_embalaje` | 3 | 1 | 1 | 2 | 1 | 1.7 | ✅ PostgreSQL |
| `cat_pais` | 4 | 1 | 1 | 3 | 1 | 2.1 | ✅ PostgreSQL |
| `cat_via_entrada_salida` | 2 | 1 | 1 | 2 | 1 | 1.4 | ✅ PostgreSQL |
| `cat_registro_istmo` | 2 | 1 | 1 | 1 | 1 | 1.2 | ✅ PostgreSQL |
| `codigos_postales_mexico` | 5 | 5 | 1 | 4 | 1 | 3.3 | ✅ PostgreSQL |

### Justificación Catálogos

1. **Read-only**: Nunca modificados por usuarios
2. **Búsquedas complejas**: LIKE, filtros combinados, paginación
3. **Alto volumen fijo**: >200K registros que no crecen
4. **JOINs necesarios**: Validaciones cruzadas entre catálogos
5. **Sin beneficio DynamoDB**: No hay ganancia en latencia o costo

---

## 4. Gestión de Usuarios

| Tabla | Criticidad | Volumen | Complejidad | Dependencias | Beneficio | Score | Decisión |
|-------|------------|---------|-------------|--------------|-----------|-------|----------|
| `profiles` | 5 | 3 | 4 | 5 | 2 | 3.8 | ✅ Supabase |
| `user_roles` | 5 | 2 | 3 | 4 | 2 | 3.3 | ✅ Supabase |
| `subscriptions` | 5 | 3 | 4 | 4 | 2 | 3.7 | ✅ Supabase |
| `creditos_usuarios` | 5 | 3 | 3 | 3 | 3 | 3.5 | ✅ Supabase |
| `transacciones_creditos` | 4 | 5 | 2 | 2 | 4 | 3.5 | 🚀 DynamoDB |
| `configuracion_empresa` | 5 | 3 | 2 | 2 | 4 | 3.4 | 🚀 DynamoDB |
| `certificados_digitales` | 5 | 2 | 2 | 2 | 3 | 3.0 | 🚀 DynamoDB |
| `bloqueos_usuario` | 5 | 1 | 2 | 2 | 2 | 2.6 | ✅ Supabase |

### Justificación Usuarios

- **Supabase Auth**: profiles, roles, subscriptions integrados con auth.users
- **DynamoDB**: configuracion_empresa tiene patrón de acceso simple por user_id
- **Transacciones**: Alto volumen, append-only, ideal para DynamoDB

---

## 5. Auditoría y Logs

| Tabla | Criticidad | Volumen | Complejidad | Dependencias | Beneficio | Score | Decisión |
|-------|------------|---------|-------------|--------------|-----------|-------|----------|
| `audit_log` | 4 | 5 | 2 | 1 | 4 | 3.3 | 🔄 Consolidar |
| `security_audit_log` | 5 | 4 | 2 | 1 | 4 | 3.3 | 🔄 Consolidar |
| `timbrado_logs` | 4 | 5 | 2 | 2 | 4 | 3.5 | 🔄 Consolidar |
| `login_audit_log` | 4 | 4 | 2 | 1 | 4 | 3.1 | 🔄 Consolidar |
| `data_deletion_audit` | 5 | 2 | 2 | 1 | 3 | 2.7 | 🔄 Consolidar |
| `sw_api_logs` | 3 | 5 | 2 | 1 | 4 | 3.0 | 🔄 Consolidar |
| `webhook_logs` | 3 | 4 | 2 | 1 | 4 | 2.8 | 🔄 Consolidar |
| `operation_logs` | 3 | 4 | 2 | 1 | 3 | 2.6 | 🔄 Consolidar |

### Justificación Auditoría

- **5 tablas → 1 tabla**: `audit_events` con campo `event_type`
- **4 tablas → 1 tabla**: `operation_logs` con campo `log_type`
- **Retención**: Facilita políticas de limpieza por tipo

---

## 6. Tablas Auxiliares

| Tabla | Criticidad | Volumen | Complejidad | Dependencias | Beneficio | Score | Decisión |
|-------|------------|---------|-------------|--------------|-----------|-------|----------|
| `ubicaciones_frecuentes` | 3 | 3 | 1 | 1 | 4 | 2.4 | 🔄 Consolidar |
| `mercancias_frecuentes` | 3 | 3 | 1 | 1 | 4 | 2.4 | 🔄 Consolidar |
| `clientes_frecuentes` | 2 | 2 | 1 | 1 | 4 | 2.0 | 🔄 Consolidar |
| `productos_frecuentes` | 2 | 2 | 1 | 1 | 4 | 2.0 | 🔄 Consolidar |
| `calendar_events` | 3 | 2 | 2 | 2 | 3 | 2.4 | ✅ Mantener |
| `eventos_calendario` | 3 | 2 | 2 | 3 | 3 | 2.6 | 🔄 Consolidar |
| `recordatorios` | 2 | 2 | 1 | 2 | 3 | 2.0 | 🔄 Consolidar |
| `mantenimientos` | 4 | 3 | 2 | 3 | 4 | 3.3 | 🚀 DynamoDB |
| `documentos_entidades` | 4 | 3 | 2 | 2 | 4 | 3.1 | 🚀 DynamoDB |
| `documentos_procesados` | 3 | 3 | 2 | 2 | 3 | 2.6 | 🚀 DynamoDB |

---

## 7. Tablas Sin Uso / Candidatas a Eliminación

| Tabla | Registros | Última Actividad | Dependencias | Decisión |
|-------|-----------|------------------|--------------|----------|
| `metricas_conductor` | 0 | Nunca | 0 | ❌ Eliminar |
| `metricas_tiempo_real` | 0 | Nunca | 0 | ⚠️ Evaluar |
| `dashboard_cache` | 0 | Nunca | 0 | ⚠️ Evaluar |
| `permisos_semarnat` | 0 | Nunca | 0 | 🔄 Embed en vehículos |
| `certificados_activos` | Bajo | Activa | 1 | 🔄 Campo en certificados |
| `subscription_history` | Bajo | Activa | 1 | 🔄 JSONB en subscriptions |
| `usuarios` | Medio | Activa | 2 | ⚠️ Revisar duplicación |

---

## Resumen de Decisiones

### Por Categoría

| Decisión | Cantidad | Tablas |
|----------|----------|--------|
| 🚀 Migrar a DynamoDB | 25 | Negocio + documentos + transacciones |
| ✅ Mantener PostgreSQL | 22 | Catálogos SAT + auth + suscripciones |
| 🔄 Consolidar | 20 | Auditoría + logs + favoritos + calendario |
| ⚠️ Revisar | 5 | Tablas vacías o duplicadas |
| ❌ Eliminar | 4 | Sin uso confirmado |

### Prioridad de Migración

| Prioridad | Tablas | Justificación |
|-----------|--------|---------------|
| **P0 - Crítica** | viajes, cartas_porte, conductores, vehiculos | Core del negocio |
| **P1 - Alta** | facturas, cotizaciones, clientes_proveedores | Operación diaria |
| **P2 - Media** | mantenimientos, documentos, favoritos | Funcionalidad auxiliar |
| **P3 - Baja** | analíticas, reportes, calendario | Nice-to-have |

### Esfuerzo Estimado

| Fase | Tablas | Esfuerzo | Duración |
|------|--------|----------|----------|
| Consolidación PostgreSQL | 20 | Medio | 2 semanas |
| Migración DynamoDB P0 | 8 | Alto | 4 semanas |
| Migración DynamoDB P1 | 6 | Medio | 2 semanas |
| Migración DynamoDB P2 | 6 | Bajo | 1 semana |
| Migración DynamoDB P3 | 5 | Bajo | 1 semana |
| Limpieza final | 9 | Bajo | 1 semana |
| **TOTAL** | | | **11 semanas** |
