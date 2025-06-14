
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Ubicacion } from '@/types/ubicaciones';

export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

const generateCartaPortePDF = (data: any) => {
  try {
    const doc = new jsPDF();
    
    // Convert UbicacionCompleta to Ubicacion format for compatibility
    const ubicacionesCompatibles = data.ubicaciones?.map((ub: any) => ({
      id: ub.id,
      idUbicacion: ub.id_ubicacion || ub.id,
      tipoUbicacion: ub.tipo_ubicacion,
      rfcRemitenteDestinatario: ub.rfc_remitente_destinatario,
      nombreRemitenteDestinatario: ub.nombre_remitente_destinatario,
      fechaHoraSalidaLlegada: ub.fecha_hora_salida_llegada,
      distanciaRecorrida: ub.distancia_recorrida,
      coordenadas: ub.coordenadas,
      domicilio: {
        pais: ub.domicilio.pais,
        codigoPostal: ub.domicilio.codigo_postal,
        estado: ub.domicilio.estado,
        municipio: ub.domicilio.municipio,
        colonia: ub.domicilio.colonia,
        calle: ub.domicilio.calle,
        numExterior: ub.domicilio.numero_exterior,
        numInterior: ub.domicilio.numero_interior,
        localidad: ub.domicilio.localidad,
        referencia: ub.domicilio.referencia,
      }
    })) || [];

    doc.text('Carta Porte Data', 10, 10);

    (doc as any).autoTable({
      head: [['ID', 'Tipo', 'Estado', 'Municipio']],
      body: ubicacionesCompatibles.map((ubicacion: Ubicacion) => [
        ubicacion.id,
        ubicacion.tipoUbicacion,
        ubicacion.domicilio.estado,
        ubicacion.domicilio.municipio,
      ]),
      startY: 20,
    });
    
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Mock CartaPortePDFGenerator for compatibility
export class CartaPortePDFGenerator {
  static async generate(data: any): Promise<PDFGenerationResult> {
    try {
      const blob = generateCartaPortePDF(data);
      return { success: true, blob };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export { generateCartaPortePDF };
