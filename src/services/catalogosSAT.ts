
// Mock service for postal code consultation
export interface ConsultaCodigoPostalResult {
  estado: string;
  municipio: string;
  ciudad?: string;
  asentamientos?: Array<{
    nombre: string;
    tipo: string;
  }>;
}

export const consultarCodigoPostal = async (codigoPostal: string): Promise<ConsultaCodigoPostalResult | null> => {
  // Mock implementation - in production this would call the actual SAT API
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data based on common Mexican postal codes
    const mockData: Record<string, ConsultaCodigoPostalResult> = {
      '01000': {
        estado: 'Ciudad de México',
        municipio: 'Álvaro Obregón',
        ciudad: 'Ciudad de México',
        asentamientos: [
          { nombre: 'San Ángel', tipo: 'Colonia' }
        ]
      },
      '64000': {
        estado: 'Nuevo León',
        municipio: 'Monterrey',
        ciudad: 'Monterrey',
        asentamientos: [
          { nombre: 'Centro', tipo: 'Colonia' }
        ]
      }
    };
    
    return mockData[codigoPostal] || {
      estado: 'Estado Desconocido',
      municipio: 'Municipio Desconocido',
      ciudad: 'Ciudad Desconocida',
      asentamientos: []
    };
  } catch (error) {
    console.error('Error consultando código postal:', error);
    return null;
  }
};

// Mock CatalogosSATService for compatibility
export class CatalogosSATService {
  static async consultarCodigoPostal(cp: string) {
    return consultarCodigoPostal(cp);
  }
}
