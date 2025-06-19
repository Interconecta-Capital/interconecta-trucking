import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { CartaPorteData } from '@/types/cartaPorte';

export interface FiscalPDFOptions {
  xmlTimbrado?: string;
  datosTimbre: {
    uuid: string;
    idCCP: string;
    selloDigital: string;
    selloSAT: string;
    cadenaOriginal: string;
    fechaTimbrado: string;
    noCertificadoSAT: string;
    noCertificadoEmisor: string;
    fechaEmision?: string;
  };
  companyLogoUrl?: string;
}

export interface FiscalPDFResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
  error?: string;
}

export class CartaPorteFiscalPDF {
  private static readonly COLORS = {
    primary: '#1a365d',
    secondary: '#2d5a87', 
    accent: '#4a90a4',
    text: '#1a202c',
    lightText: '#4a5568',
    border: '#e2e8f0',
    background: '#f7fafc',
    success: '#38a169',
    white: '#ffffff'
  };

  private static readonly LAYOUT = {
    margin: 15,
    headerHeight: 70,
    footerHeight: 60,
    sectionSpacing: 12,
    qrSize: 76, // 2.7cm aprox
    lineHeight: 5
  };

  static async generateFiscalPDF(
    cartaPorteData: CartaPorteData,
    options: FiscalPDFOptions
  ): Promise<FiscalPDFResult> {
    try {
      if (!options.datosTimbre.uuid || !options.datosTimbre.idCCP) {
        throw new Error('UUID e IdCCP son obligatorios para generar PDF fiscal');
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Cargar logo si existe
      let logoData = '';
      if (options.companyLogoUrl) {
        try {
          const response = await fetch(options.companyLogoUrl);
          const blob = await response.blob();
          logoData = await this.blobToBase64(blob);
        } catch (error) {
          console.warn('No se pudo cargar el logo:', error);
        }
      }

      // Generar QR Code fiscal obligatorio
      const qrCodeDataURL = await this.generateFiscalQR(cartaPorteData, options.datosTimbre);

      let yPosition = this.LAYOUT.margin;

      // 1. ENCABEZADO FISCAL
      yPosition = this.addFiscalHeader(
        doc, 
        pageWidth, 
        yPosition, 
        cartaPorteData,
        options.datosTimbre,
        qrCodeDataURL,
        logoData
      );

      // 2. EMISOR Y RECEPTOR
      yPosition = this.addEmisorReceptor(doc, pageWidth, yPosition, cartaPorteData);

      // 3. INFORMACIÓN GENERAL DEL CFDI
      yPosition = this.addInformacionGeneral(doc, pageWidth, yPosition, cartaPorteData);

      // 4. UBICACIONES (ORIGEN Y DESTINO)
      yPosition = this.addUbicacionesCompletas(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

      // 5. MERCANCÍAS DETALLADAS
      yPosition = this.addMercanciasCompletas(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

      // 6. AUTOTRANSPORTE
      yPosition = this.addAutotransporteCompleto(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

      // 7. FIGURAS DE TRANSPORTE
      yPosition = this.addFigurasTransporte(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

      // 8. PIE DE PÁGINA CON SELLOS DIGITALES (OBLIGATORIO)
      this.addFooterWithDigitalSeals(doc, pageWidth, pageHeight, options.datosTimbre);

      // Agregar numeración de páginas
      this.addPageNumbers(doc);

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      return {
        success: true,
        pdfBlob,
        pdfUrl
      };
    } catch (error) {
      console.error('❌ Error generando PDF fiscal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private static async generateFiscalQR(
    cartaPorteData: CartaPorteData,
    datosTimbre: FiscalPDFOptions['datosTimbre']
  ): Promise<string> {
    try {
      // Obtener fecha de origen (primera ubicación tipo Origen)
      const ubicacionOrigen = cartaPorteData.ubicaciones?.find(u => 
        u.tipo_ubicacion === 'Origen'
      );
      
      if (!ubicacionOrigen?.fecha_hora_salida_llegada) {
        throw new Error('Fecha de origen requerida para generar QR fiscal');
      }

      // Formatear fechas para el QR del SAT
      const fechaOrigen = new Date(ubicacionOrigen.fecha_hora_salida_llegada)
        .toISOString().slice(0, 19); // YYYY-MM-DDTHH:MM:SS
      
      const fechaTimbrado = new Date(datosTimbre.fechaTimbrado)
        .toISOString().slice(0, 19); // YYYY-MM-DDTHH:MM:SS

      // URL oficial del SAT para verificación
      const qrUrl = `https://verificacfdi.facturaelectronica.sat.gob.mx/verificaccp/default.aspx?&IdCCP=${datosTimbre.idCCP}&FechaOrig=${fechaOrigen}&FechaTimb=${fechaTimbrado}`;
      
      console.log('🔗 Generando QR con URL:', qrUrl);

      return await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
      console.error('Error generando QR fiscal:', error);
      throw new Error('No se pudo generar el código QR fiscal');
    }
  }

  private static addUbicacionesCompletas(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 60);
    
    this.addSectionTitle(doc, '3. UBICACIONES (ORIGEN Y DESTINO)', yPosition);
    yPosition += 10;

    if (!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('No hay ubicaciones registradas', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const headers = ['Tipo', 'ID Ubicación', 'Nombre/RFC', 'Domicilio Completo', 'Fecha/Hora', 'Distancia'];
    const tableData = [headers];

    cartaPorteData.ubicaciones.forEach(ubicacion => {
      const domicilio = ubicacion.domicilio ? 
        `${ubicacion.domicilio.calle || ''} ${ubicacion.domicilio.numero_exterior || ''}, ${ubicacion.domicilio.colonia || ''}, ${ubicacion.domicilio.localidad || ''}, ${ubicacion.domicilio.municipio || ''}, ${ubicacion.domicilio.estado || ''}, CP ${ubicacion.domicilio.codigo_postal || ''}`.trim() : 
        'N/A';
      
      const nombreRFC = `${ubicacion.nombre_remitente_destinatario || 'N/A'}\nRFC: ${ubicacion.rfc_remitente_destinatario || 'N/A'}`;

      const fechaHora = ubicacion.fecha_hora_salida_llegada ? 
        new Date(ubicacion.fecha_hora_salida_llegada).toLocaleString('es-MX') : 
        'N/A';

      const distancia = ubicacion.distancia_recorrida ? `${ubicacion.distancia_recorrida} km` : 'N/A';

      tableData.push([
        ubicacion.tipo_ubicacion || 'N/A',
        ubicacion.id_ubicacion || 'N/A',
        nombreRFC,
        domicilio,
        fechaHora,
        distancia
      ]);
    });

    yPosition = this.addTable(doc, pageWidth, yPosition, tableData, true, 7);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addFiscalHeader(
    doc: jsPDF,
    pageWidth: number,
    yPosition: number,
    cartaPorteData: CartaPorteData,
    datosTimbre: FiscalPDFOptions['datosTimbre'],
    qrCode: string,
    logo?: string
  ): number {
    // Fondo del header
    doc.setFillColor(247, 250, 252);
    doc.rect(this.LAYOUT.margin, yPosition - 5, pageWidth - (this.LAYOUT.margin * 2), this.LAYOUT.headerHeight, 'F');
    
    // Borde
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(this.LAYOUT.margin, yPosition - 5, pageWidth - (this.LAYOUT.margin * 2), this.LAYOUT.headerHeight, 'S');

    // Logo de la empresa
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', this.LAYOUT.margin + 5, yPosition, 40, 20);
      } catch (error) {
        console.error('Error agregando logo:', error);
      }
    }

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(26, 54, 93);
    doc.text('REPRESENTACIÓN IMPRESA DE UN CFDI DE TRASLADO', pageWidth / 2, yPosition + 8, { align: 'center' });
    doc.text('CON COMPLEMENTO CARTA PORTE 3.1', pageWidth / 2, yPosition + 15, { align: 'center' });

    // Datos fiscales críticos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(26, 32, 44);

    let infoY = yPosition + 25;
    doc.text(`FOLIO FISCAL (UUID): ${datosTimbre.uuid}`, this.LAYOUT.margin + 5, infoY);
    infoY += 5;
    doc.text(`IdCCP: ${datosTimbre.idCCP}`, this.LAYOUT.margin + 5, infoY);
    infoY += 5;
    
    if (cartaPorteData.folio) {
      doc.text(`FOLIO INTERNO: ${cartaPorteData.folio}`, this.LAYOUT.margin + 5, infoY);
      infoY += 5;
    }
    
    doc.text(`NO. CERTIFICADO SAT: ${datosTimbre.noCertificadoSAT}`, this.LAYOUT.margin + 5, infoY);
    infoY += 5;
    doc.text(`NO. CERTIFICADO EMISOR: ${datosTimbre.noCertificadoEmisor}`, this.LAYOUT.margin + 5, infoY);
    infoY += 5;
    
    const fechaEmision = datosTimbre.fechaEmision || new Date().toISOString();
    doc.text(`FECHA EMISIÓN: ${new Date(fechaEmision).toLocaleString('es-MX')}`, this.LAYOUT.margin + 5, infoY);
    infoY += 5;
    doc.text(`FECHA TIMBRADO: ${new Date(datosTimbre.fechaTimbrado).toLocaleString('es-MX')}`, this.LAYOUT.margin + 5, infoY);

    // Código QR en esquina superior derecha (OBLIGATORIO)
    if (qrCode) {
      try {
        doc.addImage(qrCode, 'PNG', pageWidth - this.LAYOUT.margin - this.LAYOUT.qrSize, yPosition, this.LAYOUT.qrSize, this.LAYOUT.qrSize);
      } catch (error) {
        console.error('Error agregando QR fiscal:', error);
      }
    }

    return yPosition + this.LAYOUT.headerHeight + this.LAYOUT.sectionSpacing;
  }

  private static addEmisorReceptor(doc: jsPDF, pageWidth: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    this.addSectionTitle(doc, '1. EMISOR Y RECEPTOR', yPosition);
    yPosition += 10;

    const tableData = [
      ['CONCEPTO', 'EMISOR', 'RECEPTOR'],
      ['Razón Social', cartaPorteData.nombreEmisor || 'N/A', cartaPorteData.nombreReceptor || 'N/A'],
      ['RFC', cartaPorteData.rfcEmisor || 'N/A', cartaPorteData.rfcReceptor || 'N/A']
    ];

    yPosition = this.addTable(doc, pageWidth, yPosition, tableData, true);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addInformacionGeneral(doc: jsPDF, pageWidth: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    this.addSectionTitle(doc, '2. INFORMACIÓN GENERAL DEL CFDI Y CARTA PORTE', yPosition);
    yPosition += 10;

    const totalDistancia = cartaPorteData.ubicaciones?.reduce((sum, ub) => sum + (ub.distancia_recorrida || 0), 0) || 0;
    const totalMercancias = cartaPorteData.mercancias?.length || 0;
    const pesoTotal = cartaPorteData.mercancias?.reduce((sum, m) => sum + (m.peso_kg || 0), 0) || 0;

    const infoData = [
      ['Tipo de Comprobante:', 'T - Traslado'],
      ['Total Distancia Recorrida:', `${totalDistancia} km`],
      ['Número Total de Mercancías:', totalMercancias.toString()],
      ['Peso Bruto Total:', `${pesoTotal} kg`]
    ];

    yPosition = this.addInfoGrid(doc, pageWidth, yPosition, infoData);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addMercanciasCompletas(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 60);
    
    this.addSectionTitle(doc, '4. MERCANCÍAS', yPosition);
    yPosition += 10;

    if (!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('No hay mercancías registradas', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const headers = ['BienesTransp', 'Descripción Completa', 'Cantidad', 'Unidad', 'Peso (Kg)', 'Valor'];
    const tableData = [headers];

    cartaPorteData.mercancias.forEach(mercancia => {
      // Asegurar descripción completa sin cortes
      const descripcionCompleta = mercancia.descripcion || 'N/A';
      
      tableData.push([
        mercancia.bienes_transp || 'N/A',
        descripcionCompleta,
        mercancia.cantidad?.toString() || '0',
        mercancia.clave_unidad || 'N/A',
        mercancia.peso_kg?.toString() || '0',
        `$${mercancia.valor_mercancia || 0} ${mercancia.moneda || 'MXN'}`
      ]);
    });

    yPosition = this.addTable(doc, pageWidth, yPosition, tableData, true, 7);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addAutotransporteCompleto(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 50);
    
    this.addSectionTitle(doc, '5. AUTOTRANSPORTE', yPosition);
    yPosition += 10;

    if (!cartaPorteData.autotransporte) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('No hay datos de autotransporte registrados', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const auto = cartaPorteData.autotransporte;
    const autoData = [
      ['Tipo de Permiso SCT:', auto.perm_sct || 'N/A'],
      ['Número de Permiso SCT:', auto.num_permiso_sct || 'N/A'],
      ['Configuración Vehicular:', auto.config_vehicular || 'N/A'],
      ['Placa del Vehículo:', auto.placa_vm || 'N/A'],
      ['Año del Modelo:', auto.anio_modelo_vm?.toString() || 'N/A'],
      ['Peso Bruto Vehicular:', `${auto.peso_bruto_vehicular || 0} toneladas`],
      ['Aseguradora:', auto.asegura_resp_civil || 'N/A'],
      ['Número de Póliza:', auto.poliza_resp_civil || 'N/A']
    ];

    yPosition = this.addInfoGrid(doc, pageWidth, yPosition, autoData);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addFigurasTransporte(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 40);
    
    this.addSectionTitle(doc, '6. FIGURAS DE TRANSPORTE', yPosition);
    yPosition += 10;

    if (!cartaPorteData.figuras || cartaPorteData.figuras.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('No hay figuras de transporte registradas', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const headers = ['Tipo de Figura', 'Nombre', 'RFC', 'Número de Licencia'];
    const tableData = [headers];

    cartaPorteData.figuras.forEach(figura => {
      tableData.push([
        figura.tipo_figura || 'N/A',
        figura.nombre_figura || 'N/A',
        figura.rfc_figura || 'N/A',
        figura.num_licencia || 'N/A'
      ]);
    });

    yPosition = this.addTable(doc, pageWidth, yPosition, tableData, true);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addFooterWithDigitalSeals(doc: jsPDF, pageWidth: number, pageHeight: number, datosTimbre: FiscalPDFOptions['datosTimbre']): void {
    const footerY = pageHeight - this.LAYOUT.footerHeight - 10;
    
    // Línea separadora
    doc.setDrawColor(26, 54, 93);
    doc.setLineWidth(1);
    doc.line(this.LAYOUT.margin, footerY - 5, pageWidth - this.LAYOUT.margin, footerY - 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(26, 54, 93);
    doc.text('SELLOS DIGITALES Y VALIDACIÓN FISCAL', this.LAYOUT.margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(26, 32, 44);
    
    let sealY = footerY + 8;
    
    // Sello Digital del CFDI
    doc.setFont('helvetica', 'bold');
    doc.text('Sello Digital del CFDI:', this.LAYOUT.margin, sealY);
    doc.setFont('helvetica', 'normal');
    const selloLines = doc.splitTextToSize(datosTimbre.selloDigital, pageWidth - this.LAYOUT.margin * 2);
    doc.text(selloLines, this.LAYOUT.margin, sealY + 3);
    sealY += Math.max(8, selloLines.length * 2);
    
    // Sello Digital del SAT
    doc.setFont('helvetica', 'bold');
    doc.text('Sello Digital del SAT:', this.LAYOUT.margin, sealY);
    doc.setFont('helvetica', 'normal');
    const selloSATLines = doc.splitTextToSize(datosTimbre.selloSAT, pageWidth - this.LAYOUT.margin * 2);
    doc.text(selloSATLines, this.LAYOUT.margin, sealY + 3);
    sealY += Math.max(8, selloSATLines.length * 2);
    
    // Cadena Original
    doc.setFont('helvetica', 'bold');
    doc.text('Cadena Original del Complemento:', this.LAYOUT.margin, sealY);
    doc.setFont('helvetica', 'normal');
    const cadenaLines = doc.splitTextToSize(datosTimbre.cadenaOriginal, pageWidth - this.LAYOUT.margin * 2);
    doc.text(cadenaLines, this.LAYOUT.margin, sealY + 3);

    // Leyenda fiscal obligatoria
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(56, 161, 105);
    doc.text('Este documento es una representación impresa de un CFDI', pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  private static addSectionTitle(doc: jsPDF, title: string, yPosition: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(26, 54, 93);
    doc.text(title, this.LAYOUT.margin, yPosition);
    
    // Línea decorativa
    doc.setDrawColor(74, 144, 164);
    doc.setLineWidth(0.8);
    doc.line(this.LAYOUT.margin, yPosition + 2, this.LAYOUT.margin + doc.getTextWidth(title), yPosition + 2);
  }

  private static addInfoGrid(doc: jsPDF, pageWidth: number, yPosition: number, data: string[][]): number {
    const columnWidth = (pageWidth - (this.LAYOUT.margin * 2)) / 2;
    
    data.forEach((row, index) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(74, 85, 104);
      doc.text(row[0], this.LAYOUT.margin + 5, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 32, 44);
      doc.text(row[1], this.LAYOUT.margin + columnWidth, yPosition);
      
      yPosition += this.LAYOUT.lineHeight;
    });
    
    return yPosition;
  }

  private static addTable(doc: jsPDF, pageWidth: number, yPosition: number, data: string[][], hasHeader: boolean = false, fontSize: number = 8): number {
    const tableWidth = pageWidth - (this.LAYOUT.margin * 2);
    const columnWidth = tableWidth / data[0].length;
    const rowHeight = 6;
    
    data.forEach((row, rowIndex) => {
      const isHeader = hasHeader && rowIndex === 0;
      
      if (isHeader) {
        // Fondo del header
        doc.setFillColor(26, 54, 93);
        doc.rect(this.LAYOUT.margin, yPosition - rowHeight + 2, tableWidth, rowHeight, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fontSize);
        doc.setTextColor(255, 255, 255);
      } else {
        // Fila alternada
        if (rowIndex % 2 === 0) {
          doc.setFillColor(247, 250, 252);
          doc.rect(this.LAYOUT.margin, yPosition - rowHeight + 2, tableWidth, rowHeight, 'F');
        }
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize - 1);
        doc.setTextColor(26, 32, 44);
      }
      
      // Bordes
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(this.LAYOUT.margin, yPosition - rowHeight + 2, tableWidth, rowHeight, 'S');
      
      // Contenido de las celdas
      row.forEach((cell, colIndex) => {
        const cellX = this.LAYOUT.margin + (colIndex * columnWidth) + 2;
        const maxWidth = columnWidth - 4;
        const cellText = cell.length > 35 ? cell.substring(0, 32) + '...' : cell;
        doc.text(cellText, cellX, yPosition - 2);
        
        // Líneas verticales
        if (colIndex < row.length - 1) {
          doc.line(this.LAYOUT.margin + ((colIndex + 1) * columnWidth), yPosition - rowHeight + 2, 
                  this.LAYOUT.margin + ((colIndex + 1) * columnWidth), yPosition + 2);
        }
      });
      
      yPosition += rowHeight;
    });
    
    return yPosition;
  }

  private static addPageNumbers(doc: jsPDF): void {
    const totalPages = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(74, 85, 104);
      const text = `Página ${i} de ${totalPages}`;
      doc.text(text, doc.internal.pageSize.width - this.LAYOUT.margin, doc.internal.pageSize.height - 15, { align: 'right' });
    }
  }

  private static checkPageBreak(doc: jsPDF, yPosition: number, pageHeight: number, requiredSpace: number): number {
    if (yPosition + requiredSpace > pageHeight - this.LAYOUT.footerHeight - 20) {
      doc.addPage();
      return this.LAYOUT.margin + 10;
    }
    return yPosition;
  }

  static downloadPDF(blob: Blob, filename?: string): void {
    const defaultFilename = `carta-porte-fiscal-${new Date().toISOString().slice(0, 10)}.pdf`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
