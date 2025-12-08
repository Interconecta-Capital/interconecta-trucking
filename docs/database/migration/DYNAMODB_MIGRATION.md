# Migración a DynamoDB

## Visión General

Esta guía documenta cómo migrar el esquema actual de PostgreSQL/Supabase a Amazon DynamoDB usando un diseño de tabla única (single-table design).

## Arquitectura Objetivo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AWS CLOUD                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐          │
│   │   Cognito   │──────►│ API Gateway │──────►│   Lambda    │          │
│   │ User Pools  │       │             │       │  Functions  │          │
│   └─────────────┘       └─────────────┘       └──────┬──────┘          │
│                                                      │                  │
│                                                      ▼                  │
│                                              ┌─────────────┐           │
│                                              │  DynamoDB   │           │
│                                              │ Single Table│           │
│                                              └─────────────┘           │
│                                                      │                  │
│                              ┌────────────────────────┼───────────┐     │
│                              │                        │           │     │
│                              ▼                        ▼           ▼     │
│                       ┌───────────┐          ┌───────────┐ ┌─────────┐ │
│                       │  GSI-1    │          │  GSI-2    │ │  GSI-3  │ │
│                       │ByTenant  │          │ ByStatus  │ │ByDate   │ │
│                       └───────────┘          └───────────┘ └─────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Diseño de Tabla Única

### Estructura Principal

| Campo | Tipo | Descripción |
|-------|------|-------------|
| PK | String | Partition Key: `{ENTITY}#{id}` |
| SK | String | Sort Key: `{TYPE}#{timestamp|id}` |
| GSI1PK | String | Global Secondary Index 1: Por tenant |
| GSI1SK | String | GSI1 Sort Key |
| GSI2PK | String | GSI2: Por estado |
| GSI2SK | String | GSI2 Sort Key |
| data | Map | Atributos de la entidad |

### Patrones de Partition Key

```
# Usuarios
PK: USER#{user_id}
SK: PROFILE#metadata

# Viajes
PK: USER#{user_id}
SK: VIAJE#{viaje_id}

# Conductores
PK: USER#{user_id}
SK: CONDUCTOR#{conductor_id}

# Vehículos
PK: USER#{user_id}
SK: VEHICULO#{vehiculo_id}

# Cartas Porte
PK: USER#{user_id}
SK: CARTA#{carta_id}

# Ubicaciones (anidadas en Carta Porte)
PK: CARTA#{carta_id}
SK: UBICACION#{orden}

# Mercancías
PK: CARTA#{carta_id}
SK: MERCANCIA#{mercancia_id}
```

---

## Mapeo de Entidades

### viajes

**PostgreSQL:**
```sql
CREATE TABLE viajes (
  id UUID,
  user_id UUID,
  conductor_id UUID,
  vehiculo_id UUID,
  estado TEXT,
  fecha_inicio_programada TIMESTAMPTZ,
  ...
);
```

**DynamoDB:**
```json
{
  "PK": "USER#123e4567-e89b",
  "SK": "VIAJE#987fcdeb-51a2",
  "GSI1PK": "TENANT#abc",
  "GSI1SK": "VIAJE#2024-01-15",
  "GSI2PK": "STATUS#en_curso",
  "GSI2SK": "2024-01-15T10:30:00Z",
  "entityType": "VIAJE",
  "data": {
    "id": "987fcdeb-51a2-...",
    "conductorId": "conductor-uuid",
    "vehiculoId": "vehiculo-uuid",
    "estado": "en_curso",
    "fechaInicio": "2024-01-15T10:30:00Z",
    "origen": "CDMX",
    "destino": "Guadalajara",
    "trackingData": {...}
  }
}
```

### conductores

**DynamoDB:**
```json
{
  "PK": "USER#123e4567-e89b",
  "SK": "CONDUCTOR#456abcde",
  "GSI1PK": "CONDUCTOR#disponible",
  "GSI1SK": "456abcde",
  "entityType": "CONDUCTOR",
  "data": {
    "id": "456abcde",
    "nombre": "Juan Pérez",
    "rfc": "XXXX000000XXX",
    "numLicencia": "ABC123456",
    "estado": "disponible",
    "activo": true,
    "telefono": "+52...",
    "performance": {...}
  }
}
```

### cartas_porte

**DynamoDB (con datos embebidos):**
```json
{
  "PK": "USER#123e4567-e89b",
  "SK": "CARTA#789carta",
  "GSI1PK": "CARTA#borrador",
  "GSI1SK": "2024-01-15",
  "GSI2PK": "VIAJE#viaje-uuid",
  "GSI2SK": "CARTA#789carta",
  "entityType": "CARTA_PORTE",
  "data": {
    "id": "789carta",
    "folio": "CP-000001",
    "status": "borrador",
    "rfcEmisor": "XXX...",
    "rfcReceptor": "YYY...",
    "distanciaTotal": 500,
    "pesoBrutoTotal": 15000,
    "ubicaciones": [
      {"tipo": "Origen", "orden": 1, "domicilio": {...}},
      {"tipo": "Destino", "orden": 2, "domicilio": {...}}
    ],
    "mercancias": [
      {"descripcion": "...", "cantidad": 100, "pesoKg": 5000}
    ],
    "figuras": [
      {"tipo": "01", "rfc": "...", "nombre": "..."}
    ],
    "autotransporte": {
      "permSct": "...",
      "placaVm": "ABC-123"
    }
  }
}
```

---

## Global Secondary Indexes (GSIs)

### GSI-1: Por Tenant/Estado

```
GSI1PK: TENANT#{tenant_id} o STATUS#{estado}
GSI1SK: {entity_type}#{fecha|id}

# Ejemplos de acceso:
- Todos los viajes de un tenant
- Todos los conductores disponibles
- Todas las cartas porte pendientes
```

### GSI-2: Por Fecha

```
GSI2PK: DATE#{YYYY-MM-DD}
GSI2SK: {entity_type}#{id}

# Ejemplos de acceso:
- Viajes del día
- Cartas porte generadas hoy
- Actividad reciente
```

### GSI-3: Por Relación

```
GSI3PK: VIAJE#{viaje_id} o CARTA#{carta_id}
GSI3SK: {entity_type}#{id}

# Ejemplos de acceso:
- Carta porte de un viaje
- Ubicaciones de una carta
- Mercancías de una carta
```

---

## Patrones de Acceso

### 1. Obtener viajes de un usuario

**PostgreSQL:**
```sql
SELECT * FROM viajes WHERE user_id = ? ORDER BY created_at DESC;
```

**DynamoDB:**
```javascript
const params = {
  TableName: 'TransporteApp',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': `USER#${userId}`,
    ':sk': 'VIAJE#'
  },
  ScanIndexForward: false // DESC
};
```

### 2. Obtener viaje completo para timbrado

**PostgreSQL:**
```sql
SELECT v.*, c.*, vh.*, r.*, cp.*, ...
FROM viajes v
LEFT JOIN conductores c ON v.conductor_id = c.id
LEFT JOIN vehiculos vh ON v.vehiculo_id = vh.id
...
```

**DynamoDB (datos embebidos):**
```javascript
// Los datos ya están embebidos en el item
const params = {
  TableName: 'TransporteApp',
  Key: {
    PK: `USER#${userId}`,
    SK: `VIAJE#${viajeId}`
  }
};

// El item contiene referencias que se resuelven en paralelo
const [viaje, conductor, vehiculo] = await Promise.all([
  dynamodb.get({...viajeParams}),
  dynamodb.get({PK: `USER#${userId}`, SK: `CONDUCTOR#${conductorId}`}),
  dynamodb.get({PK: `USER#${userId}`, SK: `VEHICULO#${vehiculoId}`})
]);
```

### 3. Listar conductores disponibles

**PostgreSQL:**
```sql
SELECT * FROM conductores 
WHERE user_id = ? AND estado = 'disponible' AND activo = true;
```

**DynamoDB (usando GSI):**
```javascript
const params = {
  TableName: 'TransporteApp',
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :pk',
  FilterExpression: '#data.activo = :activo',
  ExpressionAttributeValues: {
    ':pk': 'CONDUCTOR#disponible',
    ':activo': true
  },
  ExpressionAttributeNames: {
    '#data': 'data'
  }
};
```

### 4. Búsqueda por folio de Carta Porte

**PostgreSQL:**
```sql
SELECT * FROM cartas_porte WHERE folio = ? AND usuario_id = ?;
```

**DynamoDB (GSI adicional o Scan filtrado):**
```javascript
// Opción 1: GSI por folio
const params = {
  TableName: 'TransporteApp',
  IndexName: 'GSI-Folio',
  KeyConditionExpression: 'folio = :folio',
  ExpressionAttributeValues: {
    ':folio': 'CP-000001'
  }
};

// Opción 2: Query + Filter (menos eficiente)
const params = {
  TableName: 'TransporteApp',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  FilterExpression: '#data.folio = :folio',
  ExpressionAttributeValues: {
    ':pk': `USER#${userId}`,
    ':sk': 'CARTA#',
    ':folio': 'CP-000001'
  }
};
```

---

## Seguridad

### Reemplazo de RLS con Lambda + Cognito

```javascript
// Lambda Authorizer
exports.handler = async (event) => {
  const token = event.headers.Authorization;
  const decoded = await verifyJWT(token);
  
  // Extraer usuario y grupos
  const userId = decoded.sub;
  const groups = decoded['cognito:groups'] || [];
  
  return {
    principalId: userId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: event.methodArn
      }]
    },
    context: {
      userId,
      isSuperuser: groups.includes('superusers'),
      isAdmin: groups.includes('admins')
    }
  };
};

// En la Lambda de negocio
exports.handler = async (event) => {
  const userId = event.requestContext.authorizer.userId;
  const isSuperuser = event.requestContext.authorizer.isSuperuser;
  
  // Siempre filtrar por userId (equivalente a RLS)
  const params = {
    TableName: 'TransporteApp',
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`
    }
  };
  
  // Superusers pueden ver todo (scan)
  if (isSuperuser) {
    // Lógica diferente para superusers
  }
};
```

### IAM Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/TransporteApp",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["USER#${cognito-identity.amazonaws.com:sub}"]
        }
      }
    }
  ]
}
```

---

## Scripts de Migración

Ver [MIGRATION_SCRIPTS.md](./MIGRATION_SCRIPTS.md) para scripts detallados de migración de datos.

---

## Consideraciones de Costo

### Modelo de Capacidad

| Modo | Uso | Costo |
|------|-----|-------|
| On-Demand | Variable/impredecible | ~$1.25/millón WCU, ~$0.25/millón RCU |
| Provisioned | Predecible/constante | Más económico pero requiere planificación |

### Optimización

1. **Embeber datos relacionados** para reducir operaciones
2. **Usar proyecciones en GSIs** para reducir tamaño
3. **TTL** para eliminar datos antiguos automáticamente
4. **DAX** para caché en memoria si hay lecturas frecuentes

---

## Rollback Plan

1. Mantener PostgreSQL en modo solo-lectura durante migración
2. Implementar dual-write primero (escribir a ambos)
3. Validar consistencia antes de cutover
4. Mantener PostgreSQL 30 días después de migración completa
