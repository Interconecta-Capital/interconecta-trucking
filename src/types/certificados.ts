
export interface CertificadoDigital {
  id: string;
  user_id: string;
  nombre_certificado: string;
  numero_certificado: string;
  rfc_titular: string;
  razon_social?: string;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string;
  archivo_cer_path: string;
  archivo_key_path: string;
  archivo_key_encrypted: boolean;
  validado: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CertificadoActivo {
  id: string;
  user_id: string;
  certificado_id: string;
  created_at: string;
  updated_at: string;
}

export interface CertificadoInfo {
  numeroSerie: string;
  rfc: string;
  razonSocial: string;
  fechaInicioVigencia: Date;
  fechaFinVigencia: Date;
  esValido: boolean;
}

export interface CSDUploadData {
  archivoCer: File;
  archivoKey: File;
  passwordKey: string;
  nombreCertificado: string;
}

export interface CSDValidationResult {
  isValid: boolean;
  errors: string[];
  certificateInfo?: CertificadoInfo;
}
