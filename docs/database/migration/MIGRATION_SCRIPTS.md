# Scripts de Migración

## Prerequisitos

```bash
# Instalar dependencias
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install pg  # Para conexión a PostgreSQL
```

## Configuración

```javascript
// config.js
export const config = {
  postgres: {
    host: process.env.SUPABASE_DB_HOST,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD
  },
  dynamodb: {
    region: process.env.AWS_REGION || 'us-east-1',
    tableName: 'TransporteApp'
  }
};
```

---

## Script 1: Crear Tabla DynamoDB

```javascript
// 01-create-table.js
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { config } from './config.js';

const client = new DynamoDBClient({ region: config.dynamodb.region });

const createTable = async () => {
  const params = {
    TableName: config.dynamodb.tableName,
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'GSI1PK', AttributeType: 'S' },
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
      { AttributeName: 'GSI2PK', AttributeType: 'S' },
      { AttributeName: 'GSI2SK', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: 'HASH' },
          { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'GSI2',
        KeySchema: [
          { AttributeName: 'GSI2PK', KeyType: 'HASH' },
          { AttributeName: 'GSI2SK', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };

  try {
    const result = await client.send(new CreateTableCommand(params));
    console.log('Table created:', result.TableDescription.TableName);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('Table already exists');
    } else {
      throw error;
    }
  }
};

createTable();
```

---

## Script 2: Migrar Usuarios

```javascript
// 02-migrate-users.js
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;
const pool = new Pool(config.postgres);

const dynamodb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: config.dynamodb.region })
);

const migrateUsers = async () => {
  const { rows: users } = await pool.query(`
    SELECT 
      p.*,
      s.plan_id, s.status as subscription_status, s.is_trial, s.trial_ends_at,
      pl.nombre as plan_nombre, pl.limite_conductores, pl.limite_vehiculos,
      c.balance_disponible, c.total_consumidos, c.timbres_mes_actual,
      ce.rfc_emisor, ce.razon_social, ce.regimen_fiscal, ce.domicilio_fiscal
    FROM profiles p
    LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status IN ('active', 'trial')
    LEFT JOIN planes pl ON s.plan_id = pl.id
    LEFT JOIN creditos_usuarios c ON p.id = c.user_id
    LEFT JOIN configuracion_empresa ce ON p.id = ce.user_id
  `);

  console.log(`Migrating ${users.length} users...`);

  const batchSize = 25; // DynamoDB limit
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    
    const items = batch.map(user => ({
      PutRequest: {
        Item: {
          PK: `USER#${user.id}`,
          SK: 'PROFILE#metadata',
          entityType: 'USER',
          data: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            timezone: user.timezone || 'America/Mexico_City',
            createdAt: user.created_at
          },
          subscription: {
            planId: user.plan_id,
            planName: user.plan_nombre,
            status: user.subscription_status,
            isTrial: user.is_trial,
            trialEndsAt: user.trial_ends_at,
            limits: {
              conductores: user.limite_conductores,
              vehiculos: user.limite_vehiculos
            }
          },
          credits: {
            balance: user.balance_disponible || 0,
            monthlyUsed: user.timbres_mes_actual || 0,
            totalConsumed: user.total_consumidos || 0
          },
          config: user.rfc_emisor ? {
            rfcEmisor: user.rfc_emisor,
            razonSocial: user.razon_social,
            regimenFiscal: user.regimen_fiscal,
            domicilioFiscal: user.domicilio_fiscal
          } : null
        }
      }
    }));

    await dynamodb.send(new BatchWriteCommand({
      RequestItems: {
        [config.dynamodb.tableName]: items
      }
    }));

    console.log(`Migrated ${Math.min(i + batchSize, users.length)}/${users.length} users`);
  }

  console.log('Users migration completed!');
};

migrateUsers().finally(() => pool.end());
```

---

## Script 3: Migrar Viajes

```javascript
// 03-migrate-viajes.js
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;
const pool = new Pool(config.postgres);

const dynamodb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: config.dynamodb.region })
);

const migrateViajes = async () => {
  const { rows: viajes } = await pool.query(`
    SELECT 
      v.*,
      c.nombre as conductor_nombre,
      vh.placa as vehiculo_placa,
      cp.folio as carta_porte_folio, cp.status as carta_porte_status,
      cv.costo_total_estimado, cv.precio_cotizado
    FROM viajes v
    LEFT JOIN conductores c ON v.conductor_id = c.id
    LEFT JOIN vehiculos vh ON v.vehiculo_id = vh.id
    LEFT JOIN cartas_porte cp ON v.carta_porte_id = cp.id
    LEFT JOIN costos_viaje cv ON v.id = cv.viaje_id
    ORDER BY v.created_at
  `);

  console.log(`Migrating ${viajes.length} viajes...`);

  const batchSize = 25;
  for (let i = 0; i < viajes.length; i += batchSize) {
    const batch = viajes.slice(i, i + batchSize);
    
    const items = batch.map(viaje => {
      const fechaStr = new Date(viaje.created_at).toISOString().split('T')[0];
      
      return {
        PutRequest: {
          Item: {
            PK: `USER#${viaje.user_id}`,
            SK: `VIAJE#${viaje.id}`,
            GSI1PK: `STATUS#${viaje.estado}`,
            GSI1SK: `${fechaStr}#${viaje.id}`,
            GSI2PK: `DATE#${fechaStr}`,
            GSI2SK: `VIAJE#${viaje.id}`,
            entityType: 'VIAJE',
            data: {
              id: viaje.id,
              nombre: viaje.nombre_viaje,
              estado: viaje.estado,
              fechaInicioProgramada: viaje.fecha_inicio_programada,
              fechaFinProgramada: viaje.fecha_fin_programada,
              fechaInicioReal: viaje.fecha_inicio_real,
              fechaFinReal: viaje.fecha_fin_real,
              origen: viaje.origen,
              destino: viaje.destino,
              origenCoordenadas: viaje.origen_coordenadas,
              destinoCoordenadas: viaje.destino_coordenadas
            },
            resources: {
              conductorId: viaje.conductor_id,
              conductorNombre: viaje.conductor_nombre,
              vehiculoId: viaje.vehiculo_id,
              vehiculoPlaca: viaje.vehiculo_placa,
              remolqueId: viaje.remolque_id
            },
            tracking: viaje.tracking_data || {},
            fiscal: viaje.carta_porte_id ? {
              cartaPorteId: viaje.carta_porte_id,
              cartaPorteFolio: viaje.carta_porte_folio,
              cartaPorteStatus: viaje.carta_porte_status
            } : null,
            costos: {
              costoEstimado: viaje.costo_total_estimado,
              precioCliente: viaje.precio_cotizado
            },
            createdAt: viaje.created_at,
            updatedAt: viaje.updated_at
          }
        }
      };
    });

    await dynamodb.send(new BatchWriteCommand({
      RequestItems: {
        [config.dynamodb.tableName]: items
      }
    }));

    console.log(`Migrated ${Math.min(i + batchSize, viajes.length)}/${viajes.length} viajes`);
  }

  console.log('Viajes migration completed!');
};

migrateViajes().finally(() => pool.end());
```

---

## Script 4: Migrar Cartas Porte

```javascript
// 04-migrate-cartas-porte.js
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;
const pool = new Pool(config.postgres);

const dynamodb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: config.dynamodb.region })
);

const migrateCartasPorte = async () => {
  const { rows: cartas } = await pool.query(`
    SELECT cp.*
    FROM cartas_porte cp
    ORDER BY cp.created_at
  `);

  console.log(`Migrating ${cartas.length} cartas porte...`);

  for (let i = 0; i < cartas.length; i++) {
    const carta = cartas[i];

    // Obtener datos relacionados
    const [ubicaciones, mercancias, figuras, autotransporte] = await Promise.all([
      pool.query('SELECT * FROM ubicaciones WHERE carta_porte_id = $1 ORDER BY orden_secuencia', [carta.id]),
      pool.query('SELECT * FROM mercancias WHERE carta_porte_id = $1', [carta.id]),
      pool.query('SELECT * FROM figuras_transporte WHERE carta_porte_id = $1', [carta.id]),
      pool.query('SELECT * FROM autotransporte WHERE carta_porte_id = $1 LIMIT 1', [carta.id])
    ]);

    const fechaStr = new Date(carta.created_at).toISOString().split('T')[0];

    const item = {
      PK: `USER#${carta.usuario_id}`,
      SK: `CARTA#${carta.id}`,
      GSI1PK: `STATUS#${carta.status}`,
      GSI1SK: `${fechaStr}#${carta.id}`,
      GSI2PK: carta.viaje_id ? `VIAJE#${carta.viaje_id}` : `USER#${carta.usuario_id}`,
      GSI2SK: `CARTA#${carta.id}`,
      entityType: 'CARTA_PORTE',
      data: {
        id: carta.id,
        folio: carta.folio,
        versionCartaPorte: carta.version_carta_porte,
        status: carta.status,
        transporteInternacional: carta.transporte_internacional
      },
      emisor: {
        rfc: carta.rfc_emisor,
        nombre: carta.nombre_emisor,
        regimenFiscal: carta.regimen_fiscal_emisor,
        domicilioFiscal: carta.domicilio_fiscal_emisor
      },
      receptor: {
        rfc: carta.rfc_receptor,
        nombre: carta.nombre_receptor,
        regimenFiscal: carta.regimen_fiscal_receptor,
        usoCfdi: carta.uso_cfdi,
        domicilioFiscal: carta.domicilio_fiscal_receptor
      },
      totales: {
        distanciaTotal: carta.distancia_total,
        pesoBrutoTotal: carta.peso_bruto_total,
        numeroTotalMercancias: carta.numero_total_mercancias
      },
      ubicaciones: ubicaciones.rows.map(u => ({
        tipo: u.tipo_ubicacion,
        orden: u.orden_secuencia,
        idUbicacion: u.id_ubicacion,
        rfcRemitenteDestinatario: u.rfc_remitente_destinatario,
        nombreRemitenteDestinatario: u.nombre_remitente_destinatario,
        fechaHoraSalidaLlegada: u.fecha_hora_salida_llegada,
        distanciaRecorrida: u.distancia_recorrida,
        domicilio: u.domicilio
      })),
      mercancias: mercancias.rows.map(m => ({
        id: m.id,
        claveProdServ: m.clave_prod_serv,
        claveUnidad: m.clave_unidad,
        descripcion: m.descripcion,
        cantidad: m.cantidad,
        pesoKg: m.peso_kg,
        valorMercancia: m.valor_mercancia,
        materialPeligroso: m.material_peligroso
      })),
      figuras: figuras.rows.map(f => ({
        tipoFigura: f.tipo_figura,
        rfcFigura: f.rfc_figura,
        nombreFigura: f.nombre_figura,
        numLicencia: f.num_licencia
      })),
      autotransporte: autotransporte.rows[0] ? {
        permSct: autotransporte.rows[0].perm_sct,
        numPermisoSct: autotransporte.rows[0].num_permiso_sct,
        configVehicular: autotransporte.rows[0].config_vehicular,
        placaVm: autotransporte.rows[0].placa_vm,
        anioModeloVm: autotransporte.rows[0].anio_modelo_vm,
        aseguraRespCivil: autotransporte.rows[0].asegura_resp_civil,
        polizaRespCivil: autotransporte.rows[0].poliza_resp_civil
      } : null,
      timbrado: carta.uuid_fiscal ? {
        uuidFiscal: carta.uuid_fiscal,
        fechaTimbrado: carta.fecha_timbrado,
        xmlGenerado: carta.xml_generado,
        idCcp: carta.id_ccp
      } : null,
      createdAt: carta.created_at,
      updatedAt: carta.updated_at
    };

    await dynamodb.send(new PutCommand({
      TableName: config.dynamodb.tableName,
      Item: item
    }));

    if ((i + 1) % 100 === 0) {
      console.log(`Migrated ${i + 1}/${cartas.length} cartas porte`);
    }
  }

  console.log('Cartas porte migration completed!');
};

migrateCartasPorte().finally(() => pool.end());
```

---

## Script 5: Validación

```javascript
// 05-validate-migration.js
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;
const pool = new Pool(config.postgres);

const dynamodb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: config.dynamodb.region })
);

const validateMigration = async () => {
  console.log('Validating migration...\n');

  // Contar usuarios
  const { rows: [pgUsers] } = await pool.query('SELECT COUNT(*) FROM profiles');
  const { Count: ddbUsers } = await dynamodb.send(new ScanCommand({
    TableName: config.dynamodb.tableName,
    FilterExpression: 'entityType = :type',
    ExpressionAttributeValues: { ':type': 'USER' },
    Select: 'COUNT'
  }));
  console.log(`Users: PostgreSQL=${pgUsers.count}, DynamoDB=${ddbUsers}`);

  // Contar viajes
  const { rows: [pgViajes] } = await pool.query('SELECT COUNT(*) FROM viajes');
  const { Count: ddbViajes } = await dynamodb.send(new ScanCommand({
    TableName: config.dynamodb.tableName,
    FilterExpression: 'entityType = :type',
    ExpressionAttributeValues: { ':type': 'VIAJE' },
    Select: 'COUNT'
  }));
  console.log(`Viajes: PostgreSQL=${pgViajes.count}, DynamoDB=${ddbViajes}`);

  // Contar cartas porte
  const { rows: [pgCartas] } = await pool.query('SELECT COUNT(*) FROM cartas_porte');
  const { Count: ddbCartas } = await dynamodb.send(new ScanCommand({
    TableName: config.dynamodb.tableName,
    FilterExpression: 'entityType = :type',
    ExpressionAttributeValues: { ':type': 'CARTA_PORTE' },
    Select: 'COUNT'
  }));
  console.log(`Cartas Porte: PostgreSQL=${pgCartas.count}, DynamoDB=${ddbCartas}`);

  // Validar integridad de un usuario aleatorio
  const { rows: [sampleUser] } = await pool.query(`
    SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1
  `);

  if (sampleUser) {
    const userId = sampleUser.id;
    console.log(`\nValidating user ${userId}...`);

    const { rows: pgUserViajes } = await pool.query(
      'SELECT COUNT(*) FROM viajes WHERE user_id = $1', [userId]
    );

    const { Count: ddbUserViajes } = await dynamodb.send(new QueryCommand({
      TableName: config.dynamodb.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'VIAJE#'
      },
      Select: 'COUNT'
    }));

    console.log(`  Viajes: PostgreSQL=${pgUserViajes[0].count}, DynamoDB=${ddbUserViajes}`);
  }

  console.log('\nValidation completed!');
};

validateMigration().finally(() => pool.end());
```

---

## Ejecución

```bash
# Crear tabla
node 01-create-table.js

# Migrar en orden
node 02-migrate-users.js
node 03-migrate-viajes.js
node 04-migrate-cartas-porte.js

# Validar
node 05-validate-migration.js
```

## Rollback

```javascript
// rollback.js
import { DynamoDBClient, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { config } from './config.js';

const client = new DynamoDBClient({ region: config.dynamodb.region });

const rollback = async () => {
  await client.send(new DeleteTableCommand({
    TableName: config.dynamodb.tableName
  }));
  console.log('Table deleted');
};

rollback();
```
