# Documentación: Proceso de Eliminación de Cuenta

## Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Flujo Completo del Proceso](#flujo-completo-del-proceso)
3. [Estados del Usuario](#estados-del-usuario)
4. [Qué Sucede con los Datos](#qué-sucede-con-los-datos)
5. [Consideraciones Técnicas](#consideraciones-técnicas)
6. [Comportamiento Post-Eliminación](#comportamiento-post-eliminación)
7. [Políticas Legales y Cumplimiento](#políticas-legales-y-cumplimiento)
8. [Recuperación y Cancelación](#recuperación-y-cancelación)

---

## Resumen Ejecutivo

Este documento detalla el proceso completo de eliminación de cuenta de usuario en la plataforma, incluyendo todos los aspectos técnicos, legales y de experiencia de usuario. El proceso implementa un sistema de **eliminación segura con periodo de gracia de 30 días** conforme a GDPR Art. 17 y LFPDPPP Art. 26.

---

## Flujo Completo del Proceso

### Paso 1: Solicitud Inicial
1. El usuario accede a su perfil → Pestaña "Privacidad"
2. En la sección "Eliminar Mi Cuenta", hace clic en el botón rojo "Eliminar Mi Cuenta"
3. Se presenta el primer diálogo de advertencia con información detallada

### Paso 2: Primera Confirmación (Advertencia)
**Contenido del diálogo:**
- ⚠️ Título: "¿Estás seguro de que deseas eliminar tu cuenta?"
- Descripción de la acción irreversible
- Lista de qué se eliminará:
  - Datos personales (nombre, RFC, teléfono, email)
  - Conductores, vehículos y socios (anonimizados)
  - Notificaciones y archivos temporales
- Lista de qué se conservará (por ley):
  - Cartas Porte emitidas (SAT: 10 años, anonimizadas)
  - Logs de auditoría (7 años, sin datos personales)
- Opciones: "Cancelar" o "Continuar"

### Paso 3: Segunda Confirmación (Verificación Final)
**Contenido del diálogo:**
- 🗑️ Título: "Confirmación Final"
- Checkbox obligatorio: "Confirmo que deseo eliminar mi cuenta permanentemente"
- Campo de contraseña: Requerido para verificar identidad
- Información del periodo de gracia de 30 días
- Opciones: "Atrás" o "Eliminar Mi Cuenta"

**Validaciones:**
- ✅ Checkbox debe estar marcado
- ✅ Contraseña debe ser ingresada
- ✅ Contraseña se valida contra el sistema de autenticación
- ❌ Si la contraseña es incorrecta → Error: "Contraseña incorrecta"

### Paso 4: Ejecución
1. Se llama a la función `eliminar_datos_usuario(user_id)` en la base de datos
2. Se ejecuta el proceso de anonimización
3. Se registra el evento en auditoría
4. Se muestra toast de confirmación
5. Después de 2 segundos:
   - Se cierra la sesión automáticamente
   - Se redirige a `/auth` (página de login)

---

## Estados del Usuario

### Estado 1: Usuario Activo
- **Descripción:** Usuario normal con cuenta activa
- **Acceso:** Completo a todas las funcionalidades
- **Duración:** Indefinida (hasta que solicite eliminación)

### Estado 2: Eliminación Programada (Periodo de Gracia)
- **Descripción:** Usuario ha solicitado eliminación, cuenta en periodo de gracia
- **Acceso:** Sesión cerrada, no puede iniciar sesión
- **Duración:** 30 días desde la solicitud
- **Campo en DB:** `usuarios.deleted_at` = NOW() + 30 días
- **Reversible:** ✅ Sí, contactando a arrebolcorporation@gmail.com

### Estado 3: Anonimizado (Eliminación Completada)
- **Descripción:** Datos personales completamente anonimizados
- **Acceso:** Ninguno, cuenta eliminada permanentemente
- **Duración:** Permanente
- **Reversible:** ❌ No, proceso irreversible
- **Datos en DB:** 
  - `nombre` → "Usuario Eliminado [random_hash]"
  - `email` → "deleted_[random_hash]@anonimizado.local"
  - `telefono` → NULL
  - `rfc` → "ANONIMIZADO"

---

## Qué Sucede con los Datos

### Datos que se ELIMINAN Inmediatamente (Anonimización)

#### Tabla: `profiles`
```sql
nombre → "Usuario Eliminado [hash]"
email → "deleted_[hash]@anonimizado.local"
telefono → NULL
rfc → "ANONIMIZADO"
empresa → "Empresa Eliminada"
```

#### Tabla: `usuarios`
```sql
nombre → "Usuario Eliminado [hash]"
email → "deleted_[hash]@anonimizado.local"
telefono → NULL
```

#### Tabla: `conductores`
```sql
nombre → "Usuario Eliminado [hash]"
licencia_numero → "ANON[hash]"
telefono → NULL
email → "deleted_[hash]@anonimizado.local"
direccion → "Dirección eliminada"
foto_licencia_url → NULL
```

#### Tabla: `security_audit_log`
```sql
ip_address → NULL
user_agent → NULL
event_data → event_data + {"anonymized": true, "anonymized_at": timestamp}
```

### Datos que se CONSERVAN (Por Requisitos Legales)

#### Cartas Porte (`cartas_porte`)
- **Motivo:** Obligación fiscal SAT - Art. 30 CFF
- **Periodo de conservación:** 10 años
- **Estado:** Anonimizadas (sin datos personales del usuario)
- **Estructura conservada:** Datos fiscales, timbrado, folios

#### Logs de Auditoría (`security_audit_log`)
- **Motivo:** Requisitos de seguridad ISO 27001
- **Periodo de conservación:** 7 años
- **Estado:** Sin PII (Personal Identifiable Information)
- **Contenido:** Tipos de eventos, timestamps, acciones del sistema

#### Registro de Eliminación (`data_deletion_audit`)
- **Motivo:** Auditoría de cumplimiento GDPR/LFPDPPP
- **Periodo de conservación:** Indefinido
- **Contenido:**
  - `user_id`: UUID del usuario
  - `status`: 'completed'
  - `deletion_completed_at`: Timestamp
  - `tables_affected`: JSON con tablas modificadas
  - `records_anonymized`: Cantidad de registros
  - `executed_by`: Usuario que ejecutó (puede ser el mismo usuario)

---

## Consideraciones Técnicas

### Función Principal: `eliminar_datos_usuario(UUID)`

**Ubicación:** `public.eliminar_datos_usuario`

**Tipo:** PostgreSQL Function - SECURITY DEFINER

**Flujo de ejecución:**
```sql
1. Verificar autorización (usuario propio o admin)
2. Crear registro en data_deletion_audit (status: 'in_progress')
3. Llamar a anonimizar_usuario(user_id)
   3.1. Generar identificadores anónimos
   3.2. Actualizar profiles
   3.3. Actualizar usuarios
   3.4. Actualizar conductores
   3.5. Sanitizar security_audit_log
4. Actualizar data_deletion_audit (status: 'completed')
5. Registrar en security_audit_log
6. Retornar resultado JSON
```

**Retorno exitoso:**
```json
{
  "success": true,
  "audit_id": "uuid",
  "message": "Solicitud de eliminación procesada. Los datos han sido anonimizados.",
  "grace_period_days": 30,
  "result": {
    "affected_tables": [
      {"table": "profiles", "records": 1},
      {"table": "conductores", "records": 3},
      ...
    ]
  }
}
```

### Seguridad Implementada

1. **Autenticación requerida:** Usuario debe estar autenticado
2. **Verificación de contraseña:** Contraseña validada antes de proceder
3. **Autorización:** Solo el usuario propietario o admin puede eliminar
4. **Auditoría completa:** Todos los eventos registrados
5. **Rate limiting:** Protección contra abuso (implementado en RLS)
6. **SECURITY DEFINER:** Función ejecutada con privilegios seguros

---

## Comportamiento Post-Eliminación

### ¿Qué ve el usuario después de eliminar su cuenta?

**Inmediatamente después:**
1. Toast de confirmación verde
2. Mensaje: "Tu cuenta ha sido programada para eliminación"
3. Descripción: "Tienes 30 días para cancelar..."
4. Después de 2 segundos → Cierre de sesión automático
5. Redirección a `/auth` (página de login)

### ¿Qué pasa si intenta volver a iniciar sesión?

**Comportamiento:**
- ❌ Login FALLARÁ
- **Motivo:** Email anonimizado a "deleted_[hash]@anonimizado.local"
- **Error mostrado:** "Credenciales inválidas" o "Usuario no encontrado"
- **Pantalla:** Formulario de login normal (sin mensaje especial)

**Explicación técnica:**
- El email real del usuario ya no existe en `auth.users`
- La autenticación busca por email → No encuentra coincidencia
- Sistema retorna error genérico por seguridad

### ¿Puede registrarse nuevamente con el mismo email?

**Respuesta:** ✅ SÍ (después de la eliminación completa)

**Escenarios:**

#### Escenario A: Durante el periodo de gracia (0-30 días)
- ❌ NO puede registrarse
- **Motivo:** Email aún existe en sistema pero anonimizado
- **Solución:** Debe esperar 30 días o cancelar la eliminación

#### Escenario B: Después del periodo de gracia (30+ días)
- ✅ SÍ puede registrarse
- **Proceso:** Sistema lo trata como usuario completamente nuevo
- **Datos:** Nueva cuenta sin relación con la anterior
- **Historial:** NO se recupera ningún dato de la cuenta anterior

**Flujo de re-registro:**
```
1. Usuario va a /auth/register
2. Ingresa el email que usó antes
3. Sistema valida email único
4. ✅ Registro exitoso
5. Nueva cuenta creada desde cero
6. Trial de 14 días asignado automáticamente
```

### ¿Se conservan datos si se re-registra?

**Respuesta:** ❌ NO

**Explicación:**
- Los datos fueron anonimizados → No hay forma de vincularlos
- El nuevo registro crea un UUID completamente diferente
- No existe relación técnica entre ambas cuentas
- Todas las cartas porte antiguas siguen anonimizadas

---

## Políticas Legales y Cumplimiento

### GDPR (Reglamento General de Protección de Datos - UE)

#### Art. 17 - Derecho de Supresión ("Derecho al Olvido")
- ✅ Usuario puede solicitar eliminación en cualquier momento
- ✅ Proceso automatizado y verificable
- ✅ Confirmación de eliminación proporcionada
- ✅ Excepciones legales documentadas (SAT, auditoría)

#### Art. 5(1)(e) - Limitación del Plazo de Conservación
- ✅ Datos personales no se conservan más tiempo del necesario
- ✅ PII eliminada de logs después de 90 días
- ✅ Datos fiscales conservados solo por obligación legal

#### Art. 15 - Derecho de Acceso
- ✅ Usuario puede exportar todos sus datos antes de eliminar
- ✅ Función `exportar_datos_usuario` disponible

### LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares - México)

#### Art. 26 - Derecho de Cancelación
- ✅ Usuario puede cancelar (eliminar) sus datos
- ✅ Proceso gratuito y accesible
- ✅ Plazos razonables (30 días de gracia)

#### Art. 23 - Derechos ARCO
- ✅ Acceso: Exportación de datos implementada
- ✅ Rectificación: Perfil editable
- ✅ Cancelación: Eliminación de cuenta
- ✅ Oposición: Usuario puede oponerse al tratamiento

### Obligaciones Fiscales (SAT - México)

#### Art. 30 CFF - Conservación de Comprobantes Fiscales
- ✅ Cartas Porte conservadas 10 años
- ✅ Datos anonimizados pero estructura fiscal intacta
- ✅ Cumplimiento con requisitos de timbrado y folios

---

## Recuperación y Cancelación

### Durante el Periodo de Gracia (30 días)

**¿Cómo cancelar la eliminación?**

**Método:**
1. Contactar a: **arrebolcorporation@gmail.com**
2. Asunto: "Cancelación de Eliminación de Cuenta"
3. Incluir:
   - Nombre completo
   - Email de la cuenta
   - RFC (si aplica)
   - Motivo de la solicitud

**Tiempo de respuesta:**
- Inmediato durante horario laboral (9am-6pm)
- Máximo 24 horas

**Proceso de recuperación:**
1. Verificación de identidad (puede requerir documento)
2. Admin ejecuta reversión manual en DB:
   ```sql
   UPDATE usuarios 
   SET deleted_at = NULL 
   WHERE id = 'user_uuid';
   ```
3. Se restaura acceso completo
4. Usuario notificado por email
5. Usuario puede iniciar sesión normalmente

### Después del Periodo de Gracia (30+ días)

**¿Se puede recuperar?**
- ❌ NO - Proceso irreversible
- Datos completamente anonimizados
- No hay backup de datos personales
- Sistema de recuperación no disponible

**Alternativa:**
- Usuario debe crear una cuenta nueva
- No se recuperan datos antiguos
- Trial de 14 días aplicable

---

## Búsqueda y Auditoría

### ¿Cómo buscar información de una eliminación?

#### Consulta SQL para verificar eliminación:
```sql
-- Verificar si usuario fue eliminado
SELECT * FROM data_deletion_audit 
WHERE user_id = 'user_uuid'
ORDER BY created_at DESC;

-- Ver detalles de anonimización
SELECT 
  audit_id,
  status,
  deletion_completed_at,
  tables_affected,
  records_anonymized
FROM data_deletion_audit 
WHERE user_id = 'user_uuid';

-- Verificar anonimización completa
SELECT * FROM verificar_eliminacion_completa('user_uuid');
```

#### Consulta para ver logs de seguridad:
```sql
SELECT 
  event_type,
  event_data,
  created_at
FROM security_audit_log 
WHERE user_id = 'user_uuid'
  AND event_type IN ('account_deletion_requested', 'user_deletion_completed')
ORDER BY created_at DESC;
```

### Herramientas de Auditoría

**Función disponible:** `verificar_eliminacion_completa(UUID)`

**Retorno:**
```json
{
  "user_id": "uuid",
  "is_fully_anonymized": true,
  "checks": {
    "profile_anonymized": true,
    "conductores_anonymized": true,
    "audit_record_exists": true
  },
  "verified_at": "timestamp"
}
```

---

## Mantenimiento y Tareas Automatizadas

### Tarea Cron: Sanitización de PII
- **Función:** `sanitize_pii_from_logs()`
- **Frecuencia:** Diaria
- **Objetivo:** Eliminar IPs y user agents de logs > 90 días

### Tarea Cron: Limpieza de Rate Limits
- **Objetivo:** Eliminar registros > 30 días
- **Tabla:** `rate_limit_log`

---

## Contacto y Soporte

### Responsable de Privacidad
- **Nombre:** Alan Soto
- **Email:** arrebolcorporation@gmail.com
- **Teléfono:** +52 55 1968 6023

### Tiempo de Respuesta
- **Cancelación de eliminación:** Inmediato - 24h
- **Consultas generales:** Máximo 20 días hábiles (conforme GDPR/LFPDPPP)
- **Emergencias:** Inmediato

---

## Resumen de Seguridad

✅ **Doble confirmación requerida**  
✅ **Verificación de contraseña obligatoria**  
✅ **Periodo de gracia de 30 días**  
✅ **Auditoría completa de todos los eventos**  
✅ **Cumplimiento GDPR + LFPDPPP**  
✅ **Conservación legal de datos fiscales**  
✅ **Anonimización irreversible después de 30 días**  
✅ **Re-registro permitido después de eliminación**  
✅ **Contacto directo para cancelar eliminación**  

---

**Última actualización:** 2025-11-11  
**Versión del documento:** 1.0  
**Mantenedor:** Equipo de Seguridad y Cumplimiento
