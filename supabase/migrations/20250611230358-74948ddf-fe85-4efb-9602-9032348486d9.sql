
-- Crear tabla para catálogo de claves de productos y servicios de Carta Porte
CREATE TABLE public.cat_clave_prod_serv_cp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_prod_serv VARCHAR(8) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  incluye_iva BOOLEAN DEFAULT false,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para catálogo de claves de unidad
CREATE TABLE public.cat_clave_unidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_unidad VARCHAR(3) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  nota TEXT,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  simbolo VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para catálogo de tipos de permiso SCT
CREATE TABLE public.cat_tipo_permiso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_permiso VARCHAR(10) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  transporte_pasajeros BOOLEAN DEFAULT false,
  transporte_carga BOOLEAN DEFAULT false,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para configuraciones de autotransporte
CREATE TABLE public.cat_config_autotransporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_config VARCHAR(10) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  remolque BOOLEAN DEFAULT false,
  semirremolque BOOLEAN DEFAULT false,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para subtipos de remolque
CREATE TABLE public.cat_subtipo_remolque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_subtipo VARCHAR(10) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para figuras de transporte
CREATE TABLE public.cat_figura_transporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_figura VARCHAR(2) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  persona_fisica BOOLEAN DEFAULT false,
  persona_moral BOOLEAN DEFAULT false,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para materiales peligrosos
CREATE TABLE public.cat_material_peligroso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_material VARCHAR(10) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  clase_division VARCHAR(10),
  peligro_secundario VARCHAR(10),
  grupo_embalaje VARCHAR(10),
  instrucciones_embalaje TEXT,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para tipos de embalaje
CREATE TABLE public.cat_tipo_embalaje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_embalaje VARCHAR(10) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para países
CREATE TABLE public.cat_pais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_pais VARCHAR(3) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  formato_codigo_postal VARCHAR(50),
  formato_reg_id_trib VARCHAR(50),
  validacion_reg_id_trib VARCHAR(200),
  agrupaciones TEXT,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para vías de entrada/salida
CREATE TABLE public.cat_via_entrada_salida (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_via VARCHAR(2) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para estados
CREATE TABLE public.cat_estado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_estado VARCHAR(2) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  pais_clave VARCHAR(3) DEFAULT 'MEX',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para municipios
CREATE TABLE public.cat_municipio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_municipio VARCHAR(3) NOT NULL,
  descripcion VARCHAR(100) NOT NULL,
  estado_clave VARCHAR(2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(clave_municipio, estado_clave)
);

-- Crear tabla para localidades
CREATE TABLE public.cat_localidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_localidad VARCHAR(2) NOT NULL,
  descripcion VARCHAR(100) NOT NULL,
  estado_clave VARCHAR(2) NOT NULL,
  municipio_clave VARCHAR(3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(clave_localidad, estado_clave, municipio_clave)
);

-- Crear tabla para códigos postales (CORREGIDA - sin doble primary key)
CREATE TABLE public.cat_codigo_postal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_postal VARCHAR(5) NOT NULL UNIQUE,
  estado_clave VARCHAR(2) NOT NULL,
  municipio_clave VARCHAR(3) NOT NULL,
  localidad_clave VARCHAR(2),
  estimulo_frontera BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para colonias
CREATE TABLE public.cat_colonia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_colonia VARCHAR(4) NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  codigo_postal VARCHAR(5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(clave_colonia, codigo_postal)
);

-- Crear tabla para registro ISTMO
CREATE TABLE public.cat_registro_istmo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave_registro VARCHAR(2) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  fecha_inicio_vigencia DATE,
  fecha_fin_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_cat_clave_prod_serv_cp_clave ON public.cat_clave_prod_serv_cp(clave_prod_serv);
CREATE INDEX idx_cat_clave_prod_serv_cp_descripcion ON public.cat_clave_prod_serv_cp USING gin(to_tsvector('spanish', descripcion));

CREATE INDEX idx_cat_clave_unidad_clave ON public.cat_clave_unidad(clave_unidad);
CREATE INDEX idx_cat_clave_unidad_nombre ON public.cat_clave_unidad USING gin(to_tsvector('spanish', nombre));

CREATE INDEX idx_cat_codigo_postal_cp ON public.cat_codigo_postal(codigo_postal);
CREATE INDEX idx_cat_colonia_cp ON public.cat_colonia(codigo_postal);
CREATE INDEX idx_cat_colonia_descripcion ON public.cat_colonia USING gin(to_tsvector('spanish', descripcion));

-- Añadir datos de ejemplo para algunos catálogos críticos
INSERT INTO public.cat_clave_unidad (clave_unidad, nombre, descripcion, simbolo) VALUES
('MTR', 'Metro', 'Unidad de longitud del Sistema Internacional', 'm'),
('KGM', 'Kilogramo', 'Unidad de masa del Sistema Internacional', 'kg'),
('LTR', 'Litro', 'Unidad de volumen', 'L'),
('H87', 'Pieza', 'Unidad de conteo', 'pza'),
('TNE', 'Tonelada métrica', 'Unidad de masa equivalente a 1000 kilogramos', 't'),
('MTK', 'Metro cuadrado', 'Unidad de superficie', 'm²'),
('MTQ', 'Metro cúbico', 'Unidad de volumen', 'm³');

INSERT INTO public.cat_tipo_permiso (clave_permiso, descripcion, transporte_carga) VALUES
('TPAF01', 'Autotransporte Federal de Carga General', true),
('TPAF02', 'Autotransporte Federal de Carga Especializada', true),
('TPAF03', 'Autotransporte Federal de Materiales y Residuos Peligrosos', true),
('TPAF04', 'Servicio Auxiliar de Arrastre y Salvamento', true),
('TPAF05', 'Autotransporte Privado', true);

INSERT INTO public.cat_figura_transporte (clave_figura, descripcion, persona_fisica, persona_moral) VALUES
('01', 'Operador', true, false),
('02', 'Propietario', true, true),
('03', 'Arrendador', true, true),
('04', 'Notificado', true, true);

INSERT INTO public.cat_config_autotransporte (clave_config, descripcion, remolque, semirremolque) VALUES
('C2', 'Camión Unitario (2 llantas en el eje delantero y 4 llantas en el eje trasero)', false, false),
('C3', 'Camión Unitario (2 llantas en el eje delantero y 6 llantas en los ejes traseros)', false, false),
('T3S2', 'Tractocamión articulado (3 ejes en el tractocamión, 2 ejes en el semirremolque)', false, true),
('T3S3', 'Tractocamión articulado (3 ejes en el tractocamión, 3 ejes en el semirremolque)', false, true);

-- Algunos estados mexicanos de ejemplo
INSERT INTO public.cat_estado (clave_estado, descripcion) VALUES
('01', 'Aguascalientes'),
('02', 'Baja California'),
('03', 'Baja California Sur'),
('04', 'Campeche'),
('05', 'Coahuila de Zaragoza'),
('06', 'Colima'),
('07', 'Chiapas'),
('08', 'Chihuahua'),
('09', 'Ciudad de México'),
('10', 'Durango'),
('11', 'Guanajuato'),
('12', 'Guerrero'),
('13', 'Hidalgo'),
('14', 'Jalisco'),
('15', 'México'),
('16', 'Michoacán de Ocampo'),
('17', 'Morelos'),
('18', 'Nayarit'),
('19', 'Nuevo León'),
('20', 'Oaxaca'),
('21', 'Puebla'),
('22', 'Querétaro'),
('23', 'Quintana Roo'),
('24', 'San Luis Potosí'),
('25', 'Sinaloa'),
('26', 'Sonora'),
('27', 'Tabasco'),
('28', 'Tamaulipas'),
('29', 'Tlaxcala'),
('30', 'Veracruz de Ignacio de la Llave'),
('31', 'Yucatán'),
('32', 'Zacatecas');

-- Agregar algunos códigos postales de ejemplo
INSERT INTO public.cat_codigo_postal (codigo_postal, estado_clave, municipio_clave, localidad_clave) VALUES
('01000', '09', '001', '01'),
('06700', '09', '002', '01'),
('44100', '14', '039', '01'),
('64000', '19', '039', '01'),
('20000', '01', '001', '01');

-- Agregar algunas colonias de ejemplo
INSERT INTO public.cat_colonia (clave_colonia, descripcion, codigo_postal) VALUES
('0001', 'Centro', '01000'),
('0001', 'Del Valle Centro', '06700'),
('0001', 'Centro', '44100'),
('0001', 'Centro', '64000'),
('0001', 'Centro', '20000');
