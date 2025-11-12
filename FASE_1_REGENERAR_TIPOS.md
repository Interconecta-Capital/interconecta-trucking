# ⚙️ FASE 1: REGENERAR TIPOS TYPESCRIPT

## ⚠️ ACCIÓN REQUERIDA INMEDIATAMENTE

Acabas de ejecutar migraciones SQL que crearon la tabla `facturas`. 
Ahora **DEBES regenerar** el archivo de tipos TypeScript para que la aplicación reconozca esta nueva tabla.

---

## 📋 OPCIÓN 1: Usando Supabase CLI (Recomendado)

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Regenerar tipos
npx supabase gen types typescript --project-id qulhweffinppyjpfkknh > src/integrations/supabase/types.ts
```

---

## 📋 OPCIÓN 2: Manualmente desde Dashboard

1. **Ir a Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/qulhweffinppyjpfkknh

2. **Navegar a:**
   - `Settings` → `API` → **"Generate Types"**

3. **Copiar el código TypeScript generado**

4. **Pegar en:**
   - `src/integrations/supabase/types.ts` (reemplazar todo el contenido)

---

## ✅ VALIDACIÓN

Después de regenerar, verifica que `src/integrations/supabase/types.ts` contiene:

```typescript
export interface Database {
  public: {
    Tables: {
      facturas: {
        Row: {
          id: string
          uuid_fiscal: string | null
          tipo_comprobante: string
          status: 'draft' | 'timbrado' | 'cancelado'
          rfc_emisor: string
          nombre_emisor: string | null
          rfc_receptor: string
          nombre_receptor: string | null
          subtotal: number
          total: number
          user_id: string
          fecha_expedicion: string
          tiene_carta_porte: boolean | null
          carta_porte_id: string | null
          uso_cfdi: string | null
          created_at: string
          updated_at: string
          // ... resto de columnas
        }
        Insert: {
          // ... tipos de inserción
        }
        Update: {
          // ... tipos de actualización
        }
      }
      // ... resto de tablas
    }
  }
}
```

---

## 🚨 ERRORES COMUNES

### Error: `Table 'facturas' does not exist in type 'Database'`
**Causa:** No regeneraste los tipos después de las migraciones.
**Solución:** Ejecuta los comandos de arriba.

### Error: `Cannot find module '@/integrations/supabase/types'`
**Causa:** El archivo types.ts está corrupto o vacío.
**Solución:** Regenera usando OPCIÓN 2 (manualmente).

---

## 🎯 SIGUIENTE PASO

Una vez regenerados los tipos:

```bash
# Reiniciar servidor de desarrollo para aplicar cambios
npm run dev
```

Luego ve a: **http://localhost:5173/administracion/fiscal**

Deberías poder:
- ✅ Ver listado de facturas
- ✅ Crear nueva factura
- ✅ Guardar borrador
- ✅ Timbrar factura
- ✅ Ver PDF con QR Code real

---

## 📞 ¿NECESITAS AYUDA?

Si después de regenerar los tipos sigues viendo errores, comparte:
1. Los primeros 50 líneas de `src/integrations/supabase/types.ts`
2. Los errores en consola del navegador
3. Los logs de compilación
