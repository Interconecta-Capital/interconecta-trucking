
// Interfaces principales para el sistema de catálogos SAT
export interface CatalogItem {
  value: string;
  label: string;
  descripcion?: string;
  id?: string;
  clave?: string;
  nombre?: string;
}

export interface CodigoPostalInfo {
  codigo_postal: string;
  estado_clave: string;
  estado_descripcion: string;
  municipio_clave: string;
  municipio_descripcion: string;
  localidad_clave: string;
  localidad_descripcion: string;
}

export interface ColoniaInfo {
  colonia: string;
  codigo_postal: string;
  estado: string;
  municipio: string;
  localidad: string;
}

// Servicio principal para catálogos SAT
export class CatalogosSATService {
  
  // Validar formato de código postal
  static validarFormatoCodigoPostal(codigo: string): boolean {
    return /^\d{5}$/.test(codigo);
  }

  // Buscar productos y servicios
  static async buscarProductosServicios(busqueda: string): Promise<CatalogItem[]> {
    // Mock data - en producción conectar a API real
    const mockData: CatalogItem[] = [
      { value: '78101800', label: '78101800 - Servicios de transporte de carga', descripcion: 'Servicios de transporte de carga por carretera' },
      { value: '78101801', label: '78101801 - Transporte especializado', descripcion: 'Transporte especializado de mercancías' }
    ];
    
    if (!busqueda) return mockData;
    
    return mockData.filter(item => 
      item.label.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Buscar claves de unidad
  static async buscarClaveUnidad(busqueda: string): Promise<CatalogItem[]> {
    const mockData: CatalogItem[] = [
      { value: 'PZA', label: 'PZA - Pieza', descripcion: 'Unidad de medida: Pieza' },
      { value: 'KGM', label: 'KGM - Kilogramo', descripcion: 'Unidad de medida: Kilogramo' },
      { value: 'LTR', label: 'LTR - Litro', descripcion: 'Unidad de medida: Litro' }
    ];
    
    if (!busqueda) return mockData;
    
    return mockData.filter(item => 
      item.label.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Buscar código postal
  static async buscarCodigoPostal(codigo: string): Promise<CodigoPostalInfo | null> {
    if (!this.validarFormatoCodigoPostal(codigo)) {
      return null;
    }

    // Mock data - en producción conectar a API real
    return {
      codigo_postal: codigo,
      estado_clave: '09',
      estado_descripcion: 'Ciudad de México',
      municipio_clave: '015',
      municipio_descripcion: 'Benito Juárez',
      localidad_clave: '001',
      localidad_descripcion: 'Ciudad de México'
    };
  }

  // Buscar colonias por código postal
  static async buscarColoniasPorCP(codigo: string): Promise<ColoniaInfo[]> {
    if (!this.validarFormatoCodigoPostal(codigo)) {
      return [];
    }

    // Mock data - en producción conectar a API real
    return [
      {
        colonia: 'Del Valle Centro',
        codigo_postal: codigo,
        estado: 'Ciudad de México',
        municipio: 'Benito Juárez',
        localidad: 'Ciudad de México'
      }
    ];
  }

  // Buscar tipos de permiso
  static async buscarTiposPermiso(busqueda?: string): Promise<CatalogItem[]> {
    const mockData: CatalogItem[] = [
      { value: 'TPAF01', label: 'TPAF01 - Autotransporte Federal', descripcion: 'Permiso de autotransporte federal' },
      { value: 'TPAF02', label: 'TPAF02 - Transporte privado', descripcion: 'Permiso de transporte privado' }
    ];
    
    if (!busqueda) return mockData;
    
    return mockData.filter(item => 
      item.label.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Buscar configuraciones de vehículo
  static async buscarConfiguracionesVehiculo(busqueda?: string): Promise<CatalogItem[]> {
    const mockData: CatalogItem[] = [
      { value: 'VL', label: 'VL - Vehículo Ligero', descripcion: 'Configuración vehicular ligera' },
      { value: 'C2', label: 'C2 - Camión Unitario', descripcion: 'Camión de dos ejes' }
    ];
    
    if (!busqueda) return mockData;
    
    return mockData.filter(item => 
      item.label.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Buscar figuras de transporte
  static async buscarFigurasTransporte(busqueda?: string): Promise<CatalogItem[]> {
    const mockData: CatalogItem[] = [
      { value: '01', label: '01 - Operador', descripcion: 'Operador de autotransporte federal' },
      { value: '02', label: '02 - Propietario', descripcion: 'Propietario del autotransporte' }
    ];
    
    if (!busqueda) return mockData;
    
    return mockData.filter(item => 
      item.label.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Buscar subtipos de remolque
  static async buscarSubtiposRemolque(busqueda?: string): Promise<CatalogItem[]> {
    const mockData: CatalogItem[] = [
      { value: 'CTR001', label: 'CTR001 - Caja cerrada', descripcion: 'Remolque tipo caja cerrada' },
      { value: 'CTR002', label: 'CTR002 - Tanque', descripcion: 'Remolque tipo tanque' }
    ];
    
    if (!busqueda) return mockData;
    
    return mockData.filter(item => 
      item.label.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Buscar materiales peligrosos
  static async buscarMaterialesPeligrosos(busqueda: string): Promise<CatalogItem[]> {
    const mockData: CatalogItem[] = [
      { value: '1203', label: '1203 - Gasolina', descripcion: 'Material peligroso: Gasolina' },
      { value: '1202', label: '1202 - Diésel', descripcion: 'Material peligroso: Combustible diésel' }
    ];
    
    if (!busqueda) return mockData;
    
    return mockData.filter(item => 
      item.label.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Buscar estados
  static async buscarEstados(busqueda?: string): Promise<CatalogItem[]> {
    const mockData: CatalogItem[] = [
      { value: '09', label: '09 - Ciudad de México', descripcion: 'Ciudad de México' },
      { value: '15', label: '15 - Estado de México', descripcion: 'Estado de México' }
    ];
    
    if (!busqueda) return mockData;
    
    return mockData.filter(item => 
      item.label.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Validar clave
  static async validarClave(catalogo: string, clave: string): Promise<boolean> {
    // Mock validation - en producción conectar a API real
    return clave.length > 0;
  }
}
