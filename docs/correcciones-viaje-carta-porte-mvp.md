# 🔧 Correcciones Implementadas: Viaje → Carta Porte (MVP)

**Fecha:** 2025-10-27  
**Estado:** ✅ Completado  
**Fases:** 1-5 (Críticas para MVP)

---

## 📋 Resumen de Problemas Corregidos

### ❌ Problemas Previos:
1. Cliente aparecía como "No especificado" en resumen del viaje
2. Borradores de Carta Porte se generaban vacíos o incompletos
3. Se creaban borradores duplicados para el mismo viaje
4. Editor de Carta Porte no mostraba datos del viaje
5. Faltaban datos fiscales completos del cliente

### ✅ Correcciones Aplicadas:
1. ✅ Visualización correcta del cliente en resumen
2. ✅ Enriquecimiento automático de datos del cliente
3. ✅ Validación completa antes de crear borrador
4. ✅ Prevención de duplicación de borradores
5. ✅ Enriquecimiento de borradores con datos del viaje

---

## 🔧 FASE 1: Corrección de Visualización del Cliente

**Archivo modificado:** `src/components/viajes/wizard/ViajeWizardResumen.tsx`

### Cambio:
```typescript
// ANTES:
<p>{data.cliente?.nombre || 'No especificado'}</p>

// DESPUÉS:
<p>{data.cliente?.nombre_razon_social || data.cliente?.nombre || 'No especificado'}</p>
```

### Resultado:
- El nombre del cliente ahora se muestra correctamente en el resumen
- Prioriza `nombre_razon_social` (campo correcto) sobre `nombre` (legacy)
- Fallback a "No especificado" si no hay datos

---

## 🔧 FASE 2: Enriquecimiento de Datos del Cliente

**Archivos creados/modificados:**
- `src/hooks/viajes/useClienteCompletoDatos.ts` (NUEVO)
- `src/components/viajes/wizard/ViajeWizardMision.tsx`

### Hook Creado: `useClienteCompletoDatos`

```typescript
export function useClienteCompletoDatos(clienteId?: string) {
  // Carga automática de datos fiscales completos:
  // - RFC
  // - Régimen Fiscal
  // - Uso CFDI
  // - Domicilio Fiscal
  // - Tipo de Persona
  // - Email y Teléfono
}
```

### Flujo:
1. Usuario selecciona cliente en el wizard
2. Hook carga datos completos desde `socios` o `clientes_proveedores`
3. Datos se enriquecen automáticamente en `wizardData.cliente`
4. Todos los datos fiscales quedan disponibles para la Carta Porte

### Resultado:
- Cliente tiene TODOS los datos fiscales necesarios
- Régimen fiscal se incluye automáticamente
- Domicilio fiscal se carga desde la base de datos
- No se requiere entrada manual de datos ya existentes

---

## 🔧 FASE 3: Validación y Mapeo Completo

**Archivo modificado:** `src/services/viajes/ViajeToCartaPorteMapper.ts`

### Método Agregado: `validarDatosCompletos()`

```typescript
static validarDatosCompletos(wizardData: ViajeWizardData): { 
  valido: boolean; 
  errores: string[] 
} {
  // Valida:
  // ✅ Cliente (RFC, nombre, régimen fiscal)
  // ✅ Ubicaciones (origen y destino con direcciones)
  // ✅ Vehículo (placa, permiso SCT)
  // ✅ Conductor (nombre, RFC, licencia)
  // ✅ Mercancía (descripción)
}
```

### Método Mejorado: `getEmisorData()`

```typescript
static async getEmisorData(): Promise<{ 
  rfc: string; 
  nombre: string; 
  regimenFiscal: string 
}> {
  // Obtiene datos del emisor desde:
  // 1. ConfiguracionEmisorService (configuracion_empresa)
  // 2. Valida que los datos estén completos
  // 3. Lanza error descriptivo si faltan datos
}
```

### Resultado:
- Validación estricta ANTES de crear borrador
- Errores claros y descriptivos si faltan datos
- Datos del emisor (transportista) se cargan automáticamente
- Mapeo completo RFC Emisor → Receptor con régimen fiscal

---

## 🔧 FASE 4: Prevención de Duplicación de Borradores

**Archivo modificado:** `src/services/viajes/ViajeCartaPorteService.ts`

### Flujo Mejorado en `crearBorradorDesdeViaje()`:

```typescript
1. ✅ VERIFICAR si ya existe borrador
   → Consultar viajes.tracking_data.borrador_carta_porte_id
   
2. ✅ Si existe borrador:
   → Verificar que aún existe en borradores_carta_porte
   → Si existe: REUTILIZAR (no crear duplicado)
   → Si no existe: Continuar creación

3. ✅ VALIDAR datos completos
   → Usar ViajeToCartaPorteMapper.validarDatosCompletos()
   → Mostrar errores claros si faltan datos

4. ✅ MAPEAR datos (ahora es async)
   → await ViajeToCartaPorteMapper.mapToValidCartaPorteFormat()
   → Incluye datos del emisor automáticamente

5. ✅ CREAR borrador
   → Solo si pasa validaciones

6. ✅ VINCULAR en tracking_data con metadatos
   → Guardar borrador_carta_porte_id
   → Almacenar datos_cliente (RFC, nombre, régimen)
   → Almacenar datos_emisor (RFC, nombre)
```

### Resultado:
- NO se crean borradores duplicados para el mismo viaje
- Toast informativo si ya existe un borrador
- Reutilización inteligente de borradores existentes
- Metadatos enriquecidos en `tracking_data` para trazabilidad

---

## 🔧 FASE 5: Enriquecimiento al Cargar Borradores

**Archivo modificado:** `src/hooks/carta-porte/useCartaPorteFormManager.ts`

### Flujo Mejorado en `loadCartaPorteData()`:

```typescript
1. ✅ Cargar borrador desde borradores_carta_porte

2. ✅ Buscar viaje vinculado:
   → SELECT * FROM viajes 
   → WHERE tracking_data->>'borrador_carta_porte_id' = borrador.id

3. ✅ Si encuentra viaje vinculado:
   → Extraer datos_cliente de tracking_data
   → Enriquecer formData.rfcReceptor
   → Enriquecer formData.nombreReceptor
   → Agregar metadata con viaje_id y ubicaciones

4. ✅ Persistir datos en sesión
```

### Resultado:
- Editor de Carta Porte muestra datos completos del viaje
- RFC y nombre del receptor se cargan automáticamente
- Metadata incluye referencia al viaje de origen
- Datos persisten correctamente entre sesiones

---

## 📊 Validación del Flujo Completo

### Flujo Correcto POST-CORRECCIONES:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO CREA VIAJE                                       │
│    ↓                                                         │
│    • Selecciona cliente                                     │
│    • Hook carga datos fiscales completos (FASE 2)          │
│    • Define origen, destino, mercancía                      │
│    • Selecciona vehículo y conductor                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SISTEMA VALIDA DATOS (FASE 3)                           │
│    ↓                                                         │
│    • ViajeToCartaPorteMapper.validarDatosCompletos()       │
│    • Si faltan datos → Error descriptivo                    │
│    • Si datos OK → Continuar                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. VERIFICACIÓN DE DUPLICADOS (FASE 4)                     │
│    ↓                                                         │
│    • ¿Ya existe borrador_carta_porte_id?                   │
│    • SI → Reutilizar borrador existente                     │
│    • NO → Crear nuevo borrador                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CREACIÓN DE BORRADOR                                     │
│    ↓                                                         │
│    • Obtener datos emisor (ConfiguracionEmisorService)     │
│    • Mapear wizardData → CartaPorteData                     │
│    • Crear en borradores_carta_porte                        │
│    • Vincular en viajes.tracking_data                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. USUARIO ABRE EDITOR DE CARTA PORTE (FASE 5)            │
│    ↓                                                         │
│    • useCartaPorteFormManager carga borrador               │
│    • Busca viaje vinculado                                  │
│    • Enriquece datos desde tracking_data                    │
│    • Muestra datos completos en editor                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. COMPLETAR Y TIMBRAR (FUTURO)                            │
│    ↓                                                         │
│    • Usuario completa campos faltantes                      │
│    • convertirBorradorACartaPorte()                         │
│    • Actualizar viajes.carta_porte_id                       │
│    • Generar XML y timbrar ante SAT                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Consultas SQL de Verificación

### 1. Verificar viajes con borradores vinculados:

```sql
SELECT 
  v.id,
  v.origen,
  v.destino,
  v.estado,
  v.tracking_data->>'borrador_carta_porte_id' as borrador_id,
  v.tracking_data->'datos_cliente'->>'rfc' as cliente_rfc,
  v.tracking_data->'datos_cliente'->>'nombre' as cliente_nombre,
  bcp.nombre_borrador,
  bcp.created_at as borrador_creado
FROM viajes v
LEFT JOIN borradores_carta_porte bcp 
  ON bcp.id = (v.tracking_data->>'borrador_carta_porte_id')::uuid
WHERE v.tracking_data->>'borrador_carta_porte_id' IS NOT NULL
ORDER BY v.created_at DESC
LIMIT 10;
```

### 2. Verificar datos completos en borradores:

```sql
SELECT 
  id,
  nombre_borrador,
  datos_formulario->>'rfcEmisor' as rfc_emisor,
  datos_formulario->>'nombreEmisor' as nombre_emisor,
  datos_formulario->>'rfcReceptor' as rfc_receptor,
  datos_formulario->>'nombreReceptor' as nombre_receptor,
  datos_formulario->>'regimenFiscalEmisor' as regimen_emisor,
  jsonb_array_length(datos_formulario->'ubicaciones') as num_ubicaciones,
  jsonb_array_length(datos_formulario->'mercancias') as num_mercancias,
  created_at
FROM borradores_carta_porte
ORDER BY created_at DESC
LIMIT 5;
```

### 3. Detectar duplicados potenciales:

```sql
SELECT 
  v.id as viaje_id,
  COUNT(bcp.id) as num_borradores,
  array_agg(bcp.id) as borrador_ids
FROM viajes v
LEFT JOIN borradores_carta_porte bcp 
  ON bcp.nombre_borrador LIKE '%' || COALESCE(v.origen, '') || '%'
WHERE v.created_at > NOW() - INTERVAL '7 days'
GROUP BY v.id
HAVING COUNT(bcp.id) > 1;
```

---

## 🎯 Resultados Esperados POST-CORRECCIONES

### ✅ Antes de las correcciones:
- ❌ Cliente: "No especificado"
- ❌ Borrador vacío o incompleto
- ❌ Duplicados en borradores
- ❌ Editor sin datos del viaje

### ✅ Después de las correcciones:
- ✅ Cliente: Muestra nombre correcto
- ✅ Borrador: Datos completos (emisor + receptor + ubicaciones + mercancías)
- ✅ Sin duplicados: Reutiliza borrador existente
- ✅ Editor: Muestra todos los datos del viaje vinculado

---

## 📝 Próximos Pasos (POST-MVP)

### FASE 6: Módulo de Facturación Electrónica
- [ ] Crear tabla `facturas_electronicas`
- [ ] Implementar `FacturacionService`
- [ ] Crear `FacturaEditor` component
- [ ] Vincular Carta Porte como complemento de CFDI
- [ ] Integrar timbrado SAT

### FASE 7: Validaciones Visuales en Editor
- [ ] Indicadores de campos vacíos
- [ ] Alertas de datos incompletos
- [ ] Tooltips explicativos
- [ ] Validación en tiempo real

### FASE 8: Documentación de Usuario
- [ ] `docs/flujo-facturacion-carta-porte.md`
- [ ] `docs/guia-usuario-carta-porte.md`
- [ ] `docs/diferencia-cfdi-carta-porte.md`

---

## 🔍 Archivos Modificados

### Creados:
- `src/hooks/viajes/useClienteCompletoDatos.ts`
- `docs/correcciones-viaje-carta-porte-mvp.md`

### Modificados:
- `src/components/viajes/wizard/ViajeWizardResumen.tsx`
- `src/components/viajes/wizard/ViajeWizardMision.tsx`
- `src/services/viajes/ViajeToCartaPorteMapper.ts`
- `src/services/viajes/ViajeCartaPorteService.ts`
- `src/hooks/carta-porte/useCartaPorteFormManager.ts`

---

## ✅ Checklist de Validación

- [x] Cliente se muestra correctamente en resumen
- [x] Datos fiscales completos del cliente se cargan automáticamente
- [x] Validación estricta antes de crear borrador
- [x] No se crean borradores duplicados
- [x] Editor carga datos completos del viaje
- [x] Metadatos enriquecidos en tracking_data
- [x] Logs descriptivos en consola para debugging
- [x] Manejo de errores con mensajes claros
- [x] TypeScript sin errores de compilación

---

**Estado Final:** ✅ MVP FUNCIONAL - Viaje → Carta Porte
