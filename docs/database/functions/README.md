# Funciones y Triggers de Base de Datos

## Índice

| Archivo | Descripción |
|---------|-------------|
| [SECURITY_FUNCTIONS.md](./SECURITY_FUNCTIONS.md) | Funciones de seguridad y autorización |
| [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) | Lógica de negocio encapsulada |
| [TRIGGERS.md](./TRIGGERS.md) | Triggers y automatizaciones |

## Resumen de Funciones

### Por Categoría

| Categoría | Cantidad | SECURITY DEFINER |
|-----------|----------|------------------|
| Seguridad/Roles | 8 | Sí |
| Lógica de Negocio | 12 | Mixto |
| Triggers | 15 | No |
| Utilidades | 5 | No |

### Convenciones

#### Nomenclatura
- Verificación de estado: `is_*()` → retorna BOOLEAN
- Verificación de pertenencia: `has_*()` → retorna BOOLEAN  
- Obtención de datos: `get_*()` → retorna valor/record
- Validación: `validar_*()` → retorna JSONB con resultado
- Actualización: `update_*()` → retorna TRIGGER

#### SECURITY DEFINER vs INVOKER

**SECURITY DEFINER** (ejecuta como owner):
- Usado para funciones que necesitan bypass de RLS
- Siempre incluye `SET search_path = public, pg_catalog`
- Usado en verificaciones de roles

**SECURITY INVOKER** (ejecuta como caller):
- Default para funciones normales
- Respeta RLS del usuario que llama

## Funciones Críticas

### Autenticación y Autorización

```sql
-- Verifica si usuario es superusuario
is_superuser_secure(user_id UUID) → BOOLEAN

-- Verifica si usuario tiene un rol específico
has_role(user_id UUID, role app_role) → BOOLEAN

-- Verifica si es admin o superusuario
is_admin_or_superuser(user_id UUID) → BOOLEAN
```

### Validación de Negocio

```sql
-- Valida configuración fiscal antes de Carta Porte
validar_configuracion_fiscal_completa(config_id UUID) → JSONB

-- Obtiene datos completos de viaje para timbrado
get_viaje_completo_para_timbrado(viaje_id UUID) → JSONB

-- Verifica límites del plan del usuario
verificar_limite_recurso(user_id UUID, recurso TEXT) → BOOLEAN
```

### Triggers Principales

```sql
-- Crea perfil automáticamente al registrar usuario
handle_new_user() → TRIGGER

-- Actualiza métricas en tiempo real
actualizar_metricas_tiempo_real_v2() → TRIGGER

-- Sincroniza fechas de trial
sync_trial_dates() → TRIGGER
```

## Patrón de Implementación

### Función SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION public.nombre_funcion(param1 TYPE)
RETURNS RETURN_TYPE
LANGUAGE plpgsql
STABLE  -- o VOLATILE si modifica datos
SECURITY DEFINER
SET search_path = public, pg_catalog  -- ¡IMPORTANTE!
AS $$
BEGIN
  -- Lógica aquí
END;
$$;
```

### Trigger Function

```sql
CREATE OR REPLACE FUNCTION public.trigger_function_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Acceso a NEW y OLD
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Asociar trigger
CREATE TRIGGER trg_nombre
  BEFORE UPDATE ON tabla
  FOR EACH ROW
  EXECUTE FUNCTION trigger_function_name();
```
