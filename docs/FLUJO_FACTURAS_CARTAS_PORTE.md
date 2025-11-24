# 📋 Flujo Completo: Facturas y Cartas Porte

**Última actualización:** 2025-11-24
**Versión del sistema:** 3.1

---

## 📊 Diagrama del Flujo

```mermaid
graph TD
    A[Wizard de Viaje] --> B[Viaje Creado]
    B --> C[Factura Borrador]
    B --> D[Borrador Carta Porte]
    
    C --> E[/documentos-fiscales/facturas]
    D --> F[/documentos-fiscales/carta-porte]
    
    E --> G{Usuario: Timbrar Factura}
    G --> H[Navega a /viajes/:id]
    H --> I[Modal de Previsualización]
    
    F --> J{Usuario: Continuar Llenado}
    J --> K[/carta-porte/editor/:id]
    K --> L[Completa Progreso ≥ 80%]
    L --> M[Activar Carta Porte]
    
    M --> N[Carta Porte Activa]
    I --> O{Validar CP Activa}
    O -->|Sí| P[Timbrar con Edge Function]
    O -->|No| Q[Mensaje: Completar CP primero]
    
    P --> R[Factura y CP Timbradas]
    R --> S[Viaje Vinculado]
```

---

## 🔑 Conceptos Clave

### IdCCP (Identificador Único)
- **Formato:** 32 caracteres alfanuméricos en MAYÚSCULAS (UUID sin guiones)
- **Generación:** Automática al crear borrador
- **Persistencia:** `borradores_carta_porte.datos_formulario.idCCP`
- **Visualización:** `A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6`

### Progreso de Completitud
El sistema calcula el progreso en tiempo real basándose en 5 secciones:

| Sección | Peso | Requisito Mínimo |
|---------|------|------------------|
| Configuración | 20% | RFCs emisor y receptor |
| Ubicaciones | 20% | Mínimo 2 (origen y destino) |
| Mercancías | 20% | Mínimo 1 mercancía |
| Autotransporte | 20% | Placa del vehículo |
| Figuras | 20% | Mínimo 1 figura (operador) |

**Progreso mínimo para activar:** 80%

---

## 🛣️ Flujo Detallado

### FASE 1: Creación desde Wizard de Viaje

```typescript
// Usuario completa wizard
1. ViajeWizard.tsx → onComplete()
2. ViajeCartaPorteService.crearBorradorDesdeViaje()
   - Crea viaje en estado "programado"
   - Crea factura borrador con tiene_carta_porte=true
   - Crea borrador de carta porte:
     * idCCP: GENERADO AUTOMÁTICAMENTE
     * datos_formulario: mapeados desde wizard
     * viaje_id: vinculado al viaje
     * progreso inicial: ~40-60%
```

**Resultado:**
```json
{
  "viaje": {
    "id": "uuid-viaje",
    "estado": "programado",
    "tracking_data": {
      "borrador_carta_porte_id": "uuid-borrador"
    }
  },
  "factura": {
    "id": "uuid-factura",
    "status": "draft",
    "tiene_carta_porte": true,
    "viaje_id": "uuid-viaje"
  },
  "borrador_cp": {
    "id": "uuid-borrador",
    "viaje_id": "uuid-viaje",
    "datos_formulario": {
      "idCCP": "A1B2C3D4E5F6..." // ✅ Ya generado
    }
  }
}
```

---

### FASE 2: Vista de Facturas (/documentos-fiscales/facturas)

#### UI Principal
```tsx
// FacturasTab.tsx
- Buscar facturas por serie, folio, RFC, cliente
- Filtrar por estado: Todos, Borradores, Timbradas, Canceladas
- Acciones:
  * Ver Detalles → /factura/:id
  * Editar → /factura/editar/:id (solo borradores)
  * Timbrar Factura → navigate('/viajes/:id', { state: { from: 'facturas' } })
  * Eliminar (solo borradores)
```

#### Handler: Timbrar Factura
```typescript
const handleTimbrarFactura = async (facturaId: string) => {
  // 1. Cargar factura con viaje
  const factura = await supabase
    .from('facturas')
    .select('*, viaje:viajes!facturas_viaje_id_fkey(*)')
    .eq('id', facturaId)
    .single();
  
  // 2. Navegar a viaje con estado
  navigate(`/viajes/${factura.viaje_id}`, { 
    state: { from: 'facturas' } 
  });
  
  // 3. ViajeDetalle.tsx detecta origen y ajusta botón "Volver"
};
```

---

### FASE 3: Detalles de Factura (/factura/:id)

#### Página: FacturaDetallePage.tsx
```tsx
// Muestra:
- Información general (serie, folio, total, RFCs)
- Detalles CFDI (uso, forma/método de pago, moneda)
- Sección "Carta Porte Vinculada":
  * IdCCP del borrador
  * Progreso actual
  * Botón "Continuar Llenado de Carta Porte"
- Acciones:
  * Editar Factura (solo borradores)
  * Pre-visualizar y Timbrar
  * Descargar PDF/XML (solo timbradas)
```

---

### FASE 4: Vista de Cartas Porte (/documentos-fiscales/carta-porte)

#### UI Principal
```tsx
// CartasPorteTab.tsx
- Buscar por IdCCP, RFC, UUID, viaje
- Filtrar por estado: Todos, Borradores, Auto-guardados, Timbradas, Canceladas
- Cada borrador muestra:
  * IdCCP: Badge verde si existe
  * Progreso: Barra de progreso con %
  * Datos incompletos: Badge amarillo si faltan datos
  * Acciones:
    - Continuar Editando → /borrador-carta-porte/:id
    - Activar (si progreso ≥ 80%)
    - Eliminar
```

#### Cálculo de Progreso
```typescript
const calcularProgreso = (datosFormulario: any): number => {
  let completedSections = 0;
  
  // 1. Configuración (RFCs)
  if (datosForm.rfcEmisor && datosForm.rfcReceptor) completedSections++;
  
  // 2. Ubicaciones (mín 2)
  if (datosForm.ubicaciones?.length >= 2) completedSections++;
  
  // 3. Mercancías (mín 1)
  if (datosForm.mercancias?.length > 0) completedSections++;
  
  // 4. Autotransporte (placa)
  if (datosForm.autotransporte?.placa_vm) completedSections++;
  
  // 5. Figuras (mín 1)
  if (datosForm.figuras?.length > 0) completedSections++;
  
  return Math.round((completedSections / 5) * 100);
};
```

---

### FASE 5: Editor de Carta Porte (/carta-porte/editor/:id)

#### Funcionalidad
```typescript
// ModernCartaPorteEditor.tsx
1. Cargar borrador desde Supabase
2. Si falta idCCP:
   - Generar automáticamente: UUIDService.generateValidIdCCP()
   - Guardar en datos_formulario
   - Mostrar en header: IdCCP en verde
3. Mostrar progreso en tiempo real
4. Permitir edición de 5 secciones
5. Auto-guardar cada 30 segundos
6. Validar antes de activar (progreso ≥ 80%)
```

#### Activar Carta Porte
```typescript
const handleActivar = async () => {
  // 1. Validar progreso ≥ 80%
  const progreso = calcularProgreso(formData);
  if (progreso < 80) {
    toast.error('Completa al menos 80% antes de activar');
    return;
  }
  
  // 2. Convertir borrador a Carta Porte activa
  const cartaPorte = await CartaPorteLifecycleManager
    .convertirBorradorACartaPorte({
      borradorId: borrador.id,
      validarDatos: true
    });
  
  // 3. Generar folio: CP-001, CP-002, etc.
  // 4. Vincular con viaje
  await supabase
    .from('viajes')
    .update({ 
      carta_porte_id: cartaPorte.id,
      tracking_data: {
        carta_porte_activa: true
      }
    })
    .eq('id', viaje_id);
};
```

---

### FASE 6: Timbrado Final

#### Pre-requisitos
- ✅ Carta Porte activa (status='active')
- ✅ Progreso ≥ 80%
- ✅ Certificado digital activo
- ✅ Créditos de timbrado disponibles

#### Edge Function: timbrar-con-sw
```typescript
// Llamada desde ViajeDetalle.tsx
const response = await supabase.functions.invoke('timbrar-con-sw', {
  body: {
    facturaId: factura.id,
    cartaPorteId: cartaPorte.id,
    certificadoId: certificado.id
  }
});

// Edge function:
1. Genera XML CFDI 4.0 con complemento CartaPorte 3.1
2. Timbra con proveedor (SmartWay, etc.)
3. Actualiza registros:
   - Factura: status='timbrada', uuid_fiscal, fecha_timbrado
   - Carta Porte: status='timbrado', uuid_fiscal
   - Viaje: vinculación final con carta_porte_id
```

---

## ⚠️ Solución de Problemas

### Problema 1: "🔄 Generando..." permanente

**Causa:** Borrador legacy sin `idCCP` en `datos_formulario`

**Solución:**
```sql
-- Ejecutar script de reparación
-- Ver: docs/SQL_AUDITORIA_CARTAS_PORTE.sql (sección 7)
UPDATE borradores_carta_porte
SET datos_formulario = jsonb_set(
  datos_formulario, 
  '{idCCP}', 
  to_jsonb(UPPER(REPLACE(gen_random_uuid()::text, '-', '')))
)
WHERE datos_formulario->>'idCCP' IS NULL;
```

O simplemente abrir el borrador en el editor (se auto-genera).

---

### Problema 2: Progreso siempre 0%

**Causa:** `datos_formulario` vacío o campos en ubicación incorrecta

**Solución:**
Verificar estructura en Supabase:
```json
{
  "idCCP": "A1B2...",
  "rfcEmisor": "AAA010101AAA",  // ← Debe estar en raíz
  "rfcReceptor": "BBB020202BBB",
  "ubicaciones": [...],          // ← Array con al menos 2 elementos
  "mercancias": [...],           // ← Array con al menos 1 elemento
  "autotransporte": {
    "placa_vm": "ABC123"         // ← Campo requerido
  },
  "figuras": [...]               // ← Array con al menos 1 elemento
}
```

---

### Problema 3: "Volver" regresa a lugar incorrecto

**Causa:** No se pasó `state: { from: 'facturas' }` en navigate

**Solución:**
```typescript
// Siempre pasar estado al navegar desde facturas
navigate(`/viajes/${viajeId}`, { 
  state: { from: 'facturas' } 
});

// En ViajeDetalle.tsx detectar:
const fromFacturas = window.history.state?.usr?.from === 'facturas';
```

---

## 📊 Métricas de Auditoría

Ejecutar periódicamente: `docs/SQL_AUDITORIA_CARTAS_PORTE.sql`

**Indicadores clave:**
- Borradores sin IdCCP: **0** ✅
- Viajes con múltiples borradores: **< 5** ⚠️
- Cartas porte huérfanas: **< 3** ⚠️
- Borradores con progreso < 80%: *Cualquier cantidad* (normal)

---

## 🔗 Referencias

- [Documentación Carta Porte SAT](https://www.sat.gob.mx/)
- [CFDI 4.0 Especificaciones](https://www.sat.gob.mx/consultas/92764/conoce-las-especificaciones-tecnicas-del-cfdi-version-4.0)
- [Complemento Carta Porte 3.1](https://www.sat.gob.mx/aplicacion/operacion/66752/complemento-carta-porte)
