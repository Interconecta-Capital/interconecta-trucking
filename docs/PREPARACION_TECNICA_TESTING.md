
# Preparación Técnica - Plan de Pruebas v1.1.2

## SCRIPTS CREADOS Y SU PROPÓSITO

### 1. Migración de Base de Datos
**Archivo:** `migración SQL ejecutada`
- ✅ Añade `limite_almacenamiento_gb` a `planes_suscripcion`
- ✅ Crea tabla `usuario_almacenamiento` para tracking de uso
- ✅ Implementa funciones de gestión de almacenamiento
- ✅ Establece políticas RLS apropiadas

### 2. Hook de Almacenamiento
**Archivo:** `src/hooks/useStorageUsage.ts`
- Gestiona el uso de almacenamiento por usuario
- Proporciona funciones para actualizar y consultar uso
- Integra con las funciones de base de datos

### 3. Hook Unificado Actualizado
**Archivo:** `src/hooks/useUnifiedPermissions.ts` (actualizado)
- ✅ Incluye lógica de límites de almacenamiento
- ✅ Añade `canUploadFile` a los permisos
- ✅ Extiende `usage` con información de almacenamiento
- ✅ Mantiene compatibilidad con sistema anterior

### 4. Indicador de Almacenamiento
**Archivo:** `src/components/common/StorageUsageIndicator.tsx`
- Componente visual para mostrar uso de almacenamiento
- Incluye alertas cuando se acerca al límite
- Botón de upgrade cuando es necesario

### 5. Datos de Prueba
**Archivo:** `scripts/test-data-setup.sql`
- Crea 5 usuarios de prueba con diferentes configuraciones
- Establece planes específicos para testing
- Simula uso cerca de límites para validación
- Datos de almacenamiento pre-configurados

### 6. Helpers de Validación
**Archivo:** `scripts/validation-helpers.js`
- Funciones JavaScript para debugging en consola
- Monitor en tiempo real de cambios de permisos
- Validación automática de estados de botones
- Testing específico de límites de almacenamiento

## CONFIGURACIÓN DE PLANES DE PRUEBA

### Plan Operador (Testing de Límites Bajos)
```
Límites:
- Conductores: 10 (simulado uso: 9/10)
- Vehículos: 5 (simulado uso: 4/5)
- Socios: 3
- Cartas Porte: 50 (simulado uso: 48/50)
- Almacenamiento: 1 GB (simulado uso: 0.9 GB)
```

### Plan Flota (Testing de Límites Medios)
```
Límites:
- Conductores: 50
- Vehículos: 25
- Socios: 15
- Cartas Porte: 200
- Almacenamiento: 10 GB
```

### Plan Enterprise (Testing de Personalización)
```
Límites:
- Conductores: 500 (personalizado)
- Vehículos: 250 (personalizado)
- Socios: 100 (personalizado)
- Cartas Porte: ilimitado (NULL)
- Almacenamiento: 100 GB (personalizado)
```

## USUARIOS DE PRUEBA CONFIGURADOS

| Email | Tipo | Estado | Propósito |
|-------|------|--------|-----------|
| `superuser@test.com` | Superuser | Activo | Escenario A: Acceso total |
| `trial@test.com` | Trial | Día 5/14 | Escenario B: Trial activo |
| `operador@test.com` | Plan Operador | Cerca límites | Escenario C: Límites bajos |
| `flota@test.com` | Plan Flota | Activo | Escenario D: Upgrade testing |
| `enterprise@test.com` | Plan Enterprise | Activo | Escenario E: Personalización |

## INSTRUCCIONES DE EJECUCIÓN

### Paso 1: Ejecutar Script de Datos
```sql
-- Ejecutar en entorno de staging
\i scripts/test-data-setup.sql
```

### Paso 2: Cargar Helpers de Validación
```javascript
// En consola del navegador
fetch('/scripts/validation-helpers.js')
  .then(response => response.text())
  .then(script => eval(script));
```

### Paso 3: Verificar Configuración
```javascript
// Verificar que todo está configurado
window.testingHelpers.debugUnifiedPermissions();
window.testingHelpers.validateButtonStates();
```

## VALIDACIONES AUTOMÁTICAS DISPONIBLES

1. **Monitor en Tiempo Real:**
   ```javascript
   const monitor = window.testingHelpers.startPermissionsMonitor();
   ```

2. **Test de Almacenamiento:**
   ```javascript
   window.testingHelpers.testStorageLimit();
   ```

3. **Debug de Permisos:**
   ```javascript
   window.testingHelpers.debugUnifiedPermissions();
   ```

## PREPARACIÓN COMPLETADA ✅

El sistema está listo para ejecutar:
- ✅ Escenarios A, B, C, D (completamente preparados)
- ✅ Escenario E (Enterprise personalización)
- ⚠️ Escenario F (Gestión de borradores) - requiere implementación adicional

## SIGUIENTE PASO

**Recomendación:** Comenzar con la **Fase A** del plan de pruebas ejecutando los Escenarios A-D que están completamente preparados, mientras se trabaja en paralelo en la implementación del Escenario F.
