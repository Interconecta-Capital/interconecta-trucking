
export interface UbicacionFrecuente {
  id: string;
  nombre: string;
  tipo_ubicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  rfc_remitente_destinatario?: string;
  nombre_remitente_destinatario?: string;
  domicilio: {
    calle: string;
    numero_exterior?: string;
    numero_interior?: string;
    colonia: string;
    localidad?: string;
    municipio: string;
    estado: string;
    pais: string;
    codigo_postal: string;
    referencia?: string;
  };
  uso_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UbicacionBase {
  tipo_estacion: string;
  nombre_estacion?: string;
  rfc_remitente_destinatario?: string;
  id_ubicacion?: string;
  distancia_recorrida?: number;
  domicilio: {
    calle: string;
    numero_exterior?: string;
    numero_interior?: string;
    colonia: string;
    localidad?: string;
    municipio: string;
    estado: string;
    pais: string;
    codigo_postal: string;
    referencia?: string;
  };
}
