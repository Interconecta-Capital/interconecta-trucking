# Errores SAT Comunes y Soluciones

## ✅ Normalización Automática de Fechas

El sistema normaliza automáticamente las fechas para cumplir con el formato SAT:

### Transformaciones Aplicadas:

1. **Sin segundos** → Se agregan automáticamente
   - `2025-11-22T11:29` → `2025-11-22T11:29:00`

2. **Con milisegundos** → Se eliminan
   - `2025-11-24T02:26:48.729` → `2025-11-24T02:26:48`

3. **Con zona horaria** → Se elimina
   - `2025-11-24T02:26:48Z` → `2025-11-24T02:26:48`

### Ventajas:
- ✅ Los usuarios no necesitan preocuparse por el formato exacto
- ✅ El sistema acepta múltiples formatos de entrada
- ✅ Garantiza cumplimiento con especificación SAT CFDI 4.0

---

## CFDI40139 - Nombre del Emisor No Coincide con RFC

### Causa
El nombre del emisor enviado no coincide con el nombre registrado oficialmente en el SAT para ese RFC. Este error es especialmente común en ambiente sandbox (pruebas).

### Solución en Modo Pruebas (Sandbox)

**El sistema automáticamente usa los datos oficiales del SAT** cuando tu empresa está en modo pruebas.

#### RFCs de Prueba Oficiales del SAT

| RFC | Nombre Oficial | Tipo | Régimen Fiscal |
|-----|----------------|------|----------------|
| EKU9003173C9 | ESCUELA KEMPER URGATE | Moral | 601 |
| CACX7605101P8 | XOCHILT CASAS CHAVEZ | Física | 605 |

**IMPORTANTE**: 
- ✅ El sistema automáticamente usa estos datos cuando `modo_pruebas = true`
- ✅ Verás una alerta amber en la pantalla de configuración indicando qué datos se están usando
- ✅ Tu configuración real se mantiene intacta y se usará en producción

### Solución en Producción

Verifica que tu RFC y razón social estén registrados correctamente en:
- **Administración > Mi Empresa > Datos Fiscales**
- Asegúrate de que el RFC y nombre coincidan EXACTAMENTE con los registrados ante el SAT

### ¿Por qué este error?

El SAT valida que el nombre del emisor coincida con el registrado oficialmente para prevenir suplantación de identidad fiscal. En ambiente sandbox, DEBES usar los RFCs y nombres oficiales de prueba del SAT.

---

## CFDI40101 - El campo Fecha no cumple con el patrón requerido

**Causa:** Formato de fecha incorrecto (con milisegundos o zona horaria)

**Formato correcto:** `YYYY-MM-DDTHH:MM:SS`

**Ejemplo válido:** `2025-11-24T14:30:15`

**Ejemplo inválido:** `2025-11-24T14:30:15.266` o `2025-11-24T14:30:15Z`

**Solución:** Usar `SATFormatters.formatFechaCFDI()` para todas las fechas en el CFDI.

---

## CFDI40109 - El TipoDeComprobante es T o P y el importe no es igual a 0

**Causa:** Para comprobantes de tipo Traslado (T) o Pago (P), el SubTotal y Total deben ser exactamente `0.00`

**Solución:** 
- Si es Traslado con CartaPorte, usar `SubTotal="0.00"` y `Total="0.00"`
- Si es Ingreso, cambiar `TipoDeComprobante="I"`

---

## CFDI304 - RFC del receptor no existe en la lista de RFC inscritos

**Causa:** RFC no registrado en el padrón del SAT o tiene errores de captura

**Solución:** 
- Verificar RFC en https://www.sat.gob.mx/
- Confirmar que el RFC esté activo y sin restricciones
- Revisar que no haya espacios o caracteres especiales

---

## CCP215 - RFC del operador no válido

**Causa:** RFC en la figura de transporte no coincide con el padrón SAT

**Solución:** 
- Actualizar RFC en el catálogo de conductores
- Verificar que el RFC sea de persona física (13 caracteres)
- Confirmar que el operador esté dado de alta en el SAT

---

## CFDI40110 - Régimen fiscal inválido

**Causa:** Código de régimen fiscal no existe en el catálogo del SAT

**Regímenes válidos:**
- `601` - General de Ley Personas Morales
- `603` - Personas Morales con Fines no Lucrativos
- `605` - Sueldos y Salarios e Ingresos Asimilados a Salarios
- `606` - Arrendamiento
- `612` - Personas Físicas con Actividades Empresariales
- `621` - Incorporación Fiscal
- Etc. (ver catálogo completo en `SATValidators.REGIMENES_FISCALES`)

**Solución:** Usar solo códigos válidos del catálogo SAT c_RegimenFiscal

---

## CFDI40111 - UsoCFDI inválido

**Causa:** Código de uso de CFDI no existe en el catálogo

**Usos comunes:**
- `G01` - Adquisición de mercancías
- `G02` - Devoluciones, descuentos o bonificaciones
- `G03` - Gastos en general
- `I01` - Construcciones
- `I02` - Mobiliario y equipo de oficina
- `CP01` - Pagos (para CartaPorte)

**Solución:** Verificar que el uso CFDI sea compatible con el régimen fiscal del receptor

---

## CCP202 - Falta información de ubicaciones

**Causa:** CartaPorte requiere al menos 2 ubicaciones (origen y destino)

**Solución:**
- Agregar ubicación de origen con `TipoUbicacion="Origen"`
- Agregar ubicación de destino con `TipoUbicacion="Destino"`
- Incluir código postal válido en ambas ubicaciones

---

## CCP207 - Distancia recorrida no corresponde

**Causa:** La distancia declarada no es coherente con las ubicaciones

**Solución:**
- Calcular distancia real entre origen y destino
- Usar servicio de rutas para obtener distancia precisa
- La distancia debe estar en kilómetros con 2 decimales

---

## CFDI403 - Error en el sellado

**Causa:** Certificado digital vencido, incorrecto o password inválido

**Solución:**
- Verificar vigencia del certificado (.cer)
- Confirmar que el password de la llave privada (.key) sea correcto
- Renovar certificado si está vencido

---

## Validaciones Pre-Timbrado

Para evitar estos errores, el sistema realiza validaciones exhaustivas antes de enviar al PAC:

1. ✅ Formato de fecha (sin milisegundos)
2. ✅ RFCs válidos (emisor y receptor)
3. ✅ Valores monetarios con 2 decimales exactos
4. ✅ Códigos postales de 5 dígitos
5. ✅ Catálogos SAT (régimen fiscal, uso CFDI, forma de pago)
6. ✅ Conceptos completos (clave, cantidad, descripción)
7. ✅ Ubicaciones CartaPorte (mínimo 2)
8. ✅ Figuras de transporte con RFC válido

---

## Modo Sandbox vs Producción

**Sandbox (Pruebas):**
- URL: `http://services.test.sw.com.mx`
- Usar RFC de prueba: `EKU9003173C9`
- Los timbres no tienen validez fiscal

**Producción:**
- URL: `https://services.sw.com.mx`
- Usar RFC real registrado en SAT
- Los timbres tienen validez fiscal completa

---

## Recursos Adicionales

- [Catálogos SAT oficiales](http://omawww.sat.gob.mx/tramitesyservicios/Paginas/catalogos_emision_cfdi_complemento_carta_porte.htm)
- [Validador XML SAT](https://www.sat.gob.mx/aplicacion/51174/verifica-comprobantes)
- [SmartWeb API Docs](https://developers.sw.com.mx/)
