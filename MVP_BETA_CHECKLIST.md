# MVP Beta Checklist - CFDI 4.0 + Carta Porte 3.1

## Estado Actual del MVP
**Última actualización:** 2024-11-25  
**Versión:** 2.0.0-beta

---

## ✅ FASE 1: Catálogos SAT (COMPLETADO)

### 1.1 CatalogosService
- [x] `validateCpRelation(cp, estado, municipio)` - Validación de correlación
- [x] `lookupByCp(cp)` - Búsqueda de información de CP
- [x] `isValidRegimen(code)` - Validación de régimen fiscal
- [x] `isValidUsoCfdi(code)` - Validación de uso CFDI
- [x] `isValidClaveUnidad(code)` - Validación de clave de unidad
- [x] `isValidClaveProdServ(code)` - Validación de clave producto/servicio
- [x] `getEstados()` - Obtener lista de estados
- [x] `getMunicipiosByEstado()` - Obtener municipios por estado
- [x] Cache con TTL de 30 minutos

### 1.2 Funciones de Base de Datos
- [x] `buscar_codigo_postal_completo(cp)` - Búsqueda completa de CP
- [x] `validar_correlacion_cp(cp, estado, municipio)` - Validación en DB
- [x] `sugerir_codigos_similares(cp)` - Sugerencias de CP
- [x] Índices optimizados para consultas

### 1.3 Edge Function: poblar-catalogos-cp
- [x] Endpoint para poblar catálogos desde SEPOMEX
- [x] Modo incremental y completo
- [ ] **PENDIENTE:** Ejecutar poblado inicial de catálogos

---

## ✅ FASE 2: Validación Pre-Timbrado (COMPLETADO)

### 2.1 ValidadorPreTimbradoCompleto
- [x] Validación de Emisor/Receptor
- [x] Validación de ubicaciones con correlación CP ↔ Estado ↔ Municipio
- [x] Validación de mercancías (valor > 0, clave SAT válida)
- [x] Validación de autotransporte
- [x] Validación de figuras (RFC, licencia para operadores)
- [x] Validación de tipo CFDI
- [x] Validación de coherencia de fechas
- [x] Validación de certificados y CSD
- [x] Validación rápida para UI

### 2.2 Integración con CatalogosService
- [x] Validación de correlación CP en ubicaciones
- [x] Validación de claves SAT en mercancías
- [x] Validación de claves de unidad

---

## ✅ FASE 3: Integración SmartWeb (COMPLETADO)

### 3.1 SwPayloadValidator
- [x] Validación de estructura básica
- [x] Construcción de payload en formato SW
- [x] Validación de payload construido
- [x] Integración con endpoint de validación SW (opcional)
- [x] Manejo de errores y advertencias

### 3.2 SwErrorInterpreter
- [x] Catálogo de errores SAT (CFDI y Carta Porte)
- [x] Detección de errores por patrón
- [x] Mensajes amigables para usuario
- [x] Sugerencias de corrección
- [x] Agrupación por severidad

### 3.3 Mapa de Endpoints SW
```json
{
  "timbrado": "/emision/timbrado-json-cfdi",
  "validacion": "/validacion-cfdi",
  "documento": "/documento/obtener",
  "cancelacion": "/cancelacion",
  "errores": "/errors"
}
```

---

## ✅ FASE 4: Validador XML/XSD (COMPLETADO)

### 4.1 XmlXsdValidator
- [x] Parseo y validación de XML
- [x] Validación de estructura CFDI 4.0
- [x] Validación de complemento Carta Porte 3.1
- [x] Validación de ubicaciones
- [x] Validación de mercancías
- [x] Validación de autotransporte
- [x] Validación de figuras
- [x] Validación de valores y patrones
- [x] Validación de coherencia con datos originales

### 4.2 Patrones Validados
- [x] RFC Persona Física/Moral
- [x] Código Postal (5 dígitos)
- [x] Fecha/Hora ISO
- [x] UUID/IdCCP (32 caracteres)
- [x] Montos y cantidades
- [x] Placas vehiculares
- [x] Números de licencia

---

## ✅ FASE 5: Seguridad e ISO 27001 (COMPLETADO)

### 5.1 Logger Sanitizado
- [x] Niveles de log (debug, info, warn, error)
- [x] Sanitización de datos sensibles
- [x] Patrones para RFC, CURP, email, teléfono, tokens
- [x] Campos sensibles automáticos
- [x] Enmascaramiento inteligente
- [x] Session tracking
- [x] Logger hijo por módulo

### 5.2 Campos Protegidos
- [x] password, contraseña, clave
- [x] secret, token, apiKey
- [x] rfc, curp, nss
- [x] tarjeta, cuenta, clabe, cvv
- [x] private_key, archivo_key

---

## 🔄 PENDIENTES PARA BETA

### Alta Prioridad
- [ ] Ejecutar poblado inicial de catálogos SAT
- [ ] Migrar console.log restantes a logger
- [ ] Tests unitarios para validadores
- [ ] Tests de integración con SW sandbox

### Media Prioridad
- [ ] Panel de debug para visualizar XML
- [ ] Generación de PDF profesional
- [ ] Tests E2E completos

### Baja Prioridad
- [ ] Dashboard de métricas de timbrado
- [ ] Alertas de certificados próximos a vencer
- [ ] Optimización de consultas de catálogos

---

## Comandos Útiles

```bash
# Verificar estructura
find src/services -name "*.ts" | head -20

# Buscar console.log pendientes
grep -r "console.log" src/ --include="*.ts" | wc -l

# Verificar tipos
npx tsc --noEmit

# Ejecutar tests
npm test
```

---

## Estructura de Archivos Clave

```
src/
├── services/
│   ├── catalogos/
│   │   ├── CatalogosService.ts    ✅
│   │   └── index.ts               ✅
│   ├── pac/
│   │   ├── SwPayloadValidator.ts  ✅
│   │   ├── SwErrorInterpreter.ts  ✅
│   │   └── index.ts               ✅
│   ├── validacion/
│   │   └── ValidadorPreTimbradoCompleto.ts ✅
│   └── xml/
│       └── XmlXsdValidator.ts     ✅
├── utils/
│   └── logger/
│       └── index.ts               ✅
└── supabase/
    └── functions/
        └── poblar-catalogos-cp/   ✅
```

---

## Validación de Ambiente

| Aspecto | Sandbox | Producción |
|---------|---------|------------|
| RFC LRFC/LCO | ✅ Valida | ✅ Valida |
| Certificados | ✅ Valida | ✅ Valida |
| Estructura XML | ✅ Valida | ✅ Valida |
| Domicilios fiscales | ❌ No valida | ✅ Valida |
| Correlación CP | ✅ Valida | ✅ Valida |

---

## Contacto y Soporte

- **PAC:** SmartWeb (SW)
- **Documentación SAT:** http://omawww.sat.gob.mx/tramitesyservicios/Paginas/anexo_20.htm
- **Carta Porte 3.1:** http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/Carta_Porte_31.pdf
