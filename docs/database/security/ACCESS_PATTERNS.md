# Patrones de Acceso por Rol

## Roles del Sistema

### 1. Usuario Regular (Transportista)
```
Acceso: Solo sus propios datos
Filtro RLS: auth.uid() = user_id
```

| Recurso | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| viajes | ✅ Propios | ✅ | ✅ Propios | ✅ Propios |
| conductores | ✅ Propios | ✅ | ✅ Propios | ✅ Propios |
| vehiculos | ✅ Propios | ✅ | ✅ Propios | ✅ Propios |
| cartas_porte | ✅ Propios | ✅ | ✅ Propios | ❌ |
| facturas | ✅ Propios | ✅ | ✅ Propios | ❌ |
| catálogos SAT | ✅ Todos | ❌ | ❌ | ❌ |

---

### 2. Superusuario (Administrador)
```
Acceso: Todos los datos del sistema
Verificación: is_superuser_secure() = true
```

| Recurso | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| Todas las tablas | ✅ Todos | ✅ | ✅ | ✅ |
| superusuarios | ✅ | ✅ | ✅ | ✅ |
| configuración global | ✅ | ✅ | ✅ | ✅ |

---

### 3. Tenant (Multi-tenant)
```
Acceso: Datos del tenant + propios
Filtro: tenant_id = user.tenant_id OR user_id = auth.uid()
```

Tablas con soporte multi-tenant:
- `clientes_proveedores`
- `cartas_porte`
- `figuras_frecuentes`
- `ubicaciones_frecuentes`
- `mercancias_frecuentes`

---

## Patrones de Query Frecuentes

### Por Usuario
```sql
-- Viajes del usuario actual
SELECT * FROM viajes WHERE user_id = auth.uid();

-- Recursos disponibles
SELECT * FROM conductores WHERE user_id = auth.uid() AND activo = true;
```

### Por Estado
```sql
-- Viajes activos
SELECT * FROM viajes WHERE user_id = auth.uid() AND estado IN ('programado', 'en_curso');

-- Cartas porte pendientes de timbrar
SELECT * FROM cartas_porte WHERE usuario_id = auth.uid() AND status = 'borrador';
```

### Por Fecha
```sql
-- Viajes del mes
SELECT * FROM viajes 
WHERE user_id = auth.uid() 
AND fecha_inicio_programada >= date_trunc('month', now());
```

### Agregaciones
```sql
-- Conteo por estado
SELECT estado, COUNT(*) FROM viajes WHERE user_id = auth.uid() GROUP BY estado;

-- Ingresos del mes
SELECT SUM(total) FROM facturas 
WHERE user_id = auth.uid() 
AND fecha_expedicion >= date_trunc('month', now());
```

---

## Migración a DynamoDB: Implementación de Acceso

### Reemplazo de RLS
```javascript
// En Lambda/API Gateway
const userId = event.requestContext.authorizer.claims.sub; // Cognito

// Filtrar por partition key
const params = {
  TableName: 'TransporteData',
  KeyConditionExpression: 'PK = :pk',
  ExpressionAttributeValues: {
    ':pk': `USER#${userId}`
  }
};
```

### Verificación de Superusuario
```javascript
// Cognito groups
const groups = event.requestContext.authorizer.claims['cognito:groups'] || [];
const isSuperuser = groups.includes('superusers');

if (isSuperuser) {
  // Scan completo permitido
} else {
  // Solo datos del usuario
}
```

### Multi-tenant en DynamoDB
```javascript
// GSI para queries por tenant
const params = {
  TableName: 'TransporteData',
  IndexName: 'GSI-Tenant',
  KeyConditionExpression: 'tenantId = :tid',
  ExpressionAttributeValues: {
    ':tid': userTenantId
  }
};
```
