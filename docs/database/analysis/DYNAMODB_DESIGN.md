# Diseño DynamoDB - Single Table Design

## Visión General

Este documento describe el diseño optimizado de DynamoDB para TransporteApp, utilizando el patrón Single-Table Design para maximizar eficiencia y minimizar costos.

---

## Arquitectura Híbrida

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE DATOS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────┐                               │
│  │         DYNAMODB                │                               │
│  │    (Datos Transaccionales)      │                               │
│  │                                 │                               │
│  │  • Viajes           ~70%        │                               │
│  │  • Cartas Porte                 │                               │
│  │  • Conductores      del         │                               │
│  │  • Vehículos        tráfico     │                               │
│  │  • Facturas                     │                               │
│  │  • Cotizaciones                 │                               │
│  │  • Configuración                │                               │
│  │  • Favoritos                    │                               │
│  │  • Documentos                   │                               │
│  └─────────────────────────────────┘                               │
│                                                                     │
│  ┌─────────────────────────────────┐                               │
│  │       POSTGRESQL/AURORA         │                               │
│  │      (Datos de Referencia)      │                               │
│  │                                 │                               │
│  │  • Catálogos SAT    ~30%        │                               │
│  │  • auth.users       del         │                               │
│  │  • profiles         tráfico     │                               │
│  │  • subscriptions                │                               │
│  │  • Auditoría                    │                               │
│  └─────────────────────────────────┘                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tabla Principal DynamoDB

### Configuración

```yaml
TableName: transporte-app-main
BillingMode: PAY_PER_REQUEST  # On-demand para inicio
PointInTimeRecovery: Enabled
Encryption: AWS_OWNED_CMK

AttributeDefinitions:
  - AttributeName: PK
    AttributeType: S
  - AttributeName: SK
    AttributeType: S
  - AttributeName: GSI1PK
    AttributeType: S
  - AttributeName: GSI1SK
    AttributeType: S
  - AttributeName: GSI2PK
    AttributeType: S
  - AttributeName: GSI2SK
    AttributeType: S

KeySchema:
  - AttributeName: PK
    KeyType: HASH
  - AttributeName: SK
    KeyType: RANGE
```

---

## Diseño de Partition Keys y Sort Keys

### Entidades Principales

| Entidad | PK | SK | Ejemplo |
|---------|----|----|---------|
| Usuario Config | `USER#<userId>` | `CONFIG#empresa` | `USER#abc123` / `CONFIG#empresa` |
| Viaje | `USER#<userId>` | `VIAJE#<viajeId>` | `USER#abc123` / `VIAJE#v001` |
| Evento Viaje | `USER#<userId>` | `VIAJE#<viajeId>#EVENT#<timestamp>` | `USER#abc123` / `VIAJE#v001#EVENT#2024-01-15T10:30:00` |
| Conductor | `USER#<userId>` | `CONDUCTOR#<conductorId>` | `USER#abc123` / `CONDUCTOR#c001` |
| Vehículo | `USER#<userId>` | `VEHICULO#<vehiculoId>` | `USER#abc123` / `VEHICULO#vh001` |
| Remolque | `USER#<userId>` | `REMOLQUE#<remolqueId>` | `USER#abc123` / `REMOLQUE#rm001` |
| Carta Porte | `USER#<userId>` | `CARTA#<cartaId>` | `USER#abc123` / `CARTA#cp001` |
| Factura | `USER#<userId>` | `FACTURA#<facturaId>` | `USER#abc123` / `FACTURA#f001` |
| Cliente | `USER#<userId>` | `CLIENTE#<clienteId>` | `USER#abc123` / `CLIENTE#cl001` |
| Cotización | `USER#<userId>` | `COTIZACION#<cotizId>` | `USER#abc123` / `COTIZACION#cot001` |
| Favorito | `USER#<userId>` | `FAV#<tipo>#<entityId>` | `USER#abc123` / `FAV#ubicacion#ub001` |
| Certificado | `USER#<userId>` | `CERT#<certId>` | `USER#abc123` / `CERT#cert001` |
| Documento | `USER#<userId>` | `DOC#<entidadTipo>#<entidadId>#<docId>` | `USER#abc123` / `DOC#viaje#v001#doc001` |

---

## Global Secondary Indexes (GSIs)

### GSI1: Por Estado y Fecha

**Propósito**: Consultar viajes/cartas por estado ordenados por fecha

```yaml
GSI1:
  KeySchema:
    - AttributeName: GSI1PK  # USER#<userId>#<entityType>#<status>
      KeyType: HASH
    - AttributeName: GSI1SK  # <fecha>
      KeyType: RANGE
  Projection: ALL
```

**Ejemplos de uso:**
```
# Viajes pendientes del usuario ordenados por fecha
GSI1PK = "USER#abc123#VIAJE#pendiente"
GSI1SK between "2024-01-01" and "2024-12-31"

# Cartas porte timbradas
GSI1PK = "USER#abc123#CARTA#timbrado"
GSI1SK >= "2024-06-01"
```

### GSI2: Por Entidad Relacionada

**Propósito**: Buscar por conductor, vehículo, cliente, etc.

```yaml
GSI2:
  KeySchema:
    - AttributeName: GSI2PK  # <entityType>#<entityId>
      KeyType: HASH
    - AttributeName: GSI2SK  # <fecha>
      KeyType: RANGE
  Projection: ALL
```

**Ejemplos de uso:**
```
# Viajes de un conductor específico
GSI2PK = "CONDUCTOR#c001"
GSI2SK >= "2024-01-01"

# Viajes con un vehículo específico
GSI2PK = "VEHICULO#vh001"

# Cartas porte de un cliente
GSI2PK = "CLIENTE#cl001"
```

### GSI3: Por Fecha Global (Opcional)

**Propósito**: Consultas administrativas/reportes por fecha

```yaml
GSI3:
  KeySchema:
    - AttributeName: GSI3PK  # <entityType>#<YYYY-MM>
      KeyType: HASH
    - AttributeName: GSI3SK  # <timestamp>#<userId>
      KeyType: RANGE
  Projection: KEYS_ONLY
```

---

## Estructura de Items

### Viaje

```json
{
  "PK": "USER#abc123",
  "SK": "VIAJE#v001",
  "GSI1PK": "USER#abc123#VIAJE#en_curso",
  "GSI1SK": "2024-01-15T08:00:00Z",
  "GSI2PK": "CONDUCTOR#c001",
  "GSI2SK": "2024-01-15T08:00:00Z",
  
  "entityType": "VIAJE",
  "id": "v001",
  "userId": "abc123",
  
  "origen": "CDMX",
  "destino": "Guadalajara",
  "status": "en_curso",
  "prioridad": "alta",
  
  "fechaInicio": "2024-01-15T08:00:00Z",
  "fechaFinEstimada": "2024-01-15T16:00:00Z",
  "fechaFinReal": null,
  
  "conductorId": "c001",
  "vehiculoId": "vh001",
  "remolqueId": "rm001",
  "clienteId": "cl001",
  
  "distanciaKm": 550,
  "tiempoEstimadoMin": 420,
  
  "costos": {
    "combustibleEstimado": 2500,
    "combustibleReal": null,
    "casetas": 850,
    "salarioConductor": 1200
  },
  
  "ubicacionActual": {
    "lat": 20.659699,
    "lng": -103.349609,
    "timestamp": "2024-01-15T12:30:00Z"
  },
  
  "notas": "Entrega urgente",
  
  "createdAt": "2024-01-14T18:00:00Z",
  "updatedAt": "2024-01-15T12:30:00Z"
}
```

### Carta Porte (Documento Completo)

```json
{
  "PK": "USER#abc123",
  "SK": "CARTA#cp001",
  "GSI1PK": "USER#abc123#CARTA#timbrado",
  "GSI1SK": "2024-01-15T10:00:00Z",
  "GSI2PK": "VIAJE#v001",
  "GSI2SK": "2024-01-15T10:00:00Z",
  
  "entityType": "CARTA_PORTE",
  "id": "cp001",
  "userId": "abc123",
  "viajeId": "v001",
  
  "folio": "CP-2024-001",
  "status": "timbrado",
  "versionCartaPorte": "3.1",
  
  "emisor": {
    "rfc": "ABC123456789",
    "nombre": "Transportes ABC SA de CV",
    "regimenFiscal": "601",
    "domicilioFiscal": {
      "codigoPostal": "06600",
      "estado": "CMX",
      "municipio": "015"
    }
  },
  
  "receptor": {
    "rfc": "XYZ987654321",
    "nombre": "Cliente XYZ SA",
    "usoCfdi": "S01"
  },
  
  "ubicaciones": [
    {
      "tipoUbicacion": "Origen",
      "idUbicacion": "OR001",
      "rfcRemitenteDestinatario": "ABC123456789",
      "fechaHoraSalidaLlegada": "2024-01-15T08:00:00",
      "domicilio": {
        "codigoPostal": "06600",
        "estado": "CMX",
        "municipio": "015",
        "localidad": "01"
      }
    },
    {
      "tipoUbicacion": "Destino",
      "idUbicacion": "DE001",
      "rfcRemitenteDestinatario": "XYZ987654321",
      "fechaHoraSalidaLlegada": "2024-01-15T16:00:00",
      "distanciaRecorrida": 550,
      "domicilio": {
        "codigoPostal": "44100",
        "estado": "JAL",
        "municipio": "039"
      }
    }
  ],
  
  "mercancias": {
    "pesoBrutoTotal": 5000,
    "unidadPeso": "KGM",
    "numTotalMercancias": 2,
    "items": [
      {
        "bienesTransp": "25174800",
        "descripcion": "Productos electrónicos",
        "cantidad": 100,
        "claveUnidad": "H87",
        "pesoEnKg": 3000,
        "valorMercancia": 150000
      },
      {
        "bienesTransp": "44121600",
        "descripcion": "Papel y cartón",
        "cantidad": 50,
        "claveUnidad": "H87",
        "pesoEnKg": 2000,
        "valorMercancia": 25000
      }
    ]
  },
  
  "autotransporte": {
    "permSCT": "TPAF01",
    "numPermisoSCT": "123456",
    "identificacionVehicular": {
      "configVehicular": "T3S2R4",
      "placaVM": "ABC-123",
      "anioModeloVM": 2022
    },
    "seguros": {
      "aseguraRespCivil": "Seguros XYZ",
      "polizaRespCivil": "POL-123456"
    },
    "remolques": [
      {
        "subTipoRem": "CTR004",
        "placa": "REM-456"
      }
    ]
  },
  
  "figurasTransporte": [
    {
      "tipoFigura": "01",
      "rfcFigura": "XAXX010101000",
      "nombreFigura": "Juan Pérez López",
      "numLicencia": "D12345678"
    }
  ],
  
  "timbrado": {
    "uuid": "12345678-1234-1234-1234-123456789012",
    "fechaTimbrado": "2024-01-15T10:00:00Z",
    "noCertificadoSAT": "00001000000504465028",
    "selloSAT": "...",
    "selloCFD": "..."
  },
  
  "xmlGenerado": "base64...",
  
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Conductor

```json
{
  "PK": "USER#abc123",
  "SK": "CONDUCTOR#c001",
  "GSI1PK": "USER#abc123#CONDUCTOR#disponible",
  "GSI1SK": "2024-01-15T00:00:00Z",
  
  "entityType": "CONDUCTOR",
  "id": "c001",
  "userId": "abc123",
  
  "nombre": "Juan Pérez López",
  "rfc": "PELJ800101ABC",
  "curp": "PELJ800101HDFRPN09",
  "telefono": "+52 55 1234 5678",
  "email": "juan.perez@email.com",
  
  "licencia": {
    "numero": "D12345678",
    "tipo": "E",
    "vigencia": "2025-12-31"
  },
  
  "estado": "disponible",
  "activo": true,
  
  "vehiculoAsignadoId": "vh001",
  "viajeActualId": null,
  
  "direccion": {
    "calle": "Av. Principal 123",
    "colonia": "Centro",
    "codigoPostal": "06600",
    "ciudad": "CDMX"
  },
  
  "certificaciones": [
    { "tipo": "materiales_peligrosos", "vigencia": "2025-06-30" }
  ],
  
  "historialPerformance": {
    "viajesCompletados": 150,
    "calificacionPromedio": 4.8,
    "incidentes": 0,
    "kilometrosRecorridos": 85000
  },
  
  "salarioBase": 15000,
  "porcentajeComision": 5,
  
  "createdAt": "2023-06-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

### Vehículo

```json
{
  "PK": "USER#abc123",
  "SK": "VEHICULO#vh001",
  "GSI1PK": "USER#abc123#VEHICULO#disponible",
  "GSI1SK": "2024-01-01T00:00:00Z",
  
  "entityType": "VEHICULO",
  "id": "vh001",
  "userId": "abc123",
  
  "placa": "ABC-123-X",
  "numeroEconomico": "T-001",
  "marca": "Kenworth",
  "modelo": "T680",
  "ano": 2022,
  
  "configVehicular": "T3S2R4",
  "tipoCarroceria": "Caja seca",
  "numeroSerieVin": "1XKAD49X1234567890",
  
  "capacidadCarga": 25000,
  "pesoBrutoVehicular": 15000,
  "rendimientoKmL": 2.5,
  
  "permisoSCT": {
    "tipo": "TPAF01",
    "numero": "123456789",
    "vigencia": "2025-12-31"
  },
  
  "seguros": {
    "responsabilidadCivil": {
      "aseguradora": "Seguros XYZ",
      "poliza": "POL-123456",
      "vigencia": "2024-12-31"
    },
    "carga": {
      "aseguradora": "Seguros ABC",
      "poliza": "CARGA-789",
      "vigencia": "2024-12-31"
    }
  },
  
  "tarjetaCirculacion": {
    "numero": "TC-123456",
    "vigencia": "2025-06-30"
  },
  
  "estado": "disponible",
  "activo": true,
  "conductorAsignadoId": "c001",
  
  "ultimoMantenimiento": "2024-01-01",
  "proximoMantenimiento": "2024-04-01",
  "kilometrajeActual": 125000,
  
  "createdAt": "2022-01-15T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

---

## Patrones de Acceso

### Queries Principales

| Operación | Access Pattern | Query |
|-----------|----------------|-------|
| Obtener viajes de usuario | `PK = USER#userId, SK begins_with VIAJE#` | Query |
| Obtener viaje específico | `PK = USER#userId, SK = VIAJE#viajeId` | GetItem |
| Viajes por estado | `GSI1PK = USER#userId#VIAJE#status` | Query GSI1 |
| Viajes de conductor | `GSI2PK = CONDUCTOR#conductorId` | Query GSI2 |
| Conductores disponibles | `GSI1PK = USER#userId#CONDUCTOR#disponible` | Query GSI1 |
| Carta porte por viaje | `GSI2PK = VIAJE#viajeId, SK begins_with CARTA#` | Query GSI2 |
| Favoritos por tipo | `PK = USER#userId, SK begins_with FAV#ubicacion#` | Query |
| Config de empresa | `PK = USER#userId, SK = CONFIG#empresa` | GetItem |

### Batch Operations

```javascript
// Obtener dashboard completo de usuario
const params = {
  RequestItems: {
    'transporte-app-main': {
      Keys: [
        { PK: 'USER#abc123', SK: 'CONFIG#empresa' },
        { PK: 'USER#abc123', SK: 'CONFIG#estadisticas' }
      ]
    }
  }
};
const result = await dynamodb.batchGet(params);

// Query múltiple con Promise.all
const [viajes, conductores, vehiculos] = await Promise.all([
  queryByPrefix('USER#abc123', 'VIAJE#'),
  queryByPrefix('USER#abc123', 'CONDUCTOR#'),
  queryByPrefix('USER#abc123', 'VEHICULO#')
]);
```

---

## Transacciones

### Crear Viaje con Actualización de Conductor

```javascript
const params = {
  TransactItems: [
    {
      Put: {
        TableName: 'transporte-app-main',
        Item: {
          PK: 'USER#abc123',
          SK: 'VIAJE#v002',
          // ... datos del viaje
        },
        ConditionExpression: 'attribute_not_exists(PK)'
      }
    },
    {
      Update: {
        TableName: 'transporte-app-main',
        Key: { PK: 'USER#abc123', SK: 'CONDUCTOR#c001' },
        UpdateExpression: 'SET estado = :estado, viajeActualId = :viajeId',
        ExpressionAttributeValues: {
          ':estado': 'en_viaje',
          ':viajeId': 'v002'
        }
      }
    },
    {
      Update: {
        TableName: 'transporte-app-main',
        Key: { PK: 'USER#abc123', SK: 'VEHICULO#vh001' },
        UpdateExpression: 'SET estado = :estado',
        ExpressionAttributeValues: {
          ':estado': 'en_uso'
        }
      }
    }
  ]
};

await dynamodb.transactWrite(params);
```

---

## Migración de Datos

### Orden de Migración

1. **Fase 1**: Configuración y catálogos de usuario
   - configuracion_empresa → CONFIG#empresa
   - certificados_digitales → CERT#*

2. **Fase 2**: Entidades maestras
   - conductores → CONDUCTOR#*
   - vehiculos → VEHICULO#*
   - remolques → REMOLQUE#*
   - clientes_proveedores → CLIENTE#*

3. **Fase 3**: Transacciones
   - viajes → VIAJE#*
   - eventos_viaje → VIAJE#*#EVENT#*
   - cartas_porte → CARTA#* (con ubicaciones y mercancías embebidas)
   - facturas → FACTURA#*

4. **Fase 4**: Datos auxiliares
   - user_favorites → FAV#*
   - documentos_entidades → DOC#*
   - cotizaciones → COTIZACION#*

### Script de Migración Ejemplo

```javascript
// Migrar viajes
async function migrateViajes(userId) {
  const viajes = await supabase
    .from('viajes')
    .select(`
      *,
      conductor:conductores(*),
      vehiculo:vehiculos(*),
      eventos:eventos_viaje(*),
      costos:costos_viaje(*)
    `)
    .eq('user_id', userId);

  const dynamoItems = viajes.map(viaje => ({
    PutRequest: {
      Item: {
        PK: `USER#${userId}`,
        SK: `VIAJE#${viaje.id}`,
        GSI1PK: `USER#${userId}#VIAJE#${viaje.estado}`,
        GSI1SK: viaje.fecha_inicio,
        GSI2PK: `CONDUCTOR#${viaje.conductor_id}`,
        GSI2SK: viaje.fecha_inicio,
        entityType: 'VIAJE',
        ...transformViaje(viaje)
      }
    }
  }));

  // Batch write en chunks de 25
  for (let i = 0; i < dynamoItems.length; i += 25) {
    await dynamodb.batchWrite({
      RequestItems: {
        'transporte-app-main': dynamoItems.slice(i, i + 25)
      }
    });
  }
}
```

---

## Monitoreo y Costos

### CloudWatch Alarms

```yaml
Alarms:
  - ConsumedReadCapacity > 80%
  - ConsumedWriteCapacity > 80%
  - ThrottledRequests > 0
  - SystemErrors > 0
```

### Estimación de Costos

| Métrica | Valor Estimado | Costo/mes |
|---------|----------------|-----------|
| Storage | 10 GB | $2.50 |
| Read Units | 1M requests | $0.25 |
| Write Units | 500K requests | $0.625 |
| GSI Storage | 20 GB | $5.00 |
| **Total** | | **~$8-15/mes** |

*Nota: Costos aproximados para carga moderada. Pay-per-request escala automáticamente.*
