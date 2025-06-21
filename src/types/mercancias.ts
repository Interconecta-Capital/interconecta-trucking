
export interface Mercancia {
  id?: string;
  descripcion: string;
  claveProdServ: string;
  claveUnidad: string;
  cantidad: number;
  pesoKg: number;
  valorMercancia: number;
  valorUnitario?: number;
  unidad: string;
  numIdentificacion?: string;
  materialPeligroso?: string;
  esMaterialPeligroso?: boolean;
  embalaje?: string;
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
  // Metadatos de IA
  aiGenerated?: boolean;
  aiConfidence?: 'alta' | 'media' | 'baja';
  validacionSAT?: {
    claveProdServ?: { valid: boolean; item?: any };
    claveUnidad?: { valid: boolean; item?: any };
  };
}
