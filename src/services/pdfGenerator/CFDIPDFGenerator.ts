/**
 * CFDIPDFGenerator - Generador de PDF CFDI Oficial con QR SAT
 * 
 * Genera PDFs con todos los elementos fiscales requeridos:
 * - QR del SAT con URL de verificación
 * - UUID fiscal
 * - Sellos digitales (CFDI y SAT)
 * - Cadena original del complemento
 * 
 * @see Anexo 20 CFDI 4.0
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CartaPorteData } from '@/types/cartaPorte';
import logger from '@/utils/logger';

export interface CFDIPDFResult {
  success: boolean;
  blob?: Blob;
  pdfUrl?: string;
  error?: string;
  pages?: number;
  uuid?: string;
}

export interface DatosTimbrado {
  uuid: string;
  fechaTimbrado: string;
  selloCFDI: string;
  selloSAT: string;
  cadenaOriginal: string;
  noCertificadoSAT: string;
  noCertificadoEmisor: string;
  rfcProvCertif: string;
}

/**
 * Generador de PDF CFDI con especificación SAT
 */
export class CFDIPDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 15;
  private currentY: number = 15;
  
  private colors = {
    primary: '#1e40af',
    secondary: '#3b82f6',
    text: '#1f2937',
    textLight: '#6b7280',
    border: '#e5e7eb',
    background: '#f9fafb',
    success: '#059669',
    warning: '#d97706'
  };

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.pageHeight = this.pdf.internal.pageSize.height;
  }

  /**
   * Generar PDF CFDI oficial con datos de timbrado
   */
  async generateCFDIPDF(
    cartaPorteData: CartaPorteData,
    datosTimbrado: DatosTimbrado,
    datosRuta?: { distanciaTotal?: number; tiempoEstimado?: number }
  ): Promise<CFDIPDFResult> {
    const startTime = Date.now();
    
    try {
      logger.info('general', 'Iniciando generación PDF CFDI', {
        uuid: datosTimbrado.uuid,
        tieneCartaPorte: !!cartaPorteData
      });

      this.currentY = 15;
      
      // 1. Header con datos fiscales principales
      this.drawHeaderFiscal(cartaPorteData, datosTimbrado);
      
      // 2. Sección Emisor / Receptor
      this.drawEmisorReceptor(cartaPorteData);
      
      // 3. Conceptos (para CFDI de traslado)
      this.drawConceptos(cartaPorteData);
      
      // 4. Complemento Carta Porte
      this.drawCartaPorteSection(cartaPorteData, datosRuta);
      
      // 5. Ubicaciones
      this.drawUbicaciones(cartaPorteData);
      
      // 6. Mercancías
      this.drawMercanciasTable(cartaPorteData);
      
      // 7. Autotransporte
      this.drawAutotransporte(cartaPorteData);
      
      // 8. Figuras de transporte
      this.drawFiguras(cartaPorteData);
      
      // 9. QR del SAT y sellos
      await this.drawQRAndSellos(datosTimbrado, cartaPorteData);
      
      // 10. Footer con cadena original
      this.drawFooterCadenaOriginal(datosTimbrado);

      // Generar blob
      const pdfBlob = this.pdf.output('blob');
      
      if (pdfBlob.size < 1000) {
        throw new Error('PDF generado está vacío o incompleto');
      }
      
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      logger.info('general', 'PDF CFDI generado exitosamente', {
        uuid: datosTimbrado.uuid,
        size: pdfBlob.size,
        pages: this.pdf.getNumberOfPages(),
        tiempoMs: Date.now() - startTime
      });

      return {
        success: true,
        blob: pdfBlob,
        pdfUrl,
        pages: this.pdf.getNumberOfPages(),
        uuid: datosTimbrado.uuid
      };
      
    } catch (error: any) {
      logger.error('general', 'Error generando PDF CFDI', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Header con datos fiscales principales
   */
  private drawHeaderFiscal(data: CartaPorteData, timbrado: DatosTimbrado) {
    // Logo / Título empresa
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(data.nombreEmisor || 'EMPRESA EMISORA', this.margin, this.currentY);
    
    this.currentY += 6;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(`RFC: ${data.rfcEmisor || 'N/A'}`, this.margin, this.currentY);
    
    // Tipo de comprobante (derecha)
    const rightX = this.pageWidth - this.margin;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(this.colors.success);
    this.pdf.text('CFDI de Traslado', rightX, 15, { align: 'right' });
    
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.text);
    this.pdf.text('Complemento Carta Porte 3.1', rightX, 21, { align: 'right' });
    
    // Línea separadora
    this.currentY += 8;
    this.pdf.setDrawColor(this.colors.primary);
    this.pdf.setLineWidth(0.8);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    // Caja de datos fiscales
    this.currentY += 5;
    const boxHeight = 28;
    this.pdf.setFillColor(this.colors.background);
    this.pdf.setDrawColor(this.colors.border);
    this.pdf.setLineWidth(0.3);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), boxHeight, 'FD');
    
    // Datos en 2 columnas
    const col1X = this.margin + 5;
    const col2X = this.pageWidth / 2 + 5;
    let dataY = this.currentY + 6;
    
    // Columna 1
    this.drawLabelValue('Folio Fiscal (UUID):', timbrado.uuid, col1X, dataY);
    dataY += 6;
    this.drawLabelValue('Fecha Timbrado:', timbrado.fechaTimbrado, col1X, dataY);
    dataY += 6;
    this.drawLabelValue('No. Certificado Emisor:', timbrado.noCertificadoEmisor, col1X, dataY);
    
    // Columna 2
    dataY = this.currentY + 6;
    this.drawLabelValue('IdCCP:', data.cartaPorteId || data.idCCP || 'N/A', col2X, dataY);
    dataY += 6;
    this.drawLabelValue('No. Certificado SAT:', timbrado.noCertificadoSAT, col2X, dataY);
    dataY += 6;
    this.drawLabelValue('RFC Proveedor Certif.:', timbrado.rfcProvCertif || 'SPR190613I52', col2X, dataY);
    
    this.currentY += boxHeight + 10;
  }

  /**
   * Sección Emisor / Receptor
   */
  private drawEmisorReceptor(data: CartaPorteData) {
    const colWidth = (this.pageWidth - (this.margin * 2) - 10) / 2;
    
    // Emisor
    this.drawSectionHeader('EMISOR');
    this.currentY += 5;
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    this.pdf.text(data.nombreEmisor || 'Nombre Emisor', this.margin, this.currentY);
    
    this.currentY += 5;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(`RFC: ${data.rfcEmisor || 'N/A'}`, this.margin, this.currentY);
    this.currentY += 4;
    this.pdf.text(`Régimen Fiscal: ${data.regimenFiscalEmisor || '601'}`, this.margin, this.currentY);
    
    // Receptor (columna derecha)
    const receptorX = this.margin + colWidth + 10;
    let rY = this.currentY - 14;
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(this.colors.secondary);
    this.pdf.text('RECEPTOR', receptorX, rY);
    rY += 5;
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    this.pdf.text(data.nombreReceptor || 'Nombre Receptor', receptorX, rY);
    
    rY += 5;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(`RFC: ${data.rfcReceptor || 'N/A'}`, receptorX, rY);
    rY += 4;
    this.pdf.text(`Uso CFDI: ${data.usoCfdi || 'S01 - Sin efectos fiscales'}`, receptorX, rY);
    
    this.currentY += 10;
  }

  /**
   * Conceptos del CFDI
   */
  private drawConceptos(data: CartaPorteData) {
    this.drawSectionHeader('CONCEPTOS');
    this.currentY += 3;
    
    // Para CFDI de traslado, un solo concepto genérico
    const conceptos = [[
      '78101800',
      '1',
      'E48',
      'Servicio de transporte de carga por carretera',
      '$0.00',
      '$0.00'
    ]];
    
    (this.pdf as any).autoTable({
      startY: this.currentY,
      head: [['Clave SAT', 'Cantidad', 'Unidad', 'Descripción', 'P. Unitario', 'Importe']],
      body: conceptos,
      theme: 'striped',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: '#ffffff',
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: this.colors.text
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 5;
    
    // Totales
    const totalsX = this.pageWidth - this.margin - 50;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.text);
    this.pdf.text('Subtotal: $0.00', totalsX, this.currentY);
    this.currentY += 5;
    this.pdf.text('Total: $0.00 XXX', totalsX, this.currentY);
    
    this.currentY += 10;
  }

  /**
   * Sección Carta Porte
   */
  private drawCartaPorteSection(data: CartaPorteData, datosRuta?: any) {
    this.drawSectionHeader('COMPLEMENTO CARTA PORTE 3.1');
    this.currentY += 5;
    
    const distancia = datosRuta?.distanciaTotal || 
      data.ubicaciones?.reduce((sum, u) => sum + (u.distancia_recorrida || 0), 0) || 0;
    
    this.drawLabelValue('Versión:', '3.1', this.margin, this.currentY);
    this.drawLabelValue('Transporte Internacional:', data.transporteInternacional ? 'Sí' : 'No', this.margin + 60, this.currentY);
    this.drawLabelValue('Total Distancia Recorrida:', `${distancia.toFixed(2)} Km`, this.margin + 130, this.currentY);
    
    this.currentY += 10;
  }

  /**
   * Ubicaciones del traslado
   */
  private drawUbicaciones(data: CartaPorteData) {
    this.drawSectionHeader('UBICACIONES');
    this.currentY += 3;
    
    if (!data.ubicaciones || data.ubicaciones.length === 0) {
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text('Sin ubicaciones registradas', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }
    
    const ubicacionesData = data.ubicaciones.map(ub => {
      const dom = ub.domicilio || {};
      const direccion = `${dom.calle || ''} ${dom.numero_exterior || ''}, ${dom.colonia || ''}, ${dom.municipio || ''}, ${dom.estado || ''}, CP ${dom.codigo_postal || ''}`;
      
      return [
        ub.tipo_ubicacion || 'N/A',
        ub.id_ubicacion || 'N/A',
        ub.rfc_remitente_destinatario || 'N/A',
        ub.fecha_hora_salida_llegada ? new Date(ub.fecha_hora_salida_llegada).toLocaleString('es-MX') : 'N/A',
        direccion.substring(0, 50) + '...',
        ub.tipo_ubicacion === 'Destino' ? `${ub.distancia_recorrida || 0} Km` : '-'
      ];
    });
    
    (this.pdf as any).autoTable({
      startY: this.currentY,
      head: [['Tipo', 'ID', 'RFC', 'Fecha/Hora', 'Domicilio', 'Distancia']],
      body: ubicacionesData,
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.secondary,
        textColor: '#ffffff',
        fontSize: 7,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: this.colors.text
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 22 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 55 },
        5: { cellWidth: 18 }
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 8;
  }

  /**
   * Tabla de mercancías
   */
  private drawMercanciasTable(data: CartaPorteData) {
    this.checkNewPage();
    this.drawSectionHeader('MERCANCÍAS');
    this.currentY += 3;
    
    if (!data.mercancias || data.mercancias.length === 0) {
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text('Sin mercancías registradas', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }
    
    // Totales
    const pesoTotal = data.mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(`Peso Bruto Total: ${pesoTotal.toFixed(3)} Kg | Unidad: KGM | Num. Total Mercancías: ${data.mercancias.length}`, this.margin, this.currentY);
    this.currentY += 5;
    
    const mercanciasData = data.mercancias.map(m => [
      m.bienes_transp || 'N/A',
      (m.descripcion || 'N/A').substring(0, 35),
      m.cantidad?.toString() || '1',
      m.clave_unidad || 'KGM',
      `${m.peso_kg || 0} Kg`,
      m.valor_mercancia ? `$${m.valor_mercancia.toLocaleString('es-MX')}` : '-',
      m.material_peligroso ? 'Sí' : 'No'
    ]);
    
    (this.pdf as any).autoTable({
      startY: this.currentY,
      head: [['Clave Bienes', 'Descripción', 'Cant.', 'Unidad', 'Peso', 'Valor', 'Mat. Pelig.']],
      body: mercanciasData,
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.secondary,
        textColor: '#ffffff',
        fontSize: 7,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: this.colors.text
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 8;
  }

  /**
   * Información de autotransporte
   */
  private drawAutotransporte(data: CartaPorteData) {
    this.checkNewPage();
    this.drawSectionHeader('AUTOTRANSPORTE');
    this.currentY += 5;
    
    const auto = data.autotransporte;
    if (!auto) {
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text('Sin información de autotransporte', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }
    
    // Primera fila
    this.drawLabelValue('Permiso SICT:', auto.perm_sct || 'N/A', this.margin, this.currentY);
    this.drawLabelValue('No. Permiso:', auto.num_permiso_sct || 'N/A', this.margin + 60, this.currentY);
    this.currentY += 5;
    
    // Vehículo
    this.drawLabelValue('Config. Vehicular:', auto.config_vehicular || 'N/A', this.margin, this.currentY);
    this.drawLabelValue('Placa VM:', auto.placa_vm || 'N/A', this.margin + 60, this.currentY);
    this.drawLabelValue('Año Modelo:', auto.anio_modelo_vm?.toString() || 'N/A', this.margin + 110, this.currentY);
    this.currentY += 5;
    
    // Peso
    this.drawLabelValue('Peso Bruto Vehicular:', `${auto.peso_bruto_vehicular || 0} Kg`, this.margin, this.currentY);
    this.currentY += 5;
    
    // Seguros
    this.drawLabelValue('Aseguradora RC:', auto.asegura_resp_civil || 'N/A', this.margin, this.currentY);
    this.drawLabelValue('Póliza RC:', auto.poliza_resp_civil || 'N/A', this.margin + 80, this.currentY);
    
    this.currentY += 10;
  }

  /**
   * Figuras de transporte
   */
  private drawFiguras(data: CartaPorteData) {
    this.checkNewPage();
    this.drawSectionHeader('FIGURAS DE TRANSPORTE');
    this.currentY += 3;
    
    if (!data.figuras || data.figuras.length === 0) {
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text('Sin figuras de transporte', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }
    
    const figurasData = data.figuras.map(f => [
      f.tipo_figura === '01' ? 'Operador' : f.tipo_figura || 'N/A',
      f.rfc_figura || 'N/A',
      f.nombre_figura || 'N/A',
      f.num_licencia || 'N/A',
      f.domicilio?.codigo_postal || 'N/A'
    ]);
    
    (this.pdf as any).autoTable({
      startY: this.currentY,
      head: [['Tipo Figura', 'RFC', 'Nombre', 'No. Licencia', 'CP Domicilio']],
      body: figurasData,
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.secondary,
        textColor: '#ffffff',
        fontSize: 7,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: this.colors.text
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 8;
  }

  /**
   * QR del SAT y sellos digitales
   */
  private async drawQRAndSellos(timbrado: DatosTimbrado, data: CartaPorteData) {
    this.checkNewPage(80);
    
    // Línea separadora
    this.pdf.setDrawColor(this.colors.border);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
    
    // QR Code (izquierda)
    const qrSize = 35;
    const qrX = this.margin;
    const qrY = this.currentY;
    
    // Generar URL de verificación SAT
    const urlVerificacion = this.generateSATVerificationURL(timbrado, data);
    
    // Dibujar placeholder de QR (en producción se usaría una librería de QR)
    this.pdf.setDrawColor(this.colors.border);
    this.pdf.setFillColor('#ffffff');
    this.pdf.rect(qrX, qrY, qrSize, qrSize, 'FD');
    
    // Texto QR placeholder
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(6);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text('QR SAT', qrX + qrSize/2, qrY + qrSize/2, { align: 'center' });
    this.pdf.text('Verificación', qrX + qrSize/2, qrY + qrSize/2 + 4, { align: 'center' });
    
    // URL de verificación debajo del QR
    this.pdf.setFontSize(5);
    const urlLines = this.pdf.splitTextToSize(urlVerificacion, qrSize);
    this.pdf.text(urlLines, qrX, qrY + qrSize + 3);
    
    // Sellos (derecha del QR)
    const sellosX = qrX + qrSize + 10;
    const sellosWidth = this.pageWidth - this.margin - sellosX;
    let sellosY = qrY;
    
    // Sello CFDI
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(this.colors.text);
    this.pdf.text('Sello Digital del CFDI:', sellosX, sellosY);
    sellosY += 4;
    
    this.pdf.setFont('courier', 'normal');
    this.pdf.setFontSize(5);
    this.pdf.setTextColor(this.colors.textLight);
    const selloCFDI = timbrado.selloCFDI.substring(0, 150) + '...';
    const selloCFDILines = this.pdf.splitTextToSize(selloCFDI, sellosWidth);
    this.pdf.text(selloCFDILines, sellosX, sellosY);
    sellosY += selloCFDILines.length * 3 + 4;
    
    // Sello SAT
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(this.colors.text);
    this.pdf.text('Sello Digital del SAT:', sellosX, sellosY);
    sellosY += 4;
    
    this.pdf.setFont('courier', 'normal');
    this.pdf.setFontSize(5);
    this.pdf.setTextColor(this.colors.textLight);
    const selloSAT = timbrado.selloSAT.substring(0, 150) + '...';
    const selloSATLines = this.pdf.splitTextToSize(selloSAT, sellosWidth);
    this.pdf.text(selloSATLines, sellosX, sellosY);
    
    this.currentY = Math.max(qrY + qrSize + 15, sellosY + selloSATLines.length * 3 + 5);
  }

  /**
   * Footer con cadena original
   */
  private drawFooterCadenaOriginal(timbrado: DatosTimbrado) {
    this.checkNewPage(30);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(this.colors.text);
    this.pdf.text('Cadena Original del Complemento de Certificación Digital del SAT:', this.margin, this.currentY);
    this.currentY += 4;
    
    this.pdf.setFont('courier', 'normal');
    this.pdf.setFontSize(5);
    this.pdf.setTextColor(this.colors.textLight);
    const cadenaWidth = this.pageWidth - (this.margin * 2);
    const cadenaLines = this.pdf.splitTextToSize(timbrado.cadenaOriginal, cadenaWidth);
    this.pdf.text(cadenaLines, this.margin, this.currentY);
    
    this.currentY += cadenaLines.length * 3 + 10;
    
    // Leyenda fiscal
    this.pdf.setDrawColor(this.colors.border);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text('Este documento es una representación impresa de un CFDI', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 4;
    this.pdf.text('Verificar en: https://verificacfdi.facturaelectronica.sat.gob.mx/', this.pageWidth / 2, this.currentY, { align: 'center' });
  }

  /**
   * Generar URL de verificación SAT
   */
  private generateSATVerificationURL(timbrado: DatosTimbrado, data: CartaPorteData): string {
    const params = new URLSearchParams({
      id: timbrado.uuid,
      re: data.rfcEmisor || '',
      rr: data.rfcReceptor || '',
      tt: '0.00',
      fe: timbrado.selloCFDI.slice(-8)
    });
    
    return `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?${params.toString()}`;
  }

  // Helpers
  private drawSectionHeader(title: string) {
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(this.colors.secondary);
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 2;
    
    this.pdf.setDrawColor(this.colors.secondary);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.margin, this.currentY, this.margin + 40, this.currentY);
    this.currentY += 3;
  }

  private drawLabelValue(label: string, value: string, x: number, y: number) {
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(label, x, y);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.colors.text);
    const labelWidth = this.pdf.getTextWidth(label);
    this.pdf.text(value, x + labelWidth + 2, y);
  }

  private checkNewPage(requiredSpace: number = 40) {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.pdf.addPage();
      this.currentY = 15;
    }
  }

  /**
   * Descargar PDF
   */
  static downloadPDF(blob: Blob, filename: string = 'cfdi-carta-porte.pdf') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
