# Catálogos del SAT

Los catálogos del SAT son tablas de referencia con datos oficiales para CFDI 4.0 y Carta Porte 3.1.

## Convención de Nomenclatura

Todas las tablas de catálogos usan el prefijo `cat_`:

```
cat_{nombre_catalogo}
```

## Catálogos Disponibles

### cat_clave_prod_serv_cp
Catálogo de productos y servicios para Carta Porte.

```sql
CREATE TABLE public.cat_clave_prod_serv_cp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_prod_serv VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  incluye_iva BOOLEAN DEFAULT false,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para búsquedas
CREATE INDEX idx_cat_prod_serv_clave ON cat_clave_prod_serv_cp(clave_prod_serv);
```

**Ejemplo de datos:**
| clave_prod_serv | descripcion |
|-----------------|-------------|
| 78101800 | Transporte de carga por carretera |
| 78101801 | Servicios de transporte de carga general |

---

### cat_clave_unidad
Catálogo de unidades de medida.

```sql
CREATE TABLE public.cat_clave_unidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_unidad VARCHAR NOT NULL,
  nombre VARCHAR NOT NULL,
  descripcion TEXT,
  simbolo VARCHAR,
  nota TEXT,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Ejemplo de datos:**
| clave_unidad | nombre | simbolo |
|--------------|--------|---------|
| KGM | Kilogramo | kg |
| LTR | Litro | l |
| XBX | Caja | - |

---

### cat_codigo_postal
Catálogo de códigos postales de México.

```sql
CREATE TABLE public.cat_codigo_postal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_postal VARCHAR NOT NULL,
  estado_clave VARCHAR NOT NULL,
  municipio_clave VARCHAR NOT NULL,
  localidad_clave VARCHAR,
  estimulo_frontera BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices importantes
CREATE INDEX idx_cat_cp_codigo ON cat_codigo_postal(codigo_postal);
CREATE INDEX idx_cat_cp_estado ON cat_codigo_postal(estado_clave);
```

---

### cat_colonia
Catálogo de colonias por código postal.

```sql
CREATE TABLE public.cat_colonia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_postal VARCHAR NOT NULL,
  clave_colonia VARCHAR NOT NULL,
  descripcion VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_estado
Catálogo de estados de México.

```sql
CREATE TABLE public.cat_estado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_estado VARCHAR NOT NULL,
  descripcion VARCHAR NOT NULL,
  pais_clave VARCHAR DEFAULT 'MEX',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Datos:**
| clave_estado | descripcion |
|--------------|-------------|
| AGU | Aguascalientes |
| BCN | Baja California |
| ... | ... |

---

### cat_municipio
Catálogo de municipios.

```sql
CREATE TABLE public.cat_municipio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_municipio VARCHAR NOT NULL,
  descripcion VARCHAR NOT NULL,
  estado_clave VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_localidad
Catálogo de localidades.

```sql
CREATE TABLE public.cat_localidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_localidad VARCHAR NOT NULL,
  descripcion VARCHAR NOT NULL,
  estado_clave VARCHAR NOT NULL,
  municipio_clave VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_pais
Catálogo de países.

```sql
CREATE TABLE public.cat_pais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_pais VARCHAR NOT NULL,
  descripcion VARCHAR NOT NULL,
  formato_codigo_postal VARCHAR,
  formato_reg_id_trib VARCHAR,
  validacion_reg_id_trib VARCHAR,
  agrupaciones TEXT,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_config_autotransporte
Configuraciones vehiculares.

```sql
CREATE TABLE public.cat_config_autotransporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_config VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  remolque BOOLEAN DEFAULT false,
  semirremolque BOOLEAN DEFAULT false,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Datos:**
| clave_config | descripcion | remolque |
|--------------|-------------|----------|
| C2 | Camión Unitario (2 ejes) | false |
| C3 | Camión Unitario (3 ejes) | false |
| T2S1 | Tractocamión con semirremolque | true |
| T3S2 | Tractocamión 3 ejes + semi 2 ejes | true |
| T3S3 | Tractocamión 3 ejes + semi 3 ejes | true |

---

### cat_subtipo_remolque
Subtipos de remolque.

```sql
CREATE TABLE public.cat_subtipo_remolque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_subtipo VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_tipo_permiso
Tipos de permiso SCT.

```sql
CREATE TABLE public.cat_tipo_permiso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_permiso VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  transporte_carga BOOLEAN DEFAULT false,
  transporte_pasajeros BOOLEAN DEFAULT false,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_figura_transporte
Figuras de transporte (operador, propietario, arrendatario).

```sql
CREATE TABLE public.cat_figura_transporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_figura VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  persona_fisica BOOLEAN DEFAULT false,
  persona_moral BOOLEAN DEFAULT false,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_material_peligroso
Catálogo de materiales peligrosos.

```sql
CREATE TABLE public.cat_material_peligroso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_material VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  clase_division VARCHAR,
  peligro_secundario VARCHAR,
  grupo_embalaje VARCHAR,
  instrucciones_embalaje TEXT,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_tipo_embalaje
Tipos de embalaje.

```sql
CREATE TABLE public.cat_tipo_embalaje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_embalaje VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_via_entrada_salida
Vías de entrada/salida para comercio exterior.

```sql
CREATE TABLE public.cat_via_entrada_salida (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_via VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### cat_registro_istmo
Registro del Istmo de Tehuantepec.

```sql
CREATE TABLE public.cat_registro_istmo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_registro VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Políticas de Acceso

Todos los catálogos del SAT son de **lectura pública**:

```sql
-- RLS Policy para catálogos
CREATE POLICY "Allow public read access to cat_*"
ON public.cat_{nombre}
FOR SELECT
USING (true);
```

Los catálogos **NO permiten**:
- INSERT (solo carga administrativa)
- UPDATE (datos inmutables)
- DELETE (datos de referencia)

---

## Tabla Auxiliar: codigos_postales_mexico

Tabla denormalizada para búsqueda rápida de direcciones:

```sql
CREATE TABLE public.codigos_postales_mexico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_postal VARCHAR NOT NULL,
  estado VARCHAR NOT NULL,
  estado_clave VARCHAR NOT NULL,
  municipio VARCHAR NOT NULL,
  municipio_clave VARCHAR NOT NULL,
  colonia VARCHAR NOT NULL,
  localidad VARCHAR,
  ciudad VARCHAR,
  tipo_asentamiento VARCHAR,
  zona VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para autocompletado
CREATE INDEX idx_cp_mexico_cp ON codigos_postales_mexico(codigo_postal);
CREATE INDEX idx_cp_mexico_colonia ON codigos_postales_mexico 
  USING gin(to_tsvector('spanish', colonia));
```
