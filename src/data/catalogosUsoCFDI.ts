
export interface UsoCFDIItem {
  clave: string;
  descripcion: string;
  aplicaPersonaFisica: boolean;
  aplicaPersonaMoral: boolean;
  fechaInicioVigencia?: string;
  fechaFinVigencia?: string;
}

export const CATALOGO_USO_CFDI: UsoCFDIItem[] = [
  {
    clave: 'G01',
    descripcion: 'Adquisición de mercancías',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'G02', 
    descripcion: 'Devoluciones, descuentos o bonificaciones',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'G03',
    descripcion: 'Gastos en general',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'I01',
    descripcion: 'Construcciones',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'I02',
    descripcion: 'Mobiliario y equipo de oficina por inversiones',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'I03',
    descripcion: 'Equipo de transporte',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'I04',
    descripcion: 'Equipo de cómputo y accesorios',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'I05',
    descripcion: 'Dados, troqueles, moldes, matrices y herramental',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'I06',
    descripcion: 'Comunicaciones telefónicas',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'I07',
    descripcion: 'Comunicaciones satelitales',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'I08',
    descripcion: 'Otra maquinaria y equipo',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'S01',
    descripcion: 'Sin efectos fiscales',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'CP01',
    descripcion: 'Pagos',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'CN01',
    descripcion: 'Nómina',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  // Específicos para transporte y carta porte
  {
    clave: 'T01',
    descripcion: 'Servicios de transporte de carga',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  },
  {
    clave: 'T02',
    descripcion: 'Servicios de transporte de pasajeros',
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true
  }
];

export const getUsoCFDIOptions = () => {
  return CATALOGO_USO_CFDI.map(item => ({
    value: item.clave,
    label: `${item.clave} - ${item.descripcion}`,
    descripcion: item.descripcion,
    clave: item.clave
  }));
};

export const getUsoCFDIByCode = (codigo: string) => {
  return CATALOGO_USO_CFDI.find(item => item.clave === codigo);
};
