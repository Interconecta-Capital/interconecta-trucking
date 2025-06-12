
-- Habilitar RLS en todas las tablas de catálogos SAT y crear políticas de acceso público

-- Catálogos de productos y servicios
ALTER TABLE public.cat_clave_prod_serv_cp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_clave_prod_serv_cp" 
ON public.cat_clave_prod_serv_cp FOR SELECT 
TO public USING (true);

-- Catálogos de unidades
ALTER TABLE public.cat_clave_unidad ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_clave_unidad" 
ON public.cat_clave_unidad FOR SELECT 
TO public USING (true);

-- Catálogos de tipos de permiso
ALTER TABLE public.cat_tipo_permiso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_tipo_permiso" 
ON public.cat_tipo_permiso FOR SELECT 
TO public USING (true);

-- Catálogos de configuración de autotransporte
ALTER TABLE public.cat_config_autotransporte ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_config_autotransporte" 
ON public.cat_config_autotransporte FOR SELECT 
TO public USING (true);

-- Catálogos de subtipos de remolque
ALTER TABLE public.cat_subtipo_remolque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_subtipo_remolque" 
ON public.cat_subtipo_remolque FOR SELECT 
TO public USING (true);

-- Catálogos de figuras de transporte
ALTER TABLE public.cat_figura_transporte ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_figura_transporte" 
ON public.cat_figura_transporte FOR SELECT 
TO public USING (true);

-- Catálogos de materiales peligrosos
ALTER TABLE public.cat_material_peligroso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_material_peligroso" 
ON public.cat_material_peligroso FOR SELECT 
TO public USING (true);

-- Catálogos de tipos de embalaje
ALTER TABLE public.cat_tipo_embalaje ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_tipo_embalaje" 
ON public.cat_tipo_embalaje FOR SELECT 
TO public USING (true);

-- Catálogos de países
ALTER TABLE public.cat_pais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_pais" 
ON public.cat_pais FOR SELECT 
TO public USING (true);

-- Catálogos de vías de entrada/salida
ALTER TABLE public.cat_via_entrada_salida ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_via_entrada_salida" 
ON public.cat_via_entrada_salida FOR SELECT 
TO public USING (true);

-- Catálogos de estados
ALTER TABLE public.cat_estado ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_estado" 
ON public.cat_estado FOR SELECT 
TO public USING (true);

-- Catálogos de municipios
ALTER TABLE public.cat_municipio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_municipio" 
ON public.cat_municipio FOR SELECT 
TO public USING (true);

-- Catálogos de localidades
ALTER TABLE public.cat_localidad ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_localidad" 
ON public.cat_localidad FOR SELECT 
TO public USING (true);

-- Catálogos de códigos postales
ALTER TABLE public.cat_codigo_postal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_codigo_postal" 
ON public.cat_codigo_postal FOR SELECT 
TO public USING (true);

-- Catálogos de colonias
ALTER TABLE public.cat_colonia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_colonia" 
ON public.cat_colonia FOR SELECT 
TO public USING (true);

-- Catálogos de registro ISTMO
ALTER TABLE public.cat_registro_istmo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cat_registro_istmo" 
ON public.cat_registro_istmo FOR SELECT 
TO public USING (true);
