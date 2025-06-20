
export interface MexicanCoordinates {
  lat: number;
  lng: number;
  ciudad: string;
  estado: string;
}

// Base de datos ampliada y más precisa de códigos postales mexicanos
export const codigosPostalesMexico: { [key: string]: MexicanCoordinates } = {
  // Ciudad de México
  '01000': { lat: 19.4326, lng: -99.1332, ciudad: 'Ciudad de México', estado: 'CDMX' },
  '03100': { lat: 19.3927, lng: -99.1588, ciudad: 'Del Valle', estado: 'CDMX' },
  '06700': { lat: 19.4284, lng: -99.1676, ciudad: 'Roma Norte', estado: 'CDMX' },
  '11000': { lat: 19.4069, lng: -99.1716, ciudad: 'San Miguel Chapultepec', estado: 'CDMX' },
  
  // Morelos - Jiutepec (coordenadas corregidas más precisas)
  '62577': { lat: 18.8711, lng: -99.2211, ciudad: 'Jiutepec', estado: 'Morelos' },
  '62574': { lat: 18.8711, lng: -99.2211, ciudad: 'Jiutepec', estado: 'Morelos' },
  '62550': { lat: 18.8800, lng: -99.2150, ciudad: 'Jiutepec Centro', estado: 'Morelos' },
  
  // Baja California - Tijuana (coordenadas más precisas)
  '22000': { lat: 32.5149, lng: -117.0382, ciudad: 'Tijuana Centro', estado: 'Baja California' },
  '22010': { lat: 32.5200, lng: -117.0300, ciudad: 'Tijuana Norte', estado: 'Baja California' },
  '22020': { lat: 32.5100, lng: -117.0450, ciudad: 'Tijuana Sur', estado: 'Baja California' },
  
  // Guadalajara, Jalisco
  '44100': { lat: 20.6597, lng: -103.3496, ciudad: 'Guadalajara Centro', estado: 'Jalisco' },
  '44110': { lat: 20.6650, lng: -103.3500, ciudad: 'Guadalajara Norte', estado: 'Jalisco' },
  '44200': { lat: 20.6700, lng: -103.3400, ciudad: 'Zapopan', estado: 'Jalisco' },
  
  // Monterrey, Nuevo León
  '64000': { lat: 25.6866, lng: -100.3161, ciudad: 'Monterrey Centro', estado: 'Nuevo León' },
  '64010': { lat: 25.6900, lng: -100.3200, ciudad: 'Monterrey Norte', estado: 'Nuevo León' },
  '64100': { lat: 25.6800, lng: -100.3100, ciudad: 'San Pedro Garza García', estado: 'Nuevo León' },
  
  // Puebla, Puebla
  '72000': { lat: 19.0414, lng: -98.2063, ciudad: 'Puebla Centro', estado: 'Puebla' },
  '72010': { lat: 19.0450, lng: -98.2100, ciudad: 'Puebla Norte', estado: 'Puebla' },
  
  // Mérida, Yucatán
  '97000': { lat: 20.9674, lng: -89.5926, ciudad: 'Mérida Centro', estado: 'Yucatán' },
  '97010': { lat: 20.9700, lng: -89.5900, ciudad: 'Mérida Norte', estado: 'Yucatán' },
  
  // Querétaro, Querétaro
  '76000': { lat: 20.5888, lng: -100.3899, ciudad: 'Querétaro Centro', estado: 'Querétaro' },
  '76010': { lat: 20.5900, lng: -100.3850, ciudad: 'Querétaro Norte', estado: 'Querétaro' },
  
  // Cancún, Quintana Roo
  '77500': { lat: 21.1619, lng: -86.8515, ciudad: 'Cancún Centro', estado: 'Quintana Roo' },
  '77510': { lat: 21.1650, lng: -86.8480, ciudad: 'Cancún Norte', estado: 'Quintana Roo' },
  
  // León, Guanajuato
  '37000': { lat: 21.1619, lng: -101.6945, ciudad: 'León Centro', estado: 'Guanajuato' },
  '37010': { lat: 21.1650, lng: -101.6900, ciudad: 'León Norte', estado: 'Guanajuato' },
};

export const useAccurateGeocodingMexico = () => {
  const geocodeByCodigoPostal = (codigoPostal: string): MexicanCoordinates | null => {
    const coords = codigosPostalesMexico[codigoPostal];
    if (coords) {
      console.log(`📍 Coordenadas precisas encontradas para CP ${codigoPostal}:`, coords);
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

  // Función para obtener coordenadas vía Mapbox (para implementación futura)
  const geocodeViaMapbox = async (address: string): Promise<MexicanCoordinates | null> => {
    try {
      // Esta función se puede implementar con la API de Mapbox en el futuro
      console.log('🗺️ Geocodificación vía Mapbox (pendiente de implementar):', address);
      return null;
    } catch (error) {
      console.error('Error en geocodificación Mapbox:', error);
      return null;
    }
  };

  return { 
    geocodeByCodigoPostal, 
    geocodeViaMapbox 
  };
};
