# 📅 Política de Retención de Datos - ISO 27701

**Fecha de vigencia**: 2025-01-10  
**Versión**: 1.0  
**Responsable**: Equipo de Cumplimiento y Privacidad  
**Controles**: ISO 27701:2019, GDPR Art. 5(1)(e), LFPDPPP Art. 11

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Principios de Retención](#principios-de-retención)
3. [Periodos de Retención por Categoría](#periodos-de-retención-por-categoría)
4. [Proceso de Eliminación](#proceso-de-eliminación)
5. [Excepciones y Conservación Legal](#excepciones-y-conservación-legal)
6. [Auditoría y Cumplimiento](#auditoría-y-cumplimiento)

---

## 🎯 Introducción

Esta política define los **periodos máximos de retención** de datos personales almacenados en la plataforma, en cumplimiento con:

- **GDPR Art. 5(1)(e)**: Principio de limitación del plazo de conservación
- **LFPDPPP Art. 11**: Principio de temporalidad (México)
- **ISO 27701:2019 A.7.4.1**: Límites de retención de información de identificación personal

### Objetivos

1. ✅ **Minimizar datos**: Conservar solo lo necesario
2. ✅ **Cumplimiento legal**: Respetar obligaciones fiscales y laborales
3. ✅ **Derechos de usuarios**: Facilitar el derecho al olvido
4. ✅ **Seguridad**: Reducir superficie de ataque eliminando datos obsoletos

---

## ⚖️ Principios de Retención

### 1. Necesidad y Proporcionalidad
> "Los datos personales solo se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recabados."

### 2. Jerarquía de Retención
1. **Obligación legal** → Mayor prioridad (ej. SAT: 10 años)
2. **Interés legítimo** → Seguridad, prevención de fraude (ej. logs: 7 años)
3. **Conveniencia del usuario** → Menor prioridad (ej. borradores: 1 año)

### 3. Minimización de Datos
- Después del periodo de retención: **Eliminación o anonimización**
- Datos sensibles: **Periodo de retención mínimo posible**
- Logs: **Sanitización de PII** tras 90 días

---

## 📊 Periodos de Retención por Categoría

### Categoría 1: Datos de Cuenta Activa
**Mientras la cuenta esté activa + periodo adicional**

| Dato | Periodo Activo | Periodo Inactivo | Total Máximo | Acción Final |
|------|----------------|------------------|--------------|--------------|
| Perfil de usuario | Ilimitado | +2 años | N/A | Anonimización |
| Preferencias | Ilimitado | +6 meses | N/A | Eliminación |
| Foto de perfil | Ilimitado | +6 meses | N/A | Eliminación |
| Sesiones activas | 90 días | Inmediata | 90 días | Eliminación |

**Base legal**: GDPR Art. 6(1)(b) - Ejecución de contrato

---

### Categoría 2: Datos de Transporte (Cartas Porte)
**Periodo máximo por obligación SAT**

| Dato | Periodo | Justificación Legal | Después de Retención |
|------|---------|---------------------|----------------------|
| **Cartas Porte emitidas** | **10 años** | Art. 30 CFF (Código Fiscal de la Federación) | Archivo permanente anonimizado |
| **Ubicaciones de transporte** | **10 años** | Vinculadas a Carta Porte | Anonimización de RFC |
| **Mercancías transportadas** | **10 años** | Vinculadas a Carta Porte | Conservación (datos no personales) |
| **Figuras de transporte** | **10 años** | Requisito SAT (Carta Porte 3.1) | Anonimización de CURP/RFC |

**Base legal**: GDPR Art. 6(1)(c) - Obligación legal + LFPDPPP Art. 10

**Proceso especial**:
```sql
-- Después de 10 años: Anonimizar pero conservar
UPDATE cartas_porte
SET 
  usuario_id = NULL, -- Desvincular de usuario
  datos_anonimizados = true
WHERE fecha_emision < now() - interval '10 years';
```

---

### Categoría 3: Datos de Conductores y Vehículos
**Periodo post-actividad**

| Dato | Periodo Activo | Periodo Inactivo | Acción Final |
|------|----------------|------------------|--------------|
| **Conductores activos** | Ilimitado | +3 años | Anonimización |
| **Vehículos en servicio** | Ilimitado | +3 años | Anonimización |
| **Licencias de conducir** | Hasta vencimiento | +3 años | Eliminación |
| **Certificados de aptitud** | Hasta vencimiento | +1 año | Eliminación |

**Criterio de "inactividad"**: Sin viajes asignados por 12 meses consecutivos

**Base legal**: Relaciones laborales (IMSS), prevención de disputas

---

### Categoría 4: Datos de Socios Comerciales
**Periodo por obligación fiscal**

| Dato | Periodo | Justificación | Después de Retención |
|------|---------|---------------|----------------------|
| **Socios activos** | Ilimitado | Relación contractual | Anonimización |
| **Socios inactivos** | +10 años | Obligación fiscal (facturas) | Anonimización |
| **Contratos** | 10 años | Art. 30 CFF | Archivo permanente |
| **Historial de transacciones** | 10 años | Art. 30 CFF | Anonimización de RFC |

---

### Categoría 5: Logs y Datos de Seguridad
**Periodo por seguridad e investigación**

| Tipo de Log | Periodo Total | Sanitización PII | Después de Retención |
|-------------|---------------|------------------|----------------------|
| **Logs de auditoría** | 7 años | A los 90 días (IPs) | Conservación (anonimizado) |
| **Logs de rate limiting** | 90 días | No aplica | Eliminación completa |
| **Logs de errores** | 1 año | Inmediata (sin PII) | Eliminación completa |
| **Eventos de seguridad** | 7 años | A los 90 días | Conservación (anonimizado) |

**Sanitización de `security_audit_log`** (automática):
```sql
-- Ejecutar mensualmente
SELECT sanitize_pii_from_logs();
-- Resultado: IPs → NULL, Emails → REDACTED_[hash]
```

**Base legal**: GDPR Art. 6(1)(f) - Interés legítimo (seguridad)

---

### Categoría 6: Notificaciones y Comunicaciones
**Periodo corto (no hay requisito legal)**

| Dato | Periodo | Acción Final |
|------|---------|--------------|
| **Notificaciones del sistema** | 30 días | Eliminación completa |
| **Mensajes de soporte** | 2 años | Anonimización |
| **Emails enviados (logs)** | 90 días | Eliminación completa |

**Job automatizado**:
```sql
DELETE FROM notificaciones WHERE created_at < now() - interval '30 days';
```

---

### Categoría 7: Borradores y Datos Temporales
**Periodo de conveniencia del usuario**

| Dato | Periodo | Acción Final |
|------|---------|--------------|
| **Borradores de Carta Porte** | 1 año sin modificar | Eliminación completa |
| **Archivos subidos sin procesar** | 30 días | Eliminación completa |
| **Caché de geocodificación** | 90 días | Eliminación completa |

---

### Categoría 8: Datos Financieros
**Periodo por obligación fiscal y bancaria**

| Dato | Periodo | Justificación | Acción Final |
|------|---------|---------------|--------------|
| **Transacciones de pago** | 7 años | Art. 30 CFF + auditorías | Anonimización |
| **Facturas emitidas** | 10 años | Art. 30 CFF | Conservación |
| **Datos de tarjetas** | 0 días | PCI-DSS | ❌ Nunca almacenar |

**Importante**: Datos de tarjeta se procesan vía Stripe (nunca almacenados localmente)

---

## 🗑️ Proceso de Eliminación

### Fase 1: Soft Delete (Marca de Eliminación)
**Duración**: 30 días (periodo de gracia)

```sql
-- Usuario solicita eliminación
UPDATE profiles
SET 
  deletion_requested_at = now(),
  deletion_scheduled_for = now() + interval '30 days'
WHERE id = user_id;
```

**Durante este periodo**:
- ✅ Usuario puede cancelar la solicitud
- ✅ Datos siguen disponibles (congelados)
- ⚠️ Usuario no puede crear nuevos datos

### Fase 2: Anonimización
**Después de 30 días**

```sql
SELECT anonimizar_usuario(user_id);
-- Resultado:
-- - Nombre → USUARIO_ELIMINADO_[hash]
-- - RFC → NULL
-- - Email → NULL
-- - Teléfono → NULL
-- - Direcciones → NULL
```

**Conserva**:
- ✅ Integridad referencial (IDs de relaciones)
- ✅ Datos agregados para análisis (sin PII)
- ✅ Cartas Porte (por requisito SAT)

### Fase 3: Hard Delete (Opcional)
**Solo para datos sin requisito legal**

```sql
SELECT eliminar_datos_usuario(user_id);
-- Elimina completamente:
-- - Notificaciones
-- - Borradores
-- - Logs de rate limiting
-- - Sesiones
```

---

## 🔒 Excepciones y Conservación Legal

### Excepciones a la Eliminación

| Situación | Periodo Extendido | Justificación |
|-----------|-------------------|---------------|
| **Litigio pendiente** | Hasta resolución + 2 años | Defensa legal |
| **Investigación fiscal (SAT)** | Hasta resolución + 5 años | Cooperación con autoridad |
| **Fraude detectado** | Hasta resolución + 10 años | Prevención de reincidencia |
| **Orden judicial** | Según orden | Obligación legal |

### Notificación de Conservación Extendida

```sql
INSERT INTO notificaciones (user_id, tipo, titulo, mensaje, urgente)
VALUES (
  user_id,
  'warning',
  'Conservación de datos extendida',
  'Debido a [motivo legal], tus datos serán conservados hasta [fecha]',
  true
);
```

---

## 📊 Auditoría y Cumplimiento

### Verificación de Retención (Trimestral)

```sql
-- Reporte de datos vencidos que aún no se han eliminado
SELECT 
  table_name,
  COUNT(*) as records_overdue,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM (
  SELECT 'profiles' as table_name, created_at FROM profiles WHERE deletion_scheduled_for < now()
  UNION ALL
  SELECT 'conductores', created_at FROM conductores WHERE activo = false AND updated_at < now() - interval '3 years'
  UNION ALL
  SELECT 'notificaciones', created_at FROM notificaciones WHERE created_at < now() - interval '30 days'
) AS overdue_records
GROUP BY table_name;
```

### Jobs Automatizados

| Job | Frecuencia | Función |
|-----|------------|---------|
| Sanitizar logs | Mensual | `sanitize_pii_from_logs()` |
| Eliminar notificaciones | Diaria | `DELETE FROM notificaciones WHERE created_at < ...` |
| Eliminar borradores | Semanal | `DELETE FROM borradores_carta_porte WHERE ...` |
| Auditoría de retención | Trimestral | Reporte de datos vencidos |

### Tabla de Auditoría

```sql
SELECT * FROM data_deletion_audit
WHERE status = 'completed'
ORDER BY completed_at DESC
LIMIT 100;
```

---

## 📞 Solicitudes de Usuario

### Derecho al Olvido (GDPR Art. 17)

**Usuario puede solicitar eliminación**:
1. Desde UI: Configuración → Privacidad → Eliminar mi cuenta
2. Por email: privacy@example.com
3. Automático: Función `eliminar_datos_usuario()`

**Respuesta**: Inmediata (automatizada) + confirmación por email

### Excepciones al Derecho al Olvido

No se puede eliminar si:
- ❌ Hay obligación legal (Cartas Porte SAT: 10 años)
- ❌ Hay litigio pendiente
- ❌ Se necesita para defensa legal

**En estos casos**: Se anonimiza en lugar de eliminar

---

## 📚 Referencias Legales

- **Código Fiscal de la Federación (México)**: Art. 30 - Retención de comprobantes fiscales por 10 años
- **GDPR**: Art. 5(1)(e) - Limitación del plazo de conservación
- **LFPDPPP**: Art. 11 - Principio de temporalidad
- **ISO 27001**: A.18.1.4 - Privacidad y protección de información de identificación personal
- **ISO 27701**: A.7.4.1 - Límites de retención de información de identificación personal

---

**Última revisión**: 2025-01-10  
**Próxima revisión**: 2025-04-10 (trimestral)  
**Aprobado por**: [Nombre del Responsable de Privacidad]
