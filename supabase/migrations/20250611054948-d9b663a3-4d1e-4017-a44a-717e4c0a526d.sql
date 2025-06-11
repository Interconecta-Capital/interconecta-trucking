
-- Crear tabla de tenants/empresas
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_empresa VARCHAR(255) NOT NULL,
  rfc_empresa VARCHAR(13) NOT NULL UNIQUE,
  subdominio VARCHAR(50) UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de usuarios por tenant
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, email)
);

-- Tabla para clientes/proveedores frecuentes
CREATE TABLE public.clientes_proveedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  rfc VARCHAR(13) NOT NULL,
  nombre_razon_social VARCHAR(255) NOT NULL,
  domicilio_fiscal JSONB,
  regimen_fiscal VARCHAR(10),
  uso_cfdi VARCHAR(10),
  tipo VARCHAR(20) CHECK (tipo IN ('cliente', 'proveedor', 'ambos')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, rfc)
);

-- Tabla principal de Cartas Porte
CREATE TABLE public.cartas_porte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES public.usuarios(id),
  folio VARCHAR(50),
  tipo_cfdi VARCHAR(20) CHECK (tipo_cfdi IN ('Ingreso', 'Traslado')),
  rfc_emisor VARCHAR(13) NOT NULL,
  nombre_emisor VARCHAR(255),
  rfc_receptor VARCHAR(13) NOT NULL,
  nombre_receptor VARCHAR(255),
  transporte_internacional BOOLEAN DEFAULT false,
  entrada_salida_merc VARCHAR(20),
  pais_origen_destino VARCHAR(3),
  via_entrada_salida VARCHAR(20),
  registro_istmo BOOLEAN DEFAULT false,
  ubicacion_polo_origen VARCHAR(20),
  ubicacion_polo_destino VARCHAR(20),
  status VARCHAR(20) DEFAULT 'borrador' CHECK (status IN ('borrador', 'validado', 'timbrado', 'cancelado')),
  xml_generado TEXT,
  uuid_fiscal VARCHAR(36),
  fecha_timbrado TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de ubicaciones (orígenes, destinos, intermedios)
CREATE TABLE public.ubicaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carta_porte_id UUID REFERENCES public.cartas_porte(id) ON DELETE CASCADE,
  id_ubicacion VARCHAR(20) NOT NULL, -- OR000001, DE000001, IN000001
  tipo_ubicacion VARCHAR(20) CHECK (tipo_ubicacion IN ('Origen', 'Destino', 'Paso Intermedio')),
  rfc_remitente_destinatario VARCHAR(13),
  nombre_remitente_destinatario VARCHAR(255),
  fecha_hora_salida_llegada TIMESTAMP WITH TIME ZONE,
  distancia_recorrida DECIMAL(10,2),
  domicilio JSONB, -- {pais, cp, estado, municipio, localidad, colonia, calle, num_ext, num_int, referencia}
  orden_secuencia INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de mercancías
CREATE TABLE public.mercancias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carta_porte_id UUID REFERENCES public.cartas_porte(id) ON DELETE CASCADE,
  bienes_transp VARCHAR(20) NOT NULL, -- Clave del catálogo c_ClaveProdServCP
  descripcion TEXT,
  cantidad DECIMAL(15,3),
  clave_unidad VARCHAR(10),
  peso_kg DECIMAL(12,3),
  material_peligroso BOOLEAN DEFAULT false,
  cve_material_peligroso VARCHAR(10),
  embalaje VARCHAR(10),
  valor_mercancia DECIMAL(18,2),
  moneda VARCHAR(3) DEFAULT 'MXN',
  fraccion_arancelaria VARCHAR(20),
  uuid_comercio_ext VARCHAR(36),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de cantidad transportada (entregas parciales)
CREATE TABLE public.cantidad_transporta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mercancia_id UUID REFERENCES public.mercancias(id) ON DELETE CASCADE,
  id_origen VARCHAR(20),
  id_destino VARCHAR(20),
  cantidad DECIMAL(15,3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de autotransporte
CREATE TABLE public.autotransporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carta_porte_id UUID REFERENCES public.cartas_porte(id) ON DELETE CASCADE,
  perm_sct VARCHAR(10),
  num_permiso_sct VARCHAR(50),
  config_vehicular VARCHAR(10),
  placa_vm VARCHAR(20),
  anio_modelo_vm INTEGER,
  asegura_resp_civil VARCHAR(100),
  poliza_resp_civil VARCHAR(50),
  asegura_med_ambiente VARCHAR(100),
  poliza_med_ambiente VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de remolques
CREATE TABLE public.remolques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  autotransporte_id UUID REFERENCES public.autotransporte(id) ON DELETE CASCADE,
  subtipo_rem VARCHAR(10),
  placa VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de figuras de transporte
CREATE TABLE public.figuras_transporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carta_porte_id UUID REFERENCES public.cartas_porte(id) ON DELETE CASCADE,
  tipo_figura VARCHAR(10),
  rfc_figura VARCHAR(13),
  num_reg_id_trib_figura VARCHAR(50),
  residencia_fiscal_figura VARCHAR(3),
  nombre_figura VARCHAR(255),
  num_licencia VARCHAR(50),
  domicilio JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de plantillas para reutilización
CREATE TABLE public.plantillas_carta_porte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES public.usuarios(id),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  template_data JSONB, -- Datos completos de la plantilla
  es_publica BOOLEAN DEFAULT false,
  uso_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de historial de ubicaciones frecuentes
CREATE TABLE public.ubicaciones_frecuentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  rfc_asociado VARCHAR(13),
  nombre_ubicacion VARCHAR(255),
  domicilio JSONB,
  uso_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de vehículos guardados
CREATE TABLE public.vehiculos_guardados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  nombre_perfil VARCHAR(255),
  placa_vm VARCHAR(20),
  anio_modelo_vm INTEGER,
  config_vehicular VARCHAR(10),
  seguros JSONB,
  remolques JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de operadores/figuras frecuentes
CREATE TABLE public.figuras_frecuentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  tipo_figura VARCHAR(10),
  rfc_figura VARCHAR(13),
  nombre_figura VARCHAR(255),
  num_licencia VARCHAR(50),
  domicilio JSONB,
  datos_adicionales JSONB,
  uso_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartas_porte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cantidad_transporta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autotransporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remolques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figuras_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantillas_carta_porte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicaciones_frecuentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos_guardados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figuras_frecuentes ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS básicas (multi-tenant)
-- Solo usuarios autenticados pueden ver sus datos de tenant
CREATE POLICY "Users can access their tenant data" ON public.tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.tenant_id = tenants.id 
      AND usuarios.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access tenant users" ON public.usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u2 
      WHERE u2.tenant_id = usuarios.tenant_id 
      AND u2.auth_user_id = auth.uid()
    )
  );

-- Políticas para las demás tablas (acceso por tenant)
CREATE POLICY "Tenant isolation policy" ON public.clientes_proveedores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.tenant_id = clientes_proveedores.tenant_id 
      AND usuarios.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant isolation policy" ON public.cartas_porte
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.tenant_id = cartas_porte.tenant_id 
      AND usuarios.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant isolation policy" ON public.plantillas_carta_porte
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.tenant_id = plantillas_carta_porte.tenant_id 
      AND usuarios.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant isolation policy" ON public.ubicaciones_frecuentes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.tenant_id = ubicaciones_frecuentes.tenant_id 
      AND usuarios.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant isolation policy" ON public.vehiculos_guardados
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.tenant_id = vehiculos_guardados.tenant_id 
      AND usuarios.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant isolation policy" ON public.figuras_frecuentes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.tenant_id = figuras_frecuentes.tenant_id 
      AND usuarios.auth_user_id = auth.uid()
    )
  );

-- Políticas para tablas relacionadas (ubicaciones, mercancías, etc.)
CREATE POLICY "Access through carta porte" ON public.ubicaciones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp
      JOIN public.usuarios u ON u.tenant_id = cp.tenant_id
      WHERE cp.id = ubicaciones.carta_porte_id 
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Access through carta porte" ON public.mercancias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp
      JOIN public.usuarios u ON u.tenant_id = cp.tenant_id
      WHERE cp.id = mercancias.carta_porte_id 
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Access through carta porte" ON public.autotransporte
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp
      JOIN public.usuarios u ON u.tenant_id = cp.tenant_id
      WHERE cp.id = autotransporte.carta_porte_id 
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Access through carta porte" ON public.figuras_transporte
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp
      JOIN public.usuarios u ON u.tenant_id = cp.tenant_id
      WHERE cp.id = figuras_transporte.carta_porte_id 
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Access through mercancia" ON public.cantidad_transporta
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.mercancias m
      JOIN public.cartas_porte cp ON cp.id = m.carta_porte_id
      JOIN public.usuarios u ON u.tenant_id = cp.tenant_id
      WHERE m.id = cantidad_transporta.mercancia_id 
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Access through autotransporte" ON public.remolques
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.autotransporte a
      JOIN public.cartas_porte cp ON cp.id = a.carta_porte_id
      JOIN public.usuarios u ON u.tenant_id = cp.tenant_id
      WHERE a.id = remolques.autotransporte_id 
      AND u.auth_user_id = auth.uid()
    )
  );

-- Crear índices para mejor performance
CREATE INDEX idx_usuarios_tenant_auth ON public.usuarios(tenant_id, auth_user_id);
CREATE INDEX idx_cartas_porte_tenant_status ON public.cartas_porte(tenant_id, status);
CREATE INDEX idx_clientes_proveedores_tenant_rfc ON public.clientes_proveedores(tenant_id, rfc);
CREATE INDEX idx_ubicaciones_carta_porte ON public.ubicaciones(carta_porte_id);
CREATE INDEX idx_mercancias_carta_porte ON public.mercancias(carta_porte_id);
CREATE INDEX idx_plantillas_tenant ON public.plantillas_carta_porte(tenant_id);
