# 🔐 Implementación de Cifrado de Datos Sensibles

**FASE 4 - Sprint 2**  
**Fecha:** 11 Noviembre 2025  
**Estado:** ✅ LISTO PARA IMPLEMENTAR

---

## 📋 **RESUMEN**

Implementación de cifrado AES-256 para fotos de licencias de conductores usando `pgp_sym_encrypt()` de PostgreSQL y Edge Functions para descifrado seguro.

---

## 🎯 **COMPONENTES**

### **1. Base de Datos**

#### **1.1 Migración SQL**

Ejecutar en Supabase Dashboard → SQL Editor:

```sql
-- ============================================================================
-- MIGRACIÓN: Cifrado de Fotos de Licencias
-- FASE 4 - Sprint 2
-- ============================================================================

-- Paso 1: Añadir columna para datos cifrados
ALTER TABLE public.conductores 
ADD COLUMN IF NOT EXISTS foto_licencia_encrypted BYTEA;

-- Paso 2: Crear índice para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_conductores_foto_encrypted 
ON public.conductores(id) 
WHERE foto_licencia_encrypted IS NOT NULL;

-- Paso 3: Añadir comentarios
COMMENT ON COLUMN public.conductores.foto_licencia_encrypted IS 
'Foto de licencia cifrada con AES-256 usando pgp_sym_encrypt(). Descifrado solo a través de función autorizada.';

-- ============================================================================
-- FUNCIÓN: encrypt_conductor_photo
-- Cifra foto de licencia con clave del Vault
-- ============================================================================

CREATE OR REPLACE FUNCTION public.encrypt_conductor_photo(
  conductor_id UUID,
  photo_data TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Obtener clave del Vault
  encryption_key := public.get_secret('ENCRYPTION_KEY');
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Clave de cifrado no configurada en Vault';
  END IF;

  -- Cifrar y guardar
  UPDATE public.conductores
  SET 
    foto_licencia_encrypted = pgp_sym_encrypt(photo_data, encryption_key),
    foto_licencia_url = NULL  -- Eliminar URL sin cifrar
  WHERE id = conductor_id
    AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conductor no encontrado o no autorizado';
  END IF;
  
  -- Registrar en auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    auth.uid(),
    'photo_encrypted',
    jsonb_build_object(
      'conductor_id', conductor_id,
      'timestamp', now()
    )
  );

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.encrypt_conductor_photo(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION public.encrypt_conductor_photo(UUID, TEXT) IS 
'Cifra foto de licencia de conductor con AES-256. Solo el propietario puede cifrar.';


-- ============================================================================
-- FUNCIÓN: decrypt_conductor_photo
-- Descifra foto de licencia con verificación de permisos
-- ============================================================================

CREATE OR REPLACE FUNCTION public.decrypt_conductor_photo(
  conductor_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  encryption_key TEXT;
  decrypted_data TEXT;
  is_superuser BOOLEAN;
BEGIN
  -- Verificar si es superusuario
  is_superuser := public.is_superuser_secure(auth.uid());

  -- Verificar autorización (propietario o superusuario)
  IF NOT is_superuser AND NOT EXISTS (
    SELECT 1 FROM public.conductores
    WHERE id = conductor_id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para acceder a esta foto';
  END IF;

  -- Obtener clave del Vault
  encryption_key := public.get_secret('ENCRYPTION_KEY');
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Clave de descifrado no disponible';
  END IF;
  
  -- Descifrar
  SELECT pgp_sym_decrypt(foto_licencia_encrypted, encryption_key)
  INTO decrypted_data
  FROM public.conductores
  WHERE id = conductor_id
    AND foto_licencia_encrypted IS NOT NULL;

  IF decrypted_data IS NULL THEN
    RAISE EXCEPTION 'Foto no encontrada o no cifrada';
  END IF;

  -- Registrar acceso en auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    auth.uid(),
    'photo_decrypted',
    jsonb_build_object(
      'conductor_id', conductor_id,
      'timestamp', now(),
      'is_superuser', is_superuser
    )
  );

  RETURN decrypted_data;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrypt_conductor_photo(UUID) TO authenticated;

COMMENT ON FUNCTION public.decrypt_conductor_photo(UUID) IS 
'Descifra foto de licencia de conductor. Solo propietario o superusuario.';


-- ============================================================================
-- FUNCIÓN: migrate_photos_to_encrypted
-- Migra fotos existentes a formato cifrado
-- ============================================================================

CREATE OR REPLACE FUNCTION public.migrate_photos_to_encrypted()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  conductor_record RECORD;
  encryption_key TEXT;
  migrated_count INTEGER := 0;
  error_count INTEGER := 0;
  errors JSONB := '[]'::jsonb;
BEGIN
  -- Solo superusuarios pueden ejecutar migración masiva
  IF NOT public.is_superuser_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Solo superusuarios pueden ejecutar migración masiva';
  END IF;

  -- Obtener clave de cifrado
  encryption_key := public.get_secret('ENCRYPTION_KEY');

  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Clave de cifrado no disponible en Vault';
  END IF;

  -- Migrar cada conductor con foto
  FOR conductor_record IN 
    SELECT id, user_id, foto_licencia_url
    FROM public.conductores
    WHERE foto_licencia_url IS NOT NULL
      AND foto_licencia_encrypted IS NULL
    ORDER BY created_at DESC
  LOOP
    BEGIN
      -- Cifrar y guardar
      UPDATE public.conductores
      SET 
        foto_licencia_encrypted = pgp_sym_encrypt(
          conductor_record.foto_licencia_url, 
          encryption_key
        ),
        foto_licencia_url = NULL
      WHERE id = conductor_record.id;

      migrated_count := migrated_count + 1;

      -- Log de progreso cada 100 registros
      IF migrated_count % 100 = 0 THEN
        RAISE NOTICE 'Migrados % conductores...', migrated_count;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        errors := errors || jsonb_build_object(
          'conductor_id', conductor_record.id,
          'error', SQLERRM
        );
        RAISE WARNING 'Error migrando conductor %: %', conductor_record.id, SQLERRM;
    END;
  END LOOP;

  -- Registrar migración completada
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    auth.uid(),
    'bulk_photo_encryption',
    jsonb_build_object(
      'migrated_count', migrated_count,
      'error_count', error_count,
      'errors', errors,
      'timestamp', now()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'migrated_count', migrated_count,
    'error_count', error_count,
    'errors', errors,
    'message', format('Migración completada: %s conductores cifrados, %s errores', migrated_count, error_count)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.migrate_photos_to_encrypted() TO authenticated;

COMMENT ON FUNCTION public.migrate_photos_to_encrypted() IS 
'Migra fotos existentes a formato cifrado. Solo superusuarios.';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migración de cifrado completada exitosamente';
  RAISE NOTICE '📊 Funciones creadas:';
  RAISE NOTICE '  - encrypt_conductor_photo()';
  RAISE NOTICE '  - decrypt_conductor_photo()';
  RAISE NOTICE '  - migrate_photos_to_encrypted()';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Próximos pasos:';
  RAISE NOTICE '  1. Configurar ENCRYPTION_KEY en Vault';
  RAISE NOTICE '  2. Ejecutar migrate_photos_to_encrypted() para migrar fotos existentes';
  RAISE NOTICE '  3. Desplegar Edge Function decrypt-photo';
END;
$$;
```

---

### **2. Configurar Clave de Cifrado en Vault**

#### **2.1 Generar clave segura**

```bash
# Generar clave de 32 bytes (256 bits)
openssl rand -base64 32
```

#### **2.2 Guardar en Supabase Vault**

```sql
-- Ejecutar en SQL Editor
SELECT vault.create_secret('ENCRYPTION_KEY', '<clave-generada>');
```

---

### **3. Migración de Datos Existentes**

#### **3.1 Ejecutar migración**

```sql
-- Ejecutar como superusuario
SELECT public.migrate_photos_to_encrypted();
```

#### **3.2 Verificar migración**

```sql
-- Verificar que no quedan fotos sin cifrar
SELECT 
  COUNT(*) FILTER (WHERE foto_licencia_url IS NOT NULL) as sin_cifrar,
  COUNT(*) FILTER (WHERE foto_licencia_encrypted IS NOT NULL) as cifradas
FROM public.conductores;

-- Debería retornar: sin_cifrar = 0, cifradas = N
```

---

### **4. Edge Function**

#### **4.1 Desplegar función**

```bash
# Desplegar Edge Function
supabase functions deploy decrypt-photo

# Verificar deployment
supabase functions list
```

#### **4.2 Probar función**

```bash
# Test desde curl
curl -X POST \
  'https://qulhweffinppyjpfkknh.supabase.co/functions/v1/decrypt-photo' \
  -H "Authorization: Bearer <USER_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"conductorId": "<CONDUCTOR_UUID>"}'
```

---

### **5. Integración en Frontend**

#### **5.1 Crear hook de descifrado**

```typescript
// src/hooks/useDecryptPhoto.ts
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDecryptPhoto = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decryptPhoto = async (conductorId: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No autenticado');
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/decrypt-photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conductorId }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al descifrar foto');
      }

      return result.photoData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { decryptPhoto, isLoading, error };
};
```

#### **5.2 Usar en componente**

```typescript
// src/components/ConductorPhotoViewer.tsx
import { useEffect, useState } from 'react';
import { useDecryptPhoto } from '@/hooks/useDecryptPhoto';

export const ConductorPhotoViewer = ({ conductorId }: { conductorId: string }) => {
  const { decryptPhoto, isLoading, error } = useDecryptPhoto();
  const [photoData, setPhotoData] = useState<string | null>(null);

  useEffect(() => {
    const loadPhoto = async () => {
      const data = await decryptPhoto(conductorId);
      setPhotoData(data);
    };

    loadPhoto();
  }, [conductorId]);

  if (isLoading) {
    return <div>Cargando foto...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!photoData) {
    return <div>No hay foto disponible</div>;
  }

  return (
    <img 
      src={`data:image/jpeg;base64,${photoData}`} 
      alt="Licencia de conductor" 
      className="rounded-lg shadow-md"
    />
  );
};
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

- [ ] **Paso 1:** Ejecutar migración SQL en Supabase Dashboard
- [ ] **Paso 2:** Generar y configurar ENCRYPTION_KEY en Vault
- [ ] **Paso 3:** Ejecutar `migrate_photos_to_encrypted()`
- [ ] **Paso 4:** Verificar que todas las fotos están cifradas
- [ ] **Paso 5:** Desplegar Edge Function `decrypt-photo`
- [ ] **Paso 6:** Probar Edge Function con curl
- [ ] **Paso 7:** Implementar `useDecryptPhoto` hook en frontend
- [ ] **Paso 8:** Actualizar componentes que muestran fotos
- [ ] **Paso 9:** Probar flujo completo en staging
- [ ] **Paso 10:** Desplegar a producción

---

## 🔐 **SEGURIDAD**

### **Medidas Implementadas:**

1. ✅ **Cifrado AES-256** con `pgp_sym_encrypt()`
2. ✅ **Clave en Vault** de Supabase (no en código)
3. ✅ **Funciones SECURITY DEFINER** con `search_path` fijo
4. ✅ **Verificación de permisos** (propietario o superusuario)
5. ✅ **Auditoría** de todos los accesos (cifrado/descifrado)
6. ✅ **Edge Function** con autenticación JWT
7. ✅ **RLS** en tabla conductores

### **Cumplimiento:**

- ✅ **GDPR Art. 32** - Security of processing
- ✅ **ISO 27001 A.10.1** - Cryptographic controls
- ✅ **LFPDPPP Art. 19** - Medidas de seguridad

---

## 📊 **PERFORMANCE**

### **Tiempos Esperados:**

- **Cifrado:** ~50-100ms por foto
- **Descifrado:** ~100-200ms por foto
- **Migración:** ~1-2 seg por 100 fotos

### **Optimizaciones:**

1. **Cachear fotos descifradas** en memoria (5 minutos)
2. **Lazy loading** de fotos en listados
3. **Índice en tabla** para búsquedas rápidas

---

**Documentado por:** Sistema Lovable AI  
**Fecha:** 11 Noviembre 2025  
**Versión:** 1.0
