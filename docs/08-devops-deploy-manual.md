# 🚀 Guía DevOps y Despliegue Manual

Este documento describe los procesos de despliegue y operaciones para **Interconecta Trucking**.

## 📋 Tabla de Contenidos

- [Arquitectura de Despliegue](#-arquitectura-de-despliegue)
- [Build de Producción](#-build-de-producción)
- [Despliegue del Frontend](#-despliegue-del-frontend)
- [Despliegue de Edge Functions](#-despliegue-de-edge-functions)
- [Migraciones de Base de Datos](#-migraciones-de-base-de-datos)
- [Checklist de Despliegue](#-checklist-de-despliegue)
- [Rollback](#-rollback)
- [Monitoreo](#-monitoreo)
- [Mantenimiento](#-mantenimiento)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Arquitectura de Despliegue

### Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCCIÓN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐          ┌─────────────────┐              │
│  │    Frontend     │          │    Supabase     │              │
│  │   (Lovable)     │◀────────▶│     Cloud       │              │
│  │                 │          │                 │              │
│  │ • React App     │          │ • PostgreSQL    │              │
│  │ • Static Files  │          │ • Edge Funcs    │              │
│  │ • CDN Global    │          │ • Auth          │              │
│  └─────────────────┘          │ • Storage       │              │
│         │                     └─────────────────┘              │
│         │                            │                         │
│         ▼                            ▼                         │
│  trucking.interconecta.capital    qulhweffinppyjpfkknh         │
│                                   .supabase.co                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Despliegue

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Código  │───▶│  Build   │───▶│  Test    │───▶│ Deploy   │
│  (Git)   │    │  (Vite)  │    │  (CI)    │    │  (Prod)  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## 📦 Build de Producción

### Comando de Build

```bash
# Build optimizado para producción
npm run build

# Output en /dist:
# dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── ...
# └── ...
```

### Verificaciones Pre-Build

```bash
# 1. Verificar dependencias
npm ci

# 2. Verificar tipos TypeScript
npx tsc --noEmit

# 3. Ejecutar linting
npm run lint

# 4. Ejecutar tests
npm run test

# 5. Build
npm run build
```

### Analizar Bundle

```bash
# Instalar analizador
npm install -D rollup-plugin-visualizer

# Build con análisis
npm run build -- --analyze

# Abre stats.html para ver el bundle
```

### Optimizaciones de Build

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Minificación
    minify: 'terser',
    
    // Source maps para debugging
    sourcemap: true,
    
    // Chunks separados
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
});
```

---

## 🌐 Despliegue del Frontend

### Opción 1: Lovable (Automático)

Lovable despliega automáticamente cuando haces cambios:

1. Hacer cambios en Lovable
2. Click en **Publish** → **Update**
3. Cambios en vivo en minutos

### Opción 2: Vercel (Manual)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configurar dominio personalizado
vercel domains add trucking.interconecta.capital
```

### Opción 3: Netlify (Manual)

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Configurar dominio
netlify domains:add trucking.interconecta.capital
```

### Opción 4: Servidor Propio (VPS/Cloud)

```bash
# En tu servidor

# 1. Clonar/actualizar repo
git pull origin main

# 2. Instalar dependencias
npm ci

# 3. Build
npm run build

# 4. Copiar a directorio web
cp -r dist/* /var/www/trucking/

# 5. Reiniciar nginx (si aplica)
sudo systemctl reload nginx
```

### Configuración Nginx

```nginx
# /etc/nginx/sites-available/trucking
server {
    listen 80;
    server_name trucking.interconecta.capital;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name trucking.interconecta.capital;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/trucking.interconecta.capital/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/trucking.interconecta.capital/privkey.pem;
    
    root /var/www/trucking;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

---

## ⚡ Despliegue de Edge Functions

### Método 1: Automático (Lovable)

Las Edge Functions se despliegan automáticamente cuando editas archivos en `supabase/functions/`.

### Método 2: Supabase CLI

```bash
# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref qulhweffinppyjpfkknh

# Deploy todas las funciones
supabase functions deploy

# Deploy función específica
supabase functions deploy timbrar-con-sw

# Deploy con verificación JWT deshabilitada
supabase functions deploy check-expirations --no-verify-jwt
```

### Verificar Despliegue

```bash
# Ver funciones desplegadas
supabase functions list

# Ver logs
supabase functions logs timbrar-con-sw

# Probar función
curl -X POST https://qulhweffinppyjpfkknh.supabase.co/functions/v1/timbrar-con-sw \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Configurar Secrets

```bash
# Agregar secreto
supabase secrets set SW_TOKEN=nuevo_token

# Ver secretos configurados
supabase secrets list

# Eliminar secreto
supabase secrets unset OLD_SECRET
```

---

## 🗄️ Migraciones de Base de Datos

### Crear Migración

```bash
# Crear archivo de migración
supabase migration new nombre_de_migracion

# Se crea: supabase/migrations/[timestamp]_nombre_de_migracion.sql
```

### Aplicar Migraciones

```bash
# En desarrollo (local)
supabase db reset

# En producción (via Dashboard)
# 1. Ir a SQL Editor
# 2. Pegar y ejecutar el SQL de la migración

# Via CLI (con acceso directo)
supabase db push
```

### Ejemplo de Migración

```sql
-- supabase/migrations/20240115_add_nueva_columna.sql

-- Agregar columna
ALTER TABLE public.viajes 
ADD COLUMN nueva_columna TEXT;

-- Crear índice
CREATE INDEX idx_viajes_nueva_columna 
ON public.viajes(nueva_columna);

-- Actualizar RLS si es necesario
CREATE POLICY "nueva_policy" ON public.viajes
FOR SELECT USING (auth.uid() = user_id);
```

### Rollback de Migración

```sql
-- Crear migración de rollback
-- supabase/migrations/20240116_rollback_nueva_columna.sql

-- Eliminar índice
DROP INDEX IF EXISTS idx_viajes_nueva_columna;

-- Eliminar columna
ALTER TABLE public.viajes 
DROP COLUMN IF EXISTS nueva_columna;
```

---

## ✅ Checklist de Despliegue

### Pre-Despliegue

- [ ] Código revisado y aprobado (PR merged)
- [ ] Todos los tests pasan
- [ ] Build de producción exitoso
- [ ] Variables de entorno configuradas
- [ ] Secretos actualizados (si cambió algo)
- [ ] Migraciones de BD preparadas
- [ ] Backup de BD realizado

### Durante el Despliegue

- [ ] Notificar al equipo del despliegue
- [ ] Aplicar migraciones de BD (si hay)
- [ ] Desplegar Edge Functions (si hay cambios)
- [ ] Desplegar Frontend
- [ ] Verificar que el sitio carga

### Post-Despliegue

- [ ] Verificar funcionalidades críticas
- [ ] Revisar logs por errores
- [ ] Verificar métricas de performance
- [ ] Confirmar que pagos/timbrado funcionan
- [ ] Notificar éxito del despliegue
- [ ] Documentar cambios en CHANGELOG

### Checklist de Funcionalidades Críticas

- [ ] Login/Logout funciona
- [ ] Dashboard carga correctamente
- [ ] Crear viaje funciona
- [ ] Timbrado de CFDI funciona (sandbox)
- [ ] Generación de PDF funciona
- [ ] Subida de archivos funciona

---

## ⏪ Rollback

### Rollback de Frontend

```bash
# Si usas Lovable
# Ir a History → Restaurar versión anterior

# Si usas Git
git revert HEAD
git push origin main

# Si usas Vercel/Netlify
# Ir a Deployments → Redeploy versión anterior
```

### Rollback de Edge Functions

```bash
# Obtener versión anterior del código
git checkout HEAD~1 -- supabase/functions/mi-funcion

# Redesplegar
supabase functions deploy mi-funcion
```

### Rollback de Base de Datos

```sql
-- Ejecutar migración de rollback
-- O restaurar desde backup

-- Verificar backup disponible
SELECT * FROM pg_catalog.pg_stat_archiver;
```

### Procedimiento de Rollback Completo

1. **Detectar problema** → Monitoreo/Reportes
2. **Evaluar severidad** → ¿Afecta usuarios?
3. **Decidir rollback** → Si es crítico
4. **Ejecutar rollback** → Seguir procedimiento
5. **Verificar** → Todo funciona
6. **Comunicar** → Notificar al equipo
7. **Post-mortem** → Documentar y aprender

---

## 📊 Monitoreo

### Supabase Dashboard

- **API Logs**: Requests, errors, latencia
- **Database Stats**: Conexiones, queries lentas
- **Auth Logs**: Logins, errores de auth
- **Edge Function Logs**: Ejecuciones, errores

### Métricas Clave

| Métrica | Umbral Alerta | Acción |
|---------|---------------|--------|
| Error Rate | > 1% | Investigar |
| Latencia P95 | > 3s | Optimizar |
| DB Connections | > 80% | Escalar |
| Edge Function Errors | > 5/min | Revisar logs |

### Alertas

Configurar en Supabase Dashboard → Settings → Alerts:

- Database approaching limits
- High error rate
- Edge function failures

### Logging Estructurado

```typescript
// En Edge Functions
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  function: 'timbrar-con-sw',
  action: 'timbrado_exitoso',
  uuid: result.uuid,
  duration_ms: Date.now() - startTime
}));
```

---

## 🔧 Mantenimiento

### Tareas Periódicas

| Tarea | Frecuencia | Responsable |
|-------|------------|-------------|
| Backup BD | Automático (Supabase) | Sistema |
| Rotar secretos | Trimestral | DevOps |
| Actualizar dependencias | Mensual | Dev |
| Revisar logs | Semanal | Dev |
| Limpiar datos obsoletos | Mensual | Sistema |

### Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar patch/minor
npm update

# Actualizar major (con cuidado)
npm install package@latest

# Verificar vulnerabilidades
npm audit
npm audit fix
```

### Limpieza de Datos

```sql
-- Ejecutar periódicamente
-- Limpiar notificaciones viejas
DELETE FROM notificaciones 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Limpiar logs de auditoría viejos
DELETE FROM security_audit_log 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Limpiar borradores abandonados
DELETE FROM borradores_carta_porte 
WHERE updated_at < NOW() - INTERVAL '7 days'
AND auto_saved = true;
```

### Vacuum de BD

```sql
-- Ejecutar en horarios de bajo tráfico
VACUUM ANALYZE;

-- Ver estadísticas de tablas
SELECT relname, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

---

## 🔍 Troubleshooting

### Problema: Sitio no carga

1. **Verificar DNS**
   ```bash
   nslookup trucking.interconecta.capital
   ```

2. **Verificar SSL**
   ```bash
   curl -I https://trucking.interconecta.capital
   ```

3. **Verificar Supabase**
   ```bash
   curl https://qulhweffinppyjpfkknh.supabase.co/rest/v1/
   ```

### Problema: Edge Function falla

1. **Ver logs**
   ```bash
   supabase functions logs nombre-funcion --tail
   ```

2. **Verificar secretos**
   ```bash
   supabase secrets list
   ```

3. **Probar localmente**
   ```bash
   supabase functions serve nombre-funcion
   ```

### Problema: Base de datos lenta

1. **Ver queries lentas**
   ```sql
   SELECT query, calls, mean_time, total_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

2. **Verificar índices**
   ```sql
   SELECT tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0;
   ```

3. **Verificar conexiones**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

### Problema: Timbrado falla

1. **Verificar credenciales PAC**
   ```bash
   supabase secrets list | grep SW_
   ```

2. **Verificar ambiente**
   ```sql
   SELECT modo_pruebas FROM configuracion_empresa;
   ```

3. **Ver logs de timbrado**
   ```bash
   supabase functions logs timbrar-con-sw --tail
   ```

### Contactos de Emergencia

| Servicio | Contacto |
|----------|----------|
| Supabase | support@supabase.io |
| PAC SmartWeb | soporte@sw.com.mx |
| DNS/Dominio | (proveedor de dominio) |
| Equipo Dev | desarrollo@interconecta.capital |

---

## 📚 Referencias

- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Vite Build](https://vitejs.dev/guide/build.html)
- [PostgreSQL Maintenance](https://www.postgresql.org/docs/current/maintenance.html)
- [Nginx Configuration](https://nginx.org/en/docs/)
