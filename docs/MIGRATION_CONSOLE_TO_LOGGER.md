# Guía de Migración: Console.log a Logger

## Objetivo
Migrar todas las llamadas `console.log`, `console.error`, `console.warn` al logger sanitizado para cumplir con requisitos de seguridad y GDPR/LFPDPPP.

## Import del Logger

```typescript
import logger from '@/utils/logger';
```

## Mapeo de Métodos

| Antes | Después |
|-------|---------|
| `console.log(msg)` | `logger.info('general', msg)` |
| `console.log(msg, data)` | `logger.info('categoria', msg, data)` |
| `console.error(msg, error)` | `logger.error('categoria', msg, error)` |
| `console.warn(msg)` | `logger.warn('categoria', msg)` |
| `console.debug(msg)` | `logger.debug('categoria', msg)` |

## Categorías Disponibles

| Categoría | Uso |
|-----------|-----|
| `general` | Logs genéricos |
| `timbrado` | Proceso de timbrado CFDI |
| `csd` | Certificados digitales |
| `xml` | Generación/parsing XML |
| `validator` | Validaciones generales |
| `sw-validator` | Validaciones SmartWeb |
| `sw-error` | Errores de SmartWeb |
| `catalogos` | Catálogos SAT |
| `db` | Operaciones de base de datos |
| `api` | Llamadas a APIs externas |
| `storage` | Almacenamiento de archivos |
| `auth` | Autenticación |
| `config` | Configuración |
| `pdf` | Generación de PDFs |
| `viajes` | Gestión de viajes |
| `mercancias` | Mercancías |
| `ubicaciones` | Ubicaciones/direcciones |
| `vehiculos` | Vehículos |
| `conductores` | Conductores |
| `facturacion` | Facturación |
| `ui` | Interfaz de usuario |
| `wizard` | Wizards/asistentes |
| `form` | Formularios |
| `cache` | Caché |
| `routing` | Navegación |
| `maps` | Mapas/Google Maps |

## Ejemplos de Migración

### Antes
```typescript
console.log('Iniciando proceso de timbrado...');
console.log('Datos:', { rfcEmisor, cartaPorteId });
console.error('Error en timbrado:', error);
```

### Después
```typescript
logger.info('timbrado', 'Iniciando proceso de timbrado');
logger.debug('timbrado', 'Datos de timbrado', { rfcEmisor, cartaPorteId });
logger.error('timbrado', 'Error en timbrado', error);
```

## Reglas de Sanitización

El logger automáticamente sanitiza estos campos en producción:
- `rfc` → `[REDACTED-RFC]`
- `curp` → `[REDACTED-CURP]`
- `password` → `[REDACTED-PASSWORD]`
- `token` → `[REDACTED-TOKEN]`
- `email` → `[REDACTED-EMAIL]`
- `telefono` → `[REDACTED-TELEFONO]`
- `num_licencia` → `[REDACTED-NUM_LICENCIA]`

## Archivos Prioritarios para Migrar

### Críticos (Seguridad)
1. ✅ `src/services/timbradoService.ts`
2. `src/services/pac/SwPayloadValidator.ts`
3. `src/services/pac/SwErrorInterpreter.ts`
4. `src/services/validacion/ValidadorPreTimbradoCompleto.ts`
5. `src/services/xml/*.ts`
6. `src/services/csd/*.ts`

### Alto (Funcionalidad Core)
- `src/hooks/carta-porte/*.ts`
- `src/hooks/useViajes*.ts`
- `src/services/catalogos/*.ts`

### Medio (UI/UX)
- `src/components/carta-porte/**/*.tsx`
- `src/components/viajes/**/*.tsx`

## Script de Búsqueda

```bash
# Buscar console.log en servicios
grep -rn "console.log" src/services/ | head -50

# Buscar console.error en hooks
grep -rn "console.error" src/hooks/ | head -50

# Contar total
grep -rc "console\." src/ | grep -v ":0" | sort -t: -k2 -nr | head -20
```

## Validación

Después de migrar, verificar:
1. `pnpm build` sin errores
2. Funcionalidad no afectada
3. Logs visibles en desarrollo
4. Datos sensibles NO aparecen en producción
