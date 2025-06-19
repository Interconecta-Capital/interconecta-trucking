
import { jsPDF } from 'jspdf';
import { CartaPorteData } from '@/types/cartaPorte';
import QRCode from 'qrcode';

export interface LegalPDFOptions {
  datosTimbre: {
    uuid: string;
    idCCP: string;
    selloDigital: string;
    selloSAT: string;
    cadenaOriginal: string;
    fechaTimbrado: string;
    numeroCertificadoSAT: string;
    rfc_proveedor_certificacion: string;
  };
  logoBase64?: string;
}

export interface LegalPDFResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
  error?: string;
}

export class CartaPorteLegalPDF {
  static async generateLegalPDF(
    cartaPorteData: CartaPorteData,
    options: LegalPDFOptions
  ): Promise<LegalPDFResult> {
    try {
      console.log('📄 Generando PDF legal de Carta Porte...');

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let currentY = 20;
      const margin = 15;
      const lineHeight = 5;

      // Header principal
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CARTA PORTE - CFDI DE TRASLADO', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Información fiscal obligatoria
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // UUID y datos fiscales (OBLIGATORIOS)
      pdf.setFont('helvetica', 'bold');
      pdf.text('FOLIO FISCAL (UUID):', margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(options.datosTimbre.uuid, margin + 50, currentY);
      currentY += lineHeight;

      pdf.setFont('helvetica', 'bold');
      pdf.text('IdCCP:', margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(options.datosTimbre.idCCP, margin + 30, currentY);
      currentY += lineHeight;

      pdf.setFont('helvetica', 'bold');
      pdf.text('FECHA TIMBRADO:', margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(options.datosTimbre.fechaTimbrado, margin + 50, currentY);
      currentY += lineHeight;

      currentY += 10;

      // Emisor
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EMISOR', margin, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`RFC: ${cartaPorteData.rfcEmisor}`, margin, currentY);
      currentY += lineHeight;
      pdf.text(`Nombre: ${cartaPorteData.nombreEmisor || 'N/A'}`, margin, currentY);
      currentY += lineHeight;
      pdf.text(`Régimen Fiscal: ${cartaPorteData.regimen_fiscal_emisor || 'N/A'}`, margin, currentY);
      currentY += 10;

      // Receptor
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RECEPTOR', margin, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`RFC: ${cartaPorteData.rfcReceptor}`, margin, currentY);
      currentY += lineHeight;
      pdf.text(`Nombre: ${cartaPorteData.nombreReceptor || 'N/A'}`, margin, currentY);
      currentY += lineHeight;
      pdf.text(`Régimen Fiscal: ${cartaPorteData.regimen_fiscal_receptor || 'N/A'}`, margin, currentY);
      currentY += lineHeight;
      pdf.text(`Uso CFDI: ${cartaPorteData.uso_cfdi || 'N/A'}`, margin, currentY);
      currentY += 15;

      // Ubicaciones
      if (cartaPorteData.ubicaciones && cartaPorteData.ubicaciones.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('UBICACIONES', margin, currentY);
        currentY += 8;

        cartaPorteData.ubicaciones.forEach((ubicacion, index) => {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${ubicacion.tipo_ubicacion} (${ubicacion.id_ubicacion})`, margin, currentY);
          currentY += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${ubicacion.domicilio.calle} ${ubicacion.domicilio.numero_exterior}`, margin + 5, currentY);
          currentY += lineHeight;
          pdf.text(`${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}`, margin + 5, currentY);
          currentY += lineHeight;
          pdf.text(`${ubicacion.domicilio.estado}, CP: ${ubicacion.domicilio.codigo_postal}`, margin + 5, currentY);
          currentY += lineHeight;
          
          if (ubicacion.distancia_recorrida) {
            pdf.text(`Distancia: ${ubicacion.distancia_recorrida} km`, margin + 5, currentY);
            currentY += lineHeight;
          }
          currentY += 3;
        });
        currentY += 10;
      }

      // Mercancías
      if (cartaPorteData.mercancias && cartaPorteData.mercancias.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MERCANCÍAS', margin, currentY);
        currentY += 8;

        cartaPorteData.mercancias.forEach((mercancia, index) => {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${mercancia.descripcion}`, margin, currentY);
          currentY += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Clave SAT: ${mercancia.bienes_transp}`, margin + 5, currentY);
          currentY += lineHeight;
          pdf.text(`Cantidad: ${mercancia.cantidad} ${mercancia.clave_unidad}`, margin + 5, currentY);
          currentY += lineHeight;
          pdf.text(`Peso: ${mercancia.peso_kg} kg`, margin + 5, currentY);
          currentY += lineHeight;
          
          if (mercancia.material_peligroso) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('MATERIAL PELIGROSO', margin + 5, currentY);
            pdf.setFont('helvetica', 'normal');
            currentY += lineHeight;
          }
          currentY += 3;
        });
        currentY += 10;
      }

      // Autotransporte
      if (cartaPorteData.autotransporte) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AUTOTRANSPORTE', margin, currentY);
        currentY += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Placa: ${cartaPorteData.autotransporte.placa_vm}`, margin, currentY);
        currentY += lineHeight;
        pdf.text(`Configuración: ${cartaPorteData.autotransporte.config_vehicular}`, margin, currentY);
        currentY += lineHeight;
        pdf.text(`Peso Bruto Vehicular: ${cartaPorteData.autotransporte.peso_bruto_vehicular} kg`, margin, currentY);
        currentY += lineHeight;
        pdf.text(`Permiso SCT: ${cartaPorteData.autotransporte.perm_sct}`, margin, currentY);
        currentY += lineHeight;
        pdf.text(`Número Permiso: ${cartaPorteData.autotransporte.num_permiso_sct}`, margin, currentY);
        currentY += 15;
      }

      // Generar QR Code
      const qrData = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?&id=${options.datosTimbre.uuid}&re=${cartaPorteData.rfcEmisor}&rr=${cartaPorteData.rfcReceptor}&tt=0.000000&fe=${options.datosTimbre.selloDigital.substring(0, 8)}`;
      
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Sección de sellos digitales y QR en la parte inferior
      const footerY = pageHeight - 80;
      
      // QR Code
      pdf.addImage(qrCodeDataURL, 'PNG', margin, footerY, 40, 40);
      
      // Sellos digitales
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SELLO DIGITAL CFDI:', margin + 50, footerY);
      pdf.setFont('helvetica', 'normal');
      
      // Sello CFDI (dividido en líneas)
      const selloLineas = this.dividirTexto(options.datosTimbre.selloDigital, 80);
      let selloY = footerY + 4;
      selloLineas.forEach(linea => {
        pdf.text(linea, margin + 50, selloY);
        selloY += 3;
      });

      // Sello SAT
      pdf.setFont('helvetica', 'bold');
      pdf.text('SELLO DIGITAL SAT:', margin + 50, selloY + 2);
      pdf.setFont('helvetica', 'normal');
      
      const selloSATLineas = this.dividirTexto(options.datosTimbre.selloSAT, 80);
      selloY += 6;
      selloSATLineas.forEach(linea => {
        pdf.text(linea, margin + 50, selloY);
        selloY += 3;
      });

      // Cadena original
      pdf.setFont('helvetica', 'bold');
      pdf.text('CADENA ORIGINAL:', margin, footerY + 45);
      pdf.setFont('helvetica', 'normal');
      
      const cadenaLineas = this.dividirTexto(options.datosTimbre.cadenaOriginal, 120);
      let cadenaY = footerY + 49;
      cadenaLineas.forEach(linea => {
        pdf.text(linea, margin, cadenaY);
        cadenaY += 3;
      });

      // Leyenda legal
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Este documento es una representación impresa de un CFDI', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Generar blob
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      console.log('✅ PDF legal generado correctamente');
      
      return {
        success: true,
        pdfBlob,
        pdfUrl
      };

    } catch (error) {
      console.error('❌ Error generando PDF legal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private static dividirTexto(texto: string, maxLength: number): string[] {
    const lines: string[] = [];
    let currentLine = '';
    
    for (let i = 0; i < texto.length; i += maxLength) {
      lines.push(texto.substring(i, i + maxLength));
    }
    
    return lines;
  }

  static downloadPDF(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `carta-porte-legal-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
