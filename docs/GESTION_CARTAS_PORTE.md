# Gestión de Cartas Porte - Guía del Usuario

## 📊 Contador de Documentos

El contador en `/documentos-fiscales` muestra **solo documentos fiscales válidos timbrados**:
- ✅ **Cartas Porte TIMBRADAS** - Documentos fiscales válidos con UUID del SAT
- ❌ **NO muestra borradores** - Los borradores son trabajos en progreso

**Esto es correcto por diseño:**
- Un borrador NO es un documento fiscal válido hasta que se timbre
- El contador refleja documentos legalmente válidos ante el SAT

---

## 🔄 Flujo Correcto de Creación

### 1. **Crear Viaje en el Wizard**
- Completa todos los pasos del wizard de viajes
- Se genera **automáticamente UN borrador** vinculado al viaje
- El borrador contiene toda la información del viaje

### 2. **Editar y Completar el Borrador**
- Navega a `/documentos-fiscales/carta-porte`
- Verás el borrador con una barra de progreso
- Haz clic en **"Continuar Editando"**
- Completa todos los campos requeridos

### 3. **Requisito de Completitud: 80% Mínimo**
⚠️ **IMPORTANTE**: Debes completar al menos **80% del borrador** antes de poder activarlo

**Las 5 secciones evaluadas son:**
1. ✅ Configuración (RFC emisor y receptor)
2. ✅ Ubicaciones (mínimo origen y destino)
3. ✅ Mercancías (al menos una mercancía)
4. ✅ Autotransporte (placa del vehículo)
5. ✅ Figuras de transporte (al menos el operador)

### 4. **Activar Carta Porte** (Opcional)
- Solo disponible si el progreso es >= 80%
- Convierte el borrador a "Carta Porte Activa"
- Genera un IdCCP único
- Estado: `active` pero aún NO timbrada

### 5. **Timbrar con el SAT**
- Una vez activa (o directamente desde borrador completo)
- Haz clic en **"Timbrar"**
- El sistema:
  - Valida todos los datos con el SAT
  - Genera el XML
  - Obtiene el UUID (sello fiscal)
- **Ahora SÍ aparece en el contador** como documento fiscal válido

---

## ⚠️ Errores Comunes y Soluciones

### ❌ "El contador muestra 0 pero tengo borradores"
**Solución:** Esto es correcto. Los borradores NO son documentos fiscales válidos. Debes timbrarlos primero.

### ❌ "Veo dos cartas porte para el mismo viaje"
**Causas posibles:**
1. Activaste un borrador incompleto (<80%)
2. Navegaste a una página antigua de cartas porte

**Solución:**
- Elimina los duplicados
- Usa SOLO la ruta `/documentos-fiscales/carta-porte`
- Completa el borrador al 80% antes de activar

### ❌ "No puedo activar mi borrador"
**Solución:** El botón "Activar Carta Porte" solo aparece si:
- Tu borrador está completo al 80% o más
- Revisa la barra de progreso
- Completa las secciones faltantes

---

## 🎯 Regla de Oro

### **UN VIAJE = UN BORRADOR = UNA CARTA PORTE FINAL**

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────────┐
│   Wizard    │  →   │   Borrador   │  →   │   Editar    │  →   │  Timbrar (SAT)   │
│ Crear Viaje │      │  Generado    │      │ Completar   │      │  UUID generado   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────────┘
                           ↓                      ↓                        ↓
                     Progreso: 60%          Progreso: 80%          Aparece en contador
                     NO activable           ✅ Activable            ✅ Documento válido
```

---

## 📂 Rutas Correctas

### ✅ Rutas que DEBES usar:
- `/documentos-fiscales` - Panel principal de documentos
- `/documentos-fiscales/carta-porte` - Vista de cartas porte (borradores + timbradas)
- `/borrador-carta-porte/:id` - Editar un borrador específico
- `/viajes/:id` - Detalle del viaje (incluye acceso al borrador)

### ❌ Rutas DEPRECADAS (NO usar):
- `/cartas-porte` - ⚠️ OBSOLETA (CartasPorteUnified)
- Cualquier otra ruta antigua de cartas porte

---

## 🔒 Validaciones de Seguridad

### Validación al Activar (80% mínimo)
El sistema verifica automáticamente:
```typescript
// Cálculo de completitud:
- Configuración: RFC emisor + RFC receptor
- Ubicaciones: >= 2 (origen y destino)
- Mercancías: >= 1 mercancía registrada
- Autotransporte: Placa del vehículo
- Figuras: >= 1 operador asignado

Progreso = (secciones_completas / 5) * 100
```

Si el progreso es < 80%, el sistema mostrará:
```
❌ El borrador está XX% completo.
   Debes completar al menos 80% antes de activar la Carta Porte.
   Secciones faltantes: [lista de secciones]
```

---

## 📊 Interpretación del Contador

### Contador de Cartas Porte: `N documentos`

**¿Qué incluye?**
- ✅ Cartas porte con UUID del SAT (timbradas)
- ✅ Estado: `timbrada`, `vigente`, `en_tránsito`

**¿Qué NO incluye?**
- ❌ Borradores (`borradores_carta_porte`)
- ❌ Cartas activas sin timbrar
- ❌ Documentos cancelados

**Esto cumple con:**
- ISO 27001 A.18.1 (Cumplimiento legal)
- Normativa del SAT (solo documentos con sello fiscal)

---

## 🛠️ Soporte y Debugging

### Si tienes problemas:

1. **Verifica la barra de progreso**
   - Debe estar al menos en 80%
   - Verde = Listo para activar
   - Naranja = Faltan datos

2. **Revisa los logs en consola**
   ```javascript
   // Busca estos mensajes:
   "📋 [CARTAS PORTE] Cargando documentos..."
   "📄 [CARTA PORTE] Usando configuración..."
   ```

3. **Consulta la documentación del SAT**
   - [Guía de llenado Carta Porte 3.1](https://www.sat.gob.mx/consulta/09861/complemento-carta-porte)

4. **Contacta soporte técnico**
   - Incluye: ID del viaje, ID del borrador, porcentaje de completitud

---

## 📝 Changelog

**v2.0 - 2025-01-24**
- ✅ Implementada validación de 80% mínimo
- ✅ Deprecadas páginas antiguas (CartasPorteUnified, CartasPorte)
- ✅ Consolidada ruta única: `/documentos-fiscales/carta-porte`
- ✅ Agregada barra de progreso visual
- ✅ Prevención de duplicación de cartas porte

**v1.0 - Versión inicial**
- Primera implementación del sistema
