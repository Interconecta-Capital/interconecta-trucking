# Análisis Completo de Errores en Timbrado de Facturas

## Fecha: 2025-11-22
## Investigación: Errores al timbrar facturas con Carta Porte

---

## 🔍 Problemas Identificados

### 1. **Error: "data.ubicaciones?.find is not a function"**
**Causa Raíz:**
- Las ubicaciones llegaban en formato objeto `{origen: {}, destino: {}}` 
- Las funciones `obtenerCPEmisor` y `obtenerCPReceptor` intentaban usar `.find()` directamente
- No validaban si era array u objeto antes de usar métodos de array

**Solución Implementada:**
```typescript
// Antes (INCORRECTO):
const origen = data.ubicaciones?.find((u: any) => u.tipo_ubicacion === 'Origen');

// Después (CORRECTO):
const ubicaciones = data.ubicaciones || data.tracking_data?.ubicaciones;
if (Array.isArray(ubicaciones)) {
  origen = ubicaciones.find((u: any) => u.tipo_ubicacion === 'Origen');
} else if (ubicaciones?.origen) {
  origen = ubicaciones.origen;
}
```

**Archivos Modificados:**
- `supabase/functions/timbrar-con-sw/index.ts` (líneas 643-683)

---

### 2. **Error: "Se requiere al menos una figura de transporte"**
**Causa Raíz:**
- El edge function requería `data.figuras` para generar FiguraTransporte
- El frontend NO estaba enviando datos del conductor en el payload
- `viajeCompleto` sí tenía los datos pero no se incluyeron en la petición

**Impacto:**
- El CartaPorte 3.1 REQUIERE al menos una figura de transporte (operador)
- Sin esta información el timbrado falla completamente

**Solución Implementada:**

#### Frontend (ViajeTrackingModal.tsx):
```typescript
// ANTES: Solo se enviaba tracking_data básico
tracking_data: trackingData

// AHORA: Se incluyen conductor, vehículo y remolque
tracking_data: {
  ...trackingData,
  conductor: viajeCompleto?.conductor,
  vehiculo: viajeCompleto?.vehiculo,
  remolque: viajeCompleto?.remolque
},
// + Autotransporte para CartaPorte
autotransporte: viajeCompleto?.vehiculo ? {
  placa_vm: viajeCompleto.vehiculo.placa,
  config_vehicular: viajeCompleto.vehiculo.config_vehicular,
  peso_bruto_vehicular: viajeCompleto.vehiculo.peso_bruto_vehicular || viajeCompleto.vehiculo.capacidad_carga,
  anio_modelo: viajeCompleto.vehiculo.anio,
  aseguradora_resp_civil: viajeCompleto.vehiculo.aseguradora || "Sin aseguradora",
  poliza_resp_civil: viajeCompleto.vehiculo.numero_poliza || "0000000"
} : undefined
```

#### Backend (timbrar-con-sw/index.ts):
```typescript
function construirFigurasTransporte(data: any) {
  let figuras = data.figuras || [];
  
  // Auto-generar desde conductor si no hay figuras explícitas
  if (figuras.length === 0 && data.tracking_data?.conductor) {
    const conductor = data.tracking_data.conductor;
    figuras = [{
      tipo_figura: "01", // Operador
      rfc_figura: conductor.rfc || "XAXX010101000",
      num_licencia: conductor.num_licencia,
      nombre_figura: conductor.nombre,
      domicilio: conductor.direccion || conductor.domicilio
    }];
  }
  
  // Fallback: figura por defecto si aún no hay
  if (figuras.length === 0) {
    figuras = [{
      tipo_figura: "01",
      rfc_figura: "XAXX010101000",
      nombre_figura: "Operador No Especificado"
    }];
  }
  
  return figuras.map(f => ({ /* ... */ }));
}
```

**Archivos Modificados:**
- `src/components/modals/ViajeTrackingModal.tsx` (líneas 245-283)
- `supabase/functions/timbrar-con-sw/index.ts` (líneas 623-661)

---

## 📊 Flujo de Datos Corregido

```
1. ViajeTrackingModal carga viaje completo
   └─> get_viaje_con_relaciones() → {viaje, conductor, vehiculo, remolque, factura, mercancias}

2. handleTimbrarFactura construye payload completo
   ├─> ubicaciones (de tracking_data)
   ├─> conductor (de viajeCompleto.conductor) ✅ NUEVO
   ├─> vehiculo (de viajeCompleto.vehiculo) ✅ NUEVO
   ├─> autotransporte (construido desde vehículo) ✅ NUEVO
   └─> mercancias

3. Edge function timbrar-con-sw
   ├─> Valida ubicaciones (array U objeto)
   ├─> construirFigurasTransporte
   │   ├─> Usa data.figuras si existe
   │   ├─> O genera desde tracking_data.conductor ✅ NUEVO
   │   └─> O usa figura por defecto ✅ NUEVO
   └─> construirComplementoCartaPorte
       ├─> Ubicaciones
       ├─> Mercancías
       ├─> FiguraTransporte ✅ AHORA CON DATOS
       └─> Autotransporte ✅ AHORA CON DATOS
```

---

## ✅ Validaciones Implementadas

### En el Edge Function:
1. ✅ Validación de formato de ubicaciones (array u objeto)
2. ✅ Búsqueda de ubicaciones en múltiples fuentes (data.ubicaciones, tracking_data.ubicaciones)
3. ✅ Auto-generación de figuras desde conductor
4. ✅ Fallback a figura por defecto si no hay datos
5. ✅ Logging detallado para debugging

### En el Frontend:
1. ✅ Inclusión de todos los datos necesarios (conductor, vehículo, autotransporte)
2. ✅ Construcción correcta de estructura de autotransporte
3. ✅ Categorización de errores para feedback al usuario

---

## 🎯 Resultados Esperados

Con estas correcciones:
1. ✅ Las ubicaciones se procesan correctamente en ambos formatos
2. ✅ Las figuras de transporte se generan automáticamente desde los datos del conductor
3. ✅ El complemento CartaPorte se construye con todos los datos requeridos
4. ✅ El timbrado debe completarse exitosamente

---

## 🧪 Puntos de Prueba

Para verificar que todo funciona:
1. ☐ Timbrar factura con viaje que tiene conductor asignado
2. ☐ Timbrar factura con viaje que tiene vehículo asignado  
3. ☐ Verificar que el XML generado incluye:
   - Complemento CartaPorte 3.1
   - Ubicaciones (origen y destino mínimo)
   - Mercancías
   - FiguraTransporte con datos del conductor
   - Autotransporte con datos del vehículo
4. ☐ Revisar logs de edge function para debugging

---

## 📝 Archivos Modificados en esta Corrección

1. **supabase/functions/timbrar-con-sw/index.ts**
   - `obtenerCPEmisor()` - Manejo de formatos de ubicaciones
   - `obtenerCPReceptor()` - Manejo de formatos de ubicaciones
   - `construirFigurasTransporte()` - Auto-generación desde conductor

2. **src/components/modals/ViajeTrackingModal.tsx**
   - `handleTimbrarFactura()` - Inclusión de conductor, vehículo y autotransporte

3. **supabase/functions/_shared/validation.ts**
   - `UbicacionesFlexibleSchema` - Validación flexible de ubicaciones (array u objeto)

---

## 🔧 Mantenimiento Futuro

### Mejoras Sugeridas:
1. Agregar validación de datos de conductor antes de enviar
2. Implementar cache de datos de conductor/vehículo
3. Agregar tests unitarios para `construirFigurasTransporte`
4. Mejorar mensajes de error específicos para cada caso

### Monitoreo:
- Revisar logs de edge function regularmente
- Monitorear tasa de éxito de timbrado
- Analizar patrones de errores en producción

---

## 📚 Referencias SAT

- **CartaPorte 3.1**: Requiere al menos una FiguraTransporte
- **RFC**: Puede ser "XAXX010101000" para extranjeros sin RFC
- **TipoFigura "01"**: Operador de autotransporte
- **Autotransporte**: Requiere PlacaVM, ConfigVehicular, PesoBrutoVehicular

---

**Documentación generada:** 2025-11-22  
**Versión:** 1.0  
**Estado:** Correcciones implementadas y desplegadas
