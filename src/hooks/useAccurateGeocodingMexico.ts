
export interface MexicanCoordinates {
  lat: number;
  lng: number;
  ciudad: string;
  estado: string;
}

// Base de datos ampliada y más precisa de códigos postales mexicanos
export const codigosPostalesMexico: { [key: string]: MexicanCoordinates } = {
  // Ciudad de México - Coordenadas más precisas
  '01000': { lat: 19.4326, lng: -99.1332, ciudad: 'Ciudad de México', estado: 'CDMX' },
  '03100': { lat: 19.3927, lng: -99.1588, ciudad: 'Del Valle', estado: 'CDMX' },
  '06700': { lat: 19.4284, lng: -99.1676, ciudad: 'Roma Norte', estado: 'CDMX' },
  '11000': { lat: 19.4069, lng: -99.1716, ciudad: 'San Miguel Chapultepec', estado: 'CDMX' },
  '04100': { lat: 19.3880, lng: -99.1677, ciudad: 'Del Valle Centro', estado: 'CDMX' },
  '08100': { lat: 19.4978, lng: -99.1269, ciudad: 'Gustavo A. Madero', estado: 'CDMX' },
  
  // Morelos - Coordenadas corregidas y ampliadas
  '62577': { lat: 18.8711, lng: -99.2211, ciudad: 'Jiutepec', estado: 'Morelos' },
  '62574': { lat: 18.8750, lng: -99.2180, ciudad: 'Jiutepec Centro', estado: 'Morelos' },
  '62550': { lat: 18.8800, lng: -99.2150, ciudad: 'Jiutepec Norte', estado: 'Morelos' },
  '62000': { lat: 18.9187, lng: -99.2342, ciudad: 'Cuernavaca Centro', estado: 'Morelos' },
  '62100': { lat: 18.9050, lng: -99.2500, ciudad: 'Cuernavaca Norte', estado: 'Morelos' },
  
  // Baja California - Coordenadas más precisas
  '22000': { lat: 32.5149, lng: -117.0382, ciudad: 'Tijuana Centro', estado: 'Baja California' },
  '22010': { lat: 32.5200, lng: -117.0300, ciudad: 'Tijuana Norte', estado: 'Baja California' },
  '22020': { lat: 32.5100, lng: -117.0450, ciudad: 'Tijuana Sur', estado: 'Baja California' },
  '21000': { lat: 32.6519, lng: -115.4683, ciudad: 'Mexicali Centro', estado: 'Baja California' },
  '22800': { lat: 32.1543, lng: -116.6062, ciudad: 'Ensenada', estado: 'Baja California' },
  
  // Guadalajara, Jalisco - Coordenadas ampliadas
  '44100': { lat: 20.6597, lng: -103.3496, ciudad: 'Guadalajara Centro', estado: 'Jalisco' },
  '44110': { lat: 20.6650, lng: -103.3500, ciudad: 'Guadalajara Norte', estado: 'Jalisco' },
  '44200': { lat: 20.6700, lng: -103.3400, ciudad: 'Zapopan', estado: 'Jalisco' },
  '45000': { lat: 20.6767, lng: -103.3475, ciudad: 'Zapopan Centro', estado: 'Jalisco' },
  '44500': { lat: 20.6030, lng: -103.4172, ciudad: 'Tlajomulco', estado: 'Jalisco' },
  
  // Monterrey, Nuevo León - Coordenadas ampliadas
  '64000': { lat: 25.6866, lng: -100.3161, ciudad: 'Monterrey Centro', estado: 'Nuevo León' },
  '64010': { lat: 25.6900, lng: -100.3200, ciudad: 'Monterrey Norte', estado: 'Nuevo León' },
  '64100': { lat: 25.6800, lng: -100.3100, ciudad: 'San Pedro Garza García', estado: 'Nuevo León' },
  '66000': { lat: 25.6510, lng: -100.2920, ciudad: 'San Nicolás de los Garza', estado: 'Nuevo León' },
  '67000': { lat: 25.7785, lng: -100.1013, ciudad: 'Guadalupe', estado: 'Nuevo León' },
  
  // Puebla, Puebla - Coordenadas ampliadas
  '72000': { lat: 19.0414, lng: -98.2063, ciudad: 'Puebla Centro', estado: 'Puebla' },
  '72010': { lat: 19.0450, lng: -98.2100, ciudad: 'Puebla Norte', estado: 'Puebla' },
  '72100': { lat: 19.0300, lng: -98.1800, ciudad: 'Puebla Este', estado: 'Puebla' },
  
  // Mérida, Yucatán - Coordenadas ampliadas
  '97000': { lat: 20.9674, lng: -89.5926, ciudad: 'Mérida Centro', estado: 'Yucatán' },
  '97010': { lat: 20.9700, lng: -89.5900, ciudad: 'Mérida Norte', estado: 'Yucatán' },
  '97100': { lat: 20.9500, lng: -89.6200, ciudad: 'Mérida Sur', estado: 'Yucatán' },
  
  // Querétaro, Querétaro - Coordenadas ampliadas
  '76000': { lat: 20.5888, lng: -100.3899, ciudad: 'Querétaro Centro', estado: 'Querétaro' },
  '76010': { lat: 20.5900, lng: -100.3850, ciudad: 'Querétaro Norte', estado: 'Querétaro' },
  '76100': { lat: 20.6000, lng: -100.4000, ciudad: 'Querétaro Sur', estado: 'Querétaro' },
  
  // Cancún, Quintana Roo - Coordenadas ampliadas
  '77500': { lat: 21.1619, lng: -86.8515, ciudad: 'Cancún Centro', estado: 'Quintana Roo' },
  '77510': { lat: 21.1650, lng: -86.8480, ciudad: 'Cancún Norte', estado: 'Quintana Roo' },
  '77520': { lat: 21.1400, lng: -86.8600, ciudad: 'Cancún Sur', estado: 'Quintana Roo' },
  
  // León, Guanajuato - Coordenadas ampliadas
  '37000': { lat: 21.1619, lng: -101.6945, ciudad: 'León Centro', estado: 'Guanajuato' },
  '37010': { lat: 21.1650, lng: -101.6900, ciudad: 'León Norte', estado: 'Guanajuato' },
  '37100': { lat: 21.1500, lng: -101.7000, ciudad: 'León Sur', estado: 'Guanajuato' },
  
  // Estado de México - Coordenadas importantes
  '50000': { lat: 19.2833, lng: -99.6667, ciudad: 'Toluca Centro', estado: 'Estado de México' },
  '53000': { lat: 19.4914, lng: -99.2394, ciudad: 'Naucalpan Centro', estado: 'Estado de México' },
  '54000': { lat: 19.3581, lng: -99.2039, ciudad: 'Tlalnepantla', estado: 'Estado de México' },
  
  // Veracruz - Puerto importante
  '91700': { lat: 19.1738, lng: -96.1342, ciudad: 'Veracruz Puerto', estado: 'Veracruz' },
  '91000': { lat: 19.2006, lng: -96.1430, ciudad: 'Veracruz Centro', estado: 'Veracruz' },
};

export const useAccurateGeocodingMexico = () => {
  const geocodeByCodigoPostal = (codigoPostal: string): MexicanCoordinates | null => {
    if (!codigoPostal || codigoPostal.length !== 5) {
      console.warn(`⚠️ Código postal inválido: ${codigoPostal}`);
      return null;
    }

    const coords = codigosPostalesMexico[codigoPostal];
    if (coords) {
      console.log(`📍 Coordenadas precisas encontradas para CP ${codigoPostal}:`, coords);
      return coords;
    }
    
    // Buscar por aproximación (primeros 3 dígitos)
    const prefijo = codigoPostal.substring(0, 3);
    const coordinacionesSimilares = Object.entries(codigosPostalesMexico).find(([cp]) => 
      cp.startsWith(prefijo)
    );
    
    if (coordinacionesSimilares) {
      const [, coords] = coordinacionesSimilares;
      console.log(`📍 Coordenadas aproximadas para CP ${codigoPostal} (basado en ${prefijo}):`, coords);
      return coords;
    }
    
    console.warn(`⚠️ CP ${codigoPostal} no encontrado en la base de datos ampliada`);
    
    // Coordenadas por defecto (Ciudad de México) si no se encuentra
    return {
      lat: 19.4326,
      lng: -99.1332,
      ciudad: 'Ciudad de México',
      estado: 'CDMX'
    };
  };

  // Función para validar coordenadas
  const validateCoordinates = (coords: MexicanCoordinates | null): boolean => {
    if (!coords) return false;
    
    // Validar que las coordenadas estén dentro de México
    const isValidLat = coords.lat >= 14.5388 && coords.lat <= 32.7186;
    const isValidLng = coords.lng >= -118.4662 && coords.lng <= -86.7104;
    
    return isValidLat && isValidLng;
  };

  // Función para calcular distancia entre dos puntos (Haversine)
  const calculateDistance = (coords1: MexicanCoordinates, coords2: MexicanCoordinates): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return { 
    geocodeByCodigoPostal,
    validateCoordinates,
    calculateDistance
  };
};
