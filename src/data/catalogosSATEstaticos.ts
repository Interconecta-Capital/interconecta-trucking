
// Catálogos SAT estáticos actualizados 2024-2025 para uso como respaldo
export interface CatalogoSATItem {
  clave: string;
  descripcion: string;
  simbolo?: string;
  clase_division?: string;
  grupo_embalaje?: string;
}

// Productos y servicios SAT actualizados (más completos)
export const PRODUCTOS_SERVICIOS_SAT: CatalogoSATItem[] = [
  { clave: "01010101", descripcion: "No existe en el catálogo" },
  
  // Animales vivos y productos animales
  { clave: "10101500", descripcion: "Animales vivos" },
  { clave: "10101600", descripcion: "Productos animales" },
  { clave: "10121500", descripcion: "Ganado bovino" },
  { clave: "10121600", descripcion: "Ganado porcino" },
  { clave: "10121700", descripcion: "Aves de corral" },
  
  // Cereales y productos agrícolas
  { clave: "10111500", descripcion: "Maíz" },
  { clave: "10111600", descripcion: "Trigo" },
  { clave: "10111700", descripcion: "Arroz" },
  { clave: "10111800", descripcion: "Avena" },
  { clave: "10111900", descripcion: "Cebada" },
  { clave: "10112000", descripcion: "Sorgo" },
  { clave: "10112100", descripcion: "Frijol" },
  { clave: "10121800", descripcion: "Frutas y verduras frescas" },
  { clave: "10121900", descripcion: "Frutas procesadas" },
  { clave: "10122000", descripcion: "Verduras procesadas" },
  
  // Productos lácteos y cárnicos
  { clave: "15101500", descripcion: "Productos lácteos" },
  { clave: "15101600", descripcion: "Carne y productos cárnicos" },
  { clave: "15101700", descripcion: "Productos avícolas" },
  { clave: "15101800", descripcion: "Productos pesqueros" },
  { clave: "15101900", descripcion: "Productos de panadería" },
  
  // Bebidas
  { clave: "15121500", descripcion: "Bebidas no alcohólicas" },
  { clave: "15121600", descripcion: "Bebidas alcohólicas" },
  { clave: "15121700", descripcion: "Agua embotellada" },
  { clave: "15121800", descripcion: "Jugos y néctares" },
  
  // Textiles y confecciones
  { clave: "20101600", descripcion: "Productos textiles" },
  { clave: "20101700", descripcion: "Hilos y fibras textiles" },
  { clave: "20101800", descripcion: "Telas y tejidos" },
  { clave: "20101900", descripcion: "Prendas de vestir" },
  { clave: "20102000", descripcion: "Calzado" },
  
  // Productos químicos y farmacéuticos
  { clave: "23101600", descripcion: "Productos químicos industriales" },
  { clave: "23101700", descripcion: "Productos farmacéuticos" },
  { clave: "23101800", descripcion: "Productos de limpieza" },
  { clave: "23101900", descripcion: "Cosméticos y productos de higiene" },
  { clave: "23102000", descripcion: "Fertilizantes" },
  { clave: "23102100", descripcion: "Plaguicidas" },
  
  // Combustibles y lubricantes
  { clave: "27101000", descripcion: "Petróleo crudo" },
  { clave: "27101100", descripcion: "Gas natural" },
  { clave: "27101200", descripcion: "Gasolinas" },
  { clave: "27101300", descripcion: "Diesel" },
  { clave: "27101400", descripcion: "Lubricantes" },
  { clave: "27101500", descripcion: "Gas LP" },
  
  // Productos plásticos y de caucho
  { clave: "24101600", descripcion: "Productos de caucho y plástico" },
  { clave: "24101700", descripcion: "Envases plásticos" },
  { clave: "24101800", descripcion: "Productos de caucho" },
  
  // Materiales de construcción
  { clave: "25101600", descripcion: "Cemento" },
  { clave: "25101700", descripcion: "Concreto premezclado" },
  { clave: "25101800", descripcion: "Varilla y acero" },
  { clave: "25101900", descripcion: "Arena y grava" },
  { clave: "25102000", descripcion: "Tabique y blocks" },
  { clave: "25102100", descripcion: "Vidrio y cristal" },
  
  // Productos metálicos
  { clave: "30101600", descripcion: "Productos metálicos" },
  { clave: "30101700", descripcion: "Estructuras metálicas" },
  { clave: "30101800", descripcion: "Herramientas de metal" },
  
  // Maquinaria y equipo
  { clave: "31101600", descripcion: "Maquinaria industrial" },
  { clave: "31101700", descripcion: "Maquinaria agrícola" },
  { clave: "31101800", descripcion: "Equipo de construcción" },
  
  // Equipo electrónico
  { clave: "32101600", descripcion: "Equipo electrónico" },
  { clave: "32101700", descripcion: "Computadoras y equipos" },
  { clave: "32101800", descripcion: "Componentes electrónicos" },
  
  // Vehículos automotores
  { clave: "33101600", descripcion: "Vehículos automotores" },
  { clave: "33101700", descripcion: "Autopartes" },
  { clave: "33101800", descripcion: "Llantas y neumáticos" },
  
  // Servicios
  { clave: "70101600", descripcion: "Servicios profesionales" },
  { clave: "71101600", descripcion: "Servicios de transporte" },
  { clave: "72101600", descripcion: "Servicios de logística" },
  { clave: "78101600", descripcion: "Servicios de almacenamiento" },
  { clave: "80101600", descripcion: "Servicios de salud" },
  { clave: "81101600", descripcion: "Servicios educativos" },
  { clave: "84101600", descripcion: "Servicios de alimentación" },
  { clave: "90101600", descripcion: "Servicios gubernamentales" }
];

// Unidades de medida SAT actualizadas (completas)
export const UNIDADES_MEDIDA_SAT: CatalogoSATItem[] = [
  // Unidades básicas más comunes
  { clave: "H87", descripcion: "Pieza", simbolo: "pza" },
  { clave: "KGM", descripcion: "Kilogramo", simbolo: "kg" },
  { clave: "GRM", descripcion: "Gramo", simbolo: "g" },
  { clave: "LTR", descripcion: "Litro", simbolo: "l" },
  { clave: "MTR", descripcion: "Metro", simbolo: "m" },
  { clave: "MTK", descripcion: "Metro cuadrado", simbolo: "m²" },
  { clave: "MTQ", descripcion: "Metro cúbico", simbolo: "m³" },
  
  // Unidades de empaque
  { clave: "BX", descripcion: "Caja", simbolo: "cja" },
  { clave: "PK", descripcion: "Paquete", simbolo: "paq" },
  { clave: "CS", descripcion: "Estuche", simbolo: "est" },
  { clave: "CT", descripcion: "Cartón", simbolo: "ctn" },
  { clave: "DZN", descripcion: "Docena", simbolo: "doc" },
  { clave: "HND", descripcion: "Ciento", simbolo: "cto" },
  { clave: "MIL", descripcion: "Millar", simbolo: "mlr" },
  
  // Unidades de volumen
  { clave: "GLL", descripcion: "Galón estadounidense", simbolo: "gal" },
  { clave: "PT", descripcion: "Pinta estadounidense", simbolo: "pt" },
  { clave: "QT", descripcion: "Cuarto estadounidense", simbolo: "qt" },
  { clave: "ML", descripcion: "Mililitro", simbolo: "ml" },
  { clave: "CM3", descripcion: "Centímetro cúbico", simbolo: "cm³" },
  
  // Unidades de peso
  { clave: "TNE", descripcion: "Tonelada métrica", simbolo: "t" },
  { clave: "QTL", descripcion: "Quintal métrico", simbolo: "q" },
  { clave: "ONZ", descripcion: "Onza", simbolo: "oz" },
  { clave: "LBR", descripcion: "Libra", simbolo: "lb" },
  { clave: "MGM", descripcion: "Miligramo", simbolo: "mg" },
  
  // Unidades de longitud
  { clave: "CMT", descripcion: "Centímetro", simbolo: "cm" },
  { clave: "MMT", descripcion: "Milímetro", simbolo: "mm" },
  { clave: "KTM", descripcion: "Kilómetro", simbolo: "km" },
  { clave: "INH", descripcion: "Pulgada", simbolo: "in" },
  { clave: "FOT", descripcion: "Pie", simbolo: "ft" },
  { clave: "YRD", descripcion: "Yarda", simbolo: "yd" },
  
  // Unidades de área
  { clave: "CMK", descripcion: "Centímetro cuadrado", simbolo: "cm²" },
  { clave: "DMK", descripcion: "Decímetro cuadrado", simbolo: "dm²" },
  { clave: "KMK", descripcion: "Kilómetro cuadrado", simbolo: "km²" },
  { clave: "HAR", descripcion: "Hectárea", simbolo: "ha" },
  
  // Unidades de tiempo y servicios
  { clave: "HUR", descripcion: "Hora", simbolo: "hr" },
  { clave: "MIN", descripcion: "Minuto", simbolo: "min" },
  { clave: "DAY", descripcion: "Día", simbolo: "día" },
  { clave: "WEE", descripcion: "Semana", simbolo: "sem" },
  { clave: "MON", descripcion: "Mes", simbolo: "mes" },
  { clave: "ANN", descripcion: "Año", simbolo: "año" },
  
  // Unidades específicas
  { clave: "ACT", descripcion: "Actividad", simbolo: "act" },
  { clave: "E48", descripcion: "Unidad de servicio", simbolo: "serv" },
  { clave: "E51", descripcion: "Trabajo", simbolo: "trab" },
  { clave: "E54", descripcion: "Viaje", simbolo: "viaje" },
  { clave: "XUN", descripcion: "Unidad", simbolo: "und" },
  { clave: "XPK", descripcion: "Paquete", simbolo: "paq" },
  { clave: "XBX", descripcion: "Caja", simbolo: "cja" }
];

// Tipos de embalaje SAT actualizados y completos
export const TIPOS_EMBALAJE_SAT: CatalogoSATItem[] = [
  // Tambores
  { clave: "1A1", descripcion: "Tambor de acero con tapa no desmontable" },
  { clave: "1A2", descripcion: "Tambor de acero con tapa desmontable" },
  { clave: "1B1", descripcion: "Tambor de aluminio con tapa no desmontable" },
  { clave: "1B2", descripcion: "Tambor de aluminio con tapa desmontable" },
  { clave: "1N1", descripcion: "Tambor de metal (distinto del acero o aluminio) con tapa no desmontable" },
  { clave: "1N2", descripcion: "Tambor de metal (distinto del acero o aluminio) con tapa desmontable" },
  { clave: "1H1", descripcion: "Tambor de plástico con tapa no desmontable" },
  { clave: "1H2", descripcion: "Tambor de plástico con tapa desmontable" },
  { clave: "1G", descripcion: "Tambor de fibra" },
  { clave: "1D", descripcion: "Tambor de madera contrachapada" },
  
  // Bidones
  { clave: "3A1", descripcion: "Bidón de acero con tapa no desmontable" },
  { clave: "3A2", descripcion: "Bidón de acero con tapa desmontable" },
  { clave: "3B1", descripcion: "Bidón de aluminio con tapa no desmontable" },
  { clave: "3B2", descripcion: "Bidón de aluminio con tapa desmontable" },
  { clave: "3H1", descripcion: "Bidón de plástico con tapa no desmontable" },
  { clave: "3H2", descripcion: "Bidón de plástico con tapa desmontable" },
  
  // Cajas
  { clave: "4A", descripcion: "Caja de acero" },
  { clave: "4B", descripcion: "Caja de aluminio" },
  { clave: "4N", descripcion: "Caja de metal (distinto del acero o aluminio)" },
  { clave: "4C1", descripcion: "Caja de madera natural ordinaria" },
  { clave: "4C2", descripcion: "Caja de madera natural con paredes a prueba de polvos finos" },
  { clave: "4D", descripcion: "Caja de madera contrachapada" },
  { clave: "4F", descripcion: "Caja de madera reconstituida" },
  { clave: "4G", descripcion: "Caja de fibra" },
  { clave: "4H1", descripcion: "Caja de plástico expandido" },
  { clave: "4H2", descripcion: "Caja de plástico rígido" },
  
  // Sacos
  { clave: "5H1", descripcion: "Saco de plástico tejido" },
  { clave: "5H2", descripcion: "Saco de plástico resistente a la humedad" },
  { clave: "5H3", descripcion: "Saco de película de plástico" },
  { clave: "5H4", descripcion: "Saco de plástico tejido con forro" },
  { clave: "5L1", descripcion: "Saco de textil" },
  { clave: "5L2", descripcion: "Saco de textil resistente a la humedad" },
  { clave: "5L3", descripcion: "Saco de textil impermeable" },
  { clave: "5M1", descripcion: "Saco de papel multipared" },
  { clave: "5M2", descripcion: "Saco de papel multipared resistente al agua" },
  
  // Embalajes compuestos
  { clave: "6GA", descripcion: "Embalaje compuesto: recipiente de fibra con forro interior de plástico" },
  { clave: "6HG1", descripcion: "Embalaje compuesto: recipiente de plástico rígido en tambor de fibra" },
  { clave: "6HH1", descripcion: "Embalaje compuesto: recipiente de plástico rígido en bidón de plástico rígido" },
  { clave: "6PA1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en tambor de acero" },
  { clave: "6PB1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en tambor de aluminio" },
  { clave: "6PC", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en caja de madera" },
  { clave: "6PD1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en caja de madera contrachapada" },
  { clave: "6PG1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en tambor de fibra" },
  { clave: "6PH1", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en embalaje expandido de plástico" },
  { clave: "6PH2", descripcion: "Embalaje compuesto: recipiente de vidrio, cerámica o gres en embalaje rígido de plástico" },
  
  // Otros tipos comunes
  { clave: "43", descripcion: "Bolsa" },
  { clave: "44", descripcion: "Bolsón" },
  { clave: "1E", descripcion: "Aerosol" },
  { clave: "3E", descripcion: "Tubo" },
  { clave: "ZZ", descripcion: "Embalaje definido mutuamente" }
];

// Materiales peligrosos SAT (muestra representativa actualizada)
export const MATERIALES_PELIGROSOS_SAT: CatalogoSATItem[] = [
  // Clase 1 - Explosivos
  { clave: "0004", descripcion: "Picrato de amonio, seco o humidificado con menos del 10% de agua", clase_division: "1.1D", grupo_embalaje: "I" },
  { clave: "0005", descripcion: "Cartuchos para armas, con carga explosiva", clase_division: "1.1F", grupo_embalaje: "II" },
  { clave: "0006", descripcion: "Cartuchos para armas, con carga explosiva", clase_division: "1.1E", grupo_embalaje: "II" },
  
  // Clase 2 - Gases
  { clave: "1001", descripcion: "Acetileno disuelto", clase_division: "2.1", grupo_embalaje: "-" },
  { clave: "1002", descripcion: "Aire comprimido", clase_division: "2.2", grupo_embalaje: "-" },
  { clave: "1003", descripcion: "Aire refrigerado líquido", clase_division: "2.2", grupo_embalaje: "-" },
  { clave: "1005", descripcion: "Amoníaco anhidro", clase_division: "2.3", grupo_embalaje: "-" },
  { clave: "1006", descripcion: "Argón comprimido", clase_division: "2.2", grupo_embalaje: "-" },
  { clave: "1008", descripcion: "Trifluoruro de boro", clase_division: "2.3", grupo_embalaje: "-" },
  { clave: "1009", descripcion: "Bromotrifluorometano (gas refrigerante R 13B1)", clase_division: "2.2", grupo_embalaje: "-" },
  { clave: "1010", descripcion: "Butadienos estabilizados", clase_division: "2.1", grupo_embalaje: "-" },
  { clave: "1011", descripcion: "Butano", clase_division: "2.1", grupo_embalaje: "-" },
  { clave: "1012", descripcion: "Butileno", clase_division: "2.1", grupo_embalaje: "-" },
  { clave: "1013", descripcion: "Dióxido de carbono", clase_division: "2.2", grupo_embalaje: "-" },
  { clave: "1016", descripcion: "Monóxido de carbono comprimido", clase_division: "2.3", grupo_embalaje: "-" },
  { clave: "1017", descripcion: "Cloro", clase_division: "2.3", grupo_embalaje: "-" },
  { clave: "1018", descripcion: "Clorodifluorometano (gas refrigerante R 22)", clase_division: "2.2", grupo_embalaje: "-" },
  { clave: "1020", descripcion: "Cloropentafluoroetano (gas refrigerante R 115)", clase_division: "2.2", grupo_embalaje: "-" },
  
  // Clase 3 - Líquidos inflamables
  { clave: "1090", descripcion: "Acetona", clase_division: "3", grupo_embalaje: "II" },
  { clave: "1098", descripcion: "Alcohol alílico", clase_division: "6.1", grupo_embalaje: "I" },
  { clave: "1100", descripcion: "Cloruro de alilo", clase_division: "3", grupo_embalaje: "I" },
  { clave: "1104", descripcion: "Acetato de amilo", clase_division: "3", grupo_embalaje: "III" },
  { clave: "1105", descripcion: "Pentanol", clase_division: "3", grupo_embalaje: "II" },
  { clave: "1106", descripcion: "Amilamina", clase_division: "3", grupo_embalaje: "II" },
  { clave: "1110", descripcion: "n-Amilmetilcetona", clase_division: "3", grupo_embalaje: "III" },
  { clave: "1120", descripcion: "Butanol", clase_division: "3", grupo_embalaje: "III" },
  { clave: "1123", descripcion: "Acetato de butilo", clase_division: "3", grupo_embalaje: "II" },
  { clave: "1125", descripcion: "n-Butilamina", clase_division: "3", grupo_embalaje: "II" },
  { clave: "1126", descripcion: "1-Bromobutano", clase_division: "3", grupo_embalaje: "II" },
  { clave: "1127", descripcion: "Clorobutano", clase_division: "3", grupo_embalaje: "II" },
  { clave: "1128", descripcion: "n-Butilformiato", clase_division: "3", grupo_embalaje: "II" },
  { clave: "1129", descripcion: "Butiraldehído", clase_division: "3", grupo_embalaje: "II" },
  { clave: "1130", descripcion: "Aceite de alcanfor", clase_division: "3", grupo_embalaje: "III" },
  { clave: "1131", descripcion: "Disulfuro de carbono", clase_division: "3", grupo_embalaje: "I" },
  { clave: "1133", descripcion: "Adhesivos", clase_division: "3", grupo_embalaje: "I, II, III" },
  
  // Clase 4 - Sólidos inflamables
  { clave: "1325", descripcion: "Sólido orgánico inflamable, n.e.p.", clase_division: "4.1", grupo_embalaje: "II, III" },
  { clave: "1350", descripcion: "Azufre", clase_division: "4.1", grupo_embalaje: "III" },
  { clave: "1353", descripcion: "Fibras impregnadas de nitrocelulosa débilmente nitrada, n.e.p.", clase_division: "4.1", grupo_embalaje: "III" },
  { clave: "1355", descripcion: "Ácido pícrico, seco o humidificado con menos del 30% de agua", clase_division: "4.1", grupo_embalaje: "I" },
  
  // Clase 5 - Comburentes y peróxidos orgánicos
  { clave: "1450", descripcion: "Bromatos inorgánicos, n.e.p.", clase_division: "5.1", grupo_embalaje: "II, III" },
  { clave: "1461", descripcion: "Cloratos inorgánicos, n.e.p.", clase_division: "5.1", grupo_embalaje: "II, III" },
  { clave: "1470", descripcion: "Perclorato de plomo", clase_division: "5.1", grupo_embalaje: "II" },
  
  // Clase 6 - Sustancias tóxicas e infecciosas
  { clave: "1547", descripcion: "Anilina", clase_division: "6.1", grupo_embalaje: "II" },
  { clave: "1549", descripcion: "Compuestos inorgánicos de antimonio, n.e.p.", clase_division: "6.1", grupo_embalaje: "III" },
  { clave: "1551", descripcion: "Compuestos de arsénico, n.e.p.", clase_division: "6.1", grupo_embalaje: "I, II, III" },
  { clave: "1553", descripcion: "Ácido arsénico líquido", clase_division: "6.1", grupo_embalaje: "I" },
  { clave: "1554", descripcion: "Ácido arsénico sólido", clase_division: "6.1", grupo_embalaje: "I" },
  { clave: "1556", descripcion: "Compuesto de arsénico líquido, n.e.p.", clase_division: "6.1", grupo_embalaje: "I, II, III" },
  { clave: "1557", descripcion: "Compuesto de arsénico sólido, n.e.p.", clase_division: "6.1", grupo_embalaje: "I, II, III" },
  { clave: "1558", descripcion: "Arsénico", clase_division: "6.1", grupo_embalaje: "II" },
  { clave: "1559", descripcion: "Pentóxido de arsénico", clase_division: "6.1", grupo_embalaje: "II" },
  { clave: "1560", descripcion: "Tricloruro de arsénico", clase_division: "6.1", grupo_embalaje: "I" },
  
  // Clase 8 - Sustancias corrosivas
  { clave: "1760", descripcion: "Líquido corrosivo, n.e.p.", clase_division: "8", grupo_embalaje: "I, II, III" },
  { clave: "1789", descripcion: "Ácido clorhídrico", clase_division: "8", grupo_embalaje: "II, III" },
  { clave: "1790", descripcion: "Ácido fluorhídrico", clase_division: "8", grupo_embalaje: "I" },
  { clave: "1791", descripcion: "Hipoclorito en solución", clase_division: "8", grupo_embalaje: "II, III" },
  { clave: "1793", descripcion: "Ácido fosfórico", clase_division: "8", grupo_embalaje: "III" },
  { clave: "1805", descripcion: "Ácido fosfórico en solución", clase_division: "8", grupo_embalaje: "III" },
  { clave: "1824", descripcion: "Hidróxido de sodio en solución", clase_division: "8", grupo_embalaje: "II, III" },
  { clave: "1830", descripcion: "Ácido sulfúrico", clase_division: "8", grupo_embalaje: "II" },
  { clave: "1832", descripcion: "Ácido sulfúrico gastado", clase_division: "8", grupo_embalaje: "II" },
  { clave: "1840", descripcion: "Cloruro de cinc en solución", clase_division: "8", grupo_embalaje: "III" },
  
  // Clase 9 - Sustancias peligrosas varias
  { clave: "3077", descripcion: "Sustancia peligrosa para el medio ambiente, sólida, n.e.p.", clase_division: "9", grupo_embalaje: "III" },
  { clave: "3082", descripcion: "Sustancia peligrosa para el medio ambiente, líquida, n.e.p.", clase_division: "9", grupo_embalaje: "III" },
  { clave: "3090", descripcion: "Pilas de litio", clase_division: "9", grupo_embalaje: "-" },
  { clave: "3091", descripcion: "Pilas de litio instaladas en equipos", clase_division: "9", grupo_embalaje: "-" },
  { clave: "3480", descripcion: "Pilas de iones de litio", clase_division: "9", grupo_embalaje: "-" },
  { clave: "3481", descripcion: "Pilas de iones de litio instaladas en equipos", clase_division: "9", grupo_embalaje: "-" }
];

// Función helper para formatear items del catálogo
export const formatCatalogItem = (item: CatalogoSATItem) => ({
  value: item.clave,
  label: `${item.clave} - ${item.descripcion}`,
  descripcion: item.descripcion,
  clave: item.clave,
  simbolo: item.simbolo,
  clase_division: item.clase_division,
  grupo_embalaje: item.grupo_embalaje
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
    case 'materiales_peligrosos':
      return MATERIALES_PELIGROSOS_SAT.map(formatCatalogItem);
    default:
      return [];
  }
};

// Función para buscar en catálogos estáticos
export const searchCatalogoEstatico = (tipo: string, termino: string) => {
  const catalogo = getCatalogoEstatico(tipo);
  if (!termino || termino.length < 2) return catalogo.slice(0, 50);
  
  const terminoLower = termino.toLowerCase();
  return catalogo.filter(item => 
    item.clave.toLowerCase().includes(terminoLower) ||
    item.descripcion.toLowerCase().includes(terminoLower)
  ).slice(0, 100);
};
