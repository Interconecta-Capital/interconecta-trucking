# 🔐 Seguridad del Edge Function: timbrar-con-sw

## ISO 27001 Controls Implementados

### A.14.2.1 - Validación de Entrada Robusta

**Problema Identificado:**
- Error 500 exponía stack traces completos en producción
- No había validación temprana de estructura de datos
- Mensajes de error genéricos sin contexto

**Solución Implementada:**
1. **Validación en múltiples capas:**
   - Validación Zod en línea 36-39
   - Validación de tipo de documento (líneas 43-61)
   - Validación de ubicaciones antes de construir CFDI (líneas 72-103)

2. **Mensajes de error claros y seguros:**
   - Errores descriptivos sin exponer información sensible
   - Stack traces solo en modo `sandbox` (desarrollo)
   - Logging estructurado con niveles apropiados

### A.12.2.1 - Protección contra Procesamiento Incorrecto

**Implementación:**
- Detección automática de tipo de documento (líneas 43-48)
- No intentar construir complemento CartaPorte si no hay ubicaciones
- Validación de integridad de datos antes de enviar a PAC

### A.16.1.5 - Respuesta Segura a Incidentes

**Manejo de Errores (líneas 257-288):**
```typescript
// ❌ ANTES: Exponía stack trace en producción
{ success: false, error: error.message, stack: error.stack }

// ✅ AHORA: Stack trace solo en desarrollo
{
  success: false,
  error: "mensaje descriptivo",
  timestamp: "ISO 8601",
  support: "contacto",
  debug: { stack: "..." } // SOLO si ambiente === 'sandbox'
}
```

### A.12.4.1 - Logging Seguro

**Datos Sensibles Protegidos:**
- User IDs truncados a 8 caracteres
- No se loggean passwords ni tokens en logs
- Filtrado de campos sensibles en logging (línea 461)

## Validaciones Implementadas

### 1. Validación de Tipo de Documento

```typescript
const esFacturaConCartaPorte = !!(
  cartaPorteData?.ubicaciones || 
  facturaData?.ubicaciones ||
  // ... otras fuentes
);
```

### 2. Validación de Ubicaciones

- **Array format:** Mínimo 2 elementos
- **Object format:** Requiere `origen` Y `destino`
- **Early validation:** Antes de construir CFDI

### 3. Validación en Schema Zod

```typescript
.refine(
  data => {
    if (data.facturaData?.ubicaciones) {
      return data.facturaData.ubicaciones.length >= 2;
    }
    return true; // Factura simple válida
  }
)
```

## Mejoras de Seguridad

### Antes vs Después

| Aspecto | ❌ Antes | ✅ Después |
|---------|---------|-----------|
| **Validación** | Solo Zod básico | Validación en 3 capas |
| **Errores** | Stack trace expuesto | Stack solo en dev |
| **Logging** | User ID completo | User ID truncado |
| **Mensajes** | Genéricos | Descriptivos y seguros |
| **Tipo Doc** | No detectado | Auto-detectado |

## Testing

### Casos de Prueba

1. **Factura Simple (sin CartaPorte):**
   ```json
   {
     "facturaData": {
       "rfcEmisor": "...",
       "conceptos": [...]
       // Sin ubicaciones - VÁLIDO
     }
   }
   ```

2. **Factura con CartaPorte:**
   ```json
   {
     "facturaData": {
       "rfcEmisor": "...",
       "ubicaciones": [{origen}, {destino}]
       // Con ubicaciones - VÁLIDO
     }
   }
   ```

3. **Error de Validación:**
   ```json
   {
     "facturaData": {
       "ubicaciones": [solo_origen]
       // Solo 1 ubicación - ERROR CLARO
     }
   }
   ```

## Monitoreo

### Métricas de Seguridad

- `error_rate`: % de requests con error 500
- `validation_errors`: Errores de validación detectados
- `stack_trace_exposure`: Debe ser 0 en producción

### Alertas

1. **Error Rate > 5%**: Investigar logs
2. **Stack Trace en Producción**: Alerta crítica
3. **Validación Fallando**: Revisar schema

## Compliance

✅ **ISO 27001:2022**
- A.14.2.1: Secure development
- A.12.2.1: Protection from malware
- A.16.1.5: Response to security incidents
- A.12.4.1: Event logging

✅ **OWASP Top 10**
- A03:2021 – Injection (validación de entrada)
- A05:2021 – Security Misconfiguration (no exponer stack)
- A09:2021 – Security Logging (logging apropiado)

## Contacto

Para reportar vulnerabilidades de seguridad: security@example.com
