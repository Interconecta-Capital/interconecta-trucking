
export interface FaunaSilvestreInfo {
  nombreComun: string;
  nombreCientifico: string;
  claveNOM059: string;
  estatusProteccion: string;
  cites: string;
  requierePermisoSEMARNAT: boolean;
  requiereAutorizacionTraslado: boolean;
  normativaNOM051: boolean;
}

export class CatalogosFaunaSilvestre {
  
  private static especiesProtegidas: Record<string, FaunaSilvestreInfo> = {
    'jaguar': {
      nombreComun: 'Jaguar',
      nombreCientifico: 'Panthera onca',
      claveNOM059: 'P',
      estatusProteccion: 'En Peligro de Extinción',
      cites: 'Apéndice I',
      requierePermisoSEMARNAT: true,
      requiereAutorizacionTraslado: true,
      normativaNOM051: true
    },
    'ocelote': {
      nombreComun: 'Ocelote',
      nombreCientifico: 'Leopardus pardalis',
      claveNOM059: 'P',
      estatusProteccion: 'En Peligro de Extinción',
      cites: 'Apéndice I',
      requierePermisoSEMARNAT: true,
      requiereAutorizacionTraslado: true,
      normativaNOM051: true
    },
    'quetzal': {
      nombreComun: 'Quetzal',
      nombreCientifico: 'Pharomachrus mocinno',
      claveNOM059: 'P',
      estatusProteccion: 'En Peligro de Extinción',
      cites: 'Apéndice I',
      requierePermisoSEMARNAT: true,
      requiereAutorizacionTraslado: true,
      normativaNOM051: true
    }
  };

  // Obtener información de especie protegida
  static getEspecieInfo(nombreComun: string): FaunaSilvestreInfo | null {
    const key = nombreComun.toLowerCase();
    return this.especiesProtegidas[key] || null;
  }

  // Generar descripción completa para Carta Porte
  static generarDescripcionCartaPorte(params: {
    nombreComun: string;
    sexo?: string;
    edad?: string;
    microchip?: string;
    autorizacionSEMARNAT?: string;
    acreditacionLegal?: string;
    observaciones?: string;
  }): string {
    const especie = this.getEspecieInfo(params.nombreComun);
    
    if (!especie) {
      throw new Error(`Especie no encontrada en catálogo: ${params.nombreComun}`);
    }

    let descripcion = `${especie.nombreComun} (${especie.nombreCientifico})`;
    
    if (params.sexo) {
      descripcion += `, ${params.sexo}`;
    }
    
    if (params.edad) {
      descripcion += `, ${params.edad}`;
    }
    
    if (params.microchip) {
      descripcion += `, Microchip: ${params.microchip}`;
    }
    
    // Información legal obligatoria
    if (params.autorizacionSEMARNAT) {
      descripcion += `, Amparado por Autorización de Traslado SEMARNAT No. ${params.autorizacionSEMARNAT}`;
    } else if (especie.requiereAutorizacionTraslado) {
      throw new Error('Se requiere número de Autorización de Traslado SEMARNAT para esta especie');
    }
    
    if (params.acreditacionLegal) {
      descripcion += `, Acreditación de Legal Procedencia No. ${params.acreditacionLegal}`;
    } else if (especie.requierePermisoSEMARNAT) {
      throw new Error('Se requiere Acreditación de Legal Procedencia para esta especie');
    }
    
    if (params.observaciones) {
      descripcion += `, ${params.observaciones}`;
    }

    return descripcion;
  }

  // Validar documentación requerida
  static validarDocumentacionRequerida(nombreComun: string, documentos: {
    tieneAutorizacionTraslado?: boolean;
    tieneAcreditacionLegal?: boolean;
    cumpleNOM051?: boolean;
  }): { esValido: boolean; errores: string[]; advertencias: string[] } {
    const especie = this.getEspecieInfo(nombreComun);
    const errores: string[] = [];
    const advertencias: string[] = [];

    if (!especie) {
      errores.push(`Especie no registrada en catálogo: ${nombreComun}`);
      return { esValido: false, errores, advertencias };
    }

    if (especie.requiereAutorizacionTraslado && !documentos.tieneAutorizacionTraslado) {
      errores.push(`${especie.nombreComun} requiere Autorización de Traslado SEMARNAT`);
    }

    if (especie.requierePermisoSEMARNAT && !documentos.tieneAcreditacionLegal) {
      errores.push(`${especie.nombreComun} requiere Acreditación de Legal Procedencia`);
    }

    if (especie.normativaNOM051 && !documentos.cumpleNOM051) {
      advertencias.push(`${especie.nombreComun} debe cumplir NOM-051-ZOO-1995 para trato humanitario`);
    }

    if (especie.cites === 'Apéndice I') {
      advertencias.push(`${especie.nombreComun} está en CITES Apéndice I - máxima protección internacional`);
    }

    return {
      esValido: errores.length === 0,
      errores,
      advertencias
    };
  }

  // Obtener clave BienesTransp para animales
  static getClaveBienesTransp(): string {
    return '01010101'; // Animales vivos según catálogo SAT
  }

  // Obtener clave unidad recomendada
  static getClaveUnidad(): string {
    return 'H87'; // Pieza
  }

  // Verificar si es material peligroso
  static esMaterialPeligroso(): boolean {
    return false; // Los animales vivos no se clasifican como material peligroso según NOM-002-SCT
  }
}
