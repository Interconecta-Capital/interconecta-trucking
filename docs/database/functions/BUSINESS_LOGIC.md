# Funciones de Lógica de Negocio

## Validación Fiscal

### validar_configuracion_fiscal_completa

Valida que la configuración fiscal del usuario esté completa para generar Carta Porte.

```sql
CREATE OR REPLACE FUNCTION public.validar_configuracion_fiscal_completa(config_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  config RECORD;
  errores jsonb := '[]'::jsonb;
BEGIN
  SELECT * INTO config FROM configuracion_empresa WHERE id = config_id;
  
  IF NOT FOUND THEN
    errores := errores || '["Configuración no encontrada"]'::jsonb;
    RETURN jsonb_build_object('completa', false, 'errores', errores);
  END IF;
  
  -- Validar RFC Emisor
  IF config.rfc_emisor IS NULL OR config.rfc_emisor = '' THEN
    errores := errores || '["RFC Emisor es obligatorio"]'::jsonb;
  END IF;
  
  -- Validar Razón Social
  IF config.razon_social IS NULL OR config.razon_social = '' THEN
    errores := errores || '["Razón Social es obligatoria"]'::jsonb;
  END IF;
  
  -- Validar Régimen Fiscal
  IF config.regimen_fiscal IS NULL OR config.regimen_fiscal = '' THEN
    errores := errores || '["Régimen Fiscal es obligatorio"]'::jsonb;
  END IF;
  
  -- Validar Código Postal
  IF config.domicilio_fiscal IS NULL OR 
     config.domicilio_fiscal->>'codigo_postal' IS NULL THEN
    errores := errores || '["Código Postal del domicilio fiscal es obligatorio"]'::jsonb;
  END IF;
  
  -- Validar Estado
  IF config.domicilio_fiscal->>'estado' IS NULL THEN
    errores := errores || '["Estado del domicilio fiscal es obligatorio"]'::jsonb;
  END IF;
  
  -- Actualizar flag
  UPDATE configuracion_empresa 
  SET configuracion_completa = (jsonb_array_length(errores) = 0)
  WHERE id = config_id;
  
  RETURN jsonb_build_object(
    'completa', jsonb_array_length(errores) = 0,
    'errores', errores
  );
END;
$$;
```

**Uso:**
```sql
SELECT validar_configuracion_fiscal_completa('uuid-config');
-- Retorna: {"completa": true, "errores": []}
-- o: {"completa": false, "errores": ["RFC Emisor es obligatorio"]}
```

---

### verificar_config_fiscal_antes_carta_porte

Trigger que verifica configuración antes de crear Carta Porte.

```sql
CREATE OR REPLACE FUNCTION public.verificar_config_fiscal_antes_carta_porte()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
DECLARE
  config RECORD;
  validacion jsonb;
BEGIN
  -- Obtener configuración fiscal del usuario
  SELECT * INTO config 
  FROM configuracion_empresa 
  WHERE user_id = NEW.usuario_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Debe configurar datos fiscales antes de crear cartas porte';
  END IF;
  
  -- Validar configuración completa
  validacion := validar_configuracion_fiscal_completa(config.id);
  
  IF NOT (validacion->>'completa')::boolean THEN
    RAISE EXCEPTION 'Configuración fiscal incompleta: %', validacion->>'errores';
  END IF;
  
  -- Auto-poblar datos del emisor
  NEW.rfc_emisor := config.rfc_emisor;
  NEW.nombre_emisor := config.razon_social;
  NEW.regimen_fiscal_emisor := config.regimen_fiscal;
  NEW.domicilio_fiscal_emisor := config.domicilio_fiscal;
  
  RETURN NEW;
END;
$$;
```

---

## Obtención de Datos

### get_viaje_completo_para_timbrado

Obtiene todos los datos necesarios para timbrar un viaje.

```sql
CREATE OR REPLACE FUNCTION public.get_viaje_completo_para_timbrado(p_viaje_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  resultado jsonb;
BEGIN
  SELECT jsonb_build_object(
    'viaje', to_jsonb(v.*),
    'conductor', to_jsonb(c.*),
    'vehiculo', to_jsonb(vh.*),
    'remolque', to_jsonb(r.*),
    'socio', to_jsonb(s.*),
    'config_empresa', to_jsonb(ce.*),
    'carta_porte', to_jsonb(cp.*),
    'ubicaciones', (
      SELECT COALESCE(jsonb_agg(to_jsonb(u.*) ORDER BY u.orden_secuencia), '[]'::jsonb)
      FROM ubicaciones u 
      WHERE u.carta_porte_id = cp.id
    ),
    'mercancias', (
      SELECT COALESCE(jsonb_agg(to_jsonb(m.*)), '[]'::jsonb)
      FROM mercancias m 
      WHERE m.carta_porte_id = cp.id
    ),
    'figuras', (
      SELECT COALESCE(jsonb_agg(to_jsonb(f.*)), '[]'::jsonb)
      FROM figuras_transporte f 
      WHERE f.carta_porte_id = cp.id
    ),
    'autotransporte', (
      SELECT to_jsonb(a.*)
      FROM autotransporte a
      WHERE a.carta_porte_id = cp.id
      LIMIT 1
    )
  ) INTO resultado
  FROM viajes v
  LEFT JOIN conductores c ON v.conductor_id = c.id
  LEFT JOIN vehiculos vh ON v.vehiculo_id = vh.id
  LEFT JOIN remolques r ON v.remolque_id = r.id
  LEFT JOIN socios s ON v.socio_id = s.id
  LEFT JOIN configuracion_empresa ce ON v.user_id = ce.user_id
  LEFT JOIN cartas_porte cp ON (v.carta_porte_id = cp.id OR cp.viaje_id = v.id)
  WHERE v.id = p_viaje_id
  AND v.user_id = auth.uid();
  
  IF resultado IS NULL THEN
    RAISE EXCEPTION 'Viaje no encontrado o no autorizado';
  END IF;
  
  RETURN resultado;
END;
$$;
```

---

### get_user_plan_limits

Obtiene los límites del plan del usuario.

```sql
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'plan_nombre', p.nombre,
    'limite_cartas_porte', p.limite_cartas_porte,
    'limite_conductores', p.limite_conductores,
    'limite_vehiculos', p.limite_vehiculos,
    'limite_socios', p.limite_socios,
    'timbres_incluidos', p.timbres_incluidos,
    'funcionalidades', p.funcionalidades,
    'is_trial', s.is_trial,
    'trial_ends_at', s.trial_ends_at,
    'status', s.status
  ) INTO result
  FROM subscriptions s
  JOIN planes p ON s.plan_id = p.id
  WHERE s.user_id = _user_id
    AND s.status IN ('active', 'trial')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;
```

---

### get_usage_stats

Obtiene estadísticas de uso actual del usuario.

```sql
CREATE OR REPLACE FUNCTION public.get_usage_stats(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN jsonb_build_object(
    'conductores', (SELECT COUNT(*) FROM conductores WHERE user_id = _user_id AND activo = true),
    'vehiculos', (SELECT COUNT(*) FROM vehiculos WHERE user_id = _user_id AND activo = true),
    'remolques', (SELECT COUNT(*) FROM remolques WHERE user_id = _user_id AND activo = true),
    'socios', (SELECT COUNT(*) FROM socios WHERE user_id = _user_id AND activo = true),
    'viajes_mes', (SELECT COUNT(*) FROM viajes WHERE user_id = _user_id 
                   AND created_at >= date_trunc('month', now())),
    'cartas_porte_mes', (SELECT COUNT(*) FROM cartas_porte WHERE usuario_id = _user_id 
                         AND created_at >= date_trunc('month', now())),
    'timbres_mes', (SELECT COUNT(*) FROM cartas_porte WHERE usuario_id = _user_id 
                    AND status = 'timbrada' AND fecha_timbrado >= date_trunc('month', now()))
  );
END;
$$;
```

---

## Gestión de Créditos

### consumir_credito

Consume un crédito/timbre del balance del usuario.

```sql
CREATE OR REPLACE FUNCTION public.consumir_credito(
  _user_id UUID,
  _tipo TEXT,
  _referencia_id UUID DEFAULT NULL,
  _descripcion TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  credito RECORD;
  nuevo_balance INTEGER;
BEGIN
  -- Obtener créditos actuales con lock
  SELECT * INTO credito
  FROM creditos_usuarios
  WHERE user_id = _user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario sin registro de créditos');
  END IF;
  
  IF credito.balance_disponible <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sin créditos disponibles');
  END IF;
  
  nuevo_balance := credito.balance_disponible - 1;
  
  -- Actualizar balance
  UPDATE creditos_usuarios
  SET 
    balance_disponible = nuevo_balance,
    total_consumidos = total_consumidos + 1,
    timbres_mes_actual = timbres_mes_actual + 1,
    updated_at = now()
  WHERE user_id = _user_id;
  
  -- Registrar transacción
  INSERT INTO transacciones_creditos (
    user_id, tipo, cantidad, balance_anterior, balance_posterior,
    referencia_id, referencia_tipo, descripcion
  ) VALUES (
    _user_id, 'consumo', -1, credito.balance_disponible, nuevo_balance,
    _referencia_id, _tipo, _descripcion
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'balance_anterior', credito.balance_disponible,
    'balance_nuevo', nuevo_balance
  );
END;
$$;
```

---

### agregar_creditos

Agrega créditos al balance del usuario.

```sql
CREATE OR REPLACE FUNCTION public.agregar_creditos(
  _user_id UUID,
  _cantidad INTEGER,
  _tipo TEXT DEFAULT 'compra',
  _referencia_id UUID DEFAULT NULL,
  _descripcion TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  credito RECORD;
  nuevo_balance INTEGER;
BEGIN
  -- Upsert créditos
  INSERT INTO creditos_usuarios (user_id, balance_disponible, total_comprados)
  VALUES (_user_id, _cantidad, _cantidad)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    balance_disponible = creditos_usuarios.balance_disponible + _cantidad,
    total_comprados = creditos_usuarios.total_comprados + _cantidad,
    updated_at = now()
  RETURNING * INTO credito;
  
  nuevo_balance := credito.balance_disponible;
  
  -- Registrar transacción
  INSERT INTO transacciones_creditos (
    user_id, tipo, cantidad, balance_anterior, balance_posterior,
    referencia_id, referencia_tipo, descripcion
  ) VALUES (
    _user_id, _tipo, _cantidad, nuevo_balance - _cantidad, nuevo_balance,
    _referencia_id, 'compra', _descripcion
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'cantidad_agregada', _cantidad,
    'balance_nuevo', nuevo_balance
  );
END;
$$;
```

---

## Gestión de Folios

### get_next_folio

Obtiene y reserva el siguiente folio para un tipo de documento.

```sql
CREATE OR REPLACE FUNCTION public.get_next_folio(
  _user_id UUID,
  _tipo TEXT  -- 'carta_porte' o 'factura'
)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  config RECORD;
  nuevo_folio INTEGER;
  serie TEXT;
BEGIN
  SELECT * INTO config
  FROM configuracion_empresa
  WHERE user_id = _user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Configuración de empresa no encontrada';
  END IF;
  
  IF _tipo = 'carta_porte' THEN
    nuevo_folio := COALESCE(config.folio_actual_carta_porte, 1);
    serie := COALESCE(config.serie_carta_porte, 'CP');
    
    UPDATE configuracion_empresa
    SET folio_actual_carta_porte = nuevo_folio + 1
    WHERE user_id = _user_id;
  ELSE
    nuevo_folio := COALESCE(config.folio_actual_factura, 1);
    serie := COALESCE(config.serie_factura, 'F');
    
    UPDATE configuracion_empresa
    SET folio_actual_factura = nuevo_folio + 1
    WHERE user_id = _user_id;
  END IF;
  
  RETURN serie || '-' || LPAD(nuevo_folio::text, 6, '0');
END;
$$;
```

**Uso:**
```sql
SELECT get_next_folio(auth.uid(), 'carta_porte');
-- Retorna: "CP-000001"
```
