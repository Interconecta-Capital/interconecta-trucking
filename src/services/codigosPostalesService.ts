
export interface DireccionCompleta {
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad?: string;
  colonias: string[];
}

export interface RespuestaSEPOMEX {
  error: boolean;
  code_zip: string;
  zip_code: string;
  municipality: string;
  state: string;
  city: string;
  d_city: string;
  d_state: string;
  d_mnp: string;
  d_CP: string;
  d_asenta: string;
  d_tipo_asenta: string;
  d_codigo: string;
  c_estado: string;
  c_oficina: string;
  c_CP: string;
  c_tipo_asenta: string;
  c_mnp: string;
  id_asenta_cpcons: string;
  response: Array<{
    d_asenta: string;
    d_tipo_asenta: string;
    d_mnp: string;
    d_estado: string;
    d_ciudad: string;
    d_CP: string;
    c_estado: string;
    c_oficina: string;
    c_CP: string;
    c_tipo_asenta: string;
    c_mnp: string;
    id_asenta_cpcons: string;
  }>;
}

class CodigosPostalesService {
  private readonly baseURL = 'https://api-sepomex.hckdrk.mx/query/info_cp';
  private cache = new Map<string, DireccionCompleta>();

  async buscarDireccionPorCP(codigoPostal: string): Promise<DireccionCompleta | null> {
    // Validar formato
    if (!/^\d{5}$/.test(codigoPostal)) {
      return null;
    }

    // Verificar cache
    if (this.cache.has(codigoPostal)) {
      return this.cache.get(codigoPostal)!;
    }

    try {
      const response = await fetch(`${this.baseURL}/${codigoPostal}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RespuestaSEPOMEX = await response.json();

      if (data.error || !data.response || data.response.length === 0) {
        return null;
      }

      // Procesar respuesta
      const primeraRespuesta = data.response[0];
      const todasLasColonias = data.response.map(item => item.d_asenta);
      const coloniasUnicas = [...new Set(todasLasColonias)].sort();

      const direccionCompleta: DireccionCompleta = {
        codigoPostal: codigoPostal,
        estado: primeraRespuesta.d_estado,
        municipio: primeraRespuesta.d_mnp,
        localidad: primeraRespuesta.d_ciudad,
        colonias: coloniasUnicas
      };

      // Guardar en cache
      this.cache.set(codigoPostal, direccionCompleta);

      return direccionCompleta;
    } catch (error) {
      console.error('Error al consultar código postal:', error);
      return null;
    }
  }

  // Limpiar cache si es necesario
  limpiarCache(): void {
    this.cache.clear();
  }

  // Obtener datos del cache
  obtenerDelCache(codigoPostal: string): DireccionCompleta | null {
    return this.cache.get(codigoPostal) || null;
  }
}

export const codigosPostalesService = new CodigosPostalesService();
