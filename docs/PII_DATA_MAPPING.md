# 📊 Mapeo de Datos Personales (PII) - ISO 27701

**Última actualización**: 2025-01-10  
**Responsable**: Equipo de Privacidad y Cumplimiento  
**Controles**: ISO 27701:2019, GDPR, LFPDPPP (México)

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Clasificación de Datos](#clasificación-de-datos)
3. [Inventario de Tablas con PII](#inventario-de-tablas-con-pii)
4. [Base Legal para Procesamiento](#base-legal-para-procesamiento)
5. [Periodo de Retención](#periodo-de-retención)
6. [Transferencias Internacionales](#transferencias-internacionales)

---

## 🎯 Resumen Ejecutivo

Este documento mapea todos los **Datos de Identificación Personal (PII)** almacenados en la plataforma, clasificados según:

- **GDPR** (Reglamento General de Protección de Datos - UE)
- **LFPDPPP** (Ley Federal de Protección de Datos Personales en Posesión de Particulares - México)
- **ISO 27701:2019** (Sistema de Gestión de Información de Privacidad)

### Estadísticas del Sistema

| Métrica | Valor |
|---------|-------|
| **Tablas con PII** | 10 tablas principales |
| **Categorías de datos** | 4 categorías (A, B, C, D) |
| **Datos sensibles** | Licencias, certificados, coordenadas GPS |
| **Periodo máximo de retención** | 10 años (Cartas Porte SAT) |
| **Usuarios con datos** | Todos los usuarios registrados |

---

## 🏷️ Clasificación de Datos

### Categoría A: Identificación Directa
**Nivel de riesgo**: 🔴 ALTO  
**Base legal**: Consentimiento + Ejecución de contrato  
**GDPR Art.**: 6(1)(a), 6(1)(b)

| Dato | Descripción | Tablas | Sensibilidad |
|------|-------------|--------|--------------|
| **RFC** | Registro Federal de Contribuyentes | `profiles`, `conductores`, `socios`, `ubicaciones`, `figuras` | Alta |
| **CURP** | Clave Única de Registro de Población | `conductores`, `figuras` | Alta |
| **Nombre completo** | Nombre y apellidos | `profiles`, `conductores`, `socios`, `figuras` | Media |
| **Email** | Correo electrónico | `profiles`, `conductores`, `socios` | Media |
| **Teléfono** | Número telefónico | `profiles`, `conductores`, `socios` | Media |

### Categoría B: Datos de Contacto y Ubicación
**Nivel de riesgo**: 🟡 MEDIO  
**Base legal**: Ejecución de contrato + Interés legítimo  
**GDPR Art.**: 6(1)(b), 6(1)(f)

| Dato | Descripción | Tablas | Sensibilidad |
|------|-------------|--------|--------------|
| **Dirección física** | Domicilio completo | `profiles`, `conductores`, `socios`, `ubicaciones`, `figuras` | Media |
| **Código postal** | CP de ubicación | `ubicaciones`, `codigos_postales_mexico` | Baja |
| **Coordenadas GPS** | Latitud/Longitud | `ubicaciones`, `eventos_viaje` | Media-Alta |
| **Ciudad/Estado** | Localización geográfica | `ubicaciones`, `conductores`, `socios` | Baja |

### Categoría C: Datos Biométricos y Sensibles
**Nivel de riesgo**: 🔴 MUY ALTO  
**Base legal**: Consentimiento explícito  
**GDPR Art.**: 9 (Datos sensibles)  
**LFPDPPP**: Datos sensibles (Art. 3)

| Dato | Descripción | Tablas | Cifrado |
|------|-------------|--------|---------|
| **Foto de licencia** | Imagen de licencia de conducir | `conductores` (URL), `certificados_cifrados` (cifrado) | ✅ Recomendado |
| **Número de licencia** | Licencia de conducir | `conductores`, `figuras` | ❌ Texto plano |
| **Firma digital** | Firma del usuario | `certificados_digitales` | ✅ Cifrado (PKI) |
| **Certificados digitales** | .cer, .key del SAT | `certificados_digitales`, `certificados_cifrados` | ✅ Cifrado |

### Categoría D: Datos de Actividad y Logs
**Nivel de riesgo**: 🟢 BAJO-MEDIO  
**Base legal**: Interés legítimo (seguridad)  
**GDPR Art.**: 6(1)(f)

| Dato | Descripción | Tablas | Retención |
|------|-------------|--------|-----------|
| **IP Address** | Dirección IP de conexión | `security_audit_log`, `user_consents` | 90 días |
| **User Agent** | Navegador y dispositivo | `security_audit_log`, `user_consents` | 90 días |
| **Event data** | Eventos de seguridad | `security_audit_log` | 7 años |
| **Timestamps** | Fecha/hora de acciones | Todas las tablas | Variable |
| **Rate limit logs** | Intentos de acceso | `rate_limit_log` | 90 días |

---

## 📊 Inventario de Tablas con PII

### 1. `profiles` (Tabla Central)
**PII almacenada**:
- ✅ Nombre completo
- ✅ RFC
- ✅ Email
- ✅ Teléfono
- ✅ Dirección
- ✅ Foto de perfil (URL)

**Usuarios afectados**: Todos  
**Base legal**: Ejecución de contrato (GDPR 6(1)(b))  
**Retención**: Mientras la cuenta esté activa + 2 años

### 2. `conductores`
**PII almacenada**:
- ✅ Nombre completo
- ✅ RFC
- ✅ CURP
- ✅ Teléfono
- ✅ Email
- ✅ Domicilio
- ✅ Foto de licencia
- ✅ Número de licencia
- ✅ Fecha de nacimiento (implícita en CURP)

**Usuarios afectados**: Transportistas  
**Base legal**: Ejecución de contrato + Cumplimiento legal (SAT)  
**Retención**: 3 años tras última actividad

### 3. `socios`
**PII almacenada**:
- ✅ Razón social / Nombre
- ✅ RFC
- ✅ Teléfono
- ✅ Email
- ✅ Dirección fiscal
- ✅ Dirección física

**Usuarios afectados**: Socios comerciales  
**Base legal**: Ejecución de contrato + Cumplimiento fiscal  
**Retención**: 10 años (requisito SAT)

### 4. `cartas_porte`
**PII almacenada** (indirecta):
- ✅ Relaciones con conductores, vehículos, socios
- ✅ Datos de transporte (rutas, mercancías)

**Usuarios afectados**: Todos los emisores  
**Base legal**: Cumplimiento legal (SAT - Carta Porte 3.1)  
**Retención**: 10 años (obligatorio SAT)

### 5. `ubicaciones`
**PII almacenada**:
- ✅ RFC remitente/destinatario
- ✅ Coordenadas GPS
- ✅ Dirección completa
- ✅ Código postal

**Usuarios afectados**: Emisores de cartas porte  
**Base legal**: Ejecución de contrato + Cumplimiento legal  
**Retención**: 10 años (vinculada a carta porte)

### 6. `figuras_transporte`
**PII almacenada**:
- ✅ Nombre
- ✅ RFC
- ✅ CURP
- ✅ Número de licencia
- ✅ Domicilio

**Usuarios afectados**: Operadores, transportistas  
**Base legal**: Cumplimiento legal (SAT)  
**Retención**: 10 años (requisito SAT)

### 7. `security_audit_log`
**PII almacenada**:
- ⚠️ User ID (referencia)
- ⚠️ IP Address
- ⚠️ User Agent
- ⚠️ Event data (puede contener PII)

**Usuarios afectados**: Todos  
**Base legal**: Interés legítimo (seguridad)  
**Retención**: 7 años + sanitización de IPs (90 días)

### 8. `rate_limit_log`
**PII almacenada**:
- ⚠️ Identifier (emails, IPs)
- ⚠️ Metadata

**Usuarios afectados**: Todos los que intentan acceder  
**Base legal**: Interés legítimo (prevención de abuso)  
**Retención**: 90 días

### 9. `notificaciones`
**PII almacenada**:
- ⚠️ User ID (referencia)
- ⚠️ Contenido del mensaje (puede tener nombres, datos)

**Usuarios afectados**: Todos  
**Base legal**: Ejecución de contrato  
**Retención**: 30 días

### 10. `vehiculos`
**PII almacenada** (indirecta):
- ⚠️ Relación con conductores (propietario)
- ✅ Placas (identificador indirecto)

**Usuarios afectados**: Transportistas  
**Base legal**: Ejecución de contrato  
**Retención**: Mientras esté activo + 3 años

---

## ⚖️ Base Legal para Procesamiento

### GDPR Art. 6 - Base legal para datos NO sensibles

| Base Legal | Descripción | Aplicación en el Sistema |
|------------|-------------|--------------------------|
| **6(1)(a) - Consentimiento** | Usuario acepta el procesamiento | Registro de cuenta, marketing |
| **6(1)(b) - Contrato** | Necesario para ejecutar el servicio | Emisión de Cartas Porte, gestión de viajes |
| **6(1)(c) - Obligación legal** | Cumplimiento de ley (SAT, IMSS) | Conservación de Cartas Porte por 10 años |
| **6(1)(f) - Interés legítimo** | Seguridad, prevención de fraude | Logs de auditoría, rate limiting |

### GDPR Art. 9 - Datos sensibles (biométricos)

| Dato Sensible | Base Legal Especial | Consentimiento Requerido |
|---------------|---------------------|--------------------------|
| Foto de licencia | Consentimiento explícito | ✅ Sí (checkbox específico) |
| Certificados digitales | Cumplimiento legal (SAT) | ⚠️ Implícito en uso del servicio |
| Coordenadas GPS | Interés legítimo + consentimiento | ✅ Sí (para tracking en tiempo real) |

### LFPDPPP (México) - Equivalencias

| GDPR | LFPDPPP | Aplicación |
|------|---------|------------|
| Art. 6 | Art. 8 | Principio de consentimiento |
| Art. 9 | Art. 3 (fracciones VI, VII) | Datos sensibles |
| Art. 17 | Art. 22 | Derecho de cancelación |
| Art. 20 | Art. 29 | Derecho de portabilidad |

---

## ⏳ Periodo de Retención por Tipo de Dato

| Tipo de Dato | Periodo | Justificación | Después de Retención |
|--------------|---------|---------------|----------------------|
| **Cartas Porte** | 10 años | Requisito SAT (Art. 30 CFF) | Archivo permanente (anonimizado) |
| **Datos de conductores** | Activo + 3 años | IMSS, relaciones laborales | Anonimización |
| **Logs de auditoría** | 7 años | ISO 27001, prevención de fraude | Conservación (sanitizado) |
| **Logs de rate limit** | 90 días | Interés legítimo corto plazo | Eliminación completa |
| **IPs en logs** | 90 días | GDPR minimización de datos | Sanitización (NULL) |
| **Notificaciones** | 30 días | No hay requisito legal | Eliminación completa |
| **Sesiones** | 90 días | Seguridad, prevención de hijacking | Eliminación completa |
| **Borradores** | 1 año | Conveniencia del usuario | Eliminación completa |

### Proceso de Retención Automatizado

```sql
-- Ejecutar mensualmente (job automatizado)
SELECT sanitize_pii_from_logs(); -- Sanitiza IPs y emails en logs >90 días
DELETE FROM notificaciones WHERE created_at < now() - interval '30 days';
DELETE FROM rate_limit_log WHERE created_at < now() - interval '90 days';
DELETE FROM borradores_carta_porte WHERE updated_at < now() - interval '1 year';
```

---

## 🌍 Transferencias Internacionales

### Proveedores Externos con Acceso a PII

| Proveedor | Servicio | Datos Compartidos | Ubicación | Base Legal |
|-----------|----------|-------------------|-----------|------------|
| **Supabase** | Base de datos y auth | Todos los datos de usuario | Estados Unidos | Cláusulas contractuales tipo (SCC) |
| **Mapbox** | Mapas | Coordenadas GPS | Estados Unidos | Consentimiento + Interés legítimo |
| **HERE Maps** | Ruteo comercial | Coordenadas GPS | Alemania (UE) | ✅ GDPR compliant |
| **Stripe** | Pagos | Email, nombre, datos de pago | Estados Unidos/UE | Privacy Shield (legacy), SCC |
| **Google Cloud** | Geocoding, OAuth | Email, coordenadas | Estados Unidos | SCC |
| **Conectia (PAC)** | Timbrado fiscal | RFC, datos de carta porte | México | ✅ Nacional |

### Medidas de Seguridad en Transferencias

1. **Cifrado en tránsito**: TLS 1.3 para todas las comunicaciones
2. **Cifrado en reposo**: AES-256 en Supabase
3. **Acceso mínimo necesario**: Cada proveedor solo recibe datos estrictamente necesarios
4. **Contratos DPA**: Data Processing Agreements con todos los proveedores
5. **Auditorías regulares**: Revisión trimestral de accesos

---

## 📝 Derechos ARCO (México) / GDPR

### Derechos del Usuario

| Derecho | GDPR | LFPDPPP | Implementación |
|---------|------|---------|----------------|
| **Acceso** | Art. 15 | Art. 23 | Función `exportar_datos_usuario()` |
| **Rectificación** | Art. 16 | Art. 24 | UI de perfil + API de actualización |
| **Cancelación** | Art. 17 | Art. 26 | Función `eliminar_datos_usuario()` |
| **Oposición** | Art. 21 | Art. 27 | Tabla `user_consents` |
| **Portabilidad** | Art. 20 | Art. 29 | Edge Function `/export-user-data` |

### Tiempo de Respuesta

- **GDPR**: 1 mes (puede extenderse a 3 meses)
- **LFPDPPP**: 20 días hábiles
- **Nuestro compromiso**: ⚡ Respuesta automatizada inmediata para exportación y eliminación

---

## 🔐 Medidas de Seguridad Implementadas

### Controles Técnicos

| Control | Implementación | ISO 27001 | Estado |
|---------|----------------|-----------|--------|
| **RLS (Row Level Security)** | Políticas en todas las tablas con PII | A.9.4.1 | ✅ Activo |
| **Cifrado en reposo** | AES-256 (Supabase nativo) | A.10.1.1 | ✅ Activo |
| **Cifrado en tránsito** | TLS 1.3 | A.10.1.1 | ✅ Activo |
| **Cifrado de certificados** | pgcrypto (AES-256) | A.10.1.2 | ✅ Implementado |
| **Pseudonimización** | Función `anonimizar_usuario()` | A.18.1.4 | ✅ Disponible |
| **Auditoría de accesos** | `security_audit_log` | A.12.4.1 | ✅ Activo |
| **Sanitización de logs** | `sanitize_pii_from_logs()` | A.18.1.3 | ✅ Automatizado |

### Controles Organizacionales

- ✅ Política de privacidad publicada
- ✅ Aviso de privacidad (México)
- ✅ DPO designado (opcional, recomendado)
- ✅ Capacitación anual del equipo
- ✅ Plan de respuesta a incidentes
- ✅ Auditorías trimestrales

---

## 📞 Contacto de Privacidad

**Responsable de Protección de Datos**  
Email: privacy@example.com  
Teléfono: +52 (55) XXXX-XXXX  
Horario: Lunes a Viernes, 9:00 - 18:00 CST

---

**Última revisión**: 2025-01-10  
**Próxima revisión**: 2025-04-10 (trimestral)  
**Aprobado por**: [Nombre del DPO / Responsable Legal]
