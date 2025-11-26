# 🛠️ Manual de Instalación Local

Este documento explica cómo configurar el proyecto **Interconecta Trucking** en tu máquina local para desarrollo.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#-requisitos-previos)
- [Instalación del Repositorio](#-instalación-del-repositorio)
- [Instalación de Dependencias](#-instalación-de-dependencias)
- [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
- [Conexión a Supabase](#-conexión-a-supabase)
- [Ejecutar el Proyecto](#-ejecutar-el-proyecto)
- [Comandos Útiles](#-comandos-útiles)
- [Probar Timbrado en Sandbox](#-probar-timbrado-en-sandbox)
- [Solución de Errores Comunes](#-solución-de-errores-comunes)

---

## 📦 Requisitos Previos

### Software Necesario

| Software | Versión Mínima | Verificar Instalación |
|----------|----------------|----------------------|
| Node.js | 18.0+ | `node --version` |
| npm | 9.0+ | `npm --version` |
| Git | 2.30+ | `git --version` |

### Instalación de Node.js (Recomendado: NVM)

```bash
# Instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reiniciar terminal o ejecutar
source ~/.bashrc  # Linux
source ~/.zshrc   # macOS con zsh

# Instalar Node.js 18 LTS
nvm install 18
nvm use 18

# Verificar instalación
node --version  # Debe mostrar v18.x.x
npm --version   # Debe mostrar 9.x.x o superior
```

### Herramientas Opcionales Recomendadas

| Herramienta | Propósito |
|-------------|-----------|
| VS Code | Editor de código |
| Supabase CLI | Desarrollo local de Supabase |
| Postman/Insomnia | Pruebas de API |

---

## 📥 Instalación del Repositorio

### Opción 1: Clonar Directamente (Colaboradores con Acceso)

```bash
# Clonar el repositorio
git clone https://github.com/interconecta/trucking-platform.git

# Entrar al directorio
cd trucking-platform
```

### Opción 2: Fork (Colaboradores Externos)

```bash
# 1. Hacer fork en GitHub (botón "Fork")

# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/trucking-platform.git

# 3. Configurar upstream
cd trucking-platform
git remote add upstream https://github.com/interconecta/trucking-platform.git

# 4. Verificar remotes
git remote -v
# origin    https://github.com/TU_USUARIO/trucking-platform.git (fetch)
# origin    https://github.com/TU_USUARIO/trucking-platform.git (push)
# upstream  https://github.com/interconecta/trucking-platform.git (fetch)
# upstream  https://github.com/interconecta/trucking-platform.git (push)
```

---

## 📦 Instalación de Dependencias

```bash
# Instalar todas las dependencias
npm install

# Verificar que no hay vulnerabilidades críticas
npm audit

# Si hay vulnerabilidades, intentar arreglar automáticamente
npm audit fix
```

### Dependencias Principales

El proyecto usa las siguientes dependencias clave:

| Categoría | Dependencias |
|-----------|--------------|
| UI | `react`, `react-dom`, `@radix-ui/*`, `tailwindcss` |
| Estado | `@tanstack/react-query`, `zustand` |
| Formularios | `react-hook-form`, `zod` |
| Backend | `@supabase/supabase-js` |
| PDF | `jspdf`, `jspdf-autotable` |
| Mapas | `mapbox-gl` |
| Fechas | `date-fns` |

---

## ⚙️ Configuración de Variables de Entorno

### Paso 1: Crear archivo .env

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

### Paso 2: Configurar Variables

Edita el archivo `.env` con los siguientes valores:

```env
# ============================================
# SUPABASE (Requerido)
# ============================================
VITE_SUPABASE_URL=https://qulhweffinppyjpfkknh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# GOOGLE MAPS (Opcional para desarrollo)
# ============================================
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_google_maps

# ============================================
# ENTORNO
# ============================================
NODE_ENV=development
```

> ⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` al repositorio. Ya está en `.gitignore`.

### Variables Disponibles

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Clave anónima de Supabase |
| `VITE_GOOGLE_MAPS_API_KEY` | ⚠️ | API Key de Google Maps |
| `NODE_ENV` | ❌ | Entorno (development/production) |

---

## 🔌 Conexión a Supabase

### Opción A: Usar Supabase Cloud (Recomendado)

El proyecto ya está configurado para conectarse al proyecto de Supabase en la nube. Solo necesitas las variables de entorno correctas.

```typescript
// La conexión se hace automáticamente en:
// src/integrations/supabase/client.ts
import { supabase } from "@/integrations/supabase/client";
```

### Opción B: Supabase Local (Avanzado)

Para desarrollo aislado, puedes usar Supabase localmente:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local
supabase start

# Esto levanta:
# - PostgreSQL en localhost:54322
# - API en localhost:54321
# - Studio en localhost:54323

# Aplicar migraciones
supabase db reset

# Ver estado
supabase status
```

Actualiza `.env` para usar Supabase local:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ▶️ Ejecutar el Proyecto

### Servidor de Desarrollo

```bash
# Iniciar con hot reload
npm run dev

# El servidor se inicia en:
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.x.x:5173/
```

### Build de Producción

```bash
# Crear build optimizado
npm run build

# El output se genera en /dist

# Previsualizar build
npm run preview
# ➜  Local:   http://localhost:4173/
```

---

## 🔧 Comandos Útiles

### Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualizar build |
| `npm run lint` | Ejecutar ESLint |

### Testing

| Comando | Descripción |
|---------|-------------|
| `npm run test` | Ejecutar tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con coverage |

### Base de Datos (Supabase CLI)

| Comando | Descripción |
|---------|-------------|
| `supabase start` | Iniciar Supabase local |
| `supabase stop` | Detener Supabase local |
| `supabase db reset` | Resetear BD y aplicar migraciones |
| `supabase db push` | Aplicar migraciones |
| `supabase functions serve` | Ejecutar Edge Functions localmente |

---

## 🧪 Probar Timbrado en Sandbox

El sistema está configurado para usar el ambiente **Sandbox** de SmartWeb (PAC) durante desarrollo.

### Requisitos

1. Credenciales de prueba SW (solicitar al equipo)
2. Certificados CSD de prueba del SAT

### Flujo de Prueba

```typescript
// 1. Crear un viaje de prueba
// Navegar a /viajes y usar el wizard

// 2. Generar factura y carta porte
// El sistema usa ambiente sandbox automáticamente

// 3. Verificar en logs
// Los Edge Functions registran el ambiente usado
```

### RFCs de Prueba SAT

| RFC | Nombre | Uso |
|-----|--------|-----|
| `EKU9003173C9` | Escuela Kemper Urgate | Emisor de prueba |
| `XAXX010101000` | Público General | Receptor genérico |

### Verificar Ambiente

```typescript
// En la configuración de empresa, verificar:
configuracion_empresa.modo_pruebas = true  // Sandbox
configuracion_empresa.modo_pruebas = false // Producción
```

---

## 🔧 Solución de Errores Comunes

### Error: "Module not found"

```bash
# Limpiar cache y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

### Error: "VITE_SUPABASE_URL is undefined"

```bash
# Verificar que .env existe y tiene los valores correctos
cat .env

# Reiniciar el servidor de desarrollo
npm run dev
```

### Error: "CORS policy"

Si recibes errores de CORS al conectar con Supabase:

1. Verificar que `VITE_SUPABASE_URL` es correcto
2. Verificar que estás usando la clave anónima correcta
3. En Supabase Dashboard → Settings → API, verificar orígenes permitidos

### Error: "RLS policy violation"

Este error indica que las políticas de seguridad están funcionando:

1. Verificar que el usuario está autenticado
2. Verificar que el `user_id` coincide con los registros
3. Revisar las políticas RLS en Supabase Dashboard

### Error: "Edge Function timeout"

```bash
# Verificar logs de Edge Functions
supabase functions logs nombre-funcion

# O en Supabase Dashboard → Edge Functions → Logs
```

### Puerto 5173 en uso

```bash
# Encontrar proceso usando el puerto
lsof -i :5173

# Matar proceso
kill -9 <PID>

# O usar otro puerto
npm run dev -- --port 3000
```

---

## 📚 Siguiente Paso

Una vez configurado el entorno local, revisa:

- [01-conexion-supabase.md](01-conexion-supabase.md) - Configuración detallada de Supabase
- [02-arquitectura.md](02-arquitectura.md) - Entender la arquitectura del sistema
- [06-dev-sin-lovable.md](06-dev-sin-lovable.md) - Desarrollo sin usar Lovable

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas con la instalación:

1. Revisa los [Issues abiertos](https://github.com/interconecta/trucking-platform/issues)
2. Consulta [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Contacta al equipo: desarrollo@interconecta.capital
