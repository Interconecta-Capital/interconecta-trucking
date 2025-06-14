
export interface CartaPorteData {
  tipoRelacion: string;
  version: string;
  transporteInternacional: string;
  entradaSalidaMerc: string;
  viaTransporte: string;
  totalDistRec: number;
  tipoCreacion?: 'plantilla' | 'carga' | 'manual';
  cartaPorteVersion?: string;
  tipoCfdi?: string;
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  registroIstmo?: boolean;
  mercancias?: any[];
  ubicaciones?: any[];
  autotransporte?: AutotransporteCompleto;
  figuras?: FiguraCompleta[];
}

export interface AutotransporteCompleto {
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  remolques?: any[];
}

export interface FiguraCompleta {
  id: string;
  tipo_figura: string;
  rfc_figura: string;
  nombre_figura: string;
  num_licencia?: string;
  residencia_fiscal_figura?: string;
  num_reg_id_trib_figura?: string;
  domicilio: {
    pais: string;
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
    referencia?: string;
  };
}
