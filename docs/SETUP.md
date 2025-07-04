
# Guía de Configuración Detallada

## 🏁 Configuración Inicial del Proyecto

### 1. Preparación del Entorno

#### Instalación de Node.js con NVM
```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reiniciar terminal y usar Node.js 18
nvm install 18
nvm use 18
nvm alias default 18
```

#### Clonar y Configurar Repositorio
```bash
git clone https://github.com/interconecta/trucking-platform.git
cd trucking-platform
npm install
```

### 2. Configuración de Supabase

#### Crear Proyecto en Supabase
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Copiar URL y Anon Key

#### Configurar Variables de Entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

#### Ejecutar Migraciones
```bash
# Usando Supabase CLI (recomendado)
npx supabase login
npx supabase link --project-ref tu-proyecto-id
npx supabase db push

# O usando los archivos SQL en /supabase/migrations/
# Ejecutar cada archivo en orden en el SQL Editor de Supabase
```

### 3. Configuración de APIs Externas

#### Google Maps API
1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto y habilitar APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
3. Crear API Key y agregar restricciones
4. Añadir a `.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
```

#### WhatsApp Business API
1. Configurar cuenta de WhatsApp Business
2. Obtener API Key del proveedor
3. Añadir a `.env`:
```env
VITE_WHATSAPP_API_KEY=tu_whatsapp_api_key
```

#### Fiscal API (Timbrado)
1. Registrarse en proveedor de timbrado
2. Obtener credenciales de API
3. Añadir a `.env`:
```env
VITE_FISCAL_API_KEY=tu_fiscal_api_key
```

### 4. Configuración de Desarrollo

#### Estructura de Archivos de Configuración
```
proyecto/
├── .env                 # Variables de entorno (NO commitear)
├── .env.example        # Plantilla de variables
├── .gitignore          # Archivos ignorados por Git
├── package.json        # Dependencias y scripts
├── tsconfig.json       # Configuración TypeScript
├── tailwind.config.js  # Configuración Tailwind
├── vite.config.ts      # Configuración Vite
└── supabase/
    ├── config.toml     # Configuración Supabase CLI
    └── migrations/     # Migraciones de BD
```

#### Scripts de Desarrollo
```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting y formatting
npm run lint
npm run format

# Tests
npm run test
```

### 5. Configuración de Base de Datos

#### Estructura de Tablas Principales
```sql
-- Usuarios y autenticación
profiles
usuarios
suscripciones
planes_suscripcion

-- Gestión de flota
vehiculos
conductores
socios
remolques

-- Carta Porte
cartas_porte
mercancias
ubicaciones
figuras_transporte

-- Mantenimiento
mantenimientos_programados
talleres
reviews_talleres

-- Catálogos SAT
cat_* (múltiples tablas)
codigos_postales_mexico
```

#### Funciones Importantes
```sql
-- Verificar superusuario
is_superuser_optimized()

-- Verificar acceso de usuario
check_user_access(user_uuid)

-- Alertas de mantenimiento
check_maintenance_alerts(user_id)

-- Validación de Carta Porte v3.1
validate_carta_porte_v31_compliance(data)
```

### 6. Configuración de Roles y Permisos

#### Políticas RLS Principales
- **Aislamiento por usuario:** Cada usuario solo ve sus datos
- **Roles de administrador:** Acceso extendido para superusuarios
- **Catálogos públicos:** Lectura pública para catálogos SAT

#### Configurar Superusuario
```sql
-- En Supabase SQL Editor
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"is_superuser": true}'::jsonb
WHERE email = 'tu-email@ejemplo.com';
```

### 7. Configuración de Almacenamiento

#### Buckets de Supabase Storage
```sql
-- Crear bucket para certificados
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificados', 'certificados', false);

-- Política de acceso a certificados
CREATE POLICY "Users can upload their own certificates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'certificados' AND auth.uid() = owner_id);
```

### 8. Monitoreo y Logs

#### Configurar Logging
```typescript
// En hooks personalizados
console.log('Debug info:', { userId, action, data });
```

#### Métricas en Supabase
- Revisar Dashboard de Supabase
- Monitorear uso de API
- Verificar rendimiento de queries

### 9. Troubleshooting Común

#### Problemas de CORS
```typescript
// Verificar configuración en supabase.config.toml
[api]
enabled = true
port = 54321
```

#### Problemas de RLS
```sql
-- Verificar políticas activas
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### Variables de Entorno No Cargadas
```bash
# Verificar que las variables tengan prefijo VITE_
echo $VITE_SUPABASE_URL

# Reiniciar servidor de desarrollo
npm run dev
```

### 10. Checklist de Configuración

- [ ] Node.js 18+ instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Proyecto Supabase creado y conectado
- [ ] Migraciones de BD ejecutadas
- [ ] APIs externas configuradas (Google Maps, etc.)
- [ ] Superusuario configurado
- [ ] Servidor de desarrollo funcionando (`npm run dev`)
- [ ] Build de producción exitoso (`npm run build`)

### 11. Siguiente Paso

Una vez completada la configuración, revisar:
- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [Guía de Desarrollo](./DEVELOPMENT.md)
- [API Reference](./API.md)
