
export interface CodigoPostalData {
  estado: string;
  municipio: string;
  localidad?: string;
  colonias: string[];
}

// Dataset de códigos postales mexicanos más comunes
// Incluye el problemático 62577 y otros CPs frecuentes
export const codigosPostalesMexico: Record<string, CodigoPostalData> = {
  // CDMX - Códigos más comunes
  "03100": {
    estado: "Ciudad de México",
    municipio: "Benito Juárez",
    localidad: "Ciudad de México",
    colonias: ["Del Valle Centro"]
  },
  "06600": {
    estado: "Ciudad de México", 
    municipio: "Cuauhtémoc",
    localidad: "Ciudad de México",
    colonias: ["Roma Norte"]
  },
  "11000": {
    estado: "Ciudad de México",
    municipio: "Miguel Hidalgo", 
    localidad: "Ciudad de México",
    colonias: ["Lomas de Chapultepec"]
  },
  "01000": {
    estado: "Ciudad de México",
    municipio: "Álvaro Obregón",
    localidad: "Ciudad de México", 
    colonias: ["San Ángel"]
  },
  
  // Guadalajara, Jalisco
  "44100": {
    estado: "Jalisco",
    municipio: "Guadalajara",
    localidad: "Guadalajara",
    colonias: ["Centro"]
  },
  "44600": {
    estado: "Jalisco",
    municipio: "Guadalajara", 
    localidad: "Guadalajara",
    colonias: ["Lafayette"]
  },
  "45050": {
    estado: "Jalisco",
    municipio: "Zapopan",
    localidad: "Zapopan",
    colonias: ["Ciudad Granja"]
  },
  
  // Monterrey, Nuevo León
  "64000": {
    estado: "Nuevo León",
    municipio: "Monterrey",
    localidad: "Monterrey", 
    colonias: ["Centro"]
  },
  "66220": {
    estado: "Nuevo León",
    municipio: "San Pedro Garza García",
    localidad: "San Pedro Garza García",
    colonias: ["Del Valle"]
  },
  "64720": {
    estado: "Nuevo León",
    municipio: "Monterrey",
    localidad: "Monterrey",
    colonias: ["Residencial San Agustín"]
  },
  
  // Puebla
  "72000": {
    estado: "Puebla",
    municipio: "Puebla",
    localidad: "Puebla de Zaragoza",
    colonias: ["Centro"]
  },
  "72400": {
    estado: "Puebla", 
    municipio: "Puebla",
    localidad: "Puebla de Zaragoza",
    colonias: ["San Manuel"]
  },
  
  // Tijuana, Baja California
  "22000": {
    estado: "Baja California",
    municipio: "Tijuana",
    localidad: "Tijuana",
    colonias: ["Zona Centro"]
  },
  "22500": {
    estado: "Baja California",
    municipio: "Tijuana", 
    localidad: "Tijuana",
    colonias: ["La Mesa"]
  },
  
  // León, Guanajuato
  "37000": {
    estado: "Guanajuato",
    municipio: "León",
    localidad: "León de Los Aldama",
    colonias: ["Centro"]
  },
  "37180": {
    estado: "Guanajuato",
    municipio: "León",
    localidad: "León de Los Aldama", 
    colonias: ["Jardines de Jerez"]
  },
  
  // Mérida, Yucatán
  "97000": {
    estado: "Yucatán",
    municipio: "Mérida",
    localidad: "Mérida",
    colonias: ["Centro"]
  },
  "97070": {
    estado: "Yucatán",
    municipio: "Mérida",
    localidad: "Mérida",
    colonias: ["Francisco de Montejo"]
  },
  
  // Cancún, Quintana Roo
  "77500": {
    estado: "Quintana Roo",
    municipio: "Benito Juárez",
    localidad: "Cancún",
    colonias: ["Centro"]
  },
  "77520": {
    estado: "Quintana Roo",
    municipio: "Benito Juárez", 
    localidad: "Cancún",
    colonias: ["Supermanzana 4 A"]
  },
  
  // El problemático 62577 - Jiutepec, Morelos
  "62577": {
    estado: "Morelos",
    municipio: "Jiutepec",
    localidad: "Jiutepec",
    colonias: ["Ampliación Bugambilias"]
  },
  
  // Más códigos de Morelos para completar la zona
  "62574": {
    estado: "Morelos",
    municipio: "Jiutepec", 
    localidad: "Jiutepec",
    colonias: ["Bugambilias"]
  },
  "62575": {
    estado: "Morelos",
    municipio: "Jiutepec",
    localidad: "Jiutepec", 
    colonias: ["Las Flores"]
  },
  "62576": {
    estado: "Morelos",
    municipio: "Jiutepec",
    localidad: "Jiutepec",
    colonias: ["Jardines de Jiutepec"]
  },
  
  // Más CPs comunes en diferentes estados
  "20000": {
    estado: "Aguascalientes",
    municipio: "Aguascalientes",
    localidad: "Aguascalientes",
    colonias: ["Centro"]
  },
  "25000": {
    estado: "Coahuila de Zaragoza",
    municipio: "Saltillo",
    localidad: "Saltillo", 
    colonias: ["Centro"]
  },
  "28000": {
    estado: "Colima",
    municipio: "Colima",
    localidad: "Colima",
    colonias: ["Centro"]
  },
  "31000": {
    estado: "Chihuahua",
    municipio: "Chihuahua",
    localidad: "Chihuahua",
    colonias: ["Centro"]
  },
  "29000": {
    estado: "Chiapas",
    municipio: "Tuxtla Gutiérrez",
    localidad: "Tuxtla Gutiérrez",
    colonias: ["Centro"]
  },
  "50000": {
    estado: "México",
    municipio: "Toluca",
    localidad: "Toluca de Lerdo",
    colonias: ["Centro"]
  },
  "54000": {
    estado: "México",
    municipio: "Tlalnepantla de Baz",
    localidad: "Tlalnepantla de Baz",
    colonias: ["Centro"]
  },
  "55700": {
    estado: "México",
    municipio: "Cuautitlán Izcalli",
    localidad: "Cuautitlán Izcalli",
    colonias: ["Centro Urbano"]
  }
};

// Función para buscar código postal en datos locales
export function buscarCodigoPostalLocal(cp: string): CodigoPostalData | null {
  const codigo = cp.trim();
  return codigosPostalesMexico[codigo] || null;
}

// Función para validar formato de código postal mexicano
export function validarFormatoCP(cp: string): boolean {
  return /^\d{5}$/.test(cp.trim());
}

// Función para sugerir códigos postales similares
export function sugerirCodigosPostalesSimilares(cp: string): string[] {
  if (!cp || cp.length < 2) return [];
  
  const prefijo = cp.substring(0, 2);
  return Object.keys(codigosPostalesMexico)
    .filter(codigo => codigo.startsWith(prefijo) && codigo !== cp)
    .slice(0, 5);
}
