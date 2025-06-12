
import jsPDF from 'jspdf';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { Ubicacion } from '@/types/ubicaciones';

export interface PDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
  error?: string;
}

export class CartaPortePDFGenerator {
  private static readonly MARGIN = 20;
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly PAGE_HEIGHT = 297; // A4 height in mm
  private static readonly LINE_HEIGHT = 7;

  static async generarPDF(
    cartaPorteData: CartaPorteData,
    datosTimbre?: any
  ): Promise<PDFGenerationResult> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Configurar fuente
      pdf.setFont('helvetica');
      
      let yPosition = this.MARGIN;
      
      // Header del documento
      yPosition = this.agregarHeader(pdf, yPosition, datosTimbre);
      
      // Información del emisor y receptor
      yPosition = this.agregarEmisorReceptor(pdf, yPosition, cartaPorteData);
      
      // Ubicaciones
      yPosition = this.agregarUbicaciones(pdf, yPosition, cartaPorteData.ubicaciones);
      
      // Mercancías
      yPosition = this.agregarMercancias(pdf, yPosition, cartaPorteData.mercancias);
      
      // Autotransporte
      yPosition = this.agregarAutotransporte(pdf, yPosition, cartaPorteData.autotransporte);
      
      // Figuras de transporte
      yPosition = this.agregarFiguras(pdf, yPosition, cartaPorteData.figuras);
      
      // Footer con información fiscal
      this.agregarFooter(pdf, datosTimbre);
      
      // Generar blob del PDF
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      return {
        success: true,
        pdfBlob,
        pdfUrl
      };
    } catch (error) {
      console.error('Error generando PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private static agregarHeader(pdf: jsPDF, yPos: number, datosTimbre?: any): number {
    // Título principal
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CARTA PORTE', this.PAGE_WIDTH / 2, yPos, { align: 'center' });
    yPos += this.LINE_HEIGHT + 5;
    
    pdf.setFontSize(12);
    pdf.text('Complemento Carta Porte 3.1', this.PAGE_WIDTH / 2, yPos, { align: 'center' });
    yPos += this.LINE_HEIGHT + 10;
    
    // UUID si está timbrado
    if (datosTimbre?.uuid) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`UUID: ${datosTimbre.uuid}`, this.MARGIN, yPos);
      yPos += this.LINE_HEIGHT + 5;
    }
    
    return yPos;
  }

  private static agregarEmisorReceptor(pdf: jsPDF, yPos: number, data: CartaPorteData): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATOS GENERALES', this.MARGIN, yPos);
    yPos += this.LINE_HEIGHT + 3;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Emisor
    pdf.setFont('helvetica', 'bold');
    pdf.text('Emisor:', this.MARGIN, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.nombreEmisor} (${data.rfcEmisor})`, this.MARGIN + 25, yPos);
    yPos += this.LINE_HEIGHT;
    
    // Receptor
    pdf.setFont('helvetica', 'bold');
    pdf.text('Receptor:', this.MARGIN, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.nombreReceptor} (${data.rfcReceptor})`, this.MARGIN + 25, yPos);
    yPos += this.LINE_HEIGHT;
    
    // Tipo de comprobante
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tipo CFDI:', this.MARGIN, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.tipoCfdi, this.MARGIN + 25, yPos);
    yPos += this.LINE_HEIGHT + 5;
    
    return yPos;
  }

  private static agregarUbicaciones(pdf: jsPDF, yPos: number, ubicaciones: Ubicacion[]): number {
    if (!ubicaciones || ubicaciones.length === 0) return yPos;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('UBICACIONES', this.MARGIN, yPos);
    yPos += this.LINE_HEIGHT + 3;
    
    pdf.setFontSize(9);
    
    ubicaciones.forEach((ubicacion, index) => {
      // Verificar si necesitamos nueva página
      if (yPos > this.PAGE_HEIGHT - 40) {
        pdf.addPage();
        yPos = this.MARGIN;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${ubicacion.tipoUbicacion}`, this.MARGIN, yPos);
      yPos += this.LINE_HEIGHT;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`RFC: ${ubicacion.rfcRemitenteDestinatario}`, this.MARGIN + 5, yPos);
      yPos += this.LINE_HEIGHT;
      
      pdf.text(`Nombre: ${ubicacion.nombreRemitenteDestinatario}`, this.MARGIN + 5, yPos);
      yPos += this.LINE_HEIGHT;
      
      if (ubicacion.domicilio) {
        const direccion = `${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior || ''}, ${ubicacion.domicilio.colonia}`;
        pdf.text(`Dirección: ${direccion}`, this.MARGIN + 5, yPos);
        yPos += this.LINE_HEIGHT;
        
        const ubicacionCompleta = `${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}, CP: ${ubicacion.domicilio.codigoPostal}`;
        pdf.text(ubicacionCompleta, this.MARGIN + 5, yPos);
        yPos += this.LINE_HEIGHT;
      }
      
      if (ubicacion.distanciaRecorrida) {
        pdf.text(`Distancia: ${ubicacion.distanciaRecorrida} km`, this.MARGIN + 5, yPos);
        yPos += this.LINE_HEIGHT;
      }
      
      yPos += 3;
    });
    
    return yPos + 5;
  }

  private static agregarMercancias(pdf: jsPDF, yPos: number, mercancias: any[]): number {
    if (!mercancias || mercancias.length === 0) return yPos;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MERCANCÍAS', this.MARGIN, yPos);
    yPos += this.LINE_HEIGHT + 3;
    
    pdf.setFontSize(9);
    
    mercancias.forEach((mercancia, index) => {
      if (yPos > this.PAGE_HEIGHT - 30) {
        pdf.addPage();
        yPos = this.MARGIN;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${mercancia.descripcion}`, this.MARGIN, yPos);
      yPos += this.LINE_HEIGHT;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Cantidad: ${mercancia.cantidad} ${mercancia.clave_unidad}`, this.MARGIN + 5, yPos);
      yPos += this.LINE_HEIGHT;
      
      if (mercancia.peso_kg) {
        pdf.text(`Peso: ${mercancia.peso_kg} kg`, this.MARGIN + 5, yPos);
        yPos += this.LINE_HEIGHT;
      }
      
      if (mercancia.valor_mercancia) {
        pdf.text(`Valor: $${mercancia.valor_mercancia} ${mercancia.moneda || 'MXN'}`, this.MARGIN + 5, yPos);
        yPos += this.LINE_HEIGHT;
      }
      
      yPos += 3;
    });
    
    return yPos + 5;
  }

  private static agregarAutotransporte(pdf: jsPDF, yPos: number, autotransporte: any): number {
    if (!autotransporte) return yPos;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AUTOTRANSPORTE', this.MARGIN, yPos);
    yPos += this.LINE_HEIGHT + 3;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    if (autotransporte.placa_vm) {
      pdf.text(`Placa: ${autotransporte.placa_vm}`, this.MARGIN, yPos);
      yPos += this.LINE_HEIGHT;
    }
    
    if (autotransporte.config_vehicular) {
      pdf.text(`Configuración: ${autotransporte.config_vehicular}`, this.MARGIN, yPos);
      yPos += this.LINE_HEIGHT;
    }
    
    if (autotransporte.anio_modelo_vm) {
      pdf.text(`Año: ${autotransporte.anio_modelo_vm}`, this.MARGIN, yPos);
      yPos += this.LINE_HEIGHT;
    }
    
    if (autotransporte.asegura_resp_civil) {
      pdf.text(`Aseguradora: ${autotransporte.asegura_resp_civil}`, this.MARGIN, yPos);
      yPos += this.LINE_HEIGHT;
      
      if (autotransporte.poliza_resp_civil) {
        pdf.text(`Póliza: ${autotransporte.poliza_resp_civil}`, this.MARGIN, yPos);
        yPos += this.LINE_HEIGHT;
      }
    }
    
    return yPos + 5;
  }

  private static agregarFiguras(pdf: jsPDF, yPos: number, figuras: any[]): number {
    if (!figuras || figuras.length === 0) return yPos;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FIGURAS DEL TRANSPORTE', this.MARGIN, yPos);
    yPos += this.LINE_HEIGHT + 3;
    
    pdf.setFontSize(10);
    
    figuras.forEach((figura, index) => {
      if (yPos > this.PAGE_HEIGHT - 25) {
        pdf.addPage();
        yPos = this.MARGIN;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${this.getTipoFiguraDescripcion(figura.tipo_figura)}`, this.MARGIN, yPos);
      yPos += this.LINE_HEIGHT;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`RFC: ${figura.rfc_figura}`, this.MARGIN + 5, yPos);
      yPos += this.LINE_HEIGHT;
      
      pdf.text(`Nombre: ${figura.nombre_figura}`, this.MARGIN + 5, yPos);
      yPos += this.LINE_HEIGHT;
      
      if (figura.num_licencia) {
        pdf.text(`Licencia: ${figura.num_licencia}`, this.MARGIN + 5, yPos);
        yPos += this.LINE_HEIGHT;
      }
      
      yPos += 3;
    });
    
    return yPos + 5;
  }

  private static agregarFooter(pdf: jsPDF, datosTimbre?: any): void {
    const footerY = this.PAGE_HEIGHT - 20;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    // Línea separadora
    pdf.line(this.MARGIN, footerY - 5, this.PAGE_WIDTH - this.MARGIN, footerY - 5);
    
    // Información del timbre
    if (datosTimbre) {
      pdf.text('Este documento es una representación impresa de un CFDI', this.MARGIN, footerY);
      
      if (datosTimbre.cadenaOriginal) {
        pdf.text(`Cadena Original: ${datosTimbre.cadenaOriginal.substring(0, 80)}...`, this.MARGIN, footerY + 4);
      }
      
      if (datosTimbre.selloDigital) {
        pdf.text(`Sello Digital: ${datosTimbre.selloDigital.substring(0, 80)}...`, this.MARGIN, footerY + 8);
      }
    } else {
      pdf.text('Documento no timbrado - Solo para fines informativos', this.MARGIN, footerY);
    }
    
    // Fecha de generación
    const fechaGeneracion = new Date().toLocaleString('es-MX');
    pdf.text(`Generado: ${fechaGeneracion}`, this.PAGE_WIDTH - this.MARGIN - 50, footerY + 12);
  }

  private static getTipoFiguraDescripcion(tipo: string): string {
    const tipos: { [key: string]: string } = {
      '01': 'Operador',
      '02': 'Propietario',
      '03': 'Arrendador',
      '04': 'Notificado'
    };
    return tipos[tipo] || tipo;
  }

  static descargarPDF(pdfBlob: Blob, filename?: string): void {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `carta-porte-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
