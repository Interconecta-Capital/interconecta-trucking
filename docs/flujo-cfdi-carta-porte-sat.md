# FASE 8: Documentación - Flujo CFDI + Carta Porte según SAT

## 📋 Diferencia entre CFDI y Carta Porte

### ¿Qué es un CFDI?
**CFDI** (Comprobante Fiscal Digital por Internet) es la **factura electrónica** que emite el SAT en México. Es el documento principal que debe tener todo contribuyente para comprobar sus operaciones fiscales.

### ¿Qué es la Carta Porte?
**Carta Porte v3.1** es un **COMPLEMENTO del CFDI**, NO un documento independiente. Se utiliza específicamente para acreditar el transporte de mercancías en territorio nacional.

---

## 🚛 Tipos de CFDI con Carta Porte

### Tipo "T" - CFDI de Traslado (SIN COBRO)
**Uso:** Cuando se traslada mercancía propia o del cliente SIN facturar el servicio de transporte.

**Características:**
- ✅ Subtotal = $0.00
- ✅ Total = $0.00  
- ✅ Moneda = "XXX" (Sin moneda)
- ✅ NO requiere timbrado inmediato
- ✅ Se usa para acreditar la legal tenencia de la mercancía durante el transporte
- ✅ Complemento Carta Porte v3.1 es OBLIGATORIO

**Ejemplo de Uso:**
```
Empresa ABC traslada 5 toneladas de aguacate de su propia cosecha
desde Michoacán hasta CDMX para venta en mercado local.

→ CFDI Tipo "T" (Traslado) + Complemento Carta Porte v3.1
→ Subtotal: $0.00, IVA: $0.00, Total: $0.00
```

---

### Tipo "I" - CFDI de Ingreso (CON COBRO)
**Uso:** Cuando se cobra por el servicio de transporte y se debe facturar.

**Características:**
- ✅ Subtotal > $0.00 (costo del servicio)
- ✅ Total > $0.00 (incluye IVA)
- ✅ Moneda = "MXN"
- ✅ SÍ requiere timbrado ante PAC
- ✅ Complemento Carta Porte v3.1 es OBLIGATORIO
- ✅ Se emite al cliente que paga el flete

**Ejemplo de Uso:**
```
Transportes XYZ cobra $15,000 MXN + IVA por transportar
10 toneladas de maíz de un cliente desde Jalisco hasta Querétaro.

→ CFDI Tipo "I" (Ingreso/Factura) + Complemento Carta Porte v3.1
→ Subtotal: $15,000.00, IVA: $2,400.00, Total: $17,400.00
```

---

## 🔄 Flujo Completo: Viaje → Carta Porte → Timbrado

```
┌─────────────────────────────────────────────────────────────┐
│  1. CREAR VIAJE EN EL SISTEMA                               │
│     - Cliente                                               │
│     - Origen y Destino                                      │
│     - Descripción de Mercancía                              │
│     - Vehículo y Conductor                                  │
│     - Tipo de Servicio (Flete Pagado / Traslado Propio)    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  2. GENERAR BORRADOR DE CARTA PORTE                         │
│     - Mapeo automático de datos del viaje                  │
│     - Validación de campos obligatorios SAT v3.1           │
│     - Cálculo de distancias y tiempos                      │
│     - Generación de IdCCP (32 caracteres)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  3. EDITAR Y COMPLETAR CARTA PORTE                          │
│     - Configuración: Emisor, Receptor, Tipo CFDI           │
│     - Ubicaciones: Validar Códigos Postales                │
│     - Mercancías: Clave SAT, Fracción Arancelaria          │
│     - Autotransporte: Placas, Permisos SCT, Seguros        │
│     - Figuras: Operador, Licencia                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  4. GENERAR XML (Pre-Timbrado)                              │
│     - Validación exhaustiva SAT v3.1                       │
│     - Estructura CFDI 4.0 + Complemento CartaPorte 3.1     │
│     - Verificación de esquemas XSD                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  5. TIMBRAR ANTE PAC (Proveedor Autorizado de Certificación)│
│     - Envío de XML a FiscalAPI / FacturAPI / Otro PAC      │
│     - Validación del SAT                                   │
│     - Generación de UUID Fiscal                            │
│     - Obtención de XML Timbrado con Sello Digital          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  6. ALMACENAR Y GENERAR PDF                                 │
│     - Guardar XML Timbrado                                 │
│     - Generar PDF con representación impresa               │
│     - Vincular UUID con Carta Porte                        │
│     - Actualizar estado del viaje                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Requisitos Obligatorios SAT v3.1

### Configuración General
- [x] **IdCCP**: 32 caracteres alfanuméricos (UUID sin guiones)
- [x] **Versión**: "3.1"
- [x] **Tipo de CFDI**: "T" (Traslado) o "I" (Ingreso)
- [x] **RFC Emisor**: Transportista
- [x] **RFC Receptor**: Cliente o destinatario

### Ubicaciones
- [x] **Mínimo 2**: Origen y Destino
- [x] **Código Postal**: OBLIGATORIO (5 dígitos)
- [x] **Estado y País**: Obligatorios
- [x] **RFC y Nombre**: Del remitente/destinatario
- [x] **Fecha/Hora**: ISO 8601
- [x] **Distancia Recorrida**: En km (para Destino)

### Mercancías
- [x] **BienesTransp**: Clave SAT del producto (8 dígitos)
- [x] **Descripción**: Detallada
- [x] **Cantidad**: Numérica
- [x] **ClaveUnidad**: Código SAT (Ej: KGM, TNE, H87)
- [x] **Peso en Kg**: Obligatorio
- [x] **Valor Mercancía**: En pesos mexicanos

### Autotransporte Federal
- [x] **PermSCT**: Tipo de permiso (Ej: TPAF01)
- [x] **NumPermisoSCT**: Número del permiso
- [x] **PlacaVM**: Placas del vehículo motor
- [x] **ConfigVehicular**: Clave SAT (Ej: C2, C3, T3S2)
- [x] **Seguros**: Responsabilidad civil y medio ambiente

### Figura Transporte
- [x] **TipoFigura**: "01" (Operador)
- [x] **RFCFigura**: RFC del conductor
- [x] **NumLicencia**: Licencia federal
- [x] **NombreFigura**: Nombre completo

---

## 🔐 Integración con PAC (Proveedores Autorizados)

### Proveedores Recomendados
1. **FiscalAPI** - https://fiscalapi.com
   - Fácil integración
   - Documentación completa
   - Soporte 24/7

2. **FacturAPI** - https://www.facturapi.io
   - API REST moderna
   - Webhooks para notificaciones
   - Sandbox gratuito

3. **Enlace Fiscal** - https://enlacefiscal.com
   - Especializado en transporte
   - Validación específica Carta Porte

### Flujo de Integración con PAC
```typescript
// Ejemplo con FiscalAPI
import { TimbradoService } from '@/services/timbrado/TimbradoService';

// 1. Generar XML pre-timbrado
const xmlGenerado = await XMLGeneratorEnhanced.generarXMLCompleto(cartaPorteData);

// 2. Enviar a PAC para timbrado
const resultado = await TimbradoService.timbrarCartaPorte({
  xmlPreTimbrado: xmlGenerado.xml,
  rfcEmisor: cartaPorteData.rfcEmisor,
  pac: 'fiscalapi' // o 'facturapi'
});

// 3. Resultado contiene:
// - xmlTimbrado: XML con sello digital del SAT
// - uuid: UUID fiscal único
// - fechaTimbrado: Timestamp del timbrado
// - pdf: Representación impresa (opcional)
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "ID CCP debe tener 32 caracteres"
**Causa:** Se está usando formato UUID con guiones (36 chars)
**Solución:** Usar `UUIDService.generateValidIdCCP()` que genera 32 chars

### Error: "Código postal obligatorio en ubicación X"
**Causa:** Falta código postal en origen o destino
**Solución:** Validar que todas las ubicaciones tengan CP de 5 dígitos

### Error: "RFC inválido"
**Causa:** RFC no cumple formato SAT (12-13 caracteres)
**Solución:** Usar `RFCValidator.validarRFC()` antes de guardar

### Error: "Falta distancia recorrida"
**Causa:** Ubicación de Destino sin distancia en km
**Solución:** Calcular distancia entre origen-destino obligatoriamente

### Error: "ClaveUnidad no válida"
**Causa:** Unidad de medida no existe en catálogo SAT
**Solución:** Usar códigos SAT válidos (KGM, TNE, H87, XBX, etc.)

---

## 📊 Estado del Proyecto MVP

### ✅ Implementado
- [x] Generación de IdCCP (32 caracteres)
- [x] Validación de RFC
- [x] Mapeo Viaje → Carta Porte
- [x] Parser de mercancías múltiples
- [x] Validación de ubicaciones
- [x] Generación XML pre-timbrado
- [x] Tipo CFDI estandarizado

### ⏳ Pendiente (Post-MVP)
- [ ] Integración con PAC para timbrado
- [ ] Generación automática de PDF
- [ ] Cancelación de CFDI timbrados
- [ ] Reporte de viajes con carta porte
- [ ] Dashboard de CFDIs emitidos

---

## 📚 Referencias Oficiales SAT

- **Guía de llenado Carta Porte 3.1**: https://omawww.sat.gob.mx/cartaporte/Paginas/documentos/guia_llenado_CartaPorte_2024.pdf
- **Catálogos SAT actualizados**: https://www.sat.gob.mx/consultas/48471/catalogo-de-claves
- **Portal PAC SAT**: https://www.sat.gob.mx/tramites/operacion/28537/obten-la-autorizacion-para-ser-proveedor-de-certificacion-de-cfdi
- **Validador XML SAT**: https://www.sat.gob.mx/aplicacion/operacion/31274/consulta-y-recupera-tus-facturas

---

**Última actualización:** Octubre 2025
**Versión de Carta Porte:** 3.1
**Versión de CFDI:** 4.0
