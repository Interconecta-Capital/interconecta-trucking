
# Guía de Despliegue - Interconecta Trucking

## 🚀 Estrategia de Despliegue

### Entornos Disponibles

1. **Development** - Desarrollo local
2. **Staging** - Testing y QA
3. **Production** - Producción final

### Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION STACK                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Vercel/Netlify)                                 │
│  ├─ React SPA Build                                        │
│  ├─ CDN Distribution                                       │
│  └─ Custom Domain: trucking.interconecta.capital          │
├─────────────────────────────────────────────────────────────┤
│  Backend (Supabase)                                        │
│  ├─ PostgreSQL Database                                    │
│  ├─ Authentication Service                                 │
│  ├─ Edge Functions (Serverless)                          │
│  └─ File Storage Buckets                                  │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                     │
│  ├─ Google Maps API                                       │
│  ├─ WhatsApp Business API                                 │
│  ├─ Fiscal API (Timbrado)                                │
│  └─ Payment Gateways                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Configuración de Entornos

### 1. Development (Local)

```bash
# Configuración local
cp .env.example .env.development
npm install
npm run dev

# Variables específicas de desarrollo
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_SUPABASE_URL=http://localhost:54321
```

### 2. Staging

```bash
# Variables de staging
VITE_APP_ENV=staging
VITE_DEBUG_MODE=true
VITE_SUPABASE_URL=https://staging-proyecto.supabase.co
```

### 3. Production

```bash
# Variables de producción
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_SUPABASE_URL=https://proyecto-prod.supabase.co
```

## 🌐 Despliegue Frontend

### Opción 1: Vercel (Recomendado)

#### Configuración Inicial
1. Conectar repositorio GitHub a Vercel
2. Configurar variables de entorno en Vercel Dashboard
3. Configurar dominio personalizado

#### Configuración de Build
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_GOOGLE_MAPS_API_KEY": "@google-maps-key"
  },
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "/index.html",
      "permanent": false
    }
  ]
}
```

#### Comandos de Despliegue
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy inicial
vercel

# Deploy a producción
vercel --prod

# Configurar dominio
vercel domains add trucking.interconecta.capital
vercel alias https://proyecto-hash.vercel.app trucking.interconecta.capital
```

### Opción 2: Netlify

#### Configuración
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Desplegar
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy a producción
netlify deploy --prod

# Configurar dominio
netlify domains:add trucking.interconecta.capital
```

### Opción 3: Servidor Propio

#### Con Docker
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name trucking.interconecta.capital;
    root /usr/share/nginx/html;
    index index.html;

    # Configurar SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

```bash
# Build y deploy
docker build -t interconecta-trucking .
docker run -d -p 80:80 --name trucking-app interconecta-trucking
```

## 🗄️ Despliegue Backend (Supabase)

### 1. Configuración de Proyecto

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Link con proyecto remoto
supabase link --project-ref tu-proyecto-id

# Deploy migraciones
supabase db push

# Deploy edge functions
supabase functions deploy --project-ref tu-proyecto-id
```

### 2. Configuración de Base de Datos

#### Migraciones
```sql
-- Ejecutar migraciones en orden
-- supabase/migrations/20240101000000_initial_schema.sql
-- supabase/migrations/20240102000000_add_vehiculos.sql
-- supabase/migrations/20240103000000_add_mantenimiento.sql
```

#### Configuración de Políticas RLS
```sql
-- Verificar que RLS está habilitado en todas las tablas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;

-- Habilitar RLS donde sea necesario
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### 3. Edge Functions

#### Desplegar Funciones
```bash
# Deploy individual
supabase functions deploy timbrar-invoice --project-ref tu-proyecto-id

# Deploy todas las funciones
supabase functions deploy --project-ref tu-proyecto-id

# Configurar secrets
supabase secrets set FISCAL_API_KEY=tu_api_key --project-ref tu-proyecto-id
supabase secrets set GOOGLE_MAPS_API_KEY=tu_api_key --project-ref tu-proyecto-id
```

#### Monitoreo de Funciones
```typescript
// Agregar logging en edge functions
console.log(`Function invoked at ${new Date().toISOString()}`);
console.log('Request body:', JSON.stringify(request.body));

// Error handling
try {
  const result = await processRequest(request);
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
} catch (error) {
  console.error('Function error:', error);
  return new Response(JSON.stringify({ error: error.message }), {
    headers: { 'Content-Type': 'application/json' },
    status: 500
  });
}
```

## 🔐 Configuración de Seguridad

### 1. HTTPS y Certificados SSL

```bash
# Para Vercel/Netlify - Automático
# Para servidor propio con Let's Encrypt

# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d trucking.interconecta.capital

# Renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Configuración de CORS

```typescript
// En edge functions
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://trucking.interconecta.capital',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

if (request.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

### 3. Variables de Entorno Seguras

```bash
# En Vercel
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add FISCAL_API_KEY production
vercel env add GOOGLE_MAPS_API_KEY production

# En Netlify
netlify env:set SUPABASE_SERVICE_ROLE_KEY "tu_key" --context production
netlify env:set FISCAL_API_KEY "tu_key" --context production

# En Supabase
supabase secrets set FISCAL_API_KEY=tu_key --project-ref tu-proyecto
supabase secrets set STRIPE_SECRET_KEY=tu_key --project-ref tu-proyecto
```

## 📊 Monitoreo y Logs

### 1. Configuración de Monitoring

#### Supabase Monitoring
```sql
-- Crear vista para monitorear performance
CREATE VIEW performance_monitoring AS
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public';

-- Monitor de queries lentas
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

#### Application Monitoring
```typescript
// src/lib/monitoring.ts
interface MetricEvent {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: Date;
}

class MonitoringService {
  private events: MetricEvent[] = [];

  track(name: string, value: number, tags?: Record<string, string>) {
    this.events.push({
      name,
      value,
      tags,
      timestamp: new Date()
    });
    
    // En producción, enviar a servicio de monitoring
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService({ name, value, tags });
    }
  }

  private sendToMonitoringService(event: Omit<MetricEvent, 'timestamp'>) {
    // Implementar integración con servicio de monitoring
    // Ejemplo: DataDog, New Relic, etc.
  }
}

export const monitoring = new MonitoringService();

// Uso en la aplicación
monitoring.track('page_load_time', performance.now(), { page: 'dashboard' });
monitoring.track('api_call_duration', duration, { endpoint: '/api/vehiculos' });
```

### 2. Error Tracking

```typescript
// src/lib/errorTracking.ts
interface ErrorEvent {
  message: string;
  stack?: string;
  userId?: string;
  url: string;
  userAgent: string;
  timestamp: Date;
}

class ErrorTracker {
  track(error: Error, context?: Record<string, any>) {
    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      userId: this.getCurrentUserId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date()
    };

    console.error('Error tracked:', errorEvent);
    
    // En producción, enviar a servicio de error tracking
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorEvent, context);
    }
  }

  private getCurrentUserId(): string | undefined {
    // Obtener user ID del contexto de auth
    return undefined;
  }

  private sendToErrorService(error: ErrorEvent, context?: Record<string, any>) {
    // Implementar integración con Sentry, Bugsnag, etc.
  }
}

export const errorTracker = new ErrorTracker();
```

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint
      
      - name: Type check
        run: npx tsc --noEmit

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-supabase:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy database migrations
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Deploy edge functions
        run: |
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## 📋 Checklist de Despliegue

### Pre-Deploy
- [ ] Tests pasan en todos los entornos
- [ ] Build exitoso sin warnings
- [ ] Linting y formatting aplicados
- [ ] Variables de entorno configuradas
- [ ] Migraciones de BD probadas
- [ ] Edge functions testeadas
- [ ] Certificados SSL configurados
- [ ] Dominios configurados correctamente

### Deploy
- [ ] Deploy de frontend exitoso
- [ ] Deploy de backend exitoso
- [ ] Migraciones aplicadas correctamente
- [ ] Edge functions desplegadas
- [ ] Variables de entorno actualizadas
- [ ] Cache invalidado si es necesario

### Post-Deploy  
- [ ] Aplicación accesible en producción
- [ ] Funcionalidades principales funcionando
- [ ] Autenticación funcionando
- [ ] APIs externas respondiendo
- [ ] Logs de error limpios
- [ ] Métricas de performance normales
- [ ] Notificación al equipo de deploy exitoso

## 🆘 Rollback

### Estrategia de Rollback

```bash
# Rollback en Vercel
vercel --prod --local-config vercel-rollback.json

# Rollback en Netlify  
netlify deploy --prod --dir=backup-build

# Rollback de Supabase migrations
supabase migration revert --project-ref tu-proyecto
```

### Plan de Contingencia

1. **Identificar el problema** rápidamente
2. **Verificar logs** de errores
3. **Evaluar impacto** en usuarios
4. **Decidir rollback** vs fix rápido
5. **Comunicar** al equipo
6. **Monitorear** post-rollback
7. **Documentar** el incidente

Esta guía cubre todos los aspectos necesarios para un despliegue exitoso de Interconecta Trucking.
