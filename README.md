Bienvenido a Interconecta Trucking
Información del Proyecto
URL de Producción: https://trucking.interconecta.capital
Plataforma: Sistema de gestión logística especializado en automatización de transporte de carga
¿Cómo puedo editar este código?
Tienes varias formas de trabajar con la aplicación de Interconecta Trucking:
Desarrollo Local Recomendado
Para trabajar en tu IDE preferido y tener control completo del código:
Requisitos previos:

Node.js & npm instalados - instalar con nvm

Pasos para configurar el entorno:
sh# Paso 1: Clonar el repositorio
git clone https://github.com/interconecta/trucking-platform.git

# Paso 2: Navegar al directorio del proyecto
cd trucking-platform

# Paso 3: Instalar dependencias
npm install

# Paso 4: Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones de APIs y base de datos

# Paso 5: Iniciar servidor de desarrollo
npm run dev

# Paso 6: Para producción
npm run build
npm run preview
Edición Directa en GitHub

Navega a los archivos que deseas modificar
Haz clic en el botón "Edit" (ícono de lápiz)
Realiza tus cambios y confirma los commits
Los cambios se reflejarán automáticamente en el servidor de producción

Usar GitHub Codespaces

Ve a la página principal del repositorio
Haz clic en el botón "Code" (botón verde)
Selecciona la pestaña "Codespaces"
Haz clic en "New codespace" para lanzar el entorno
Edita archivos directamente y haz push de tus cambios

¿Qué tecnologías usa este proyecto?
Interconecta Trucking está construido con un stack moderno y robusto:
Frontend

React 18 - Framework principal
Vite - Build tool y servidor de desarrollo
TypeScript - Tipado estático para mayor confiabilidad
Tailwind CSS - Framework de estilos utilitarios
Lucide React - Iconografía moderna

Backend & APIs

Node.js + Express - Servidor API
PostgreSQL - Base de datos principal
n8n - Motor de automatización de workflows
OpenAI/Claude APIs - Inteligencia artificial integrada

Integraciones Específicas

WhatsApp Business API - Notificaciones automáticas
Google APIs - Maps, Calendar, Drive
SAT APIs - Timbrado de Carta Porte
MercadoPago/Stripe - Procesamiento de pagos

Infraestructura

Digital Ocean - Hosting y base de datos
Nginx - Proxy reverso y SSL
PM2 - Gestión de procesos
Let's Encrypt - Certificados SSL

¿Cómo puedo desplegar este proyecto?
Producción Actual
El proyecto ya está desplegado en:

Frontend: https://trucking.interconecta.capital
API Backend: https://trucking.interconecta.capital/api
Base de datos: PostgreSQL en Digital Ocean

Para Nuevos Despliegues
sh# Construir para producción
npm run build

# Desplegar con PM2
pm2 start ecosystem.config.js --env production

# Actualizar Nginx
sudo nginx -t && sudo systemctl reload nginx
Variables de Entorno Requeridas
env# Base de datos
DATABASE_URL=postgresql://usuario:password@host:puerto/dbname

# APIs de IA
OPENAI_API_KEY=tu_clave_openai
CLAUDE_API_KEY=tu_clave_claude

# WhatsApp Business
WHATSAPP_API_KEY=tu_clave_whatsapp
WHATSAPP_WEBHOOK_URL=tu_webhook_url

# Google Services
GOOGLE_API_KEY=tu_clave_google
GOOGLE_CLIENT_ID=tu_client_id

# Entorno
NODE_ENV=production
PORT=8091
¿Puedo conectar un dominio personalizado?
¡Sí, por supuesto!
Interconecta Trucking ya opera bajo el dominio empresarial:

Dominio principal: interconecta.capital
Subdominio trucking: trucking.interconecta.capital

Para configurar subdominios adicionales:

Configurar DNS en tu proveedor de dominio
Actualizar configuración de Nginx
Generar certificados SSL con Let's Encrypt
Actualizar variables de entorno

Estructura de Dominios Recomendada:

trucking.interconecta.capital - Aplicación principal
api.trucking.interconecta.capital - API endpoints
docs.trucking.interconecta.capital - Documentación
admin.trucking.interconecta.capital - Panel administrativo


Comandos Útiles Adicionales
Desarrollo
sh# Instalar dependencias específicas de Interconecta
npm install @interconecta/shared-components
npm install @interconecta/api-client

# Ejecutar tests
npm run test

# Linting y formato
npm run lint
npm run format

# Análisis de bundle
npm run analyze
Base de Datos
sh# Ejecutar migraciones
npm run db:migrate

# Sembrar datos de ejemplo
npm run db:seed

# Backup de producción
npm run db:backup
Monitoreo
sh# Ver logs de PM2
pm2 logs trucking-api

# Monitorear performance
pm2 monit

# Restart aplicación
pm2 restart trucking-api

## Flujo simplificado de Carta Porte

Para depurar o probar el formulario sin las optimizaciones completas puedes activar un modo simplificado.

1. Pasa el prop `simplified` al componente `CartaPorteForm`.
2. O define la variable de entorno `VITE_SIMPLIFIED_CARTA_PORTE=true` antes de compilar.

```tsx
<CartaPorteForm simplified />
```

Este modo mantiene el estado de manera básica y evita las conversiones de datos estables, facilitando la inspección durante el desarrollo.
¡Listo para automatizar el transporte de carga con Interconecta Trucking! 🚛📋✨
