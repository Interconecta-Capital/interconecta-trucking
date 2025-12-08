# Políticas Row Level Security (RLS)

## Estructura de Políticas

### Sintaxis Básica

```sql
CREATE POLICY "policy_name"
  ON schema.table
  FOR [ALL | SELECT | INSERT | UPDATE | DELETE]
  TO [role | PUBLIC]
  USING (condition)           -- Para SELECT, UPDATE, DELETE
  WITH CHECK (condition);     -- Para INSERT, UPDATE
```

### Tipos de Políticas

| Tipo | USING | WITH CHECK | Uso |
|------|-------|------------|-----|
| SELECT | ✅ | ❌ | Filtrar filas visibles |
| INSERT | ❌ | ✅ | Validar nuevas filas |
| UPDATE | ✅ | ✅ | Filtrar y validar |
| DELETE | ✅ | ❌ | Filtrar filas eliminables |
| ALL | ✅ | ✅ | Combinación |

---

## Políticas por Tabla

### viajes

```sql
-- Política principal
CREATE POLICY "viajes_user_access"
  ON viajes FOR ALL
  USING (
    auth.uid() = user_id 
    OR is_superuser_secure(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR is_superuser_secure(auth.uid())
  );
```

### conductores

```sql
CREATE POLICY "conductores_user_access"
  ON conductores FOR ALL
  USING (
    auth.uid() = user_id 
    OR is_superuser_secure(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR is_superuser_secure(auth.uid())
  );
```

### vehiculos

```sql
CREATE POLICY "vehiculos_user_access"
  ON vehiculos FOR ALL
  USING (
    auth.uid() = user_id 
    OR is_superuser_secure(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR is_superuser_secure(auth.uid())
  );
```

### cartas_porte

```sql
-- Vista de propias
CREATE POLICY "Users can view own cartas porte"
  ON cartas_porte FOR SELECT
  USING (auth.uid() = usuario_id);

-- Creación con validación
CREATE POLICY "Users can create own cartas porte"
  ON cartas_porte FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Actualización (no timbradas)
CREATE POLICY "Users can update non-timbrada cartas porte"
  ON cartas_porte FOR UPDATE
  USING (
    auth.uid() = usuario_id 
    AND status != 'timbrada'
  );

-- Eliminación (solo borradores)
CREATE POLICY "Users can delete only draft cartas porte"
  ON cartas_porte FOR DELETE
  USING (
    auth.uid() = usuario_id 
    AND status IN ('draft', 'cancelada')
  );

-- Superusuarios
CREATE POLICY "Superusers full access"
  ON cartas_porte FOR ALL
  USING (is_superuser_secure(auth.uid()));
```

### ubicaciones

```sql
-- Acceso a través de carta_porte
CREATE POLICY "Users can manage locations of their cartas"
  ON ubicaciones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cartas_porte cp
      WHERE cp.id = ubicaciones.carta_porte_id
        AND cp.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cartas_porte cp
      WHERE cp.id = ubicaciones.carta_porte_id
        AND cp.usuario_id = auth.uid()
    )
  );
```

### mercancias

```sql
CREATE POLICY "Users can manage goods of their cartas"
  ON mercancias FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cartas_porte cp
      WHERE cp.id = mercancias.carta_porte_id
        AND cp.usuario_id = auth.uid()
    )
  );
```

### profiles

```sql
-- Ver propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Actualizar propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Insertar propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### certificados_digitales

```sql
-- CRUD completo solo para propios
CREATE POLICY "Users can view their own certificates"
  ON certificados_digitales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificates"
  ON certificados_digitales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificates"
  ON certificados_digitales FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certificates"
  ON certificados_digitales FOR DELETE
  USING (auth.uid() = user_id);
```

### configuracion_empresa

```sql
CREATE POLICY "Users can manage own config"
  ON configuracion_empresa FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### subscriptions

```sql
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Solo admins pueden modificar suscripciones
CREATE POLICY "Admins can manage subscriptions"
  ON subscriptions FOR ALL
  USING (is_admin_or_superuser(auth.uid()));
```

### creditos_usuarios

```sql
CREATE POLICY "Users can view own credits"
  ON creditos_usuarios FOR SELECT
  USING (auth.uid() = user_id);

-- Modificación solo vía funciones SECURITY DEFINER
-- No hay política de UPDATE directa para usuarios
```

### audit_log

```sql
-- Solo lectura para admins
CREATE POLICY "Admins can view all audit logs"
  ON audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Superusers can view all audit logs"
  ON audit_log FOR SELECT
  USING (is_superuser_secure(auth.uid()));

-- No INSERT/UPDATE/DELETE para nadie vía RLS
```

### bloqueos_usuario

```sql
-- Usuarios solo ven sus bloqueos
CREATE POLICY "Users can view their own blocks"
  ON bloqueos_usuario FOR SELECT
  USING (auth.uid() = user_id);

-- Admins gestionan todos los bloqueos
CREATE POLICY "Admins can manage all blocks"
  ON bloqueos_usuario FOR ALL
  USING (is_admin_or_superuser(auth.uid()))
  WITH CHECK (is_admin_or_superuser(auth.uid()));
```

---

## Catálogos SAT (Solo Lectura)

```sql
-- Patrón para todos los catálogos cat_*
CREATE POLICY "Allow public read access to cat_{nombre}"
  ON cat_{nombre} FOR SELECT
  USING (true);

-- No hay políticas de INSERT/UPDATE/DELETE
-- Los catálogos se cargan administrativamente
```

Tablas con esta política:
- cat_clave_prod_serv_cp
- cat_clave_unidad
- cat_codigo_postal
- cat_colonia
- cat_estado
- cat_municipio
- cat_localidad
- cat_pais
- cat_config_autotransporte
- cat_subtipo_remolque
- cat_tipo_permiso
- cat_figura_transporte
- cat_material_peligroso
- cat_tipo_embalaje
- cat_via_entrada_salida
- cat_registro_istmo

---

## Multi-Tenant

### clientes_proveedores

```sql
CREATE POLICY "Tenant isolation policy"
  ON clientes_proveedores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.tenant_id = clientes_proveedores.tenant_id
        AND usuarios.auth_user_id = auth.uid()
    )
  );
```

### cantidad_transporta

```sql
CREATE POLICY "Access through mercancia"
  ON cantidad_transporta FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM mercancias m
      JOIN cartas_porte cp ON cp.id = m.carta_porte_id
      JOIN usuarios u ON u.tenant_id = cp.tenant_id
      WHERE m.id = cantidad_transporta.mercancia_id
        AND u.auth_user_id = auth.uid()
    )
  );
```

---

## Debugging de Políticas

### Ver políticas de una tabla
```sql
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'nombre_tabla';
```

### Verificar si RLS está habilitado
```sql
SELECT 
  relname,
  relrowsecurity,
  relforcerowsecurity
FROM pg_class
WHERE relname = 'nombre_tabla';
```

### Probar políticas
```sql
-- Como usuario específico
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-uuid-here"}';

SELECT * FROM tabla;
-- Debería mostrar solo filas permitidas
```
