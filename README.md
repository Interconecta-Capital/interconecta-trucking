# 🚛 Interconecta Trucking - Sistema de Gestión Logística

[![Version](https://img.shields.io/badge/version-1.0.0--beta-blue.svg)](https://github.com/interconecta/trucking-platform)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura General](#-arquitectura-general)
- [Infraestructura](#-infraestructura)
- [Integraciones Principales](#-integraciones-principales)
- [Flujo del Sistema](#-flujo-del-sistema)
- [Requisitos Técnicos](#-requisitos-técnicos)
- [Inicio Rápido](#-inicio-rápido)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)
- [Soporte](#-soporte)

---

## 🎯 Descripción

**Interconecta Trucking** es una plataforma integral de gestión logística especializada en el transporte de carga en México. El sistema automatiza todo el ciclo operativo: desde la cotización y programación de viajes hasta la generación de documentos fiscales CFDI 4.0 con complemento Carta Porte 3.1.

### Características Principales

| Módulo | Descripción |
|--------|-------------|
| **Gestión de Flota** | Control completo de vehículos, conductores y remolques |
| **Viajes** | Wizard inteligente para programación y seguimiento |
| **Facturación CFDI 4.0** | Generación y timbrado automático con PAC certificado |
| **Carta Porte 3.1** | Complemento fiscal obligatorio para transporte |
| **Mantenimiento** | Sistema predictivo con alertas automáticas |
| **Dashboard** | Métricas en tiempo real y reportes ejecutivos |

---

## 🏗 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│                    React 18 + TypeScript + Vite                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Auth      │  │   Storage   │  │    Edge Functions       │  │
│  │   (JWT)     │  │   (Files)   │  │    (Deno Runtime)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database                         │    │
│  │         (RLS Policies + Triggers + Functions)           │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRACIONES EXTERNAS                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  PAC SW     │  │  Google     │  │    Stripe/MercadoPago   │  │
│  │  (Timbrado) │  │  Maps API   │  │    (Pagos)              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

#### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3+ | Framework UI |
| TypeScript | 5.0+ | Tipado estático |
| Vite | 5.0+ | Build tool y dev server |
| Tailwind CSS | 3.4+ | Estilos utility-first |
| Shadcn/UI | Latest | Componentes base |
| TanStack Query | 5.x | Estado servidor y cache |
| React Hook Form | 7.x | Manejo de formularios |
| Zod | 3.x | Validación de esquemas |

#### Backend (Supabase)
| Tecnología | Propósito |
|------------|-----------|
| PostgreSQL 15 | Base de datos principal |
| Edge Functions (Deno) | Lógica serverless |
| Row Level Security | Seguridad a nivel de fila |
| Realtime | Suscripciones en tiempo real |
| Storage | Almacenamiento de archivos |
| Auth | Autenticación y autorización |

---

## 🔧 Infraestructura

### Producción
- **Frontend**: Lovable Platform (CDN global)
- **Backend**: Supabase Cloud (región: us-east-1)
- **Dominio**: `trucking.interconecta.capital`
- **SSL**: Certificado automático vía Let's Encrypt

### Servicios Críticos
```
┌────────────────────────────────────────────────────────────┐
│                    SERVICIOS DE PRODUCCIÓN                 │
├────────────────────────────────────────────────────────────┤
│  Supabase Project ID: qulhweffinppyjpfkknh                │
│  API URL: https://qulhweffinppyjpfkknh.supabase.co        │
│  PAC: SmartWeb (SW) - Ambiente Sandbox/Producción         │
│  Maps: Google Maps Platform                                │
│  Pagos: Stripe (opcional)                                  │
└────────────────────────────────────────────────────────────┘
```

---

## 🔌 Integraciones Principales

### 1. PAC SmartWeb (Timbrado CFDI)
Proveedor Autorizado de Certificación para timbrado de documentos fiscales.

```
Flujo de Timbrado:
Usuario → Validación Pre-timbrado → Generación XML → PAC SW → UUID + Sello SAT
```

**Endpoints utilizados:**
- `POST /cfdi40/issue` - Timbrar CFDI
- `POST /cfdi40/cancel` - Cancelar CFDI
- `GET /balance` - Consultar saldo de timbres

### 2. Google Maps Platform
Servicios de geolocalización y cálculo de rutas.

**APIs utilizadas:**
- Directions API (cálculo de rutas)
- Geocoding API (coordenadas)
- Places API (autocompletado de direcciones)

### 3. Supabase Auth
Sistema de autenticación con soporte para:
- Email/Password
- OAuth (Google, GitHub)
- Magic Links
- Multi-factor Authentication (MFA)

---

## 📊 Flujo del Sistema

### Diagrama de Flujo Principal

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   VIAJE     │────▶│   FACTURA   │────▶│ CARTA PORTE │
│  (Wizard)   │     │  (CFDI 4.0) │     │   (v3.1)    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Asignación  │     │ Generación  │     │ Validación  │
│ Recursos    │     │    XML      │     │    SAT      │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Tracking    │     │  Timbrado   │     │    PDF      │
│ GPS/Status  │     │   PAC SW    │     │  Oficial    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Ciclo de Vida de un Viaje

1. **Creación** → Wizard multi-paso con validación
2. **Asignación** → Conductor, vehículo, remolque
3. **Documentación** → Generación de factura + carta porte
4. **Timbrado** → Envío a PAC y obtención de UUID
5. **Seguimiento** → Tracking en tiempo real
6. **Cierre** → Documentos finales y análisis

---

## 💻 Requisitos Técnicos

### Desarrollo Local

| Requisito | Versión Mínima |
|-----------|----------------|
| Node.js | 18.0+ |
| npm | 9.0+ |
| Git | 2.30+ |

### Navegadores Soportados

| Navegador | Versión Mínima |
|-----------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 🚀 Inicio Rápido

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

# 5. Abrir en navegador
# http://localhost:5173
```

Para instrucciones detalladas, ver [docs/00-instalacion-local.md](docs/00-instalacion-local.md)

---

## 📚 Documentación

### Guías Principales

| Documento | Descripción |
|-----------|-------------|
| [00-instalacion-local.md](docs/00-instalacion-local.md) | Configuración del entorno de desarrollo |
| [01-conexion-supabase.md](docs/01-conexion-supabase.md) | Conexión y configuración de Supabase |
| [02-arquitectura.md](docs/02-arquitectura.md) | Arquitectura técnica completa |
| [03-guia-mvp.md](docs/03-guia-mvp.md) | Flujo completo del MVP |
| [04-manual-contribucion.md](docs/04-manual-contribucion.md) | Guía para contribuir al proyecto |
| [05-forks-pr-colaboradores-externos.md](docs/05-forks-pr-colaboradores-externos.md) | Trabajo con forks y PRs |
| [06-dev-sin-lovable.md](docs/06-dev-sin-lovable.md) | Desarrollo sin usar Lovable |
| [07-variables-entorno.md](docs/07-variables-entorno.md) | Variables de entorno |
| [08-devops-deploy-manual.md](docs/08-devops-deploy-manual.md) | Despliegue y DevOps |

### Documentación Técnica Adicional

| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura detallada del sistema |
| [API.md](docs/API.md) | Referencia de APIs |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Solución de problemas comunes |
| [flujo-timbrado.md](docs/flujo-timbrado.md) | Proceso de timbrado CFDI |
| [errores-sat-comunes.md](docs/errores-sat-comunes.md) | Errores SAT y soluciones |

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, lee nuestra [Guía de Contribución](docs/04-manual-contribucion.md) antes de enviar un Pull Request.

### Proceso Básico

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/mi-feature`
5. Crear Pull Request

Ver [docs/05-forks-pr-colaboradores-externos.md](docs/05-forks-pr-colaboradores-externos.md) para más detalles.

---

## 🆘 Soporte

### Canales de Soporte

| Canal | Propósito |
|-------|-----------|
| [GitHub Issues](https://github.com/interconecta/trucking-platform/issues) | Reportar bugs y solicitar features |
| [GitHub Discussions](https://github.com/interconecta/trucking-platform/discussions) | Preguntas y discusiones |
| Email: desarrollo@interconecta.capital | Soporte técnico directo |

### FAQ

**¿Cómo obtengo credenciales del PAC SW?**
Contacta a SmartWeb directamente o solicita acceso al equipo de desarrollo.

**¿Puedo usar otro PAC?**
El sistema está diseñado para SmartWeb, pero la arquitectura permite integrar otros PACs con modificaciones.

**¿Funciona sin conexión a internet?**
No. El sistema requiere conexión para timbrado, validación y sincronización.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Equipo

Desarrollado y mantenido por **Interconecta Capital**.

---

**¿Listo para automatizar tu logística? 🚛📋✨**
