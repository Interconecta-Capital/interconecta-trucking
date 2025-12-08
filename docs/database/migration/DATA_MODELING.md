# Modelado de Datos NoSQL para DynamoDB

## Principios de Diseño

### 1. Denormalización

A diferencia de PostgreSQL donde normalizamos para evitar redundancia, en DynamoDB:

- **Embeber datos relacionados** cuando se acceden juntos
- **Duplicar datos** para optimizar consultas
- **Precomputar agregaciones** en lugar de calcular al vuelo

### 2. Single-Table Design

Una sola tabla con diferentes tipos de entidades:

```
┌─────────────────────────────────────────────────────────────────┐
│                      TransporteApp Table                        │
├──────────────────────────┬──────────────────────────────────────┤
│          PK              │                SK                    │
├──────────────────────────┼──────────────────────────────────────┤
│ USER#123                 │ PROFILE#metadata                     │
│ USER#123                 │ VIAJE#abc                            │
│ USER#123                 │ VIAJE#def                            │
│ USER#123                 │ CONDUCTOR#456                        │
│ USER#123                 │ VEHICULO#789                         │
│ USER#123                 │ CARTA#xyz                            │
│ CARTA#xyz                │ UBICACION#01                         │
│ CARTA#xyz                │ UBICACION#02                         │
│ CARTA#xyz                │ MERCANCIA#m1                         │
├──────────────────────────┴──────────────────────────────────────┤
│                        GSI-1 (ByStatus)                         │
├──────────────────────────┬──────────────────────────────────────┤
│        GSI1PK            │              GSI1SK                  │
├──────────────────────────┼──────────────────────────────────────┤
│ STATUS#en_curso          │ 2024-01-15#VIAJE#abc                 │
│ STATUS#disponible        │ CONDUCTOR#456                        │
│ STATUS#borrador          │ 2024-01-15#CARTA#xyz                 │
└──────────────────────────┴──────────────────────────────────────┘
```

### 3. Access Patterns First

Diseñar el modelo basado en cómo se accederá a los datos:

| Patrón de Acceso | Solución |
|------------------|----------|
| Obtener viajes de usuario | Query: PK = USER#id, SK begins_with VIAJE# |
| Obtener viaje con carta porte | Query: PK = USER#id, SK = VIAJE#id (datos embebidos) |
| Listar conductores disponibles | Query GSI: GSI1PK = STATUS#disponible |
| Carta porte por folio | GSI adicional o embeber en item |

---

## Entidades y Atributos

### USER (Perfil de Usuario)

```json
{
  "PK": "USER#uuid",
  "SK": "PROFILE#metadata",
  "entityType": "USER",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Juan Pérez",
    "avatarUrl": "https://...",
    "timezone": "America/Mexico_City",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "subscription": {
    "planId": "plan-uuid",
    "planName": "Profesional",
    "status": "active",
    "expiresAt": "2025-01-01T00:00:00Z",
    "limits": {
      "conductores": 10,
      "vehiculos": 15,
      "cartasPorteMes": 100
    }
  },
  "credits": {
    "balance": 50,
    "monthlyUsed": 15,
    "totalConsumed": 200
  },
  "config": {
    "rfcEmisor": "XXX...",
    "razonSocial": "...",
    "regimenFiscal": "601",
    "domicilioFiscal": {...}
  }
}
```

### VIAJE

```json
{
  "PK": "USER#uuid",
  "SK": "VIAJE#viaje-uuid",
  "GSI1PK": "STATUS#en_curso",
  "GSI1SK": "2024-01-15#viaje-uuid",
  "GSI2PK": "DATE#2024-01-15",
  "GSI2SK": "VIAJE#viaje-uuid",
  "entityType": "VIAJE",
  "data": {
    "id": "viaje-uuid",
    "nombre": "Viaje CDMX-GDL",
    "estado": "en_curso",
    "fechaInicioProgramada": "2024-01-15T08:00:00Z",
    "fechaFinProgramada": "2024-01-15T18:00:00Z",
    "origen": "Ciudad de México",
    "destino": "Guadalajara",
    "origenCoordenadas": {"lat": 19.4326, "lng": -99.1332},
    "destinoCoordenadas": {"lat": 20.6597, "lng": -103.3496}
  },
  "resources": {
    "conductorId": "conductor-uuid",
    "conductorNombre": "Pedro López",  // Denormalizado
    "vehiculoId": "vehiculo-uuid",
    "vehiculoPlaca": "ABC-123",         // Denormalizado
    "remolqueId": "remolque-uuid"
  },
  "tracking": {
    "ubicacionActual": {"lat": 20.1, "lng": -101.2},
    "ultimaActualizacion": "2024-01-15T12:30:00Z",
    "progreso": 65,
    "distanciaRecorrida": 325,
    "distanciaTotal": 500
  },
  "fiscal": {
    "cartaPorteId": "carta-uuid",
    "cartaPorteFolio": "CP-000015",  // Denormalizado
    "cartaPorteStatus": "timbrada"    // Denormalizado
  },
  "costos": {
    "combustibleEstimado": 2500,
    "peajesEstimados": 800,
    "costoTotal": 5000,
    "precioCliente": 8000,
    "margen": 3000
  },
  "createdAt": "2024-01-14T20:00:00Z",
  "updatedAt": "2024-01-15T12:30:00Z"
}
```

### CONDUCTOR

```json
{
  "PK": "USER#uuid",
  "SK": "CONDUCTOR#conductor-uuid",
  "GSI1PK": "STATUS#disponible",
  "GSI1SK": "conductor-uuid",
  "entityType": "CONDUCTOR",
  "data": {
    "id": "conductor-uuid",
    "nombre": "Pedro López",
    "rfc": "XXXX000000XXX",
    "curp": "XXXX000000XXXXXX00",
    "email": "pedro@example.com",
    "telefono": "+52 55 1234 5678",
    "estado": "disponible",
    "activo": true
  },
  "licencia": {
    "tipo": "E",
    "numero": "ABC123456",
    "vigencia": "2025-06-15"
  },
  "compensacion": {
    "salarioBase": 15000,
    "porcentajeComision": 5,
    "bancoCuenta": "1234567890",
    "bancoClabe": "012345678901234567"
  },
  "performance": {
    "viajesCompletados": 150,
    "kmTotales": 75000,
    "calificacionPromedio": 4.8,
    "puntualidadPromedio": 96,
    "incidentes": 1
  },
  "asignacion": {
    "viajeActualId": null,
    "vehiculoAsignadoId": "vehiculo-uuid",
    "ubicacionActual": "Guadalajara"
  },
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

### CARTA_PORTE (con datos embebidos)

```json
{
  "PK": "USER#uuid",
  "SK": "CARTA#carta-uuid",
  "GSI1PK": "STATUS#timbrada",
  "GSI1SK": "2024-01-15#carta-uuid",
  "GSI2PK": "VIAJE#viaje-uuid",
  "GSI2SK": "CARTA#carta-uuid",
  "entityType": "CARTA_PORTE",
  "data": {
    "id": "carta-uuid",
    "folio": "CP-000015",
    "versionCartaPorte": "3.1",
    "status": "timbrada",
    "transporteInternacional": false
  },
  "emisor": {
    "rfc": "XXX000000XXX",
    "nombre": "Transportes SA de CV",
    "regimenFiscal": "601",
    "domicilioFiscal": {
      "codigoPostal": "06600",
      "estado": "CMX",
      "municipio": "014",
      "localidad": null,
      "colonia": "0001"
    }
  },
  "receptor": {
    "rfc": "YYY000000YYY",
    "nombre": "Cliente SA",
    "regimenFiscal": "601",
    "usoCfdi": "S01",
    "domicilioFiscal": {...}
  },
  "totales": {
    "distanciaTotal": 500,
    "pesoBrutoTotal": 15000,
    "numeroTotalMercancias": 3
  },
  "ubicaciones": [
    {
      "tipo": "Origen",
      "orden": 1,
      "idUbicacion": "OR000001",
      "rfcRemitenteDestinatario": "XXX...",
      "nombreRemitenteDestinatario": "...",
      "fechaHoraSalidaLlegada": "2024-01-15T08:00:00",
      "domicilio": {
        "codigoPostal": "06600",
        "estado": "CMX",
        "municipio": "014",
        "localidad": null,
        "colonia": "0001",
        "calle": "Reforma 222",
        "numeroExterior": "222"
      }
    },
    {
      "tipo": "Destino",
      "orden": 2,
      "idUbicacion": "DE000001",
      "distanciaRecorrida": 500,
      "domicilio": {...}
    }
  ],
  "mercancias": [
    {
      "id": "merc-1",
      "claveProdServ": "78101800",
      "claveUnidad": "KGM",
      "descripcion": "Mercancía general",
      "cantidad": 100,
      "pesoKg": 5000,
      "valorMercancia": 50000
    },
    {
      "id": "merc-2",
      "descripcion": "...",
      ...
    }
  ],
  "figuras": [
    {
      "tipoFigura": "01",
      "rfcFigura": "XXX...",
      "nombreFigura": "Pedro López",
      "numLicencia": "ABC123456"
    }
  ],
  "autotransporte": {
    "permSct": "TPAF01",
    "numPermisoSct": "12345",
    "configVehicular": "T3S2",
    "placaVm": "ABC-123",
    "anioModeloVm": 2022,
    "aseguraRespCivil": "Seguros XYZ",
    "polizaRespCivil": "POL-123456"
  },
  "timbrado": {
    "uuidFiscal": "12345678-1234-1234-1234-123456789012",
    "fechaTimbrado": "2024-01-15T08:30:00Z",
    "xmlGenerado": "<?xml ...>",
    "idCcp": "CCP-UUID"
  },
  "createdAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-01-15T08:30:00Z"
}
```

---

## Patrones de Consulta

### Paginación

```javascript
// Primera página
const result = await dynamodb.query({
  TableName: 'TransporteApp',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': `USER#${userId}`,
    ':sk': 'VIAJE#'
  },
  Limit: 20,
  ScanIndexForward: false
});

// Páginas siguientes
if (result.LastEvaluatedKey) {
  const nextPage = await dynamodb.query({
    ...params,
    ExclusiveStartKey: result.LastEvaluatedKey
  });
}
```

### Transacciones

```javascript
// Crear viaje con carta porte (transacción)
const result = await dynamodb.transactWrite({
  TransactItems: [
    {
      Put: {
        TableName: 'TransporteApp',
        Item: viajeItem
      }
    },
    {
      Put: {
        TableName: 'TransporteApp',
        Item: cartaPorteItem
      }
    },
    {
      Update: {
        TableName: 'TransporteApp',
        Key: { PK: `USER#${userId}`, SK: 'PROFILE#metadata' },
        UpdateExpression: 'SET #credits.#used = #credits.#used + :one',
        ExpressionAttributeNames: {
          '#credits': 'credits',
          '#used': 'monthlyUsed'
        },
        ExpressionAttributeValues: {
          ':one': 1
        }
      }
    }
  ]
});
```

### Batch Operations

```javascript
// Obtener múltiples items
const result = await dynamodb.batchGet({
  RequestItems: {
    'TransporteApp': {
      Keys: [
        { PK: `USER#${userId}`, SK: `CONDUCTOR#${conductorId}` },
        { PK: `USER#${userId}`, SK: `VEHICULO#${vehiculoId}` },
        { PK: `USER#${userId}`, SK: `REMOLQUE#${remolqueId}` }
      ]
    }
  }
});
```

---

## Optimizaciones

### 1. Sparse Indexes

Solo indexar items que tienen el atributo:

```json
// Solo viajes en curso tienen GSI1PK
{
  "PK": "USER#123",
  "SK": "VIAJE#abc",
  "GSI1PK": "STATUS#en_curso",  // Solo presente si en_curso
  ...
}
```

### 2. Projecciones en GSIs

Incluir solo atributos necesarios:

```javascript
// GSI con proyección limitada
{
  IndexName: 'GSI-Status',
  KeySchema: [...],
  Projection: {
    ProjectionType: 'INCLUDE',
    NonKeyAttributes: ['data.nombre', 'data.estado', 'updatedAt']
  }
}
```

### 3. TTL para datos temporales

```json
{
  "PK": "USER#123",
  "SK": "SESSION#abc",
  "ttl": 1704067200,  // Unix timestamp
  ...
}
```
