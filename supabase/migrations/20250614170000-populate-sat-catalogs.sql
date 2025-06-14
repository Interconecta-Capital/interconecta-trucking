
-- Populate cat_pais with official SAT country catalog
INSERT INTO public.cat_pais (clave_pais, descripcion) VALUES
('MEX', 'México'),
('USA', 'Estados Unidos de América'),
('CAN', 'Canadá'),
('GTM', 'Guatemala'),
('BLZ', 'Belice'),
('SLV', 'El Salvador'),
('HND', 'Honduras'),
('NIC', 'Nicaragua'),
('CRI', 'Costa Rica'),
('PAN', 'Panamá'),
('CUB', 'Cuba'),
('DOM', 'República Dominicana'),
('HTI', 'Haití'),
('JAM', 'Jamaica'),
('COL', 'Colombia'),
('VEN', 'Venezuela'),
('GUY', 'Guyana'),
('SUR', 'Suriname'),
('GUF', 'Guayana Francesa'),
('BRA', 'Brasil'),
('ECU', 'Ecuador'),
('PER', 'Perú'),
('BOL', 'Bolivia'),
('PRY', 'Paraguay'),
('URY', 'Uruguay'),
('ARG', 'Argentina'),
('CHL', 'Chile'),
('ESP', 'España'),
('FRA', 'Francia'),
('DEU', 'Alemania'),
('ITA', 'Italia'),
('GBR', 'Reino Unido'),
('CHN', 'China'),
('JPN', 'Japón'),
('KOR', 'Corea del Sur'),
('IND', 'India'),
('RUS', 'Rusia')
ON CONFLICT (clave_pais) DO NOTHING;

-- Populate cat_via_entrada_salida with official SAT entry/exit routes
INSERT INTO public.cat_via_entrada_salida (clave_via, descripcion) VALUES
('01', 'Aérea'),
('02', 'Marítima'),
('03', 'Terrestre'),
('04', 'Ferroviaria')
ON CONFLICT (clave_via) DO NOTHING;

-- Ensure cat_registro_istmo has data
INSERT INTO public.cat_registro_istmo (clave_registro, descripcion) VALUES
('01', 'Registro de Istmo de Tehuantepec')
ON CONFLICT (clave_registro) DO NOTHING;
