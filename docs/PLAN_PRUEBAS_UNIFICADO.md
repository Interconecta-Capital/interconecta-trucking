
# Plan de Pruebas Exhaustivas - Sistema Unificado de Permisos
**Versión:** 1.0  
**Fecha:** 2025-01-21  
**Objetivo:** Certificar que useUnifiedPermissions implementa correctamente las 4 Reglas de Negocio

---

## ESCENARIO A: SUPERUSUARIO - Acceso Total e Incondicional

### Configuración Previa
- Usuario con `is_superuser: true` en auth.users.raw_user_meta_data
- Cualquier estado de suscripción (irrelevante para superusers)

### Pasos de Prueba
1. **Login como Superuser**
   - Iniciar sesión con credenciales de superusuario
   - Navegar al dashboard principal

2. **Verificar Badge de Superuser**
   - Observar el componente PlanBadge en la interfaz
   - Verificar que muestre "Acceso de Superusuario" con ícono Crown

3. **Verificar Notificaciones Unificadas**
   - Confirmar que NO aparezcan notificaciones de límites o trial
   - Solo debe aparecer SuperuserAlert con mensaje "Modo Superuser"

4. **Probar Creación Ilimitada - Conductores**
   - Ir a /conductores
   - Intentar crear 50+ conductores consecutivos
   - Verificar que NUNCA aparezca mensaje de límite

5. **Probar Creación Ilimitada - Vehículos**
   - Ir a /vehiculos  
   - Crear múltiples vehículos sin restricción
   - Verificar botón "Nuevo Vehículo" siempre activo

6. **Probar Creación Ilimitada - Cartas de Porte**
   - Ir a /carta-porte/editor
   - Crear múltiples documentos
   - Verificar acceso total a todas las funciones

### Resultado Esperado
- **UI:** Badge dorado "Superusuario", todos los botones activos, sin notificaciones de límites
- **Base de Datos:** Creación exitosa de todos los recursos sin validación de límites
- **useUnifiedPermissions:** `accessLevel: 'superuser'`, `hasFullAccess: true`

### Criterios de Aceptación
✅ Badge muestra "Acceso de Superusuario"  
✅ Cero notificaciones de restricciones  
✅ Creación ilimitada de todos los recursos  
✅ `permissions.isSuperuser === true`

---

## ESCENARIO B: NUEVO USUARIO EN PERÍODO DE PRUEBA

### Configuración Previa
- Usuario recién registrado (< 14 días desde created_at)
- Sin suscripción activa
- is_superuser: false

### Pasos de Prueba
1. **Registro de Nuevo Usuario**
   - Crear cuenta nueva con email único
   - Completar proceso de verificación

2. **Verificar Estado de Trial - Día 1**
   - Login inmediato post-registro
   - Verificar badge "Trial activo"
   - Confirmar mensaje "Día 1 de 14 de prueba gratuita"

3. **Probar Acceso Completo Durante Trial**
   - Crear conductores (debe funcionar)
   - Crear vehículos (debe funcionar)
   - Crear cartas de porte (debe funcionar)
   - Verificar que NO hay límites durante trial

4. **Simular Progreso del Trial - Día 7**
   - Modificar created_at para simular 7 días
   - Refrescar aplicación
   - Verificar mensaje "Día 7 de 14 de prueba gratuita"

5. **Simular Final del Trial - Día 13**
   - Modificar created_at para simular 13 días
   - Verificar mensaje "Día 13 de 14 de prueba gratuita"
   - Debe aparecer notificación urgente de upgrade

6. **Simular Trial Expirado - Día 15**
   - Modificar created_at para simular 15 días
   - Verificar que todos los botones de creación estén deshabilitados
   - Confirmar notificación "Período de prueba finalizado"

### Resultado Esperado
- **Días 1-14:** Acceso completo, badge "Trial activo", contador de días
- **Día 15+:** Acceso bloqueado, botones deshabilitados, notificación de upgrade
- **Base de Datos:** Creación permitida solo durante trial activo

### Criterios de Aceptación
✅ Badge correcto según días transcurridos  
✅ Acceso total días 1-14  
✅ Bloqueo automático día 15+  
✅ Notificaciones de upgrade aparecen día 13+  
✅ `permissions.accessLevel === 'trial'` durante prueba

---

## ESCENARIO C: USUARIO SUSCRITO CON LÍMITES

### Configuración Previa
- Usuario con suscripción activa (status: 'active')
- Plan "Básico" con límites específicos:
  - limite_conductores: 5
  - limite_vehiculos: 3  
  - limite_cartas_porte: 10

### Pasos de Prueba
1. **Verificar Estado de Plan Activo**
   - Login con usuario suscrito
   - Verificar badge "Plan Básico"
   - Confirmar notificación verde "Plan activo"

2. **Probar Límite de Conductores**
   - Crear 4 conductores (debe funcionar)
   - Verificar indicador de uso "4/5 conductores"
   - Crear 5to conductor (debe funcionar)
   - Intentar crear 6to conductor (debe estar bloqueado)

3. **Verificar Indicadores de Límite**
   - Observar LimitUsageIndicator
   - Verificar barra de progreso en 100%
   - Confirmar mensaje "¡Has alcanzado el límite!"

4. **Probar Límite de Vehículos**
   - Crear 3 vehículos
   - Verificar que botón "Nuevo Vehículo" se deshabilite
   - Confirmar mensaje de límite alcanzado

5. **Probar Límite de Cartas de Porte**
   - Crear 10 cartas de porte
   - Verificar bloqueo en la 11va
   - Confirmar notificación de upgrade

6. **Verificar Botón de Upgrade**
   - Confirmar que aparece botón "Actualizar Plan"
   - Verificar que redirige a /planes

### Resultado Esperado
- **UI:** Contadores precisos, botones deshabilitados al límite, notificaciones claras
- **Base de Datos:** Creación bloqueada al alcanzar límites del plan
- **useUnifiedPermissions:** `accessLevel: 'paid'`, límites respetados

### Criterios de Aceptación
✅ Creación permitida hasta el límite exacto  
✅ Bloqueo automático al exceder límites  
✅ Indicadores de uso precisos  
✅ Botones de upgrade visibles  
✅ `permissions.canCreate* === false` al límite

---

## ESCENARIO D: USUARIO QUE HACE UPGRADE DE PLAN

### Configuración Previa
- Usuario con Plan "Básico" (límites bajos)
- Proceso de upgrade a Plan "Profesional" (límites altos)

### Pasos de Prueba
1. **Estado Inicial - Plan Básico**
   - Verificar límites iniciales (ej: 5 conductores)
   - Crear recursos hasta el límite
   - Confirmar bloqueo al límite

2. **Simular Upgrade de Plan**
   - Actualizar registro en tabla suscripciones
   - Cambiar plan_id de "básico" a "profesional"
   - Sin logout/login (debe actualizar en tiempo real)

3. **Verificar Actualización Inmediata**
   - Refrescar componentes (sin recargar página)
   - Verificar que badge cambie a "Plan Profesional"
   - Confirmar nuevos límites (ej: 50 conductores)

4. **Probar Nuevos Límites**
   - Intentar crear recursos adicionales
   - Verificar que ahora funcione (antes estaba bloqueado)
   - Confirmar indicadores actualizados

5. **Verificar Persistencia**
   - Hacer logout y login
   - Confirmar que los nuevos límites persisten
   - Verificar que el acceso expandido se mantiene

### Resultado Esperado
- **UI:** Actualización inmediata de badge y límites
- **Base de Datos:** Creación permitida según nuevos límites
- **useUnifiedPermissions:** Reflejar nuevos permisos sin delay

### Criterios de Aceptación
✅ Badge actualizado inmediatamente  
✅ Límites expandidos sin reinicio  
✅ Funcionalidad desbloqueada instantáneamente  
✅ Persistencia tras logout/login  
✅ `permissions.planInfo` actualizado

---

## MATRIZ DE VALIDACIÓN CRÍTICA

| Hook/Componente | Superuser | Trial | Pagado | Expirado |
|-----------------|-----------|-------|---------|----------|
| useUnifiedPermissions.hasFullAccess | ✅ true | ✅ true | ⚠️ limitado | ❌ false |
| useUnifiedPermissions.accessLevel | superuser | trial | paid | expired |
| PlanBadge | "Superuser" | "Trial X días" | "Plan Y" | "Expirado" |
| UnifiedPlanNotifications | ninguna | info azul | verde | naranja urgente |
| ProtectedActionsUnified | todos activos | todos activos | según límites | todos bloqueados |

---

## PROTOCOLO DE EJECUCIÓN

### Pre-Requisitos
1. Entorno de staging con datos limpios
2. Base de datos con usuarios de prueba configurados
3. Acceso a panel de admin para manipular datos

### Orden de Ejecución
1. **Escenario A** (Superuser) - Más simple, valida la base
2. **Escenario B** (Trial) - Valida lógica temporal  
3. **Escenario C** (Límites) - Valida restricciones complejas
4. **Escenario D** (Upgrade) - Valida reactividad

### Criterios de Fallo
❌ **FALLO CRÍTICO:** Cualquier escenario que no pase al 100%  
⚠️ **INVESTIGAR:** Comportamiento inconsistente entre recargas  
✅ **ÉXITO:** Todos los criterios de aceptación cumplidos

---

## REPORTE FINAL

Al completar todas las pruebas, generar reporte con:
- ✅/❌ por cada criterio de aceptación
- Screenshots de estados críticos
- Logs de consola de errores (si existen)
- Recomendaciones para producción

**Este documento constituye la certificación final de que useUnifiedPermissions implementa correctamente nuestras 4 Reglas de Negocio y está listo para soportar el crecimiento a 10,000+ usuarios.**
