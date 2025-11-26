# 🏗️ Arquitectura Completa del Proyecto

Este documento describe la arquitectura técnica completa del sistema **Interconecta Trucking**.

## 📋 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [Edge Functions](#-edge-functions)
- [Integración PAC SmartWeb](#-integración-pac-smartweb)
- [Flujo de Timbrado CFDI](#-flujo-de-timbrado-cfdi)
- [Generación de XML](#-generación-de-xml)
- [Generación de PDF](#-generación-de-pdf)
- [Infraestructura](#-infraestructura)
- [Diagramas](#-diagramas)

---

## 🎯 Visión General

### Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  React 18 + TypeScript + Vite + TailwindCSS + Shadcn/UI        │    │
│  │  ├── Pages (Routing)                                            │    │
│  │  ├── Components (UI)                                            │    │
│  │  ├── Hooks (Lógica)                                             │    │
│  │  ├── Services (API/Business Logic)                              │    │
│  │  └── State (TanStack Query + Zustand)                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE PLATFORM                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │     Auth     │  │   Storage    │  │   Realtime   │                  │
│  │   (JWT/RLS)  │  │   (S3-like)  │  │  (WebSocket) │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │              Edge Functions (Deno Runtime)               │          │
│  │  ├── timbrar-con-sw (PAC Integration)                    │          │
│  │  ├── generar-pdf-cfdi (PDF Generation)                   │          │
│  │  ├── google-directions (Maps API)                        │          │
│  │  └── validar-pre-timbrado (Validation)                   │          │
│  └──────────────────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │              PostgreSQL 15 + pgvector                    │          │
│  │  ├── Tables (50+ tablas)                                 │          │
│  │  ├── RLS Policies (Seguridad por fila)                   │          │
│  │  ├── Triggers (Automatización)                           │          │
│  │  └── Functions (Stored Procedures)                       │          │
│  └──────────────────────────────────────────────────────────┘          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │   PAC SW     │  │  Google Maps │  │    Stripe    │
            │  (Timbrado)  │  │    (Rutas)   │  │   (Pagos)    │
            └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 💻 Frontend

### Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3 | Framework UI |
| TypeScript | 5.0+ | Tipado estático |
| Vite | 5.0+ | Build tool |
| TailwindCSS | 3.4+ | Estilos |
| Shadcn/UI | Latest | Componentes base |
| TanStack Query | 5.x | Estado servidor |
| Zustand | 5.x | Estado global |
| React Router | 6.x | Routing |
| React Hook Form | 7.x | Formularios |
| Zod | 3.x | Validación |

### Estructura de Directorios

```
src/
├── assets/                 # Imágenes, fuentes, etc.
├── components/             # Componentes reutilizables
│   ├── auth/              # Autenticación
│   ├── carta-porte/       # Editor de Carta Porte
│   ├── conductores/       # Gestión de conductores
│   ├── dashboard/         # Dashboard principal
│   ├── facturas/          # Gestión de facturas
│   ├── mantenimiento/     # Sistema de mantenimiento
│   ├── ui/                # Componentes Shadcn/UI
│   ├── vehiculos/         # Gestión de vehículos
│   └── viajes/            # Gestión de viajes
├── hooks/                  # Custom hooks
│   ├── auth/              # Hooks de autenticación
│   ├── viajes/            # Hooks de viajes
│   ├── wizard/            # Hooks del wizard
│   └── xml/               # Hooks de generación XML
├── integrations/           # Integraciones externas
│   └── supabase/          # Cliente y tipos de Supabase
├── lib/                    # Utilidades
├── pages/                  # Páginas/Rutas
├── services/               # Servicios de negocio
│   ├── catalogos/         # Catálogos SAT
│   ├── fiscal/            # Servicios fiscales
│   ├── pac/               # Integración PAC
│   ├── pdf/               # Generación PDF
│   ├── validacion/        # Validadores
│   ├── viajes/            # Orquestación de viajes
│   └── xml/               # Generación XML
├── stores/                 # Zustand stores
├── types/                  # Definiciones TypeScript
└── utils/                  # Funciones utilitarias
```

### Mapa de Componentes Principales

```
App
├── AuthProvider
├── QueryClientProvider
├── ThemeProvider
└── Router
    ├── / (Dashboard)
    │   └── DashboardPage
    │       ├── MetricasResumen
    │       ├── ViajesRecientes
    │       └── AlertasMantenimiento
    │
    ├── /viajes
    │   └── ViajesPage
    │       ├── ViajesTable
    │       ├── ViajeWizard (Modal/Dialog)
    │       │   ├── Step1: DatosBasicos
    │       │   ├── Step2: Ubicaciones
    │       │   ├── Step3: Mercancias
    │       │   ├── Step4: Recursos
    │       │   └── Step5: Confirmacion
    │       └── FiltrosViajes
    │
    ├── /viajes/:id
    │   └── ViajeDetallePage
    │       ├── InfoBasica
    │       ├── Ubicaciones
    │       ├── Mercancias
    │       ├── DocumentosFiscales
    │       └── Timeline
    │
    ├── /facturas
    │   └── FacturasPage
    │
    ├── /carta-porte
    │   └── CartaPorteEditor
    │       ├── ConfiguracionSection
    │       ├── UbicacionesSection
    │       ├── MercanciasSection
    │       ├── AutotransporteSection
    │       ├── FigurasSection
    │       └── PreviewXML
    │
    ├── /vehiculos
    │   └── VehiculosPage
    │
    ├── /conductores
    │   └── ConductoresPage
    │
    └── /configuracion
        └── ConfiguracionPage
            ├── DatosFiscales
            ├── Certificados
            └── Preferencias
```

### Patrones de Estado

```typescript
// 1. Estado del Servidor (TanStack Query)
const { data: viajes, isLoading } = useQuery({
  queryKey: ['viajes'],
  queryFn: () => viajesService.listar()
});

// 2. Estado Global (Zustand)
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));

// 3. Estado Local (useState/useReducer)
const [isOpen, setIsOpen] = useState(false);

// 4. Estado de Formulario (React Hook Form)
const form = useForm<ViajeFormData>({
  resolver: zodResolver(viajeSchema)
});
```

---

## ⚡ Backend

### Supabase como Backend

El backend está completamente construido sobre Supabase:

1. **PostgreSQL** - Base de datos principal
2. **Edge Functions** - Lógica serverless
3. **Auth** - Autenticación y autorización
4. **Storage** - Almacenamiento de archivos
5. **Realtime** - Suscripciones en tiempo real

### Capas de la Aplicación

```
┌─────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN           │
│         (React Components + Pages)          │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│               CAPA DE HOOKS                 │
│    (useViajes, useFacturas, useTimbrado)    │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│              CAPA DE SERVICIOS              │
│  (ViajeService, FacturaService, PACService) │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│           CAPA DE INTEGRACIÓN               │
│      (Supabase Client, Edge Functions)      │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│             CAPA DE DATOS                   │
│        (PostgreSQL + RLS + Triggers)        │
└─────────────────────────────────────────────┘
```

### Servicios Principales

| Servicio | Archivo | Responsabilidad |
|----------|---------|-----------------|
| `ViajeOrchestrationService` | `services/viajes/` | Orquestación de viajes |
| `ViajeCartaPorteService` | `services/viajes/` | Creación de documentos fiscales |
| `CatalogosService` | `services/catalogos/` | Consulta de catálogos SAT |
| `XMLCartaPorteGenerator` | `services/xml/` | Generación de XML |
| `PDFGenerator` | `services/pdf/` | Generación de PDF |
| `TimbradoService` | `services/` | Timbrado con PAC |
| `ValidadorPreTimbrado` | `services/validacion/` | Validación pre-timbrado |

---

## 🔌 Edge Functions

### Funciones Desplegadas

```
supabase/functions/
├── _shared/                    # Código compartido
│   ├── cors.ts                # Headers CORS
│   └── supabase-client.ts     # Cliente Supabase
│
├── timbrar-con-sw/            # Timbrado CFDI con PAC SW
├── cancelar-cfdi-sw/          # Cancelación CFDI
├── generar-pdf-cfdi/          # Generación PDF oficial
├── validar-pre-timbrado/      # Validación previa
├── google-directions/         # Cálculo de rutas
├── get-google-maps-key/       # Obtener API key
├── poblar-catalogos-cp/       # Poblar catálogos SAT
├── check-expirations/         # Verificar vencimientos
├── consultar-rfc-sat/         # Validar RFC en SAT
├── consultar-saldo-pac/       # Saldo de timbres
└── procesar-certificado/      # Procesar CSD
```

### Anatomía de una Edge Function

```typescript
// supabase/functions/mi-funcion/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Autenticación (opcional)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // 3. Crear cliente Supabase con service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Obtener datos del request
    const { param1, param2 } = await req.json()

    // 5. Lógica de negocio
    const resultado = await procesarDatos(param1, param2)

    // 6. Respuesta exitosa
    return new Response(
      JSON.stringify({ success: true, data: resultado }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    // 7. Manejo de errores
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

---

## 🧾 Integración PAC SmartWeb

### Flujo de Comunicación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │────▶│ Edge Func   │────▶│   PAC SW    │
│   (React)   │     │ timbrar-sw  │     │   (API)     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      │ invoke()          │ fetch()           │
      │                   │                   │
      │◀──────────────────│◀──────────────────│
      │   UUID + Sello    │  Respuesta PAC    │
```

### Endpoints del PAC

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/cfdi40/issue` | POST | Timbrar CFDI 4.0 |
| `/cfdi40/cancel` | POST | Cancelar CFDI |
| `/balance` | GET | Consultar saldo |
| `/status` | GET | Estado del servicio |

### Configuración del PAC

```typescript
// Variables de entorno requeridas
SW_TOKEN     // Token de autenticación
SW_USER      // Usuario (opcional para algunos endpoints)
SW_PASSWORD  // Contraseña (opcional)
SW_URL       // URL base (sandbox o producción)

// URLs
SANDBOX: https://services.test.sw.com.mx
PRODUCCION: https://services.sw.com.mx
```

### Estructura del Request de Timbrado

```typescript
interface TimbradoRequest {
  xml: string;           // XML del CFDI firmado
  ambiente: 'sandbox' | 'produccion';
}

interface TimbradoResponse {
  success: boolean;
  uuid?: string;
  fechaTimbrado?: string;
  selloSAT?: string;
  cadenaOriginal?: string;
  xml?: string;          // XML timbrado
  error?: string;
}
```

---

## 📄 Flujo de Timbrado CFDI

### Diagrama de Secuencia

```
Usuario          Frontend           Edge Function        PAC SW           SAT
   │                │                    │                 │               │
   │ Crear Viaje    │                    │                 │               │
   │───────────────▶│                    │                 │               │
   │                │                    │                 │               │
   │                │ Generar XML        │                 │               │
   │                │◀───────────────────│                 │               │
   │                │                    │                 │               │
   │ Firmar XML     │                    │                 │               │
   │───────────────▶│                    │                 │               │
   │                │ invoke(timbrar)    │                 │               │
   │                │───────────────────▶│                 │               │
   │                │                    │ POST /cfdi40    │               │
   │                │                    │────────────────▶│               │
   │                │                    │                 │ Validar       │
   │                │                    │                 │──────────────▶│
   │                │                    │                 │◀──────────────│
   │                │                    │◀────────────────│               │
   │                │◀───────────────────│ UUID + Sello    │               │
   │◀───────────────│                    │                 │               │
   │ CFDI Timbrado  │                    │                 │               │
```

### Estados del Documento

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Borrador│────▶│Generado │────▶│ Firmado │────▶│Timbrado │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │ Cancelado   │
                                              │ (opcional)  │
                                              └─────────────┘
```

---

## 📝 Generación de XML

### Proceso de Generación

```typescript
// 1. Mapear datos del viaje a estructura XML
const cartaPorteData = ViajeToCartaPorteMapper.mapToValidCartaPorteFormat(viajeData);

// 2. Generar XML base
const xml = XMLCartaPorteGenerator.generarXML(cartaPorteData);

// 3. Validar contra XSD
const validacion = await XmlXsdValidator.validar(xml);

// 4. Firmar XML con CSD
const xmlFirmado = await firmarXML(xml, certificado, llave);

// 5. Enviar a timbrado
const resultado = await timbrar(xmlFirmado);
```

### Estructura XML CFDI 4.0 + Carta Porte 3.1

```xml
<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
    xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
    xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte31"
    Version="4.0"
    Serie="A"
    Folio="1234"
    Fecha="2024-01-15T10:30:00"
    ...>
    
    <cfdi:Emisor Rfc="EKU9003173C9" Nombre="..." RegimenFiscal="601"/>
    
    <cfdi:Receptor Rfc="..." Nombre="..." UsoCFDI="S01"/>
    
    <cfdi:Conceptos>
        <cfdi:Concepto ClaveProdServ="78101800" .../>
    </cfdi:Conceptos>
    
    <cfdi:Complemento>
        <cartaporte31:CartaPorte
            Version="3.1"
            TranspInternac="No"
            TotalDistRec="500.00">
            
            <cartaporte31:Ubicaciones>
                <cartaporte31:Ubicacion TipoUbicacion="Origen" .../>
                <cartaporte31:Ubicacion TipoUbicacion="Destino" .../>
            </cartaporte31:Ubicaciones>
            
            <cartaporte31:Mercancias PesoBrutoTotal="1000" ...>
                <cartaporte31:Mercancia BienesTransp="..." .../>
            </cartaporte31:Mercancias>
            
            <cartaporte31:FiguraTransporte>
                <cartaporte31:TiposFigura TipoFigura="01" .../>
            </cartaporte31:FiguraTransporte>
            
        </cartaporte31:CartaPorte>
    </cfdi:Complemento>
    
</cfdi:Comprobante>
```

---

## 📑 Generación de PDF

### Componentes del PDF

```
┌────────────────────────────────────────────────────┐
│                    ENCABEZADO                       │
│  Logo │ Datos Emisor │ Folio │ QR Code             │
├────────────────────────────────────────────────────┤
│                  DATOS RECEPTOR                     │
│  RFC │ Nombre │ Domicilio │ Uso CFDI               │
├────────────────────────────────────────────────────┤
│                   UBICACIONES                       │
│  Origen │ Destino(s) │ Coordenadas                 │
├────────────────────────────────────────────────────┤
│                   MERCANCÍAS                        │
│  Tabla: Descripción, Peso, Cantidad, Clave         │
├────────────────────────────────────────────────────┤
│                 AUTOTRANSPORTE                      │
│  Vehículo │ Placa │ Permiso SCT │ Seguros          │
├────────────────────────────────────────────────────┤
│                    FIGURAS                          │
│  Operador │ RFC │ Licencia │ Domicilio             │
├────────────────────────────────────────────────────┤
│              SELLOS Y CERTIFICADOS                  │
│  Sello Digital │ Sello SAT │ Cadena Original       │
├────────────────────────────────────────────────────┤
│                     FOOTER                          │
│  UUID │ Fecha Timbrado │ Verificación SAT          │
└────────────────────────────────────────────────────┘
```

### Librerías Utilizadas

| Librería | Versión | Propósito |
|----------|---------|-----------|
| jsPDF | 3.0+ | Generación de PDF |
| jspdf-autotable | 5.0+ | Tablas en PDF |

---

## 🏢 Infraestructura

### Diagrama de Infraestructura

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼───────┐         ┌───────▼───────┐
            │   CDN/Edge    │         │   Supabase    │
            │   (Lovable)   │         │    Cloud      │
            │               │         │               │
            │ trucking.     │         │ us-east-1     │
            │ interconecta. │         │               │
            │ capital       │         │               │
            └───────┬───────┘         └───────┬───────┘
                    │                         │
                    │                         │
            ┌───────▼───────┐         ┌───────▼───────┐
            │   Static      │         │  PostgreSQL   │
            │   Assets      │         │  + Functions  │
            │   (React)     │         │  + Storage    │
            └───────────────┘         └───────────────┘
```

### Dominios y Certificados

| Dominio | Propósito | SSL |
|---------|-----------|-----|
| `trucking.interconecta.capital` | Producción | Let's Encrypt |
| `*.lovable.app` | Staging | Automático |
| `qulhweffinppyjpfkknh.supabase.co` | API Backend | Automático |

### Buckets de Storage

| Bucket | Propósito | Acceso |
|--------|-----------|--------|
| `certificados` | Archivos CSD | Privado |
| `documentos` | PDFs generados | Privado |
| `avatars` | Fotos de perfil | Público |
| `vehiculos` | Fotos de vehículos | Privado |

---

## 📊 Diagramas

### Diagrama de Flujo CFDI + Carta Porte

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO CFDI + CARTA PORTE                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. PREPARACIÓN DE DATOS                                         │
│    ├── Cargar configuración fiscal del usuario                  │
│    ├── Cargar datos del viaje (origen, destino, mercancías)     │
│    ├── Cargar datos de recursos (vehículo, conductor)           │
│    └── Validar completitud de datos                             │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. VALIDACIÓN PRE-TIMBRADO                                      │
│    ├── Validar estructura de datos                              │
│    ├── Validar catálogos SAT (CP, estados, municipios)          │
│    ├── Validar RFC emisor y receptor                            │
│    ├── Validar configuración vehicular                          │
│    └── Validar mercancías y pesos                               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. GENERACIÓN XML                                               │
│    ├── Construir nodo Comprobante (CFDI 4.0)                    │
│    ├── Construir nodo Emisor                                    │
│    ├── Construir nodo Receptor                                  │
│    ├── Construir nodos Conceptos                                │
│    ├── Construir Complemento CartaPorte31                       │
│    │   ├── Ubicaciones                                          │
│    │   ├── Mercancías                                           │
│    │   ├── Autotransporte                                       │
│    │   └── FigurasTransporte                                    │
│    └── Generar cadena original                                  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. FIRMA DIGITAL                                                │
│    ├── Cargar certificado CSD (.cer)                            │
│    ├── Cargar llave privada (.key)                              │
│    ├── Generar sello digital (SHA-256)                          │
│    └── Insertar sello en XML                                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. TIMBRADO (PAC)                                               │
│    ├── Enviar XML firmado a PAC SW                              │
│    ├── PAC valida con SAT                                       │
│    ├── PAC genera UUID y sello                                  │
│    └── Recibir XML timbrado                                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. POST-TIMBRADO                                                │
│    ├── Guardar XML timbrado en BD                               │
│    ├── Generar PDF oficial                                      │
│    ├── Actualizar estado del viaje                              │
│    ├── Registrar consumo de timbres                             │
│    └── Notificar al usuario                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Diagrama de Base de Datos (Simplificado)

```
┌─────────────────┐       ┌─────────────────┐
│     usuarios    │       │     profiles    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ auth_user_id    │◀─────▶│ id              │
│ nombre          │       │ full_name       │
│ email           │       │ avatar_url      │
│ tenant_id       │       │ timbres_consumidos │
└─────────────────┘       └─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     viajes      │       │    facturas     │       │  cartas_porte   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ viaje_id (FK)   │◀─────▶│ viaje_id (FK)   │
│ origen          │       │ rfc_emisor      │       │ rfc_emisor      │
│ destino         │       │ rfc_receptor    │       │ uuid_fiscal     │
│ conductor_id    │       │ total           │       │ xml_generado    │
│ vehiculo_id     │       │ status          │       │ status          │
│ estado          │       │ uuid_fiscal     │       │ datos_formulario│
└─────────────────┘       └─────────────────┘       └─────────────────┘
        │
        │ N:1
        ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   conductores   │       │    vehiculos    │       │    remolques    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ user_id (FK)    │       │ user_id (FK)    │
│ nombre          │       │ placa           │       │ placa           │
│ rfc             │       │ marca           │       │ tipo_remolque   │
│ num_licencia    │       │ modelo          │       │ capacidad_carga │
│ estado          │       │ estado          │       │ estado          │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## 🔗 Referencias

- [Documentación CFDI 4.0 SAT](http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/Anexo20RMF2022.pdf)
- [Documentación Carta Porte 3.1](http://omawww.sat.gob.mx/cartaporte/Paginas/default.htm)
- [Supabase Documentation](https://supabase.com/docs)
- [SmartWeb PAC API](https://developers.sw.com.mx/)
