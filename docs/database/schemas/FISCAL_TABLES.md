# Tablas Fiscales (CFDI y Carta Porte)

## cartas_porte

Tabla principal para Carta Porte 3.1.

```sql
CREATE TABLE public.cartas_porte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  viaje_id UUID REFERENCES viajes(id),
  
  -- Identificación CFDI
  folio VARCHAR,
  tipo_cfdi VARCHAR, -- 'T' (Traslado), 'I' (Ingreso)
  version_carta_porte VARCHAR DEFAULT '3.1',
  version_documento VARCHAR DEFAULT 'v1.0',
  
  -- Emisor
  rfc_emisor VARCHAR NOT NULL,
  nombre_emisor VARCHAR,
  regimen_fiscal_emisor VARCHAR,
  domicilio_fiscal_emisor JSONB DEFAULT '{}'::jsonb,
  
  -- Receptor
  rfc_receptor VARCHAR NOT NULL,
  nombre_receptor VARCHAR,
  regimen_fiscal_receptor VARCHAR,
  domicilio_fiscal_receptor JSONB DEFAULT '{}'::jsonb,
  uso_cfdi VARCHAR,
  
  -- Carta Porte específico
  transporte_internacional BOOLEAN DEFAULT false,
  entrada_salida_merc VARCHAR, -- 'Entrada', 'Salida'
  pais_origen_destino VARCHAR,
  via_entrada_salida VARCHAR,
  registro_istmo BOOLEAN DEFAULT false,
  ubicacion_polo_origen VARCHAR,
  ubicacion_polo_destino VARCHAR,
  
  -- Totales
  distancia_total NUMERIC DEFAULT 0,
  peso_bruto_total NUMERIC DEFAULT 0,
  numero_total_mercancias INTEGER DEFAULT 0,
  
  -- Aduanero
  regimenes_aduaneros JSONB DEFAULT '[]'::jsonb,
  
  -- Estado del documento
  status VARCHAR DEFAULT 'borrador',
  -- Estados: borrador, generado, timbrado, cancelado
  
  -- Timbrado
  uuid_fiscal VARCHAR,
  fecha_timbrado TIMESTAMPTZ,
  xml_generado TEXT,
  id_ccp VARCHAR, -- ID del complemento Carta Porte
  
  -- Cancelación
  cancelable TEXT,
  estatus_cancelacion TEXT,
  motivo_cancelacion TEXT,
  fecha_cancelacion TIMESTAMPTZ,
  
  -- Relaciones opcionales
  factura_id UUID REFERENCES facturas(id),
  borrador_origen_id UUID REFERENCES borradores_carta_porte(id),
  conductor_principal_id UUID,
  vehiculo_principal_id UUID,
  remolque_principal_id UUID,
  
  -- Datos del formulario (para reconstrucción)
  datos_formulario JSONB DEFAULT '{}'::jsonb,
  nombre_documento VARCHAR,
  es_plantilla BOOLEAN DEFAULT false,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies
```sql
-- Usuarios ven solo sus cartas porte
CREATE POLICY "Users can view own cartas porte"
  ON cartas_porte FOR SELECT
  USING (auth.uid() = usuario_id);

-- Superusuarios ven todo
CREATE POLICY "Superusers full access"
  ON cartas_porte FOR ALL
  USING (is_superuser_secure(auth.uid()));
```

---

## ubicaciones

Ubicaciones de origen/destino para Carta Porte.

```sql
CREATE TABLE public.ubicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carta_porte_id UUID NOT NULL REFERENCES cartas_porte(id) ON DELETE CASCADE,
  
  -- Tipo y secuencia
  tipo_ubicacion VARCHAR NOT NULL, -- 'Origen', 'Destino'
  orden_secuencia INTEGER DEFAULT 1,
  id_ubicacion VARCHAR, -- ID para XML
  
  -- Remitente/Destinatario
  rfc_remitente_destinatario VARCHAR,
  nombre_remitente_destinatario VARCHAR,
  
  -- Fechas
  fecha_hora_salida_llegada TIMESTAMPTZ,
  
  -- Domicilio
  domicilio JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Estructura: {
  --   calle, numero_exterior, numero_interior,
  --   colonia, codigo_postal, localidad,
  --   municipio, estado, pais, referencia
  -- }
  
  -- Distancia
  distancia_recorrida NUMERIC DEFAULT 0,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## mercancias

Mercancías transportadas.

```sql
CREATE TABLE public.mercancias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carta_porte_id UUID NOT NULL REFERENCES cartas_porte(id) ON DELETE CASCADE,
  
  -- Catálogos SAT
  clave_prod_serv VARCHAR,
  clave_unidad VARCHAR,
  
  -- Descripción
  descripcion TEXT NOT NULL,
  cantidad NUMERIC NOT NULL,
  unidad VARCHAR,
  
  -- Pesos y valores
  peso_kg NUMERIC NOT NULL,
  valor_mercancia NUMERIC,
  valor_unitario NUMERIC,
  
  -- Identificación
  num_identificacion VARCHAR,
  
  -- Material peligroso
  material_peligroso BOOLEAN DEFAULT false,
  clave_material_peligroso VARCHAR,
  tipo_embalaje VARCHAR,
  descripcion_embalaje TEXT,
  
  -- Dimensiones
  dimensiones JSONB, -- {largo, ancho, alto}
  
  -- Pedimentos (comercio exterior)
  pedimentos JSONB DEFAULT '[]'::jsonb,
  
  -- Fracción arancelaria
  fraccion_arancelaria VARCHAR,
  
  -- Guías (paquetería)
  guias JSONB DEFAULT '[]'::jsonb,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## figuras_transporte

Figuras del transporte (operador, propietario, etc.).

```sql
CREATE TABLE public.figuras_transporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carta_porte_id UUID NOT NULL REFERENCES cartas_porte(id) ON DELETE CASCADE,
  
  -- Tipo de figura
  tipo_figura VARCHAR NOT NULL, -- '01' Operador, '02' Propietario, '03' Arrendador
  
  -- Datos de la figura
  rfc_figura VARCHAR,
  nombre_figura VARCHAR,
  num_licencia VARCHAR,
  num_reg_id_trib VARCHAR,
  residencia_fiscal VARCHAR DEFAULT 'MEX',
  
  -- Partes transporte (para arrendamiento)
  partes_transporte JSONB DEFAULT '[]'::jsonb,
  
  -- Domicilio
  domicilio JSONB,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## autotransporte

Datos del autotransporte para Carta Porte.

```sql
CREATE TABLE public.autotransporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carta_porte_id UUID REFERENCES cartas_porte(id) ON DELETE CASCADE,
  
  -- Permiso SCT
  perm_sct VARCHAR,
  num_permiso_sct VARCHAR,
  
  -- Vehículo
  config_vehicular VARCHAR, -- Clave SAT
  placa_vm VARCHAR,
  anio_modelo_vm INTEGER,
  numero_serie_vin VARCHAR,
  tipo_carroceria VARCHAR,
  tarjeta_circulacion VARCHAR,
  vigencia_tarjeta_circulacion DATE,
  
  -- Pesos
  peso_bruto_vehicular NUMERIC NOT NULL,
  carga_maxima NUMERIC,
  
  -- Seguros
  asegura_resp_civil VARCHAR,
  poliza_resp_civil VARCHAR,
  vigencia_resp_civil DATE,
  asegura_med_ambiente VARCHAR,
  poliza_med_ambiente VARCHAR,
  vigencia_med_ambiente DATE,
  asegura_carga VARCHAR,
  poliza_carga VARCHAR,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## facturas

Facturas CFDI 4.0.

```sql
CREATE TABLE public.facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  viaje_id UUID REFERENCES viajes(id),
  carta_porte_id UUID REFERENCES cartas_porte(id),
  
  -- Serie y folio
  serie VARCHAR,
  folio VARCHAR,
  
  -- Tipo de comprobante
  tipo_comprobante VARCHAR, -- 'I' Ingreso, 'E' Egreso, 'T' Traslado, 'P' Pago
  
  -- Fecha
  fecha_expedicion TIMESTAMPTZ NOT NULL,
  
  -- Emisor
  rfc_emisor VARCHAR NOT NULL,
  nombre_emisor VARCHAR NOT NULL,
  regimen_fiscal_emisor VARCHAR,
  
  -- Receptor
  rfc_receptor VARCHAR NOT NULL,
  nombre_receptor VARCHAR NOT NULL,
  regimen_fiscal_receptor VARCHAR NOT NULL,
  uso_cfdi VARCHAR,
  domicilio_fiscal_receptor VARCHAR,
  
  -- Moneda y forma de pago
  moneda VARCHAR DEFAULT 'MXN',
  tipo_cambio NUMERIC DEFAULT 1,
  forma_pago VARCHAR NOT NULL DEFAULT '99',
  metodo_pago VARCHAR NOT NULL DEFAULT 'PUE',
  
  -- Totales
  subtotal NUMERIC NOT NULL DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  total_impuestos_trasladados NUMERIC DEFAULT 0,
  total_impuestos_retenidos NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  
  -- Timbrado
  uuid_fiscal VARCHAR,
  fecha_timbrado TIMESTAMPTZ,
  sello_digital TEXT,
  sello_sat TEXT,
  cadena_original TEXT,
  certificado_sat VARCHAR,
  xml_generado TEXT,
  
  -- URLs de archivos
  xml_url TEXT,
  pdf_url TEXT,
  
  -- Estado
  status VARCHAR DEFAULT 'borrador',
  -- Estados: borrador, generada, timbrada, cancelada, pagada
  
  -- Cancelación
  fecha_cancelacion TIMESTAMPTZ,
  motivo_cancelacion TEXT,
  
  -- Complementos
  tiene_carta_porte BOOLEAN DEFAULT false,
  tiene_pago BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notas TEXT,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## borradores_carta_porte

Borradores guardados antes de generar Carta Porte.

```sql
CREATE TABLE public.borradores_carta_porte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  viaje_id UUID REFERENCES viajes(id),
  
  -- Identificación
  nombre_borrador VARCHAR DEFAULT 'Borrador sin título',
  version_formulario VARCHAR DEFAULT '3.1',
  
  -- Datos del formulario
  datos_formulario JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Auto-guardado
  auto_saved BOOLEAN DEFAULT false,
  ultima_edicion TIMESTAMPTZ DEFAULT now(),
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## certificados_digitales

Certificados de Sello Digital (CSD) para timbrado.

```sql
CREATE TABLE public.certificados_digitales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Identificación
  nombre_certificado VARCHAR NOT NULL,
  numero_certificado VARCHAR NOT NULL,
  rfc_titular VARCHAR NOT NULL,
  razon_social VARCHAR,
  
  -- Archivos (rutas en storage)
  archivo_cer_path TEXT NOT NULL,
  archivo_key_path TEXT NOT NULL,
  archivo_key_encrypted BOOLEAN DEFAULT true,
  password_vault_id UUID, -- Referencia a Vault
  
  -- Vigencia
  fecha_inicio_vigencia TIMESTAMPTZ NOT NULL,
  fecha_fin_vigencia TIMESTAMPTZ NOT NULL,
  
  -- Estado
  activo BOOLEAN DEFAULT false,
  validado BOOLEAN DEFAULT false,
  modo_pruebas BOOLEAN DEFAULT false,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## esquemas_xml_sat

Esquemas de ejemplo para generación de XML.

```sql
CREATE TABLE public.esquemas_xml_sat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  tipo_documento VARCHAR NOT NULL,
  tipo_transporte VARCHAR NOT NULL,
  tipo_operacion VARCHAR,
  descripcion TEXT,
  
  -- Versiones
  version_cfdi VARCHAR DEFAULT '4.0',
  version_carta_porte VARCHAR DEFAULT '3.1',
  
  -- Campos requeridos/opcionales
  campos_requeridos JSONB,
  campos_opcionales JSONB,
  
  -- XML de ejemplo
  xml_ejemplo TEXT NOT NULL,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
