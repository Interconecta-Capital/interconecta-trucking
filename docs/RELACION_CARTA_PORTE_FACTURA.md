# Relación Carta Porte ↔ Factura

## 📊 Modelo de Datos

### Base de Datos

#### Tabla `cartas_porte`
- `id` (UUID, PK)
- `factura_id` (UUID, FK → facturas.id, nullable)
- Otros campos de Carta Porte...

#### Tabla `facturas`
- `id` (UUID, PK)
- `carta_porte_id` (UUID, FK → cartas_porte.id, nullable)
- `tiene_carta_porte` (boolean)
- Otros campos de Factura...

**Relación:** Bidireccional opcional (una factura puede tener máximo una carta porte, y una carta porte puede estar vinculada a máximo una factura).

---

## 🔄 Flujos de Trabajo

### **Flujo 1: Carta Porte PRIMERO (Transporte sin cobro inmediato)**

```
Usuario → Crear Carta Porte → Timbrar CP → [Opcional] Vincular a Factura
```

**Caso de uso:** Transporte de mercancías sin cobro inmediato. Se crea la CP, se timbra, y opcionalmente después se puede crear una factura de ingreso vinculada.

**Pasos:**
1. Usuario crea Carta Porte en el módulo de Cartas Porte
2. Usuario timbra la Carta Porte (tipo de comprobante "T" - Traslado)
3. [OPCIONAL] Usuario crea Factura de Ingreso y vincula la CP existente
4. Usuario timbra la Factura con el complemento Carta Porte

**BD:**
```sql
-- Paso 1-2: Solo existe la Carta Porte
INSERT INTO cartas_porte (id, usuario_id, ..., factura_id) 
VALUES (uuid1, user1, ..., NULL);

-- Paso 3-4: Se crea la factura y se vinculan
INSERT INTO facturas (id, user_id, carta_porte_id, tiene_carta_porte, ...) 
VALUES (uuid2, user1, uuid1, TRUE, ...);

UPDATE cartas_porte SET factura_id = uuid2 WHERE id = uuid1;
```

---

### **Flujo 2: Factura PRIMERO con Carta Porte (Transporte con cobro)**

```
Usuario → Crear Factura → Vincular CP existente o crear nueva → Timbrar Factura+CP
```

**Caso de uso:** Venta con transporte incluido. Se crea la factura de ingreso con el complemento Carta Porte desde el inicio.

**Pasos:**
1. Usuario crea Factura de Ingreso en el módulo de Facturas
2. Usuario selecciona "Tiene Carta Porte" 
3. Usuario elige:
   - **Opción A:** Vincular una CP ya timbrada
   - **Opción B:** Crear nueva CP inline
4. Usuario timbra la Factura (se genera CFDI tipo "I" con complemento Carta Porte)

**BD:**

**Opción A (CP existente):**
```sql
-- CP ya existe (timbrada previamente)
SELECT id FROM cartas_porte WHERE id = uuid1 AND factura_id IS NULL;

-- Crear factura vinculada
INSERT INTO facturas (id, user_id, carta_porte_id, tiene_carta_porte, ...) 
VALUES (uuid2, user1, uuid1, TRUE, ...);

-- Actualizar CP
UPDATE cartas_porte SET factura_id = uuid2 WHERE id = uuid1;
```

**Opción B (CP nueva):**
```sql
-- Crear CP inline (sin timbrar aún)
INSERT INTO cartas_porte (id, usuario_id, ..., factura_id) 
VALUES (uuid1, user1, ..., uuid2); -- Ya vinculada desde el inicio

-- Crear factura
INSERT INTO facturas (id, user_id, carta_porte_id, tiene_carta_porte, ...) 
VALUES (uuid2, user1, uuid1, TRUE, ...);

-- Al timbrar la factura, se timbra todo junto
```

---

### **Flujo 3: Factura SIN Carta Porte (Venta sin transporte)**

```
Usuario → Crear Factura → Timbrar Factura
```

**Caso de uso:** Venta de servicios o productos sin transporte.

**Pasos:**
1. Usuario crea Factura de Ingreso
2. Usuario NO selecciona "Tiene Carta Porte"
3. Usuario timbra la Factura (CFDI tipo "I" simple, sin complementos)

**BD:**
```sql
INSERT INTO facturas (id, user_id, carta_porte_id, tiene_carta_porte, ...) 
VALUES (uuid2, user1, NULL, FALSE, ...);
```

---

## 🎯 Reglas de Negocio

### ✅ Permitido:
- ✅ Carta Porte sin Factura (tipo "T" - Traslado)
- ✅ Factura sin Carta Porte (tipo "I" - Ingreso simple)
- ✅ Factura con Carta Porte (tipo "I" con complemento CP)
- ✅ Vincular CP existente a Factura nueva
- ✅ Crear CP inline al crear Factura

### ❌ Restricciones:
- ❌ Una CP no puede estar vinculada a más de una Factura
- ❌ Una Factura no puede tener más de una CP
- ❌ No se puede desvincular una CP de una Factura después de timbrar
- ❌ No se puede modificar una Factura o CP después de timbrar (solo cancelar)

---

## 🔧 Implementación Técnica

### Constraint en BD (recomendado agregar):

```sql
-- Evitar vinculaciones múltiples
CREATE UNIQUE INDEX idx_cartas_porte_factura_id_unique 
ON cartas_porte(factura_id) WHERE factura_id IS NOT NULL;

CREATE UNIQUE INDEX idx_facturas_carta_porte_id_unique 
ON facturas(carta_porte_id) WHERE carta_porte_id IS NOT NULL;
```

### Validaciones en código:

```typescript
// Antes de vincular CP a Factura
const validarVinculacion = async (cartaPorteId: string, facturaId: string) => {
  // Verificar que la CP no esté vinculada a otra factura
  const { data: cp } = await supabase
    .from('cartas_porte')
    .select('factura_id')
    .eq('id', cartaPorteId)
    .single();

  if (cp?.factura_id && cp.factura_id !== facturaId) {
    throw new Error('Esta Carta Porte ya está vinculada a otra factura');
  }

  // Verificar que la factura no tenga otra CP
  const { data: factura } = await supabase
    .from('facturas')
    .select('carta_porte_id')
    .eq('id', facturaId)
    .single();

  if (factura?.carta_porte_id && factura.carta_porte_id !== cartaPorteId) {
    throw new Error('Esta Factura ya tiene una Carta Porte vinculada');
  }

  return true;
};
```

---

## 📋 Casos de Uso Reales

### Caso 1: Transportista puro (sin cobro)
"Necesito documentar el traslado de mercancías pero no cobro por el servicio"

→ **Flujo 1**: Carta Porte (tipo "T") sin Factura

### Caso 2: Venta con flete incluido
"Vendo productos y cobro el flete en la misma factura"

→ **Flujo 2**: Factura de Ingreso con complemento Carta Porte

### Caso 3: Transporte primero, cobro después
"Hago el traslado hoy, pero la factura de cobro la emito la próxima semana"

→ **Flujo 1** (día 1) + **Flujo 2 Opción A** (día 7): CP timbrada → vincular a Factura nueva

### Caso 4: Venta sin transporte
"Vendo servicios digitales sin transporte físico"

→ **Flujo 3**: Factura de Ingreso simple (sin CP)

---

## 🚦 Estados y Validaciones

| Estado CP | Estado Factura | Acción Permitida |
|-----------|----------------|------------------|
| `borrador` | N/A | Editar CP |
| `timbrado` | N/A | Vincular a Factura nueva |
| `timbrado` | `borrador` | Editar Factura, Timbrar |
| `timbrado` | `timbrado` | Solo consulta/descarga |
| `cancelado` | `timbrado` | Solo consulta |
| `timbrado` | `cancelado` | Solo consulta |

---

## 🔍 Consultas SQL Útiles

### Ver Facturas con CP vinculadas:
```sql
SELECT 
  f.id AS factura_id,
  f.folio AS factura_folio,
  f.uuid_fiscal AS factura_uuid,
  f.status AS factura_status,
  cp.id AS cp_id,
  cp.folio AS cp_folio,
  cp.uuid_fiscal AS cp_uuid,
  cp.status AS cp_status
FROM facturas f
LEFT JOIN cartas_porte cp ON f.carta_porte_id = cp.id
WHERE f.tiene_carta_porte = TRUE;
```

### Ver CPs sin Factura:
```sql
SELECT 
  id, folio, uuid_fiscal, status
FROM cartas_porte
WHERE factura_id IS NULL
  AND status = 'timbrado';
```

### Ver Facturas sin CP:
```sql
SELECT 
  id, folio, uuid_fiscal, status
FROM facturas
WHERE tiene_carta_porte = FALSE
  OR carta_porte_id IS NULL;
```
