# 📋 CHECKLIST DE TESTING - Sistema de Timbrado

**Proyecto:** Interconecta Trucking  
**Versión:** 2.0.0  
**Fecha:** 2025-11-22  
**Cumplimiento:** ISO 27001 A.12.7.1 (Controles de auditoría de SI)

---

## 🎯 FASE 8: Testing y Configuración Completa

### 8.1 ✅ Configuración de Secretos en Supabase

Verificar que los siguientes secretos estén configurados en:
**Supabase Dashboard → Settings → Edge Functions → Secrets**

| Secret | Valor Requerido | Estado |
|--------|----------------|--------|
| `SW_TOKEN` | Token de SmartWeb/Conecktia | ✅ Configurado |
| `SW_SANDBOX_URL` | `https://services.test.sw.com.mx` | ✅ Configurado |
| `SW_PRODUCTION_URL` | `https://services.sw.com.mx` | ✅ Configurado |
| `GOOGLE_MAPS_API_KEY` | API Key de Google Cloud | ✅ Configurado |
| `MAPBOX_ACCESS_TOKEN` | Token de Mapbox (opcional) | ✅ Configurado |

**Verificación:**
```bash
# En Supabase Dashboard → Edge Functions → Logs
# Los logs deben mostrar:
# ✅ "SmartWeb configurado: sandbox - https://services.test.sw.com.mx"
```

---

### 8.2 ✅ Verificación de Google Maps API

**Configuración en Google Cloud Console:**

1. **Habilitar APIs necesarias:**
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API

2. **Restricciones de seguridad:**
   - Tipo: Sitios web
   - Referentes permitidos:
     - `https://interconecta-trucking.lovable.app/*`
     - `https://trucking.interconecta.capital/*`
     - `http://localhost:5173/*` (desarrollo)

3. **Verificación en consola:**
```javascript
// Abrir DevTools → Console
console.log('Google Maps loaded:', !!window.google?.maps);
// Debe mostrar: true
```

---

## 🧪 PRUEBAS FUNCIONALES

### Test 1: Crear Viaje Completo ⏱️ 15 min

**Pasos:**
1. ✅ Ir a `/viajes`
2. ✅ Click en "Programar Nuevo Viaje"
3. ✅ Completar wizard con:
   - Origen: Ciudad de México, CDMX
   - Destino: Monterrey, Nuevo León
   - Cliente: Seleccionar existente o crear nuevo
   - Conductor: Asignar conductor activo
   - Vehículo: Asignar vehículo disponible
   - Mercancías: Agregar al menos 2 mercancías
4. ✅ Guardar viaje

**Resultado Esperado:**
- Viaje creado con estado "programado"
- Factura borrador generada
- Carta Porte borrador creada
- Tracking data con ubicaciones completas

**Validación en DB:**
```sql
SELECT v.id, v.estado, v.factura_id, v.carta_porte_id,
       v.tracking_data->>'tipo_servicio' as tipo_servicio,
       jsonb_array_length(v.tracking_data->'ubicaciones') as ubicaciones_count
FROM viajes v
ORDER BY v.created_at DESC
LIMIT 1;
```

---

### Test 2: Cargar Documento con IA 📄 ⏱️ 10 min

**Pasos:**
1. ✅ En modal de viaje, ir a tab "Mercancías"
2. ✅ Click en "Subir Documento"
3. ✅ Cargar PDF o imagen con datos de mercancías
4. ✅ Esperar procesamiento con IA
5. ✅ Verificar campos extraídos

**Resultado Esperado:**
- IA extrae: descripción, cantidad, peso, clave unidad
- Mercancía se crea automáticamente
- Toast de éxito aparece

**Campos a Validar:**
- `descripcion`: Texto descriptivo
- `cantidad`: Número > 0
- `peso_kg`: Número > 0
- `clave_unidad`: Código SAT válido
- `bienes_transp`: Código SAT de producto

---

### Test 3: Mapa y Cálculo de Tiempo 🗺️ ⏱️ 10 min

**Pasos:**
1. ✅ Abrir viaje en modal tracking
2. ✅ Ir a tab "Tracking"
3. ✅ Verificar que mapa se carga con:
   - Marcador de origen (verde)
   - Marcador de destino (rojo)
   - Ruta trazada entre ambos
4. ✅ Verificar tiempo estimado calculado

**Resultado Esperado:**
- Mapa interactivo visible
- Ruta dibujada correctamente
- Distancia y tiempo mostrados
- Sin errores en consola sobre Google Maps

**DevTools Check:**
```javascript
// Console debe mostrar:
// ✅ "Google Maps API cargada"
// ✅ "Ruta calculada: 950 km, 12.5 hrs"
```

---

### Test 4: Pre-visualizar Factura 👁️ ⏱️ 5 min

**Pasos:**
1. ✅ En modal de viaje, ir a tab "Documentos"
2. ✅ En sección "Factura", click "Pre-visualizar"
3. ✅ Verificar datos mostrados:
   - Serie-Folio correctos
   - RFC emisor/receptor
   - Subtotal, IVA, Total
   - Forma de pago editable
   - Método de pago editable
   - Moneda editable

**Resultado Esperado:**
- Modal de preview se abre
- Todos los campos tienen valores
- Selectores funcionan correctamente
- Cálculos son correctos

---

### Test 5: Timbrar Factura (Flete Pagado) 🔐 ⏱️ 10 min

**Pre-requisitos:**
- Viaje con `tipo_servicio = 'flete_pagado'`
- Certificados digitales (CSD) cargados
- Configuración empresarial completa

**Pasos:**
1. ✅ Abrir preview de factura
2. ✅ Editar: Moneda → MXN, Forma → 01 (Efectivo), Método → PUE
3. ✅ Click en "Timbrar Factura"
4. ✅ Esperar respuesta del PAC (~5-10 seg)
5. ✅ Verificar UUID asignado

**Resultado Esperado:**
- Toast: "✅ Factura timbrada correctamente"
- Badge cambia a "Timbrada"
- UUID visible en la card
- Botón cambia a "Cancelar Factura"

**Validación en DB:**
```sql
SELECT f.id, f.status, f.uuid_fiscal, f.fecha_timbrado
FROM facturas f
WHERE f.viaje_id = '<viaje_id>'
AND f.status = 'timbrado';
```

---

### Test 6: Pre-visualizar Carta Porte 📋 ⏱️ 5 min

**Pasos:**
1. ✅ En tab "Documentos", sección "Carta Porte"
2. ✅ Verificar badge de estado (Borrador)
3. ✅ Click en "Pre-visualizar"
4. ✅ Verificar datos de Carta Porte

**Resultado Esperado:**
- Preview muestra datos fiscales
- Ubicaciones origen/destino visibles
- Mercancías listadas
- Información de autotransporte completa

---

### Test 7: Timbrar Carta Porte (Validación Factura) 🚛 ⏱️ 15 min

**Escenario A: Flete Pagado (Factura NO timbrada)**
1. ✅ Intentar timbrar Carta Porte
2. ❌ **Debe fallar** con error:  
   _"Para fletes pagados, la factura debe estar timbrada primero"_

**Escenario B: Flete Pagado (Factura SÍ timbrada)**
1. ✅ Factura ya timbrada (Test 5)
2. ✅ Click "Timbrar CCP" en sección Carta Porte
3. ✅ Esperar timbrado (~10 seg)
4. ✅ Verificar UUID de Carta Porte

**Resultado Esperado:**
- Validación de factura funciona
- Carta Porte se timbra exitosamente
- UUID visible
- Badge cambia a "✅ Timbrada"

**Validación en DB:**
```sql
SELECT cp.id, cp.status, cp.uuid_fiscal, cp.fecha_timbrado,
       cp.viaje_id, f.uuid_fiscal as factura_uuid
FROM cartas_porte cp
LEFT JOIN facturas f ON f.id = cp.factura_id
WHERE cp.viaje_id = '<viaje_id>'
AND cp.status = 'timbrada';
```

---

### Test 8: Generar Hoja de Ruta PDF 📄 ⏱️ 5 min

**Pasos:**
1. ✅ En tab "Documentos", sección "Documentos Operativos"
2. ✅ En card "Hoja de Ruta", click "Imprimir"
3. ✅ Verificar PDF se descarga automáticamente
4. ✅ Abrir PDF y validar contenido:
   - Header con logo azul
   - Información del viaje completa
   - Recursos asignados (tabla)
   - Mercancías (tabla)
   - Documentos fiscales (si existen)
   - Footer con fecha y página

**Resultado Esperado:**
- PDF generado: `HojaRuta_<viaje_id>_<fecha>.pdf`
- Formato profesional
- Todas las secciones completas
- Footer ISO 27001 presente

---

### Test 9: Generar Checklist Pre-Viaje PDF ✅ ⏱️ 5 min

**Pasos:**
1. ✅ En card "Lista de Verificación", click "Generar PDF"
2. ✅ Verificar PDF se descarga
3. ✅ Abrir PDF y validar:
   - Header verde
   - Categorías: Documentación, Vehículo, Seguridad, Carga, Comunicación
   - Checkboxes vacíos para marcar
   - Sección de firmas (Conductor y Supervisor)
   - Nota de importancia al final

**Resultado Esperado:**
- PDF generado: `Checklist_PreViaje_<viaje_id>_<fecha>.pdf`
- Formato de checklist profesional
- Listo para imprimir y usar en campo

---

## 🔒 PRUEBAS DE SEGURIDAD (ISO 27001)

### Test 10: Validación de Permisos

**Objetivo:** Verificar que RLS policies funcionan correctamente

**Escenarios:**
1. ✅ Usuario A crea viaje → Solo Usuario A puede ver
2. ❌ Usuario B intenta acceder viaje de A → Debe fallar
3. ✅ Usuario A intenta timbrar su propia factura → Exitoso
4. ❌ Usuario B intenta timbrar factura de A → Debe fallar

**SQL para Testing:**
```sql
-- Verificar RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('viajes', 'facturas', 'cartas_porte');

-- Debe mostrar rowsecurity = true para todas
```

---

### Test 11: Validación de Inputs

**Objetivo:** Verificar que validaciones de Zod funcionan

**Escenarios de Edge Cases:**
1. ✅ Enviar `viajeId` vacío → Error 400
2. ✅ Enviar `ambiente` inválido → Error 400
3. ✅ Enviar sin autenticación → Error 401
4. ✅ XML vacío o malformado → Error 400

**DevTools Network:**
- Todas las validaciones deben retornar respuestas JSON con `success: false`

---

## 📊 CHECKLIST DE AUDITORÍA ISO 27001

| Control | Descripción | Estado | Evidencia |
|---------|-------------|--------|-----------|
| A.9.4.1 | JWT requerido en edge functions | ✅ | `verify_jwt = true` en config.toml |
| A.12.4.1 | Logging de eventos | ✅ | `console.log` en todas las operaciones |
| A.14.1.2 | API keys en secrets | ✅ | Variables de entorno en Supabase |
| A.14.2.5 | Validación de inputs | ✅ | Schemas Zod en edge functions |
| A.18.1.3 | Auditoría de timbrados | ✅ | Tabla `security_audit_log` |

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### Error: "column v.tipo_servicio does not exist"
**Causa:** Acceso incorrecto a campo JSONB  
**Solución:** Usar `v.tracking_data->>'tipo_servicio'`  
**Estado:** ✅ Corregido en migración `20251122054830`

---

### Error: "facturaData.conceptos Required"
**Causa:** Campo `conceptos` faltante en request a PAC  
**Solución:** Construir array de conceptos desde mercancías  
**Estado:** ✅ Corregido en `ViajeTrackingModal.tsx`

---

### Error: "Se requieren al menos 2 ubicaciones"
**Causa:** `tracking_data.ubicaciones` no es array  
**Solución:** Parsear ubicaciones correctamente desde JSONB  
**Estado:** ✅ Corregido en `timbrar-carta-porte/index.ts`

---

### Error: "Google Maps API key not loaded"
**Causa:** API key hardcodeada en HTML  
**Solución:** Usar hook `useGoogleMaps` para carga dinámica  
**Estado:** ✅ Implementado

---

## 📈 MÉTRICAS DE ÉXITO

| Métrica | Objetivo | Real | Estado |
|---------|----------|------|--------|
| Tiempo timbrado factura | < 10 seg | - | 🔄 Por medir |
| Tiempo timbrado CCP | < 15 seg | - | 🔄 Por medir |
| Tasa éxito timbrado | > 95% | - | 🔄 Por medir |
| Tiempo generación PDF | < 3 seg | - | 🔄 Por medir |
| Errores en producción | 0 | - | 🔄 Por medir |

---

## 🎓 NOTAS PARA DESARROLLADORES

### Indexación de Datos (ISO 27001 A.12.3.1)

**Índices creados para performance:**
```sql
-- Viajes
CREATE INDEX idx_viajes_user_estado_fecha ON viajes(user_id, estado, fecha_inicio_programada DESC);
CREATE INDEX idx_viajes_tracking_data ON viajes USING GIN(tracking_data);
CREATE INDEX idx_viajes_factura_id ON viajes(factura_id);

-- Facturas
CREATE INDEX idx_facturas_viaje_id ON facturas(viaje_id);
CREATE INDEX idx_facturas_status_user ON facturas(user_id, status);

-- Cartas Porte
CREATE INDEX idx_cartas_porte_viaje_id ON cartas_porte(viaje_id);
CREATE INDEX idx_cartas_porte_status ON cartas_porte(status);
```

**Tiempo de consulta esperado:**
- Dashboard viajes: < 500ms
- RPC `get_viaje_con_relaciones`: < 200ms
- Búsqueda en tracking_data JSONB: < 50ms

---

### Duplicación de Datos Justificada

**Campos duplicados con propósito de auditoría:**

| Campo | Columna | JSONB tracking_data | Justificación |
|-------|---------|---------------------|---------------|
| `viaje_id` | `viajes.id` | `tracking_data.viaje_id` | Trazabilidad ISO 27001 |
| `factura_id` | `viajes.factura_id` | `tracking_data.factura_id` | Índice rápido + auditoría |
| `tipo_servicio` | ❌ No existe | ✅ `tracking_data.tipo_servicio` | Metadato de flujo |
| `origen/destino` | `viajes.origen/destino` | `tracking_data.ubicaciones` | Búsqueda texto + datos estructurados |

**Cumplimiento:** ISO 27001 A.12.3.1 - Backup de información

---

## 📞 SOPORTE

**En caso de errores durante testing:**

1. **Revisar logs de Edge Functions:**
   - Supabase Dashboard → Edge Functions → Logs
   - Buscar requestId en logs para trazar flujo completo

2. **Revisar consola del navegador:**
   - DevTools → Console
   - Filtrar por "❌" o "Error"

3. **Verificar base de datos:**
   ```sql
   SELECT * FROM security_audit_log 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

---

**✅ TESTING COMPLETADO:** ___ / ___ / 2025  
**Firma Responsable:** _______________  
**Estado Sistema:** ⏳ En Testing | ✅ Aprobado | ❌ Requiere Correcciones
