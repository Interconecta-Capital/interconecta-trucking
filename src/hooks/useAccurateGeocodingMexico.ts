
export interface MexicanCoordinates {
  lat: number;
  lng: number;
  ciudad: string;
  estado: string;
}

// Base de datos más precisa de códigos postales mexicanos
export const codigosPostalesMexico: { [key: string]: MexicanCoordinates } = {
  // Ciudad de México
  '01000': { lat: 19.4326, lng: -99.1332, ciudad: 'Ciudad de México', estado: 'CDMX' },
  '03100': { lat: 19.3927, lng: -99.1588, ciudad: 'Del Valle', estado: 'CDMX' },
  '06700': { lat: 19.4284, lng: -99.1676, ciudad: 'Roma Norte', estado: 'CDMX' },
  '11000': { lat: 19.4069, lng: -99.1716, ciudad: 'San Miguel Chapultepec', estado: 'CDMX' },
  
  // Morelos - Jiutepec (corrección de coordenadas)
  '62577': { lat: 18.8814, lng: -99.1875, ciudad: 'Jiutepec', estado: 'Morelos' },
  '62574': { lat: 18.8814, lng: -99.1875, ciudad: 'Jiutepec', estado: 'Morelos' },
  '62550': { lat: 18.8814, lng: -99.1875, ciudad: 'Jiutepec', estado: 'Morelos' },
  
  // Baja California - Tijuana (corrección de coordenadas)
  '22000': { lat: 32.5149, lng: -117.0382, ciudad: 'Tijuana', estado: 'Baja California' },
  '22010': { lat: 32.5149, lng: -117.0382, ciudad: 'Tijuana', estado: 'Baja California' },
  '22020': { lat: 32.5149, lng: -117.0382, ciudad: 'Tijuana', estado: 'Baja California' },
  
  // Guadalajara, Jalisco
  '44100': { lat: 20.6597, lng: -103.3496, ciudad: 'Guadalajara', estado: 'Jalisco' },
  '44110': { lat: 20.6597, lng: -103.3496, ciudad: 'Guadalajara', estado: 'Jalisco' },
  
  // Monterrey, Nuevo León
  '64000': { lat: 25.6866, lng: -100.3161, ciudad: 'Monterrey', estado: 'Nuevo León' },
  '64010': { lat: 25.6866, lng: -100.3161, ciudad: 'Monterrey', estado: 'Nuevo León' },
  
  // Puebla, Puebla
  '72000': { lat: 19.0414, lng: -98.2063, ciudad: 'Puebla', estado: 'Puebla' },
  '72010': { lat: 19.0414, lng: -98.2063, ciudad: 'Puebla', estado: 'Puebla' },
  
  // Mérida, Yucatán
  '97000': { lat: 20.9674, lng: -89.5926, ciudad: 'Mérida', estado: 'Yucatán' },
  '97010': { lat: 20.9674, lng: -89.5926, ciudad: 'Mérida', estado: 'Yucatán' },
};

export const useAccurateGeocodingMexico = () => {
  const geocodeByCodigoPostal = (codigoPostal: string): MexicanCoordinates | null => {
    const coords = codigosPostalesMexico[codigoPostal];
    if (coords) {
      console.log(`📍 Coordenadas encontradas para CP ${codigoPostal}:`, coords);
      return coords;
    }
    
    console.warn(`⚠️ CP ${codigoPostal} no encontrado en la base de datos`);
    
    // Coordenadas por defecto (Ciudad de México) si no se encuentra
    return {
      lat: 19.4326,
      lng: -99.1332,
      ciudad: 'Ciudad de México',
      estado: 'CDMX'
    };
  };

  return { geocodeByCodigoPostal };
};
