# Integración de Stripe - Documentación Técnica

## Índice

1. [Resumen General](#resumen-general)
2. [Arquitectura](#arquitectura)
3. [Configuración](#configuración)
4. [Flujos de Pago](#flujos-de-pago)
5. [Webhooks](#webhooks)
6. [Tablas de Base de Datos](#tablas-de-base-de-datos)
7. [Servicios y Hooks](#servicios-y-hooks)
8. [Modo Test vs Producción](#modo-test-vs-producción)
9. [Guía de QA](#guía-de-qa)
10. [Troubleshooting](#troubleshooting)

---

## Resumen General

La integración con Stripe maneja dos tipos de pagos:

1. **Suscripciones**: Planes mensuales/anuales (Operador, Flota, Business)
2. **Compras One-Time**: Paquetes de timbres adicionales

### Objetos de Stripe Utilizados

| Objeto | Uso |
|--------|-----|
| `Customer` | Representa al usuario en Stripe |
| `Subscription` | Suscripciones recurrentes |
| `Price` | Precios de planes (monthly/annual) |
| `Product` | Productos (planes y packs de timbres) |
| `Checkout Session` | Sesiones de pago |
| `Invoice` | Facturas generadas |
| `PaymentIntent` | Pagos one-time |

---

## Arquitectura

```
┌──────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   Frontend       │     │   Edge Functions   │     │     Stripe      │
│                  │     │                    │     │                 │
│  /planes         │────▶│  create-checkout   │────▶│  Checkout API   │
│  PlanesCard      │     │  create-credit-    │     │                 │
│  CreditosBalance │     │  checkout          │     │                 │
│                  │◀────│  stripe-webhook    │◀────│  Webhooks       │
└──────────────────┘     └───────────────────┘     └─────────────────┘
                                  │
                                  ▼
                         ┌───────────────────┐
                         │    Supabase DB    │
                         │                   │
                         │  suscripciones    │
                         │  creditos_usuarios│
                         │  timbres_prepaid  │
                         │  subscriptions_   │
                         │  meta             │
                         └───────────────────┘
```

---

## Configuración

### Variables de Entorno Requeridas

#### Frontend (.env)
```env
# Producción
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx

# Test (solo para superusers)
VITE_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_xxxxxxxxxxxx

# Price IDs de Stripe
VITE_STRIPE_PRICE_OPERADOR_MONTHLY=price_xxxx
VITE_STRIPE_PRICE_OPERADOR_ANNUAL=price_xxxx
VITE_STRIPE_PRICE_FLOTA_MONTHLY=price_xxxx
VITE_STRIPE_PRICE_FLOTA_ANNUAL=price_xxxx
VITE_STRIPE_PRICE_BUSINESS_MONTHLY=price_xxxx
VITE_STRIPE_PRICE_BUSINESS_ANNUAL=price_xxxx
```

#### Backend (Supabase Secrets)
```bash
# Producción
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Test
STRIPE_SECRET_KEY_TEST=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxxxxxxxxx
```

### Configurar Webhook en Stripe Dashboard

1. Ir a **Developers > Webhooks**
2. Añadir endpoint: `https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook`
3. Seleccionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copiar el webhook secret a Supabase secrets

---

## Flujos de Pago

### 1. Suscripción Nueva

```typescript
// Frontend: Iniciar checkout
const { data } = await supabase.functions.invoke('create-checkout', {
  body: { 
    planId: 'uuid-del-plan',
    interval: 'monthly' // o 'annual'
  }
});

// Redirigir a Stripe Checkout
window.location.href = data.url;
```

### 2. Compra de Timbres (One-Time)

```typescript
// Frontend: Comprar paquete
const { data } = await supabase.functions.invoke('create-credit-checkout', {
  body: { 
    paquete_id: 'uuid-del-paquete'
  }
});

// Redirigir a Stripe Checkout
window.location.href = data.url;
```

### 3. Portal del Cliente

```typescript
// Abrir portal de facturación de Stripe
const { data } = await supabase.functions.invoke('customer-portal');
window.location.href = data.url;
```

---

## Webhooks

### Eventos Manejados

| Evento | Acción |
|--------|--------|
| `checkout.session.completed` | Crear/actualizar suscripción o agregar créditos |
| `customer.subscription.updated` | Actualizar estado de suscripción |
| `customer.subscription.deleted` | Marcar suscripción como cancelada |
| `invoice.payment_succeeded` | Confirmar pago exitoso |
| `invoice.payment_failed` | Notificar fallo de pago |

### Validación de Webhooks

```typescript
// El webhook valida la firma de Stripe
const signature = req.headers.get("stripe-signature");
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

---

## Tablas de Base de Datos

### `suscripciones`
```sql
CREATE TABLE suscripciones (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  plan_id UUID REFERENCES planes_suscripcion,
  status VARCHAR, -- 'active', 'past_due', 'canceled', 'trialing'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  fecha_inicio TIMESTAMPTZ,
  fecha_vencimiento TIMESTAMPTZ,
  ultimo_pago TIMESTAMPTZ,
  proximo_pago TIMESTAMPTZ
);
```

### `subscriptions_meta` (Nueva)
```sql
CREATE TABLE subscriptions_meta (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  stripe_subscription_id TEXT UNIQUE,
  plan_key TEXT, -- 'operador', 'flota', 'business'
  interval TEXT, -- 'monthly', 'annual'
  included_timbres INT DEFAULT 0,
  prepaid_timbres_remaining INT DEFAULT 0,
  last_reset TIMESTAMPTZ,
  status TEXT,
  json_meta JSONB
);
```

### `timbres_prepaid` (Nueva)
```sql
CREATE TABLE timbres_prepaid (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  purchase_id TEXT, -- Stripe payment ID
  quantity INT NOT NULL,
  remaining INT NOT NULL,
  expires_at TIMESTAMPTZ -- NULL = no expira
);
```

### `timbres_usage_log` (Nueva)
```sql
CREATE TABLE timbres_usage_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  carta_porte_id UUID,
  source TEXT CHECK (source IN ('prepaid', 'plan')),
  pack_id UUID,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Servicios y Hooks

### `useAmbientePayment`

Hook para gestionar el ambiente de pagos:

```typescript
const { 
  mode,              // 'test' | 'prod'
  stripePublishableKey,
  canToggleTestMode, // Solo true para superusers
  isTestMode,
  setForceTestMode   // Solo funciona para superusers
} = useAmbientePayment();
```

### `TimbresService`

Servicio para consumo de timbres:

```typescript
// Verificar balance
const balance = await TimbresService.getBalance(userId);

// Consumir timbre (prioridad: prepaid -> plan)
const result = await TimbresService.consumeTimbre(userId, cartaPorteId);

// Verificar disponibilidad
const hasAvailable = await TimbresService.hasTimbresDisponibles(userId);
```

---

## Modo Test vs Producción

### Reglas

| Usuario | Puede usar Test Mode |
|---------|---------------------|
| Superuser | ✅ Sí (toggle disponible) |
| Usuario normal | ❌ No (siempre producción) |

### Tarjetas de Prueba

```
Éxito:           4242 4242 4242 4242
Requiere 3DS:    4000 0025 0000 3155
Fondos insuf:    4000 0000 0000 9995
Declinada:       4000 0000 0000 0002
```

### Activar Modo Test (Superuser)

```typescript
// En componente de configuración (solo visible para superusers)
const { setForceTestMode, canToggleTestMode } = useAmbientePayment();

if (canToggleTestMode) {
  setForceTestMode(true); // Activar sandbox
}
```

---

## Guía de QA

### Checklist de Pruebas

- [ ] **Suscripción nueva**: Verificar que se crea en BD
- [ ] **Upgrade de plan**: Verificar que se actualiza correctamente
- [ ] **Downgrade de plan**: Verificar límites se ajustan
- [ ] **Cancelación**: Verificar estado cambia a 'canceled'
- [ ] **Compra de timbres**: Verificar balance aumenta
- [ ] **Consumo de timbres**: Verificar prioridad prepaid -> plan
- [ ] **Webhook retry**: Verificar idempotencia
- [ ] **Modo test**: Solo superusers pueden activar

### Verificar Suscripción en BD

```sql
SELECT 
  u.email,
  s.status,
  s.stripe_subscription_id,
  p.nombre as plan,
  s.fecha_vencimiento
FROM suscripciones s
JOIN auth.users u ON s.user_id = u.id
JOIN planes_suscripcion p ON s.plan_id = p.id
WHERE u.email = 'test@example.com';
```

### Verificar Balance de Timbres

```sql
SELECT 
  cu.user_id,
  cu.balance_disponible,
  cu.timbres_mes_actual,
  cu.total_consumidos,
  sm.included_timbres
FROM creditos_usuarios cu
LEFT JOIN subscriptions_meta sm ON cu.user_id = sm.user_id
WHERE cu.user_id = 'user-uuid';
```

---

## Troubleshooting

### Error: "Missing webhook secret"

**Causa**: No está configurado `STRIPE_WEBHOOK_SECRET`

**Solución**:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxx
```

### Error: "Customer not found"

**Causa**: El usuario no tiene `stripe_customer_id`

**Solución**: Verificar que el checkout se completó correctamente

### Error: "Insufficient credits"

**Causa**: Usuario sin timbres disponibles

**Solución**: 
1. Verificar balance en `creditos_usuarios`
2. Verificar `timbres_prepaid`
3. Verificar `subscriptions_meta.included_timbres`

### Webhook no llega

**Verificar**:
1. URL correcta en Stripe Dashboard
2. Eventos correctos seleccionados
3. Logs en Supabase Edge Functions
4. Filtrar por `stripe-webhook` en logs

---

## Scripts Útiles

### Sincronizar Suscripciones

```bash
# Ejecutar reconciliación manual
node scripts/syncStripeSubscriptions.js
```

### Seed Datos de Prueba

```bash
# Crear customers y suscripciones de prueba
node scripts/seed_stripe_test_data.js
```

---

## Referencias

- [Stripe API Docs](https://docs.stripe.com/)
- [Stripe Checkout](https://docs.stripe.com/payments/checkout)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Stripe Billing](https://docs.stripe.com/billing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
