# ⚡ Guía de Edge Functions - Interconecta Trucking

Esta guía documenta todas las Edge Functions del sistema, sus endpoints, parámetros, respuestas y flujos internos.

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Funciones de Timbrado](#funciones-de-timbrado)
- [Funciones de Certificados](#funciones-de-certificados)
- [Funciones de Créditos](#funciones-de-créditos)
- [Funciones de Geolocalización](#funciones-de-geolocalización)
- [Funciones de Catálogos](#funciones-de-catálogos)
- [Funciones de Reportes](#funciones-de-reportes)
- [Funciones de Pagos](#funciones-de-pagos)
- [Funciones de Seguridad](#funciones-de-seguridad)
- [Errores Comunes](#errores-comunes)

---

## Introducción

### Estructura de una Edge Function

```
supabase/functions/
├── nombre-funcion/
│   └── index.ts        # Código principal
├── _shared/            # Código compartido
│   ├── cors.ts
│   └── supabase.ts
└── config.toml         # Configuración de funciones
```

### Headers CORS Estándar

Todas las funciones incluyen estos headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Invocación desde Frontend

```typescript
// Usando supabase.functions.invoke (recomendado)
const { data, error } = await supabase.functions.invoke('nombre-funcion', {
  body: { param1: 'valor1' }
});

// Con headers personalizados
const { data, error } = await supabase.functions.invoke('nombre-funcion', {
  body: { param1: 'valor1' },
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
```

---

## Funciones de Timbrado

### timbrar-carta-porte

**Descripción**: Timbra un CFDI 4.0 con complemento Carta Porte 3.1 usando el PAC SmartWeb.

**URL**: `POST /functions/v1/timbrar-carta-porte`

**Autenticación**: JWT requerido (`verify_jwt = true`)

**Request Body**:
```json
{
  "viajeId": "uuid-del-viaje",
  "cartaPorteId": "uuid-carta-porte (opcional)",
  "ambiente": "sandbox | production"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "uuid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
    "carta_porte_id": "uuid-de-la-carta",
    "xml_timbrado": "<?xml version='1.0'...",
    "fecha_timbrado": "2024-01-15T10:30:00Z",
    "folio": "CP-001234",
    "sello_sat": "base64...",
    "sello_cfd": "base64...",
    "no_certificado_sat": "00001000000..."
  }
}
```

**Response Error (400/500)**:
```json
{
  "success": false,
  "error": {
    "code": "FACTURA_NO_TIMBRADA",
    "message": "Para flete pagado, debe timbrar primero la factura",
    "details": {}
  }
}
```

**Errores comunes**:
| Código | Descripción | Solución |
|--------|-------------|----------|
| `FACTURA_NO_TIMBRADA` | Falta factura para flete pagado | Timbrar factura primero |
| `PAC_ERROR` | Error del PAC SmartWeb | Verificar datos del XML |
| `XML_INVALID` | XML mal formado | Revisar estructura CFDI |
| `CSD_EXPIRED` | Certificado vencido | Renovar CSD |
| `INSUFFICIENT_CREDITS` | Sin timbres disponibles | Comprar timbres |

**Flujo interno**:
```
1. Validar JWT del usuario
2. Obtener datos del viaje (RPC: get_viaje_completo)
3. Validar datos mínimos requeridos
4. Construir XML CFDI 4.0
5. Agregar complemento Carta Porte 3.1
6. Enviar a PAC SmartWeb
7. Recibir UUID y sellos
8. Guardar en DB y Storage
9. Actualizar estado de carta porte
10. Consumir crédito del usuario
```

---

### timbrar-cfdi-v2

**Descripción**: Timbra un CFDI genérico (facturas, notas de crédito, etc.).

**URL**: `POST /functions/v1/timbrar-cfdi-v2`

**Autenticación**: JWT requerido

**Request Body**:
```json
{
  "xmlContent": "<?xml version='1.0'...",
  "tipoDocumento": "factura | nota_credito | recibo_pago",
  "usarCSD": true,
  "ambiente": "sandbox | production"
}
```

**Response**:
```json
{
  "success": true,
  "uuid": "UUID-FISCAL",
  "xmlTimbrado": "...",
  "fechaTimbrado": "ISO-8601"
}
```

---

### cancelar-cfdi / cancelar-cfdi-sw

**Descripción**: Cancela un CFDI previamente timbrado ante el SAT.

**URL**: `POST /functions/v1/cancelar-cfdi`

**Autenticación**: JWT requerido

**Request Body**:
```json
{
  "uuid": "UUID-A-CANCELAR",
  "rfcEmisor": "RFC-DEL-EMISOR",
  "motivo": "01 | 02 | 03 | 04",
  "folioSustitucion": "UUID-SUSTITUTO (si motivo=01)"
}
```

**Motivos de cancelación SAT**:
| Código | Descripción |
|--------|-------------|
| 01 | Comprobante emitido con errores con relación |
| 02 | Comprobante emitido con errores sin relación |
| 03 | No se llevó a cabo la operación |
| 04 | Operación nominativa relacionada en la factura global |

---

### validar-pre-timbrado

**Descripción**: Valida datos antes de timbrar para evitar errores del PAC.

**URL**: `POST /functions/v1/validar-pre-timbrado`

**Autenticación**: JWT requerido

**Request Body**:
```json
{
  "cartaPorteId": "uuid",
  "viajeId": "uuid"
}
```

**Response**:
```json
{
  "valid": true,
  "warnings": [
    "El peso total excede el límite del vehículo"
  ],
  "errors": []
}
```

---

### consultar-estatus-cfdi

**Descripción**: Consulta el estatus de un CFDI ante el SAT.

**URL**: `POST /functions/v1/consultar-estatus-cfdi`

**Request Body**:
```json
{
  "uuid": "UUID-DEL-CFDI",
  "rfcEmisor": "RFC-EMISOR",
  "rfcReceptor": "RFC-RECEPTOR",
  "total": "1000.00"
}
```

**Response**:
```json
{
  "estado": "Vigente | Cancelado | No encontrado",
  "esCancelable": "Cancelable sin aceptación | Cancelable con aceptación | No cancelable",
  "estatusCancelacion": "En proceso | Cancelado | Plazo vencido"
}
```

---

## Funciones de Certificados

### validar-certificado

**Descripción**: Valida par de archivos CSD (.cer y .key) del SAT.

**URL**: `POST /functions/v1/validar-certificado`

**Autenticación**: JWT requerido (se usa token del usuario)

**Request Body** (multipart/form-data):
```
cerFile: archivo .cer (base64 o binary)
keyFile: archivo .key (base64 o binary)
password: contraseña del certificado
```

**Response Success**:
```json
{
  "valid": true,
  "data": {
    "rfc": "ABC123456789",
    "razonSocial": "EMPRESA SA DE CV",
    "numeroCertificado": "00001000000...",
    "fechaInicioVigencia": "2024-01-01",
    "fechaFinVigencia": "2028-01-01",
    "tipo": "CSD"
  }
}
```

**Response Error**:
```json
{
  "valid": false,
  "error": "PASSWORD_INVALID",
  "message": "La contraseña del certificado es incorrecta"
}
```

---

### procesar-certificado

**Descripción**: Procesa y almacena certificado CSD de forma segura.

**URL**: `POST /functions/v1/procesar-certificado`

**Autenticación**: JWT requerido

**Flujo**:
1. Recibe archivos .cer y .key
2. Valida con `validar-certificado`
3. Encripta password en Vault
4. Almacena archivos en Storage
5. Crea registro en `certificados_digitales`

---

## Funciones de Créditos

### consume-credit

**Descripción**: Decrementa timbres del balance del usuario.

**URL**: `POST /functions/v1/consume-credit`

**Autenticación**: JWT requerido

**Request Body**:
```json
{
  "cantidad": 1,
  "concepto": "TIMBRADO_CARTA_PORTE",
  "referencia_id": "uuid-carta-porte"
}
```

**Response**:
```json
{
  "success": true,
  "balance_anterior": 100,
  "balance_actual": 99,
  "transaccion_id": "uuid"
}
```

**Conceptos válidos**:
- `TIMBRADO_CARTA_PORTE`
- `TIMBRADO_FACTURA`
- `CANCELACION_CFDI`

---

### check-subscription

**Descripción**: Verifica estado de suscripción y límites del usuario.

**URL**: `POST /functions/v1/check-subscription`

**Autenticación**: JWT requerido

**Response**:
```json
{
  "activa": true,
  "plan": "profesional",
  "timbres_disponibles": 99,
  "timbres_mes_actual": 1,
  "fecha_renovacion": "2024-02-01",
  "limites": {
    "vehiculos": 50,
    "conductores": 100,
    "viajes_mes": -1
  }
}
```

---

### consultar-saldo-pac

**Descripción**: Consulta saldo de timbres disponibles en el PAC.

**URL**: `GET /functions/v1/consultar-saldo-pac`

**Autenticación**: JWT requerido

**Response**:
```json
{
  "saldo": 5000,
  "pac": "SmartWeb",
  "ambiente": "production",
  "ultima_consulta": "2024-01-15T10:00:00Z"
}
```

---

## Funciones de Geolocalización

### google-directions

**Descripción**: Calcula rutas usando Google Directions API.

**URL**: `POST /functions/v1/google-directions`

**Autenticación**: JWT requerido

**Request Body**:
```json
{
  "origin": {
    "lat": 19.4326,
    "lng": -99.1332
  },
  "destination": {
    "lat": 25.6866,
    "lng": -100.3161
  },
  "waypoints": [
    { "lat": 22.1565, "lng": -100.9855 }
  ],
  "mode": "DRIVING",
  "avoid": ["tolls", "ferries"]
}
```

**Response**:
```json
{
  "routes": [{
    "distance": {
      "value": 900000,
      "text": "900 km"
    },
    "duration": {
      "value": 36000,
      "text": "10 horas"
    },
    "polyline": "encodedPolyline...",
    "steps": [...]
  }]
}
```

---

### calculate-route

**Descripción**: Calcula ruta optimizada con costos estimados.

**URL**: `POST /functions/v1/calculate-route`

**Request Body**:
```json
{
  "origen": "Ciudad de México",
  "destino": "Monterrey",
  "tipoVehiculo": "tractocamion",
  "incluirCasetas": true
}
```

**Response**:
```json
{
  "distancia_km": 900,
  "duracion_horas": 10,
  "casetas_estimadas": 1200,
  "combustible_estimado": 4500,
  "ruta_polyline": "...",
  "waypoints": [...]
}
```

---

### codigo-postal-mexico

**Descripción**: Busca información de códigos postales mexicanos.

**URL**: `GET /functions/v1/codigo-postal-mexico?cp=01000`

**Response**:
```json
{
  "codigo_postal": "01000",
  "estado": "Ciudad de México",
  "estado_clave": "CMX",
  "municipio": "Álvaro Obregón",
  "municipio_clave": "010",
  "colonias": [
    { "nombre": "San Ángel", "clave": "0001" },
    { "nombre": "Guadalupe Inn", "clave": "0002" }
  ]
}
```

---

### get-google-maps-key

**Descripción**: Obtiene API key de Google Maps de forma segura.

**URL**: `GET /functions/v1/get-google-maps-key`

**Autenticación**: JWT requerido

**Response**:
```json
{
  "apiKey": "AIza...",
  "restricted": true
}
```

---

## Funciones de Catálogos

### actualizar-catalogos-sat

**Descripción**: Actualiza catálogos del SAT desde fuente oficial.

**URL**: `POST /functions/v1/actualizar-catalogos-sat`

**Autenticación**: Admin/Service role

**Request Body**:
```json
{
  "catalogos": ["productos", "unidades", "materiales_peligrosos"],
  "forzar": false
}
```

---

### poblar-catalogos-cp

**Descripción**: Pobla tabla de códigos postales desde SEPOMEX.

**URL**: `POST /functions/v1/poblar-catalogos-cp`

**Autenticación**: Admin/Service role

---

### consultar-rfc-sat

**Descripción**: Valida RFC en lista del SAT (69-B).

**URL**: `POST /functions/v1/consultar-rfc-sat`

**Request Body**:
```json
{
  "rfc": "ABC123456789"
}
```

**Response**:
```json
{
  "valido": true,
  "enLista69B": false,
  "situacion": "Activo",
  "nombre": "EMPRESA SA DE CV"
}
```

---

## Funciones de Reportes

### generar-reporte

**Descripción**: Genera reportes en PDF o Excel.

**URL**: `POST /functions/v1/generar-reporte`

**Autenticación**: JWT requerido

**Request Body**:
```json
{
  "tipo": "viajes | facturacion | flota | rentabilidad",
  "formato": "pdf | excel",
  "filtros": {
    "fecha_inicio": "2024-01-01",
    "fecha_fin": "2024-01-31",
    "cliente_id": "uuid (opcional)"
  }
}
```

**Response**:
```json
{
  "url": "https://storage.../reportes/reporte-xxx.pdf",
  "expira": "2024-01-16T10:00:00Z"
}
```

---

### generar-pdf-cfdi

**Descripción**: Genera PDF de representación impresa de CFDI.

**URL**: `POST /functions/v1/generar-pdf-cfdi`

**Request Body**:
```json
{
  "uuid": "UUID-DEL-CFDI",
  "incluirCadenaOriginal": true,
  "incluirQR": true
}
```

---

### programar-reporte

**Descripción**: Programa envío automático de reportes.

**URL**: `POST /functions/v1/programar-reporte`

**Request Body**:
```json
{
  "tipo": "rentabilidad",
  "frecuencia": "semanal | mensual",
  "destinatarios": ["email@ejemplo.com"],
  "dia_envio": 1,
  "hora_envio": "08:00"
}
```

---

## Funciones de Pagos

### create-checkout

**Descripción**: Crea sesión de checkout de Stripe.

**URL**: `POST /functions/v1/create-checkout`

**Request Body**:
```json
{
  "priceId": "price_xxx",
  "successUrl": "https://app.../success",
  "cancelUrl": "https://app.../cancel"
}
```

---

### create-credit-checkout

**Descripción**: Crea checkout para compra de timbres.

**URL**: `POST /functions/v1/create-credit-checkout`

**Request Body**:
```json
{
  "paquete": "100 | 500 | 1000",
  "cantidad": 1
}
```

---

### stripe-webhook

**Descripción**: Procesa webhooks de Stripe.

**URL**: `POST /functions/v1/stripe-webhook`

**Autenticación**: Signature de Stripe

**Eventos manejados**:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

---

### customer-portal

**Descripción**: Genera URL de portal de cliente Stripe.

**URL**: `POST /functions/v1/customer-portal`

**Response**:
```json
{
  "url": "https://billing.stripe.com/session/xxx"
}
```

---

## Funciones de Seguridad

### validate-csrf

**Descripción**: Valida token CSRF para operaciones sensibles.

**URL**: `POST /functions/v1/validate-csrf`

**Request Body**:
```json
{
  "token": "csrf-token-xxx"
}
```

---

### security-alerts

**Descripción**: Envía alertas de seguridad.

**URL**: `POST /functions/v1/security-alerts`

**Autenticación**: Service role

**Request Body**:
```json
{
  "tipo": "login_fallido | acceso_no_autorizado | cambio_password",
  "usuario_id": "uuid",
  "detalles": {
    "ip": "192.168.1.1",
    "user_agent": "..."
  }
}
```

---

### export-user-data

**Descripción**: Exporta todos los datos de un usuario (GDPR).

**URL**: `POST /functions/v1/export-user-data`

**Autenticación**: JWT del usuario

**Response**:
```json
{
  "url": "https://storage.../exports/user-data-xxx.zip",
  "expira": "2024-01-16T10:00:00Z",
  "tablas_incluidas": [
    "profiles",
    "vehiculos",
    "conductores",
    "viajes",
    "cartas_porte"
  ]
}
```

---

### sanitize-logs-cron

**Descripción**: Sanitiza PII de logs (ejecutado por cron).

**URL**: `POST /functions/v1/sanitize-logs-cron`

**Autenticación**: `CRON_SECRET` en header

**Headers**:
```
Authorization: Bearer {CRON_SECRET}
```

---

### decrypt-document / decrypt-photo

**Descripción**: Desencripta documentos/fotos almacenados de forma segura.

**URL**: `POST /functions/v1/decrypt-document`

**Request Body**:
```json
{
  "documento_id": "uuid",
  "tipo": "licencia | ine | factura"
}
```

---

## Funciones Auxiliares

### gemini-assistant

**Descripción**: Asistente IA para ayuda contextual.

**URL**: `POST /functions/v1/gemini-assistant`

**Request Body**:
```json
{
  "mensaje": "¿Cómo agrego un nuevo vehículo?",
  "contexto": "vehiculos"
}
```

---

### operaciones-eventos

**Descripción**: Obtiene eventos de operaciones para calendario.

**URL**: `GET /functions/v1/operaciones-eventos`

**Response**:
```json
{
  "events": [
    {
      "id": "uuid",
      "tipo": "viaje | mantenimiento | documento_vence",
      "titulo": "Viaje CDMX - MTY",
      "fecha_inicio": "2024-01-15T08:00:00Z",
      "fecha_fin": "2024-01-16T18:00:00Z",
      "metadata": {}
    }
  ]
}
```

---

### check-expirations

**Descripción**: Verifica documentos próximos a vencer.

**URL**: `POST /functions/v1/check-expirations`

**Ejecutado por**: Cron job diario

---

### renovar-timbres-mensuales

**Descripción**: Renueva timbres de suscripciones activas.

**URL**: `POST /functions/v1/renovar-timbres-mensuales`

**Ejecutado por**: Cron job mensual

---

## Errores Comunes

### Códigos de Error HTTP

| Código | Significado | Acción |
|--------|-------------|--------|
| 400 | Bad Request | Verificar parámetros |
| 401 | No autorizado | Verificar JWT |
| 403 | Prohibido | Sin permisos |
| 404 | No encontrado | Verificar ID/recurso |
| 429 | Rate limit | Esperar y reintentar |
| 500 | Error interno | Contactar soporte |

### Errores del PAC SmartWeb

| Código SW | Descripción | Solución |
|-----------|-------------|----------|
| 301 | XML mal formado | Revisar estructura |
| 302 | Sello inválido | Verificar CSD |
| 303 | Certificado no corresponde | Usar CSD correcto |
| 401 | Sin saldo | Comprar timbres |
| 402 | RFC no registrado | Registrar RFC en PAC |

### Debugging

Para ver logs de una función:

```typescript
// En la función
console.log('Datos recibidos:', JSON.stringify(body));
console.error('Error:', error.message);

// Ver logs en Supabase Dashboard:
// Project Settings > Edge Functions > Logs
```

---

## Configuración (config.toml)

```toml
[project]
project_id = "qulhweffinppyjpfkknh"

# Funciones públicas (sin JWT)
[functions.codigo-postal-mexico]
verify_jwt = false

[functions.stripe-webhook]
verify_jwt = false

# Funciones protegidas (requieren JWT)
[functions.timbrar-carta-porte]
verify_jwt = true

[functions.consume-credit]
verify_jwt = true
```

---

## Variables de Entorno

Las funciones tienen acceso a:

```
SUPABASE_URL            # URL del proyecto
SUPABASE_ANON_KEY       # Key pública
SUPABASE_SERVICE_ROLE_KEY # Key de servicio (admin)

# Secrets configurados
SW_USER                 # Usuario SmartWeb
SW_PASSWORD             # Password SmartWeb
GOOGLE_MAPS_API_KEY     # API Key de Google
STRIPE_SECRET_KEY       # Key de Stripe
CRON_SECRET             # Secret para cron jobs
```
