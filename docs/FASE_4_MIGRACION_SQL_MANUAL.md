# 🔒 FASE 4: Migración SQL de Seguridad - Guía de Aplicación Manual

**Fecha:** 11 Noviembre 2025  
**Prioridad:** 🔴 **CRÍTICA**  
**Tiempo Estimado:** 15-20 minutos

---

## 📋 **RESUMEN**

Esta migración corrige advertencias críticas del Supabase Linter añadiendo `SET search_path = public, pg_catalog` a funciones SECURITY DEFINER, previniendo ataques de escalación de privilegios.

---

## ⚠️ **IMPORTANTE - LEER ANTES DE EJECUTAR**

### **¿Por qué es crítico?**

Las funciones `SECURITY DEFINER` sin `search_path` fijo son vulnerables a ataques donde un usuario malicioso puede:
1. Crear objetos con nombres conflictivos en su schema personal
2. Interceptar llamadas a funciones del sistema
3. Escalar privilegios y acceder a datos sensibles

### **¿Qué funciones ya están protegidas?**

✅ Las siguientes funciones **YA TIENEN** `search_path` configurado:
- `get_secret()` 
- `get_pac_credentials()`
- `get_pac_token()`
- `eliminar_datos_usuario()`
- `exportar_datos_usuario()`
- `verificar_eliminacion_completa()`
- `sanitize_pii_from_logs()`
- `is_superuser_secure()`
- `admin_rotate_pac_token()`
- Todas las funciones de `actualizar_metricas_tiempo_real*`
- Todas las funciones de `buscar_codigo_postal*`
- Todas las funciones de `check_*`
- `has_role()`, `is_admin_or_superuser()`

### **¿Qué funciones necesitan corrección?**

Según el análisis del código actual, las únicas funciones pendientes son:

1. ⚠️ `anonimizar_usuario()` - Si existe y no tiene `search_path`
2. ⚠️ `promote_user_to_superuser()` - Si existe y no tiene `search_path`

---

## 🚀 **PASO 1: VERIFICAR FUNCIONES PENDIENTES**

### **1.1 Abrir Supabase Dashboard**

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Database** → **SQL Editor**
4. Crea una nueva query

### **1.2 Verificar funciones sin search_path**

Ejecuta esta query para identificar funciones vulnerables:

```sql
-- Verificar funciones SECURITY DEFINER sin search_path
SELECT 
  p.proname as function_name,
  n.nspname as schema_name,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✅ Protegida'
    ELSE '⚠️ VULNERABLE'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true  -- SECURITY DEFINER
ORDER BY 
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN 1
    ELSE 0
  END,
  p.proname;
```

**Resultado esperado:** Lista de funciones con su estado de protección.

---

## 🔧 **PASO 2: APLICAR CORRECCIONES**

### **2.1 Función: anonimizar_usuario()**

**⚠️ SOLO EJECUTAR SI LA FUNCIÓN EXISTE Y NO TIENE `search_path`**

```sql
-- ============================================================================
-- CORRECCIÓN: anonimizar_usuario
-- Protege contra privilege escalation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.anonimizar_usuario(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog  -- ✅ FIX APLICADO
AS $$
DECLARE
  random_suffix TEXT;
  affected_tables JSONB := '[]'::jsonb;
  conductores_count INTEGER := 0;
  vehiculos_count INTEGER := 0;
  profiles_count INTEGER := 0;
BEGIN
  -- Verificar autorización
  IF auth.uid() != target_user_id AND NOT (
    SELECT (raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true')
    FROM auth.users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para anonimizar este usuario';
  END IF;

  -- Generar sufijo aleatorio
  random_suffix := substr(gen_random_uuid()::TEXT, 1, 8);

  -- Anonimizar perfil
  UPDATE public.profiles
  SET
    nombre = 'Usuario Anonimizado',
    email = 'deleted_' || random_suffix || '@anonimizado.local',
    empresa = 'Anonimizado',
    rfc = 'ANONIMIZADO',
    telefono = NULL,
    direccion = NULL,
    ciudad = NULL,
    estado = NULL,
    codigo_postal = NULL,
    pais = NULL
  WHERE id = target_user_id;
  
  GET DIAGNOSTICS profiles_count = ROW_COUNT;

  -- Anonimizar conductores
  UPDATE public.conductores
  SET
    nombre_completo = 'Conductor Anonimizado',
    email = 'deleted_' || random_suffix || '@anonimizado.local',
    licencia_numero = 'ANON' || random_suffix,
    telefono = NULL,
    curp = NULL,
    nss = NULL,
    domicilio = NULL,
    ciudad = NULL,
    estado = NULL,
    codigo_postal = NULL,
    foto_licencia_url = NULL,
    contacto_emergencia_nombre = NULL,
    contacto_emergencia_telefono = NULL
  WHERE user_id = target_user_id;
  
  GET DIAGNOSTICS conductores_count = ROW_COUNT;

  -- Anonimizar vehículos (eliminar datos sensibles del propietario)
  UPDATE public.vehiculos
  SET
    numero_poliza = NULL,
    aseguradora = 'Anonimizado',
    contacto_aseguradora = NULL
  WHERE user_id = target_user_id;
  
  GET DIAGNOSTICS vehiculos_count = ROW_COUNT;

  -- Construir resultado
  affected_tables := jsonb_build_array(
    jsonb_build_object('table', 'profiles', 'records', profiles_count),
    jsonb_build_object('table', 'conductores', 'records', conductores_count),
    jsonb_build_object('table', 'vehiculos', 'records', vehiculos_count)
  );

  -- Registrar en auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    target_user_id,
    'user_anonymized',
    jsonb_build_object(
      'anonymized_by', auth.uid(),
      'affected_tables', affected_tables,
      'timestamp', now()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'affected_tables', affected_tables,
    'total_records', profiles_count + conductores_count + vehiculos_count
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error en anonimizar_usuario: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.anonimizar_usuario(UUID) TO authenticated;

-- Comentario
COMMENT ON FUNCTION public.anonimizar_usuario(UUID) IS 
'Anonimiza datos personales de un usuario - GDPR Art. 17. Protegida contra privilege escalation.';
```

---

### **2.2 Función: promote_user_to_superuser()**

**⚠️ SOLO EJECUTAR SI LA FUNCIÓN EXISTE Y NO TIENE `search_path`**

```sql
-- ============================================================================
-- CORRECCIÓN: promote_user_to_superuser
-- Protege contra privilege escalation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.promote_user_to_superuser(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog  -- ✅ FIX APLICADO
AS $$
BEGIN
  -- Verificar que quien ejecuta es superusuario
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'is_superuser' = 'true'
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: se requieren permisos de superusuario';
  END IF;

  -- Promover usuario en auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('is_superuser', 'true')
  WHERE id = target_user_id;

  -- Crear o actualizar en user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'superuser')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Registrar evento de auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    auth.uid(),
    'user_promoted',
    jsonb_build_object(
      'target_user', target_user_id,
      'promoted_by', auth.uid(),
      'new_role', 'superuser',
      'timestamp', now()
    )
  );

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error promoviendo usuario: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Otorgar permisos solo a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.promote_user_to_superuser(UUID) TO authenticated;

-- Comentario
COMMENT ON FUNCTION public.promote_user_to_superuser(UUID) IS 
'Promueve un usuario a rol de superusuario. Solo ejecutable por superusuarios existentes. Protegida contra privilege escalation.';
```

---

## ✅ **PASO 3: VERIFICAR CORRECCIONES**

### **3.1 Re-ejecutar verificación**

```sql
-- Verificar que todas las funciones SECURITY DEFINER tienen search_path
SELECT 
  p.proname as function_name,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✅ Protegida'
    ELSE '⚠️ VULNERABLE'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND p.proname IN (
    'anonimizar_usuario',
    'promote_user_to_superuser',
    'get_secret',
    'get_pac_credentials',
    'eliminar_datos_usuario',
    'exportar_datos_usuario',
    'is_superuser_secure'
  )
ORDER BY p.proname;
```

**Resultado esperado:** Todas las funciones deben mostrar "✅ Protegida"

---

### **3.2 Probar funciones corregidas**

```sql
-- Test 1: Verificar que get_secret funciona
SELECT public.get_secret('SW_TOKEN') IS NOT NULL as secret_works;

-- Test 2: Verificar que is_superuser_secure funciona
SELECT public.is_superuser_secure(auth.uid()) as is_superuser;

-- Test 3: Verificar exportación de datos (debe requerir autorización)
SELECT public.exportar_datos_usuario(auth.uid())->'export_date' IS NOT NULL as export_works;
```

---

## 📊 **PASO 4: EJECUTAR SUPABASE LINTER**

### **4.1 Abrir Database Linter**

1. En Supabase Dashboard, ve a **Database** → **Linter**
2. Haz clic en **Run Linter**
3. Espera los resultados (10-30 segundos)

### **4.2 Verificar resultados**

**Antes de la migración:**
- ⚠️ ~10-12 advertencias de "Function Search Path Mutable"

**Después de la migración:**
- ✅ 0-2 advertencias (solo no críticas)
- ✅ Todas las funciones SECURITY DEFINER protegidas

---

## 🔐 **PASO 5: HABILITAR PROTECCIÓN DE CONTRASEÑAS**

### **5.1 Configurar HaveIBeenPwned**

1. Ve a **Authentication** → **Settings**
2. Busca "Password Protection"
3. Activa "Check passwords against HaveIBeenPwned database"
4. Guarda cambios

**Beneficio:** Previene que usuarios usen contraseñas comprometidas conocidas.

---

## 📝 **PASO 6: DOCUMENTAR EJECUCIÓN**

Llena este checklist:

```markdown
## Checklist de Ejecución

- [ ] Paso 1: Verificación de funciones ejecutada
- [ ] Paso 2.1: anonimizar_usuario() corregida (si aplica)
- [ ] Paso 2.2: promote_user_to_superuser() corregida (si aplica)
- [ ] Paso 3: Verificaciones post-migración exitosas
- [ ] Paso 4: Linter ejecutado - 0 advertencias críticas
- [ ] Paso 5: HaveIBeenPwned habilitado
- [ ] Paso 6: Documentación completada

**Ejecutado por:** [Tu nombre]  
**Fecha:** [Fecha]  
**Tiempo total:** [X minutos]  
**Advertencias restantes:** [X]
```

---

## 🚨 **ROLLBACK (Solo en caso de emergencia)**

Si algo sale mal, puedes revertir las funciones individualmente:

```sql
-- Ejemplo: Revertir anonimizar_usuario a versión anterior
-- (Contactar al equipo de desarrollo para versión específica)

-- Verificar historial
SELECT 
  version, 
  name, 
  created_at 
FROM supabase_migrations.schema_migrations 
ORDER BY created_at DESC 
LIMIT 10;
```

**⚠️ NO REVERTIR** a menos que haya un error crítico que impida el funcionamiento del sistema.

---

## ✅ **CRITERIOS DE ÉXITO**

La migración es exitosa cuando:

- ✅ Supabase Linter muestra 0 advertencias críticas de "Function Search Path Mutable"
- ✅ Todas las funciones SECURITY DEFINER tienen `SET search_path = public, pg_catalog`
- ✅ Tests de funciones críticas pasan correctamente
- ✅ No hay errores en logs de Supabase
- ✅ Aplicación funciona normalmente

---

## 📞 **SOPORTE**

**En caso de problemas:**
1. Revisar logs en Supabase Dashboard → Database → Logs
2. Verificar que no hay errores de sintaxis SQL
3. Contactar al equipo de desarrollo con:
   - Captura de pantalla del error
   - Query ejecutada
   - Logs relevantes

---

## 📚 **REFERENCIAS**

- **PostgreSQL SECURITY DEFINER:** https://www.postgresql.org/docs/current/sql-createfunction.html
- **Supabase Linter:** https://supabase.com/docs/guides/database/linter
- **GDPR Art. 17 (Right to Erasure):** https://gdpr-info.eu/art-17-gdpr/
- **ISO 27001 A.10.1:** Cryptographic controls

---

**Última actualización:** 11 Noviembre 2025  
**Versión:** 1.0  
**Autor:** Sistema Lovable AI
