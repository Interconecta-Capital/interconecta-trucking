# 🎯 Guía del Flujo Completo del MVP

Este documento describe el flujo completo del MVP de **Interconecta Trucking**, desde la configuración inicial hasta la generación de documentos fiscales.

## 📋 Tabla de Contenidos

- [Flujo de Usuario](#-flujo-de-usuario)
- [Configuración Fiscal](#-configuración-fiscal)
- [Flujo de Viaje](#-flujo-de-viaje)
- [Flujo de Timbrado](#-flujo-de-timbrado)
- [Generación de PDF](#-generación-de-pdf)
- [Validación de Errores](#-validación-de-errores)
- [Revisión de Logs](#-revisión-de-logs)
- [Variables del Sistema](#-variables-del-sistema)
- [Checklists QA](#-checklists-qa)

---

## 👤 Flujo de Usuario

### Registro y Onboarding

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE ONBOARDING                          │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRO
   └── Email + Password
   └── Verificación de email
   └── Creación automática de profile

2. PRIMER LOGIN
   └── Dashboard vacío
   └── Wizard de configuración inicial

3. CONFIGURACIÓN INICIAL
   ├── Datos de la empresa (RFC, Razón Social)
   ├── Domicilio fiscal (CP, Estado, Municipio)
   ├── Régimen fiscal
   ├── Certificado CSD (opcional en sandbox)
   └── Preferencias de timbrado

4. CREACIÓN DE RECURSOS
   ├── Agregar primer vehículo
   ├── Agregar primer conductor
   └── Agregar primer cliente/socio

5. PRIMER VIAJE
   └── Usar el wizard de viajes
   └── Generar primera carta porte
```

### Roles de Usuario

| Rol | Permisos |
|-----|----------|
| Usuario | CRUD de sus propios recursos |
| Admin | Gestión de usuarios del tenant |
| Superuser | Acceso total al sistema |

---

## ⚙️ Configuración Fiscal

### Requisitos Mínimos

Para poder timbrar documentos, el usuario debe configurar:

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| RFC Emisor | ✅ | RFC de la empresa |
| Razón Social | ✅ | Nombre fiscal completo |
| Régimen Fiscal | ✅ | Clave SAT (601, 612, etc.) |
| Código Postal | ✅ | CP del domicilio fiscal |
| Estado | ✅ | Estado del domicilio |
| País | ✅ | Clave SAT (MEX) |
| Certificado CSD | ⚠️ | Requerido para producción |

### Flujo de Configuración

```
Configuración → Datos Fiscales
│
├── 1. Capturar RFC
│   └── Validación: Formato correcto
│   └── Validación: RFC activo en SAT (opcional)
│
├── 2. Capturar Razón Social
│   └── Debe coincidir con Constancia Fiscal
│
├── 3. Seleccionar Régimen Fiscal
│   └── Dropdown con catálogo SAT
│   └── 601 - General de Ley PM
│   └── 612 - Personas Físicas con Actividad Empresarial
│   └── 621 - Incorporación Fiscal
│
├── 4. Capturar Domicilio Fiscal
│   └── Código Postal → Autocompleta Estado/Municipio
│   └── Calle, Número, Colonia (opcionales para CP)
│
├── 5. Subir Certificado CSD
│   └── Archivo .cer (certificado)
│   └── Archivo .key (llave privada)
│   └── Contraseña de la llave
│   └── Validación de fechas de vigencia
│
└── 6. Guardar Configuración
    └── Validación completa
    └── Flag: configuracion_completa = true
```

### Validación de Configuración

```typescript
// El sistema valida automáticamente:
interface ValidacionConfigFiscal {
  rfcValido: boolean;
  regimenValido: boolean;
  codigoPostalValido: boolean;
  certificadoVigente: boolean;
  configuracionCompleta: boolean;
}
```

---

## 🚛 Flujo de Viaje

### Wizard de Creación de Viaje

El wizard tiene 5 pasos:

#### Paso 1: Datos Básicos

```
┌─────────────────────────────────────────┐
│          PASO 1: DATOS BÁSICOS          │
├─────────────────────────────────────────┤
│ • Nombre del viaje (opcional)           │
│ • Fecha de inicio programada            │
│ • Fecha de fin estimada                 │
│ • Tipo de servicio                      │
│   └── Nacional / Internacional          │
│ • Notas adicionales                     │
└─────────────────────────────────────────┘
```

#### Paso 2: Ubicaciones

```
┌─────────────────────────────────────────┐
│         PASO 2: UBICACIONES             │
├─────────────────────────────────────────┤
│ ORIGEN:                                 │
│ • Dirección completa                    │
│ • Código Postal (validado SAT)          │
│ • RFC del remitente                     │
│ • Fecha/Hora de salida                  │
│                                         │
│ DESTINO(S):                             │
│ • Dirección completa                    │
│ • Código Postal (validado SAT)          │
│ • RFC del destinatario                  │
│ • Fecha/Hora estimada de llegada        │
│ • Distancia recorrida (km)              │
│                                         │
│ [+ Agregar destino intermedio]          │
└─────────────────────────────────────────┘
```

#### Paso 3: Mercancías

```
┌─────────────────────────────────────────┐
│         PASO 3: MERCANCÍAS              │
├─────────────────────────────────────────┤
│ MERCANCÍA 1:                            │
│ • Descripción                           │
│ • Clave Producto/Servicio (catálogo)    │
│ • Clave Unidad (catálogo)               │
│ • Peso (kg)                             │
│ • Cantidad                              │
│ • Valor declarado                       │
│ • Material peligroso (Sí/No)            │
│                                         │
│ [+ Agregar mercancía]                   │
│                                         │
│ TOTALES:                                │
│ • Peso bruto total: 1,500 kg            │
│ • Número de mercancías: 3               │
└─────────────────────────────────────────┘
```

#### Paso 4: Recursos

```
┌─────────────────────────────────────────┐
│          PASO 4: RECURSOS               │
├─────────────────────────────────────────┤
│ VEHÍCULO:                               │
│ • Selector de vehículos disponibles     │
│ • Placa: ABC-123                        │
│ • Config. vehicular: C2                 │
│                                         │
│ REMOLQUE (opcional):                    │
│ • Selector de remolques disponibles     │
│ • Placa: XYZ-456                        │
│                                         │
│ CONDUCTOR:                              │
│ • Selector de conductores disponibles   │
│ • RFC: XXXX000000XXX                    │
│ • Licencia: E12345678                   │
│                                         │
│ CLIENTE/SOCIO:                          │
│ • Selector o crear nuevo                │
│ • RFC del receptor                      │
└─────────────────────────────────────────┘
```

#### Paso 5: Confirmación

```
┌─────────────────────────────────────────┐
│        PASO 5: CONFIRMACIÓN             │
├─────────────────────────────────────────┤
│ RESUMEN DEL VIAJE:                      │
│ • Ruta: CDMX → Guadalajara              │
│ • Distancia: 540 km                     │
│ • Duración estimada: 7 horas            │
│ • Mercancías: 3 (1,500 kg)              │
│ • Vehículo: Kenworth T680               │
│ • Conductor: Juan Pérez                 │
│                                         │
│ DOCUMENTOS A GENERAR:                   │
│ ☑ Factura CFDI 4.0                      │
│ ☑ Complemento Carta Porte 3.1           │
│                                         │
│ VALIDACIÓN PRE-TIMBRADO:                │
│ ✅ Configuración fiscal completa        │
│ ✅ Datos de ubicaciones válidos         │
│ ✅ Mercancías con claves SAT            │
│ ✅ Vehículo con permisos vigentes       │
│ ✅ Conductor con licencia vigente       │
│                                         │
│ [Crear Viaje] [Crear y Timbrar]         │
└─────────────────────────────────────────┘
```

### Estados del Viaje

```
programado → en_transito → completado
     │            │
     ▼            ▼
 cancelado    cancelado
```

---

## 🧾 Flujo de Timbrado

### Pre-requisitos

1. ✅ Configuración fiscal completa
2. ✅ Certificado CSD válido (producción)
3. ✅ Saldo de timbres disponible
4. ✅ Datos del viaje completos y validados

### Proceso de Timbrado

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE TIMBRADO                            │
└─────────────────────────────────────────────────────────────────┘

1. VALIDACIÓN PRE-TIMBRADO
   ├── Validar estructura de datos
   ├── Validar catálogos SAT
   ├── Validar RFCs
   ├── Validar fechas
   └── Retornar errores/advertencias

2. GENERACIÓN XML
   ├── Construir CFDI 4.0
   ├── Agregar Complemento Carta Porte 3.1
   ├── Calcular totales
   └── Generar cadena original

3. FIRMA DIGITAL
   ├── Cargar CSD del usuario
   ├── Generar hash SHA-256
   ├── Firmar con llave privada
   └── Insertar sello en XML

4. ENVÍO A PAC
   ├── Invocar Edge Function (timbrar-con-sw)
   ├── Enviar XML a PAC SmartWeb
   ├── Esperar respuesta
   └── Manejar errores de PAC/SAT

5. PROCESAMIENTO RESPUESTA
   ├── Extraer UUID
   ├── Extraer sello SAT
   ├── Extraer cadena original SAT
   └── Guardar XML timbrado

6. ACTUALIZACIÓN BD
   ├── Guardar UUID en carta_porte
   ├── Actualizar estado a 'timbrado'
   ├── Registrar consumo de timbre
   └── Generar PDF
```

### Ambientes de Timbrado

| Ambiente | Uso | PAC URL |
|----------|-----|---------|
| Sandbox | Desarrollo/Pruebas | services.test.sw.com.mx |
| Producción | Documentos reales | services.sw.com.mx |

---

## 📄 Generación de PDF

### Estructura del PDF Oficial

```
┌─────────────────────────────────────────────────────────────────┐
│  LOGO        FACTURA CFDI 4.0                        QR CODE   │
│  EMPRESA     Serie: A  Folio: 1234                             │
│              Fecha: 2024-01-15 10:30:00                        │
├─────────────────────────────────────────────────────────────────┤
│  EMISOR                          │  RECEPTOR                   │
│  RFC: EKU9003173C9               │  RFC: XAXX010101000         │
│  Nombre: Escuela Kemper...       │  Nombre: Público General    │
│  Régimen: 601                    │  Uso CFDI: S01              │
│  CP: 06600                       │  CP: 44100                  │
├─────────────────────────────────────────────────────────────────┤
│                    COMPLEMENTO CARTA PORTE 3.1                  │
├─────────────────────────────────────────────────────────────────┤
│  UBICACIONES                                                    │
│  ┌─────────────┬─────────────┬──────────┬──────────┬─────────┐ │
│  │ Tipo        │ RFC         │ CP       │ Fecha    │ Dist.   │ │
│  ├─────────────┼─────────────┼──────────┼──────────┼─────────┤ │
│  │ Origen      │ EKU9003173C9│ 06600    │ 10:30    │ -       │ │
│  │ Destino     │ XAXX010101  │ 44100    │ 17:30    │ 540 km  │ │
│  └─────────────┴─────────────┴──────────┴──────────┴─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  MERCANCÍAS                         Peso Total: 1,500 kg        │
│  ┌────────────┬────────────┬────────┬────────┬────────────────┐│
│  │ Clave      │ Descripción│ Unidad │ Cant.  │ Peso (kg)      ││
│  ├────────────┼────────────┼────────┼────────┼────────────────┤│
│  │ 24111500   │ Refacciones│ KGM    │ 100    │ 500            ││
│  │ 31161500   │ Tornillos  │ KGM    │ 200    │ 1,000          ││
│  └────────────┴────────────┴────────┴────────┴────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  AUTOTRANSPORTE                                                 │
│  Permiso SCT: TPAF01-1234567  │  Config: C2                    │
│  Placa: ABC-123               │  Año: 2020                     │
│  Seguro RC: Póliza 12345      │  Aseguradora: GNP              │
├─────────────────────────────────────────────────────────────────┤
│  OPERADOR                                                       │
│  RFC: XXXX000000XXX           │  Licencia: E12345678           │
│  Nombre: Juan Pérez García                                      │
├─────────────────────────────────────────────────────────────────┤
│  SELLOS Y CERTIFICADOS                                          │
│  Sello CFDI: AbCdEf...                                          │
│  Sello SAT: XyZ123...                                           │
│  No. Certificado: 00001000000XXXXX                              │
│  No. Certificado SAT: 00001000000SATXX                          │
├─────────────────────────────────────────────────────────────────┤
│  Cadena Original del Complemento de Certificación Digital:      │
│  ||1.1|xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx|2024-01-15T10:30:00│
│  |PAC0000000000|AbCdEf...||                                     │
├─────────────────────────────────────────────────────────────────┤
│  UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx                     │
│  Fecha Timbrado: 2024-01-15T10:30:05                            │
│  Este documento puede verificarse en: https://verificacfdi.sat. │
└─────────────────────────────────────────────────────────────────┘
```

### Código QR

El QR debe contener la URL de verificación SAT:

```
https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?
id=UUID&
re=RFC_EMISOR&
rr=RFC_RECEPTOR&
tt=TOTAL&
fe=ULTIMOS_8_SELLO
```

---

## ❌ Validación de Errores

### Errores Comunes del SAT

| Código | Descripción | Solución |
|--------|-------------|----------|
| CFDI40147 | RFC no válido | Verificar formato RFC |
| CFDI33106 | CP no existe en catálogo | Usar CP válido del SAT |
| CCP401 | Ubicación sin coordenadas | Agregar lat/lng |
| CCP301 | Peso total incorrecto | Recalcular suma de pesos |

### Manejo de Errores en UI

```typescript
// Mostrar errores de validación
const errores = await ValidadorPreTimbrado.validar(data);

if (!errores.valido) {
  errores.errores.forEach(error => {
    toast.error(`${error.campo}: ${error.mensaje}`);
  });
}

// Mostrar errores de timbrado
try {
  await timbrar(xml);
} catch (error) {
  if (error.codigoSAT) {
    toast.error(`Error SAT ${error.codigoSAT}: ${error.mensaje}`);
  } else {
    toast.error('Error de conexión con el PAC');
  }
}
```

---

## 📊 Revisión de Logs

### Logs del Frontend

```typescript
// En desarrollo, usar el logger sanitizado
import { logger } from '@/lib/logger';

logger.info('viajes', 'Viaje creado', { viajeId: 'xxx' });
logger.error('timbrado', 'Error en timbrado', { error: 'xxx' });
```

### Logs de Edge Functions

Ver en Supabase Dashboard:

1. Ir a **Edge Functions** → Seleccionar función
2. Click en **Logs**
3. Filtrar por fecha/hora

### Logs de Base de Datos

```sql
-- Ver logs de PostgreSQL
SELECT * FROM postgres_logs
ORDER BY timestamp DESC
LIMIT 100;

-- Ver auditoría de seguridad
SELECT * FROM security_audit_log
WHERE event_type = 'timbrado'
ORDER BY created_at DESC;
```

---

## ⚙️ Variables del Sistema

### Variables Críticas

| Variable | Ubicación | Propósito |
|----------|-----------|-----------|
| `SUPABASE_URL` | .env / Edge Functions | URL del proyecto |
| `SUPABASE_ANON_KEY` | .env / Cliente | Clave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | Clave privada |
| `SW_TOKEN` | Edge Functions Secrets | Token PAC |
| `GOOGLE_MAPS_API_KEY` | Edge Functions Secrets | API Maps |

### Configuraciones de BD

```sql
-- Verificar configuración fiscal del usuario
SELECT * FROM configuracion_empresa
WHERE user_id = 'uuid-usuario';

-- Verificar certificados activos
SELECT * FROM certificados_digitales
WHERE user_id = 'uuid-usuario'
AND activo = true;
```

---

## ✅ Checklists QA

### Checklist Pre-Timbrado

- [ ] Usuario tiene configuración fiscal completa
- [ ] RFC emisor es válido
- [ ] Código postal existe en catálogo SAT
- [ ] Viaje tiene al menos 2 ubicaciones
- [ ] Mercancías tienen claves SAT válidas
- [ ] Peso total es mayor a 0
- [ ] Vehículo tiene placa y permisos
- [ ] Conductor tiene RFC y licencia
- [ ] Certificado CSD está vigente (producción)
- [ ] Hay saldo de timbres disponible

### Checklist Post-Timbrado

- [ ] UUID generado correctamente
- [ ] Sello SAT presente
- [ ] Cadena original generada
- [ ] XML guardado en BD
- [ ] PDF generado con QR
- [ ] Estado actualizado a 'timbrado'
- [ ] Consumo de timbre registrado
- [ ] Notificación enviada al usuario

### Checklist de Producción

- [ ] Ambiente de PAC configurado a producción
- [ ] Certificados CSD de producción subidos
- [ ] URL de verificación SAT funcional
- [ ] Backups de BD configurados
- [ ] Monitoreo de errores activo
- [ ] Rate limiting configurado
- [ ] SSL/TLS en todas las conexiones

---

## 🔗 Referencias

- [Validación Pre-timbrado](./flujo-timbrado.md)
- [Errores SAT Comunes](./errores-sat-comunes.md)
- [Arquitectura](./02-arquitectura.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
