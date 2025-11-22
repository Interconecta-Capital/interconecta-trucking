
export interface BorradorCartaPorte {
  id: string;
  user_id: string;
  nombre_borrador: string;
  datos_formulario: any;
  auto_saved: boolean;
  ultima_edicion: string;
  version_formulario: string;
  created_at: string;
  updated_at: string;
}

export interface CartaPorteDocumento {
  id: string;
  carta_porte_id: string;
  tipo_documento: 'xml' | 'pdf' | 'xml_firmado' | 'xml_timbrado';
  version_documento: string;
  contenido_path?: string;
  contenido_blob?: string;
  metadatos: any;
  fecha_generacion: string;
  activo: boolean;
  created_at: string;
}

export interface CartaPorteCompleta {
  id: string;
  id_ccp: string;
  nombre_documento: string;
  status: 'draft' | 'active' | 'timbrado' | 'cancelado';
  borrador_origen_id?: string;
  version_documento: string;
  datos_formulario: any;
  created_at: string;
  updated_at: string;
  documentos?: CartaPorteDocumento[];
  
  // Campos adicionales para compatibilidad con CartaPorte
  folio?: string;
  rfc_emisor: string;
  nombre_emisor?: string;
  rfc_receptor: string;
  nombre_receptor?: string;
  usuario_id: string;
  uuid_fiscal?: string;
  fecha_timbrado?: string;
  xml_generado?: string;
  tenant_id?: string;
  tipo_cfdi?: string;
  transporte_internacional?: boolean;
  registro_istmo?: boolean;
  entrada_salida_merc?: string;
  pais_origen_destino?: string;
  via_entrada_salida?: string;
  ubicacion_polo_origen?: string;
  ubicacion_polo_destino?: string;
}

export interface CreateBorradorRequest {
  nombre_borrador?: string;
  datos_formulario?: any;
  version_formulario?: string;
  viaje_id?: string; // ✅ FASE 1: Permitir vincular con viaje al crear
}

export interface UpdateBorradorRequest {
  nombre_borrador?: string;
  datos_formulario?: any;
  auto_saved?: boolean;
}

export interface ConvertirBorradorRequest {
  borradorId: string;
  nombre_documento?: string;
  validarDatos?: boolean;
}

export interface GenerarDocumentoRequest {
  cartaPorteId: string;
  tipoDocumento: 'xml' | 'pdf' | 'xml_firmado' | 'xml_timbrado';
  version?: string;
  metadatos?: any;
  contenido: string;
}
