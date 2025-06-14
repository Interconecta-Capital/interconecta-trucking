import { CatalogoEmbalaje, CatalogoCarroceria, CatalogoTipoLicencia } from '@/types/cartaPorte';
import { CatalogItem } from './catalogosSAT';

// Catálogo de tipos de embalaje SAT
export const catalogoTiposEmbalaje: CatalogoEmbalaje[] = [
  { clave: '1A1', descripcion: 'Tambor de acero con tapa no desmontable' },
  { clave: '1A2', descripcion: 'Tambor de acero con tapa desmontable' },
  { clave: '1B1', descripcion: 'Tambor de aluminio con tapa no desmontable' },
  { clave: '1B2', descripcion: 'Tambor de aluminio con tapa desmontable' },
  { clave: '1N1', descripcion: 'Tambor de metal con tapa no desmontable' },
  { clave: '1N2', descripcion: 'Tambor de metal con tapa desmontable' },
  { clave: '1H1', descripcion: 'Tambor de plástico con tapa no desmontable' },
  { clave: '1H2', descripcion: 'Tambor de plástico con tapa desmontable' },
  { clave: '1G', descripcion: 'Tambor de cartón' },
  { clave: '1D', descripcion: 'Tambor de madera contrachapada' },
  { clave: '3A1', descripcion: 'Bidón de acero con tapa no desmontable' },
  { clave: '3A2', descripcion: 'Bidón de acero con tapa desmontable' },
  { clave: '3B1', descripcion: 'Bidón de aluminio con tapa no desmontable' },
  { clave: '3B2', descripcion: 'Bidón de aluminio con tapa desmontable' },
  { clave: '3H1', descripcion: 'Bidón de plástico con tapa no desmontable' },
  { clave: '3H2', descripcion: 'Bidón de plástico con tapa desmontable' },
  { clave: '4A', descripcion: 'Caja de acero' },
  { clave: '4B', descripcion: 'Caja de aluminio' },
  { clave: '4N', descripcion: 'Caja de metal' },
  { clave: '4C1', descripcion: 'Caja de madera natural' },
  { clave: '4C2', descripcion: 'Caja de madera contrachapada' },
  { clave: '4D', descripcion: 'Caja de cartón' },
  { clave: '4F', descripcion: 'Caja de madera reconstituida' },
  { clave: '4G', descripcion: 'Caja de cartón' },
  { clave: '4H1', descripcion: 'Caja de plástico expandido' },
  { clave: '4H2', descripcion: 'Caja de plástico rígido' },
  { clave: '5H1', descripcion: 'Saco de plástico tejido' },
  { clave: '5H2', descripcion: 'Saco de plástico flexible' },
  { clave: '5H3', descripcion: 'Saco de película de plástico' },
  { clave: '5H4', descripcion: 'Saco de plástico tejido con forro' },
  { clave: '5L1', descripcion: 'Saco de textil' },
  { clave: '5L2', descripcion: 'Saco de textil con forro' },
  { clave: '5L3', descripcion: 'Saco de textil resistente al agua' },
  { clave: '5M1', descripcion: 'Saco de papel multipared' },
  { clave: '5M2', descripcion: 'Saco de papel multipared resistente al agua' },
  { clave: '6HA1', descripcion: 'Embalaje compuesto de plástico' },
  { clave: '6HB1', descripcion: 'Embalaje compuesto de plástico' },
  { clave: '6HC', descripcion: 'Embalaje compuesto de plástico sólido' },
  { clave: '6HD1', descripcion: 'Embalaje compuesto de plástico para líquidos' },
  { clave: '6HG1', descripcion: 'Embalaje compuesto de plástico para sólidos' },
  { clave: '6HH1', descripcion: 'Embalaje compuesto de plástico expandido' },
  { clave: 'ZZ', descripcion: 'Embalaje definido mutuamente' }
];

// Catálogo de tipos de carrocería SAT
export const catalogoTiposCarroceria: CatalogoCarroceria[] = [
  { clave: '01', descripcion: 'Caja seca' },
  { clave: '02', descripcion: 'Caja refrigerada' },
  { clave: '03', descripcion: 'Tolva granelera' },
  { clave: '04', descripcion: 'Tolva cementera' },
  { clave: '05', descripcion: 'Góndola' },
  { clave: '06', descripcion: 'Plataforma' },
  { clave: '07', descripcion: 'Tanque' },
  { clave: '08', descripcion: 'Madrina' },
  { clave: '09', descripcion: 'Cama baja' },
  { clave: '10', descripcion: 'Volteo' },
  { clave: '11', descripcion: 'Grúa' },
  { clave: '12', descripcion: 'Mezclador' },
  { clave: '13', descripcion: 'Recolector compactador' },
  { clave: '14', descripcion: 'Blindado' },
  { clave: '15', descripcion: 'Jaula' },
  { clave: '16', descripcion: 'Porta contenedores' },
  { clave: '17', descripcion: 'Porta automóviles' },
  { clave: '18', descripcion: 'Ganado' },
  { clave: '19', descripcion: 'Redilas' },
  { clave: '20', descripcion: 'Otra' }
];

// Catálogo de tipos de licencia SAT
export const catalogoTiposLicencia: CatalogoTipoLicencia[] = [
  { clave: 'A', descripcion: 'Motocicletas', aplica_federal: false },
  { clave: 'B', descripcion: 'Automóviles', aplica_federal: false },
  { clave: 'C', descripcion: 'Camiones unitarios', aplica_federal: true },
  { clave: 'D', descripcion: 'Autobuses', aplica_federal: true },
  { clave: 'E', descripcion: 'Tractocamiones', aplica_federal: true },
  { clave: 'F', descripcion: 'Licencia federal', aplica_federal: true }
];

// Catálogo mejorado de fracciones arancelarias (muestra)
export const catalogoFraccionesArancelarias: CatalogItem[] = [
  { codigo: '01012100', descripcion: 'Animales vivos de la especie equina, reproductores de raza pura', value: '01012100', label: '01012100 - Caballos reproductores de raza pura' },
  { codigo: '02011000', descripcion: 'Carne de bovino, fresca o refrigerada', value: '02011000', label: '02011000 - Canales y medias canales de bovino' },
  { codigo: '84071000', descripcion: 'Motores de encendido por chispa', value: '84071000', label: '84071000 - Motores de pistón alternativo' },
  { codigo: '87041000', descripcion: 'Vehículos automotores para transporte de mercancías', value: '87041000', label: '87041000 - Volquetes automotores' },
  { codigo: '25232900', descripcion: 'Cemento Portland y demás cementos hidráulicos', value: '25232900', label: '25232900 - Cementos hidráulicos' },
  { codigo: '27101911', descripcion: 'Combustibles derivados del petróleo', value: '27101911', label: '27101911 - Gasolina sin tetraetilo de plomo' },
  { codigo: '15179099', descripcion: 'Aceites y grasas vegetales y sus fracciones', value: '15179099', label: '15179099 - Mezclas de aceites vegetales' }
];

// Servicio extendido para catálogos SAT
export class CatalogosSATExtendido {
  // Obtener tipos de embalaje
  static buscarTiposEmbalaje(busqueda?: string): CatalogItem[] {
    const items = catalogoTiposEmbalaje.map(item => ({
      codigo: item.clave,
      descripcion: item.descripcion,
      value: item.clave,
      label: `${item.clave} - ${item.descripcion}`
    }));

    if (!busqueda) return items;
    
    return items.filter(item => 
      item.label!.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Obtener tipos de carrocería
  static buscarTiposCarroceria(busqueda?: string): CatalogItem[] {
    const items = catalogoTiposCarroceria.map(item => ({
      codigo: item.clave,
      descripcion: item.descripcion,
      value: item.clave,
      label: `${item.clave} - ${item.descripcion}`
    }));

    if (!busqueda) return items;
    
    return items.filter(item => 
      item.label!.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Obtener tipos de licencia
  static buscarTiposLicencia(busqueda?: string): CatalogItem[] {
    const items = catalogoTiposLicencia.map(item => ({
      codigo: item.clave,
      descripcion: item.descripcion,
      value: item.clave,
      label: `${item.clave} - ${item.descripcion}`
    }));

    if (!busqueda) return items;
    
    return items.filter(item => 
      item.label!.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Obtener fracciones arancelarias
  static buscarFraccionesArancelarias(busqueda?: string): CatalogItem[] {
    if (!busqueda || busqueda.length < 2) return [];
    
    return catalogoFraccionesArancelarias.filter(item => 
      item.codigo.includes(busqueda) ||
      item.label!.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Validar VIN (Número de serie vehicular)
  static validarVIN(vin: string): { valido: boolean; mensaje?: string } {
    if (!vin) return { valido: true };
    
    // VIN debe tener exactamente 17 caracteres
    if (vin.length !== 17) {
      return { valido: false, mensaje: 'El VIN debe tener exactamente 17 caracteres' };
    }
    
    // VIN no debe contener I, O, Q
    if (/[IOQ]/.test(vin)) {
      return { valido: false, mensaje: 'El VIN no puede contener las letras I, O, Q' };
    }
    
    // Solo letras y números
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return { valido: false, mensaje: 'El VIN solo puede contener letras (excepto I,O,Q) y números' };
    }
    
    return { valido: true };
  }

  // Validar CURP
  static validarCURP(curp: string): { valido: boolean; mensaje?: string } {
    if (!curp) return { valido: true };
    
    const curpRegex = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}[0-1][0-9][0-3][0-9][HM]{1}[A-Z]{2}[BCDFGHJKLMNPQRSTVWXYZ]{1}[0-9A-Z]{1}[0-9]{1}$/;
    
    if (!curpRegex.test(curp)) {
      return { valido: false, mensaje: 'Formato de CURP inválido' };
    }
    
    return { valido: true };
  }

  // Calcular coordenadas aproximadas por código postal (mock)
  static async calcularCoordenadas(codigoPostal: string): Promise<{ latitud: number; longitud: number } | null> {
    // Mock de coordenadas por código postal - en producción usar API real
    const coordenadasMock: Record<string, { latitud: number; longitud: number }> = {
      '01000': { latitud: 19.4326, longitud: -99.1332 }, // CDMX
      '44100': { latitud: 20.6597, longitud: -103.3496 }, // Guadalajara
      '64000': { latitud: 25.6866, longitud: -100.3161 }, // Monterrey
      '21000': { latitud: 32.5027, longitud: -117.0037 }, // Tijuana
      '22000': { latitud: 32.5027, longitud: -117.0037 }, // Tijuana
      '80000': { latitud: 25.7923, longitud: -108.9857 }, // Culiacán
    };

    return coordenadasMock[codigoPostal] || null;
  }
}
