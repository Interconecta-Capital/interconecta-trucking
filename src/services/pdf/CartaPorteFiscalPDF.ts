
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
    margin: 10,
    headerHeight: 60,
    footerHeight: 50,
    sectionSpacing: 8,
    qrSize: 60,
    lineHeight: 4
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
      yPosition = this.addEmisorReceptor(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

      // 3. INFORMACIÓN GENERAL DEL CFDI
      yPosition = this.addInformacionGeneral(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

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
        width: 200,
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
    doc.rect(this.LAYOUT.margin, yPosition - 3, pageWidth - (this.LAYOUT.margin * 2), this.LAYOUT.headerHeight, 'F');
    
    // Borde
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(this.LAYOUT.margin, yPosition - 3, pageWidth - (this.LAYOUT.margin * 2), this.LAYOUT.headerHeight, 'S');

    // Logo de la empresa (más pequeño y posicionado mejor)
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', this.LAYOUT.margin + 3, yPosition, 25, 15);
      } catch (error) {
        console.error('Error agregando logo:', error);
      }
    }

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(26, 54, 93);
    doc.text('REPRESENTACIÓN IMPRESA DE UN CFDI DE TRASLADO', pageWidth / 2, yPosition + 6, { align: 'center' });
    doc.text('CON COMPLEMENTO CARTA PORTE 3.1', pageWidth / 2, yPosition + 11, { align: 'center' });

    // Datos fiscales críticos (en dos columnas para mejor aprovechamiento)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(26, 32, 44);

    let infoY = yPosition + 18;
    const leftCol = this.LAYOUT.margin + 5;
    const rightCol = pageWidth / 2 + 5;

    // Columna izquierda
    doc.text(`FOLIO FISCAL (UUID):`, leftCol, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(datosTimbre.uuid, leftCol + 35, infoY);
    infoY += 4;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`IdCCP:`, leftCol, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(datosTimbre.idCCP, leftCol + 15, infoY);
    infoY += 4;
    
    if (cartaPorteData.folio) {
      doc.setFont('helvetica', 'bold');
      doc.text(`FOLIO INTERNO:`, leftCol, infoY);
      doc.setFont('helvetica', 'normal');
      doc.text(cartaPorteData.folio, leftCol + 25, infoY);
      infoY += 4;
    }

    // Columna derecha
    infoY = yPosition + 18;
    doc.setFont('helvetica', 'bold');
    doc.text(`NO. CERT. SAT:`, rightCol, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(datosTimbre.noCertificadoSAT, rightCol + 25, infoY);
    infoY += 4;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`NO. CERT. EMISOR:`, rightCol, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(datosTimbre.noCertificadoEmisor, rightCol + 30, infoY);
    infoY += 4;
    
    const fechaEmision = datosTimbre.fechaEmision || new Date().toISOString();
    doc.setFont('helvetica', 'bold');
    doc.text(`FECHA EMISIÓN:`, rightCol, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(fechaEmision).toLocaleString('es-MX'), rightCol + 25, infoY);
    infoY += 4;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`FECHA TIMBRADO:`, rightCol, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(datosTimbre.fechaTimbrado).toLocaleString('es-MX'), rightCol + 27, infoY);

    // Código QR en esquina superior derecha (más pequeño)
    if (qrCode) {
      try {
        doc.addImage(qrCode, 'PNG', pageWidth - this.LAYOUT.margin - this.LAYOUT.qrSize, yPosition, this.LAYOUT.qrSize, this.LAYOUT.qrSize);
      } catch (error) {
        console.error('Error agregando QR fiscal:', error);
      }
    }

    return yPosition + this.LAYOUT.headerHeight + this.LAYOUT.sectionSpacing;
  }

  private static addEmisorReceptor(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 30);
    
    this.addSectionTitle(doc, '1. EMISOR Y RECEPTOR', yPosition);
    yPosition += 8;

    const tableData = [
      ['CONCEPTO', 'EMISOR', 'RECEPTOR'],
      ['Razón Social', cartaPorteData.nombreEmisor || 'N/A', cartaPorteData.nombreReceptor || 'N/A'],
      ['RFC', cartaPorteData.rfcEmisor || 'N/A', cartaPorteData.rfcReceptor || 'N/A']
    ];

    yPosition = this.addResponsiveTable(doc, pageWidth, yPosition, tableData, true);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addInformacionGeneral(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 30);
    
    this.addSectionTitle(doc, '2. INFORMACIÓN GENERAL DEL CFDI Y CARTA PORTE', yPosition);
    yPosition += 8;

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

  private static addUbicacionesCompletas(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 40);
    
    this.addSectionTitle(doc, '3. UBICACIONES (ORIGEN Y DESTINO)', yPosition);
    yPosition += 8;

    if (!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('No hay ubicaciones registradas', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    // Tabla más compacta y responsiva
    const headers = ['Tipo', 'ID', 'Nombre/RFC', 'Domicilio', 'Fecha/Hora', 'Dist.'];
    const tableData = [headers];

    cartaPorteData.ubicaciones.forEach(ubicacion => {
      const domicilio = ubicacion.domicilio ? 
        `${ubicacion.domicilio.calle || ''} ${ubicacion.domicilio.numero_exterior || ''}, ${ubicacion.domicilio.colonia || ''}, ${ubicacion.domicilio.municipio || ''}, ${ubicacion.domicilio.estado || ''}, CP ${ubicacion.domicilio.codigo_postal || ''}`.trim() : 
        'N/A';
      
      const nombreRFC = `${ubicacion.nombre_remitente_destinatario || 'N/A'} / ${ubicacion.rfc_remitente_destinatario || 'N/A'}`;

      const fechaHora = ubicacion.fecha_hora_salida_llegada ? 
        new Date(ubicacion.fecha_hora_salida_llegada).toLocaleDateString('es-MX') : 
        'N/A';

      const distancia = ubicacion.distancia_recorrida ? `${ubicacion.distancia_recorrida}km` : 'N/A';

      tableData.push([
        ubicacion.tipo_ubicacion || 'N/A',
        ubicacion.id_ubicacion || 'N/A',
        nombreRFC,
        domicilio,
        fechaHora,
        distancia
      ]);
    });

    yPosition = this.addResponsiveTable(doc, pageWidth, yPosition, tableData, true);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addMercanciasCompletas(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 40);
    
    this.addSectionTitle(doc, '4. MERCANCÍAS', yPosition);
    yPosition += 8;

    if (!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('No hay mercancías registradas', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const headers = ['Clave', 'Descripción', 'Cant.', 'Unidad', 'Peso(Kg)', 'Valor'];
    const tableData = [headers];

    cartaPorteData.mercancias.forEach(mercancia => {
      tableData.push([
        mercancia.bienes_transp || 'N/A',
        mercancia.descripcion || 'N/A',
        mercancia.cantidad?.toString() || '0',
        mercancia.clave_unidad || 'N/A',
        mercancia.peso_kg?.toString() || '0',
        `$${mercancia.valor_mercancia || 0}`
      ]);
    });

    yPosition = this.addResponsiveTable(doc, pageWidth, yPosition, tableData, true);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addAutotransporteCompleto(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 35);
    
    this.addSectionTitle(doc, '5. AUTOTRANSPORTE', yPosition);
    yPosition += 8;

    if (!cartaPorteData.autotransporte) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('No hay datos de autotransporte registrados', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const auto = cartaPorteData.autotransporte;
    const autoData = [
      ['Tipo Permiso SCT:', auto.perm_sct || 'N/A'],
      ['Número Permiso SCT:', auto.num_permiso_sct || 'N/A'],
      ['Config. Vehicular:', auto.config_vehicular || 'N/A'],
      ['Placa Vehículo:', auto.placa_vm || 'N/A'],
      ['Año Modelo:', auto.anio_modelo_vm?.toString() || 'N/A'],
      ['Peso Bruto Vehicular:', `${auto.peso_bruto_vehicular || 0} ton`],
      ['Aseguradora:', auto.asegura_resp_civil || 'N/A'],
      ['Póliza:', auto.poliza_resp_civil || 'N/A']
    ];

    yPosition = this.addInfoGrid(doc, pageWidth, yPosition, autoData);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addFigurasTransporte(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 30);
    
    this.addSectionTitle(doc, '6. FIGURAS DE TRANSPORTE', yPosition);
    yPosition += 8;

    if (!cartaPorteData.figuras || cartaPorteData.figuras.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('No hay figuras de transporte registradas', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const headers = ['Tipo', 'Nombre', 'RFC', 'Licencia'];
    const tableData = [headers];

    cartaPorteData.figuras.forEach(figura => {
      tableData.push([
        figura.tipo_figura || 'N/A',
        figura.nombre_figura || 'N/A',
        figura.rfc_figura || 'N/A',
        figura.num_licencia || 'N/A'
      ]);
    });

    yPosition = this.addResponsiveTable(doc, pageWidth, yPosition, tableData, true);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addFooterWithDigitalSeals(doc: jsPDF, pageWidth: number, pageHeight: number, datosTimbre: FiscalPDFOptions['datosTimbre']): void {
    const footerY = pageHeight - this.LAYOUT.footerHeight - 5;
    
    // Línea separadora
    doc.setDrawColor(26, 54, 93);
    doc.setLineWidth(0.5);
    doc.line(this.LAYOUT.margin, footerY - 3, pageWidth - this.LAYOUT.margin, footerY - 3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(26, 54, 93);
    doc.text('SELLOS DIGITALES Y VALIDACIÓN FISCAL', this.LAYOUT.margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(26, 32, 44);
    
    let sealY = footerY + 5;
    
    // Sello Digital del CFDI (truncado para que quepa)
    doc.setFont('helvetica', 'bold');
    doc.text('Sello CFDI:', this.LAYOUT.margin, sealY);
    doc.setFont('helvetica', 'normal');
    const selloCorto = datosTimbre.selloDigital.substring(0, 120) + '...';
    doc.text(selloCorto, this.LAYOUT.margin + 15, sealY);
    sealY += 4;
    
    // Sello Digital del SAT (truncado)
    doc.setFont('helvetica', 'bold');
    doc.text('Sello SAT:', this.LAYOUT.margin, sealY);
    doc.setFont('helvetica', 'normal');
    const selloSATCorto = datosTimbre.selloSAT.substring(0, 120) + '...';
    doc.text(selloSATCorto, this.LAYOUT.margin + 15, sealY);
    sealY += 4;
    
    // Cadena Original (truncada)
    doc.setFont('helvetica', 'bold');
    doc.text('Cadena Original:', this.LAYOUT.margin, sealY);
    doc.setFont('helvetica', 'normal');
    const cadenaCorta = datosTimbre.cadenaOriginal.substring(0, 100) + '...';
    doc.text(cadenaCorta, this.LAYOUT.margin + 20, sealY);

    // Leyenda fiscal obligatoria
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(56, 161, 105);
    doc.text('Este documento es una representación impresa de un CFDI', pageWidth / 2, pageHeight - 3, { align: 'center' });
  }

  private static addSectionTitle(doc: jsPDF, title: string, yPosition: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(26, 54, 93);
    doc.text(title, this.LAYOUT.margin, yPosition);
    
    // Línea decorativa
    doc.setDrawColor(74, 144, 164);
    doc.setLineWidth(0.5);
    doc.line(this.LAYOUT.margin, yPosition + 1, this.LAYOUT.margin + doc.getTextWidth(title), yPosition + 1);
  }

  private static addInfoGrid(doc: jsPDF, pageWidth: number, yPosition: number, data: string[][]): number {
    const columnWidth = (pageWidth - (this.LAYOUT.margin * 2)) / 2;
    
    data.forEach((row, index) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(74, 85, 104);
      doc.text(row[0], this.LAYOUT.margin + 3, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 32, 44);
      const valueText = row[1].length > 30 ? row[1].substring(0, 27) + '...' : row[1];
      doc.text(valueText, this.LAYOUT.margin + columnWidth, yPosition);
      
      yPosition += this.LAYOUT.lineHeight;
    });
    
    return yPosition;
  }

  private static addResponsiveTable(doc: jsPDF, pageWidth: number, yPosition: number, data: string[][], hasHeader: boolean = false): number {
    const tableWidth = pageWidth - (this.LAYOUT.margin * 2);
    const columnCount = data[0].length;
    
    // Anchos de columna adaptativos
    const columnWidths = columnCount === 6 ? 
      [20, 15, 45, 60, 25, 25] : // Para ubicaciones
      [tableWidth / columnCount, tableWidth / columnCount, tableWidth / columnCount, tableWidth / columnCount]; // Para otras tablas
    
    const rowHeight = 5;
    
    data.forEach((row, rowIndex) => {
      const isHeader = hasHeader && rowIndex === 0;
      
      if (isHeader) {
        // Fondo del header
        doc.setFillColor(26, 54, 93);
        doc.rect(this.LAYOUT.margin, yPosition - rowHeight + 1, tableWidth, rowHeight, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(255, 255, 255);
      } else {
        // Fila alternada
        if (rowIndex % 2 === 0) {
          doc.setFillColor(247, 250, 252);
          doc.rect(this.LAYOUT.margin, yPosition - rowHeight + 1, tableWidth, rowHeight, 'F');
        }
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(26, 32, 44);
      }
      
      // Bordes
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(this.LAYOUT.margin, yPosition - rowHeight + 1, tableWidth, rowHeight, 'S');
      
      // Contenido de las celdas con texto truncado
      let cellX = this.LAYOUT.margin + 1;
      row.forEach((cell, colIndex) => {
        const maxWidth = columnWidths[colIndex] - 2;
        const maxChars = Math.floor(maxWidth / 1.5); // Estimación de caracteres
        const cellText = cell.length > maxChars ? cell.substring(0, maxChars - 3) + '...' : cell;
        
        doc.text(cellText, cellX, yPosition - 1);
        
        // Líneas verticales
        if (colIndex < row.length - 1) {
          doc.line(cellX + columnWidths[colIndex] - 1, yPosition - rowHeight + 1, 
                  cellX + columnWidths[colIndex] - 1, yPosition + 1);
        }
        
        cellX += columnWidths[colIndex];
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
      doc.setFontSize(7);
      doc.setTextColor(74, 85, 104);
      const text = `Página ${i} de ${totalPages}`;
      doc.text(text, doc.internal.pageSize.width - this.LAYOUT.margin, doc.internal.pageSize.height - 10, { align: 'right' });
    }
  }

  private static checkPageBreak(doc: jsPDF, yPosition: number, pageHeight: number, requiredSpace: number): number {
    if (yPosition + requiredSpace > pageHeight - this.LAYOUT.footerHeight - 15) {
      doc.addPage();
      return this.LAYOUT.margin + 5;
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
