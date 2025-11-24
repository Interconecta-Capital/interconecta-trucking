# Navegación de Cartas Porte - Guía de Rutas

## 📚 Resumen Ejecutivo

Este documento describe las rutas correctas para navegar entre cartas porte en el sistema, y cómo prevenir la generación de IdCCPs duplicados o "fantasma".

---

## ✅ Rutas Correctas (Definidas en App.tsx)

| Origen | Acción | Destino Correcto | Descripción |
|--------|--------|------------------|-------------|
| **ViajeDetalle** | Editar borrador | `/borrador-carta-porte/:id` | Continuar llenando borrador existente |
| **ViajeDetalle** | Editar carta activa | `/borrador-carta-porte/:id` | Editar carta porte activa (no timbrada) |
| **CartasPortePage** | Editar borrador | `/borrador-carta-porte/:id` | Continuar editando desde lista |
| **CartasPortePage** | Ver carta timbrada | `/carta-porte/:id` | Ver carta porte timbrada (solo lectura) |
| **Cualquier lugar** | Crear nuevo borrador | `/carta-porte/nuevo` | Crear desde cero |

---

## ❌ Rutas Incorrectas (NO USAR)

Las siguientes rutas **NO EXISTEN** en `App.tsx` y causarán problemas:

- ❌ `/carta-porte/editor?borrador=...`
- ❌ `/carta-porte/editor?carta=...`
- ❌ Cualquier ruta con **query params** para pasar IDs
- ❌ `/carta-porte/editar/:id` (no existe)

### ⚠️ Problema causado por rutas incorrectas

Cuando se navega a una ruta inexistente con query params:
1. El router no encuentra la ruta
2. `ModernCartaPorteEditor` se monta sin `documentId` válido
3. `useCartaPorteFormManager` detecta que no hay `documentId`
4. **Se genera un nuevo IdCCP "fantasma"** (ej: `204AFC91-...`)
5. El usuario ve un borrador "vacío" que no existe en la BD

---

## 🔍 Cómo Verificar Rutas en el Código

### Paso 1: Buscar navegaciones incorrectas

```bash
# Buscar en el código navegaciones con query params
grep -r "navigate.*carta-porte/editor" src/
```

### Paso 2: Verificar contra App.tsx

Las **únicas rutas válidas** definidas en `src/App.tsx` son:

```typescript
<Route path="/borrador-carta-porte/:id" element={<CartaPorteEditor />} />
<Route path="/carta-porte/:id" element={<CartaPorteEditor />} />
<Route path="/carta-porte/nuevo" element={<CartaPorteEditor />} />
```

### Paso 3: Corregir navegaciones incorrectas

```typescript
// ❌ ANTES (INCORRECTO)
navigate(`/carta-porte/editor?borrador=${borradorId}`);

// ✅ DESPUÉS (CORRECTO)
navigate(`/borrador-carta-porte/${borradorId}`);
```

---

## 🛡️ Prevención de IdCCPs Fantasma

### Problema

Cuando el componente `ModernCartaPorteEditor` se monta **sin un `documentId` válido**, el hook `useCartaPorteFormManager` genera automáticamente un nuevo IdCCP local, creando la ilusión de un borrador "duplicado" que no existe en la base de datos.

### Solución Implementada

#### 1. Validación en ModernCartaPorteEditor.tsx

```typescript
useEffect(() => {
  if (!documentId) {
    console.error('❌ [ModernCartaPorteEditor] No se proporcionó documentId');
    toast.error('Error: ID de documento no válido');
    navigate('/documentos-fiscales/carta-porte');
  }
}, [documentId, navigate]);
```

#### 2. Generación Condicional en useCartaPorteFormManager.ts

```typescript
useEffect(() => {
  // ✅ SOLO generar IdCCP si estamos creando un NUEVO borrador
  if (!currentCartaPorteId && !cartaPorteId && !idCCP && !borradorCargado) {
    const newIdCCP = UUIDService.generateValidIdCCP();
    setIdCCP(newIdCCP);
  }
}, [currentCartaPorteId, cartaPorteId, idCCP, borradorCargado]);
```

#### 3. Limpieza de localStorage

```typescript
const loadCartaPorteData = useCallback(async (id: string) => {
  // ✅ Limpiar idCCP fantasma ANTES de cargar
  setIdCCP('');
  
  // Limpiar localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('carta-porte-') || key.includes('idCCP')) {
      localStorage.removeItem(key);
    }
  });
  
  // Cargar datos reales de BD...
}, []);
```

---

## 🐛 Debugging: Cómo Identificar IdCCPs Fantasma

### Síntomas

- ✅ En la BD hay UN borrador con IdCCP: `3C5E0C6A3CF9481EA06C0EE78759FF6D`
- ❌ El usuario ve OTRO IdCCP diferente: `204AFC91-E6A1-4B1D-9BF0-123456789ABC`
- ❌ Los datos del formulario están vacíos o incompletos
- ❌ El progreso muestra 0% o valores incorrectos

### Pasos de Debugging

1. **Abrir DevTools → Console**
2. **Buscar logs de navegación:**

```
🔍 [ViajeDetalle] Navegando a borrador: {
  borradorId: "ee9877f1-9982-4ec9-9ce7-7d07279f5f6c",
  ruta: "/borrador-carta-porte/ee9877f1-9982-4ec9-9ce7-7d07279f5f6c",
  idCCP_en_borrador: "3C5E0C6A3CF9481EA06C0EE78759FF6D"
}
```

3. **Verificar que `documentId` NO sea undefined:**

```
✅ [ModernCartaPorteEditor] Documento cargado: {
  documentId: "ee9877f1-9982-4ec9-9ce7-7d07279f5f6c",
  isBorrador: true,
  idCCP: "3C5E0C6A3CF9481EA06C0EE78759FF6D"
}
```

4. **Si ves esto, hay un problema:**

```
❌ [ModernCartaPorteEditor] No se proporcionó documentId
❌ [CartaPorteForm] IdCCP generado para NUEVO borrador: 204AFC91-...
```

---

## 📋 Checklist de Corrección

Antes de aprobar un PR que modifica navegación de cartas porte:

- [ ] Todas las navegaciones usan `/borrador-carta-porte/:id` (NO query params)
- [ ] `ModernCartaPorteEditor` valida `documentId` al montar
- [ ] `useCartaPorteFormManager` NO genera IdCCP si ya hay uno cargando
- [ ] `loadCartaPorteData` limpia localStorage y `idCCP` antes de cargar
- [ ] Se agregaron logs para debugging
- [ ] Se probó navegación desde:
  - [ ] ViajeDetalle → Borrador
  - [ ] ViajeDetalle → Carta activa
  - [ ] CartasPortePage → Borrador
  - [ ] CartasPortePage → Carta timbrada

---

## 🎯 Resultado Esperado

✅ **UN viaje → UN borrador → UN idCCP (el real de la BD)**

✅ **Navegación consistente desde cualquier lugar**

✅ **No más IdCCPs "fantasma" generados en frontend**

✅ **Usuario siempre ve los datos correctos de la BD**

✅ **Progreso correcto (ej: 67% si tiene 4 de 6 secciones completas)**

✅ **Logs claros para debugging futuro**

---

## 📞 Contacto

Si encuentras un caso donde aparecen IdCCPs duplicados:

1. Abrir DevTools → Console
2. Reproducir el problema
3. Copiar todos los logs que contienen `[CartaPorteForm]` o `[ModernCartaPorteEditor]`
4. Reportar con screenshots de:
   - La consola
   - La URL de la página
   - El IdCCP mostrado en la UI
   - El IdCCP en la BD (verificado con SQL)

---

## 🔧 SQL de Auditoría

Para verificar que no hay IdCCPs duplicados:

```sql
-- Verificar IdCCP en borradores
SELECT 
  id,
  nombre_borrador,
  viaje_id,
  datos_formulario->'idCCP' as id_ccp,
  created_at
FROM borradores_carta_porte
WHERE user_id = 'tu-user-id'
ORDER BY created_at DESC;

-- Buscar viajes con múltiples borradores
SELECT 
  viaje_id,
  COUNT(*) as cantidad_borradores,
  ARRAY_AGG(id) as borrador_ids
FROM borradores_carta_porte
WHERE user_id = 'tu-user-id'
GROUP BY viaje_id
HAVING COUNT(*) > 1;
```

---

**Última actualización:** 2025-11-24
**Versión:** 1.0
**Autor:** Sistema de Gestión de Cartas Porte
