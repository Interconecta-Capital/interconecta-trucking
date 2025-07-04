
# Interconecta Trucking - Sistema de Gestión Logística

## 📋 Información del Proyecto

**URL de Producción:** https://trucking.interconecta.capital  
**Plataforma:** Sistema de gestión logística especializado en automatización de transporte de carga  
**Tecnología Principal:** React + TypeScript + Supabase

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm (recomendado instalar con [nvm](https://github.com/nvm-sh/nvm))
- Cuenta de Supabase (para base de datos y autenticación)
- Git para control de versiones

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/interconecta/trucking-platform.git
cd trucking-platform

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Para producción
npm run build
npm run preview
```

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Frontend:**
- **React 18** - Framework principal
- **Vite** - Build tool y servidor de desarrollo
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Shadcn/UI** - Componentes de interfaz
- **Lucide React** - Iconografía

**Backend & APIs:**
- **Supabase** - Base de datos PostgreSQL + Auth + Storage
- **Edge Functions** - Funciones serverless
- **Row Level Security (RLS)** - Seguridad a nivel de base de datos

**Integraciones:**
- **WhatsApp Business API** - Notificaciones
- **Google APIs** - Maps, Calendar, Drive
- **SAT APIs** - Timbrado de Carta Porte
- **MercadoPago/Stripe** - Procesamiento de pagos

### Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Autenticación
│   ├── carta-porte/    # Módulo Carta Porte
│   ├── conductores/    # Gestión de conductores
│   ├── vehiculos/      # Gestión de vehículos
│   ├── mantenimiento/  # Sistema de mantenimiento
│   └── ui/             # Componentes base (shadcn/ui)
├── hooks/              # Hooks personalizados
├── pages/              # Páginas principales
├── lib/                # Utilidades y configuraciones
└── integrations/       # Integraciones externas
    └── supabase/       # Cliente y tipos de Supabase
```

## 🗄️ Base de Datos

### Esquema Principal

**Tablas Core:**
- `profiles` - Perfiles de usuario
- `usuarios` - Información extendida de usuarios
- `suscripciones` - Gestión de planes
- `vehiculos` - Flota de vehículos
- `conductores` - Personal de conducción
- `cartas_porte` - Documentos CFDI

**Tablas de Mantenimiento:**
- `mantenimientos_programados` - Programación de servicios
- `talleres` - Red de talleres certificados
- `reviews_talleres` - Sistema de calificaciones

**Catálogos SAT:**
- `cat_*` - Catálogos oficiales del SAT
- `codigos_postales_mexico` - Códigos postales nacionales

### Políticas de Seguridad (RLS)

Todas las tablas implementan Row Level Security para:
- Aislamiento de datos por usuario/tenant
- Acceso granular basado en roles
- Protección contra acceso no autorizado

## 🔧 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build para producción
npm run preview         # Preview del build

# Calidad de código
npm run lint            # ESLint
npm run format          # Prettier

# Base de datos (si usas Supabase CLI)
npx supabase start      # Supabase local
npx supabase db reset   # Reset de BD local
```

## 🌐 Despliegue

### Producción Actual

El proyecto está desplegado en:
- **Frontend:** Vercel/Netlify (automático desde main)
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Dominio:** trucking.interconecta.capital

### Variables de Entorno Requeridas

```env
# Supabase
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# APIs Externas
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_google_maps
VITE_WHATSAPP_API_KEY=tu_api_key_whatsapp
VITE_FISCAL_API_KEY=tu_api_key_timbrado

# Entorno
NODE_ENV=production
```

## 📱 Funcionalidades Principales

### 1. Sistema de Autenticación
- Registro/Login con email
- Autenticación con redes sociales
- Recuperación de contraseña
- Gestión de perfiles

### 2. Gestión de Flota
- **Vehículos:** Registro, documentación, mantenimiento
- **Conductores:** Perfiles, licencias, asignaciones
- **Remolques:** Gestión de equipo adicional

### 3. Carta Porte CFDI 4.0
- Editor inteligente con validación SAT
- Generación de XML/PDF
- Timbrado automático
- Versiones 3.0 y 3.1

### 4. Mantenimiento Predictivo
- Alertas automáticas por kilometraje/tiempo
- Red de talleres certificados
- Optimización de costos
- Historial de servicios

### 5. Dashboard Analítico
- Métricas de flota
- Calendario de operaciones
- Reportes de rendimiento
- Notificaciones inteligentes

## 🔐 Seguridad

### Implementación
- **RLS (Row Level Security)** en todas las tablas
- **JWT Tokens** para autenticación
- **HTTPS** obligatorio en producción
- **Rate Limiting** en APIs críticas
- **Validación** de datos en frontend y backend

### Roles de Usuario
- **Usuario Regular:** Acceso a su flota
- **Administrador:** Gestión de sistema
- **Superusuario:** Acceso completo para desarrollo

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

## 📚 Documentación Adicional

- [Guía de Configuración](./docs/SETUP.md)
- [Arquitectura Detallada](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Guía de Contribución](./docs/CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## 👥 Equipo de Desarrollo

- **Lead Developer:** [Nombre]
- **Backend:** [Nombre]
- **Frontend:** [Nombre]
- **DevOps:** [Nombre]

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](./LICENSE).

## 🆘 Soporte

- **Issues:** [GitHub Issues](https://github.com/interconecta/trucking-platform/issues)
- **Documentación:** [Wiki](https://github.com/interconecta/trucking-platform/wiki)
- **Email:** desarrollo@interconecta.capital

---

**¡Listo para automatizar el transporte de carga! 🚛📋✨**
