// Catálogos SAT estáticos más comunes para uso como respaldo
export interface CatalogoSATItem {
  clave: string;
  descripcion: string;
}

// Productos y servicios más comunes del SAT
export const PRODUCTOS_SERVICIOS_SAT: CatalogoSATItem[] = [
  { clave: "01010101", descripcion: "No existe en el catálogo" },
  { clave: "10101500", descripcion: "Animales vivos" },
  { clave: "10101600", descripcion: "Productos animales" },
  { clave: "10121700", descripcion: "Cereales" },
  { clave: "10121800", descripcion: "Frutas y verduras" },
  { clave: "15101500", descripcion: "Productos lácteos" },
  { clave: "15101600", descripcion: "Carne y productos cárnicos" },
  { clave: "15121500", descripcion: "Bebidas" },
  { clave: "20101600", descripcion: "Productos textiles" },
  { clave: "23101600", descripcion: "Productos químicos" },
  { clave: "24101600", descripcion: "Productos de caucho y plástico" },
  { clave: "25101600", descripcion: "Productos de cuero" },
  { clave: "26101600", descripcion: "Productos de madera" },
  { clave: "27101600", descripcion: "Productos de papel" },
  { clave: "30101600", descripcion: "Productos metálicos" },
  { clave: "31101600", descripcion: "Maquinaria y equipo" },
  { clave: "32101600", descripcion: "Equipo electrónico" },
  { clave: "33101600", descripcion: "Vehículos automotores" },
  { clave: "39101600", descripcion: "Otros productos manufacturados" },
  { clave: "43191600", descripcion: "Servicios de construcción" },
  { clave: "50101600", descripcion: "Servicios de comercio" },
  { clave: "60101600", descripcion: "Servicios de transporte" },
  { clave: "70101600", descripcion: "Servicios profesionales" },
  { clave: "80101600", descripcion: "Servicios de salud" },
  { clave: "81101600", descripcion: "Servicios educativos" },
  { clave: "84101600", descripcion: "Servicios de alimentación" },
  { clave: "85101600", descripcion: "Servicios de entretenimiento" },
  { clave: "90101600", descripcion: "Servicios gubernamentales" }
];

// Tipos de embalaje más comunes del SAT
export const TIPOS_EMBALAJE_SAT: CatalogoSATItem[] = [
  { clave: "1A1", descripcion: "Tambor de acero con tapa no desmontable" },
  { clave: "1A2", descripcion: "Tambor de acero con tapa desmontable" },
  { clave: "1B1", descripcion: "Tambor de aluminio con tapa no desmontable" },
  { clave: "1B2", descripcion: "Tambor de aluminio con tapa desmontable" },
  { clave: "1G", descripcion: "Tambor de fibra" },
  { clave: "1H1", descripcion: "Tambor de plástico con tapa no desmontable" },
  { clave: "1H2", descripcion: "Tambor de plástico con tapa desmontable" },
  { clave: "1N1", descripcion: "Tambor de metal (distinto del acero o aluminio) con tapa no desmontable" },
  { clave: "1N2", descripcion: "Tambor de metal (distinto del acero o aluminio) con tapa desmontable" },
  { clave: "3A1", descripcion: "Bidón de acero con tapa no desmontable" },
  { clave: "3A2", descripcion: "Bidón de acero con tapa desmontable" },
  { clave: "3B1", descripcion: "Bidón de aluminio con tapa no desmontable" },
  { clave: "3B2", descripcion: "Bidón de aluminio con tapa desmontable" },
  { clave: "3H1", descripcion: "Bidón de plástico con tapa no desmontable" },
  { clave: "3H2", descripcion: "Bidón de plástico con tapa desmontable" },
  { clave: "4A", descripcion: "Caja de acero" },
  { clave: "4B", descripcion: "Caja de aluminio" },
  { clave: "4C1", descripcion: "Caja de madera natural ordinaria" },
  { clave: "4C2", descripcion: "Caja de madera natural con paredes a prueba de polvos finos" },
  { clave: "4D", descripcion: "Caja de madera contrachapada" },
  { clave: "4F", descripcion: "Caja de madera reconstituida" },
  { clave: "4G", descripcion: "Caja de fibra" },
  { clave: "4H1", descripcion: "Caja de plástico expandido" },
  { clave: "4H2", descripcion: "Caja de plástico rígido" },
  { clave: "5H1", descripcion: "Saco de plástico tejido" },
  { clave: "5H2", descripcion: "Saco de plástico tejido resistente a la humedad" },
  { clave: "5H3", descripcion: "Saco de película de plástico" },
  { clave: "5H4", descripcion: "Saco de plástico tejido" },
  { clave: "5L1", descripcion: "Saco de textil" },
  { clave: "5L2", descripcion: "Saco de textil resistente a la humedad" },
  { clave: "5L3", descripcion: "Saco de textil impermeable" },
  { clave: "5M1", descripcion: "Saco de papel multipared" },
  { clave: "5M2", descripcion: "Saco de papel multipared resistente al agua" },
  { clave: "6GA", descripcion: "Embalaje compuesto: recipiente de fibra con forro interior de plástico" },
  { clave: "6HG1", descripcion: "Embalaje compuesto: recipiente de plástico rígido en tambor de fibra" },
  { clave: "6HH1", descripcion: "Embalaje compuesto: recipiente de plástico rígido en bidón de plástico rígido" },
  { clave: "6PA1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en tambor de acero" },
  { clave: "6PB1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en tambor de aluminio" },
  { clave: "6PC", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en caja de madera" },
  { clave: "6PD1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en caja de madera contrachapada" },
  { clave: "6PG1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en tambor de fibra" },
  { clave: "6PH1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en embalaje expandido de plástico" },
  { clave: "6PH2", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en embalaje rígido de plástico" }
];

// Unidades de medida más comunes del SAT
export const UNIDADES_MEDIDA_SAT: CatalogoSATItem[] = [
  { clave: "H87", descripcion: "Pieza" },
  { clave: "KGM", descripcion: "Kilogramo" },
  { clave: "GRM", descripcion: "Gramo" },
  { clave: "LTR", descripcion: "Litro" },
  { clave: "MTR", descripcion: "Metro" },
  { clave: "MTK", descripcion: "Metro cuadrado" },
  { clave: "MTQ", descripcion: "Metro cúbico" },
  { clave: "BX", descripcion: "Caja" },
  { clave: "PK", descripcion: "Paquete" },
  { clave: "CS", descripcion: "Estuche" },
  { clave: "CT", descripcion: "Cartón" },
  { clave: "DZN", descripcion: "Docena" },
  { clave: "GLL", descripcion: "Galón" },
  { clave: "ONZ", descripcion: "Onza" },
  { clave: "LB", descripcion: "Libra" },
  { clave: "YRD", descripcion: "Yarda" },
  { clave: "FOT", descripcion: "Pie" },
  { clave: "INH", descripcion: "Pulgada" },
  { clave: "XBX", descripcion: "Caja" },
  { clave: "XPK", descripcion: "Paquete" },
  { clave: "XUN", descripcion: "Unidad" },
  { clave: "ACT", descripcion: "Actividad" },
  { clave: "E48", descripcion: "Unidad de servicio" },
  { clave: "E51", descripcion: "Trabajo" },
  { clave: "E54", descripcion: "Viaje" },
  { clave: "HUR", descripcion: "Hora" }
];

// Catálogo de Regímenes Aduaneros (simplificado)
export const REGIMENES_ADUANEROS_SAT: CatalogoSATItem[] = [
  { clave: 'A1', descripcion: 'Importación definitiva' },
  { clave: 'A3', descripcion: 'Importación temporal' },
  { clave: 'B1', descripcion: 'Exportación definitiva' },
  { clave: 'B2', descripcion: 'Exportación temporal' },
  { clave: 'C1', descripcion: 'Transformación o elaboración en recinto fiscalizado' }
];

// Función helper para formatear items del catálogo
export const formatCatalogItem = (item: CatalogoSATItem) => ({
  value: item.clave,
  label: `${item.clave} - ${item.descripcion}`,
  descripcion: item.descripcion,
  clave: item.clave
});

// Función para obtener catálogo estático por tipo
export const getCatalogoEstatico = (tipo: string) => {
  switch (tipo) {
    case 'productos':
      return PRODUCTOS_SERVICIOS_SAT.map(formatCatalogItem);
    case 'embalajes':
      return TIPOS_EMBALAJE_SAT.map(formatCatalogItem);
    case 'unidades':
      return UNIDADES_MEDIDA_SAT.map(formatCatalogItem);
    case 'regimenes_aduaneros':
      return REGIMENES_ADUANEROS_SAT.map(formatCatalogItem);
    default:
      return [];
  }
};
