
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CartaPorteData } from '@/types/cartaPorte';

export interface ProfessionalPDFResult {
  success: boolean;
  blob?: Blob;
  pdfUrl?: string;
  error?: string;
  pages?: number;
}

export class ProfessionalCartaPortePDF {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;
  
  // Colores del diseño
  private colors = {
    primary: '#2563EB',      // Azul vibrante
    gray900: '#1f2937',      // Texto principal
    gray800: '#374151',      // Texto secundario
    gray600: '#4b5563',      // Texto tabla header
    gray500: '#6b7280',      // Texto auxiliar
    gray400: '#9ca3af',      // Texto footer
    gray200: '#e5e7eb',      // Bordes
    gray100: '#f3f4f6',      // Fondo tabla header
    gray50: '#f9fafb',       // Fondo caja fiscal
    cyan600: '#0891b2',      // Origen
    blue600: '#2563eb'       // Destino
  };

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.pageHeight = this.pdf.internal.pageSize.height;
  }

  async generatePDF(cartaPorteData: CartaPorteData, datosRuta?: { distanciaTotal?: number; tiempoEstimado?: number }): Promise<ProfessionalPDFResult> {
    try {
      this.currentY = 30;
      
      // Header principal
      this.drawHeader(cartaPorteData);
      
      // Datos fiscales
      this.drawFiscalDataBox(cartaPorteData);
      
      // Emisor y Receptor
      this.drawEmisorReceptor(cartaPorteData);
      
      // Ubicaciones / Ruta del traslado
      this.drawRutaTraslado(cartaPorteData, datosRuta);
      
      // Mercancías
      this.drawMercancias(cartaPorteData);
      
      // Autotransporte y Figuras
      this.drawAutotransporteFiguras(cartaPorteData);
      
      // Footer fiscal
      this.drawFooterFiscal(cartaPorteData);
      
      // Copyright
      this.drawCopyright();

      const pdfBlob = this.pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      return {
        success: true,
        blob: pdfBlob,
        pdfUrl,
        pages: this.pdf.getNumberOfPages()
      };
      
    } catch (error) {
      console.error('Error generando PDF profesional:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private drawHeader(data: CartaPorteData) {
    // Logo y título principal
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(this.colors.gray900);
    this.pdf.text('Interconecta', this.margin, this.currentY);
    
    this.currentY += 8;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(this.colors.gray500);
    this.pdf.text('CFDI de Traslado con Complemento Carta Porte 3.1', this.margin, this.currentY);
    
    // Información del folio (lado derecho)
    const rightX = this.pageWidth - this.margin;
    this.currentY = 30;
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.gray800);
    const folioText = `Folio Interno: ${data.cartaPorteId || `CP-${Date.now().toString().slice(-8)}`}`;
    this.pdf.text(folioText, rightX, this.currentY, { align: 'right' });
    
    this.currentY += 6;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.gray600);
    
    const fechaExpedicion = `Fecha de Expedición: ${new Date().toISOString().slice(0, 19)}`;
    this.pdf.text(fechaExpedicion, rightX, this.currentY, { align: 'right' });
    
    this.currentY += 4;
    const fechaTimbrado = `Fecha de Timbrado: ${new Date().toISOString().slice(0, 19)}`;
    this.pdf.text(fechaTimbrado, rightX, this.currentY, { align: 'right' });
    
    // Línea separadora
    this.currentY += 10;
    this.pdf.setDrawColor(this.colors.primary);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  private drawFiscalDataBox(data: CartaPorteData) {
    const boxHeight = 35;
    const boxY = this.currentY;
    
    // Fondo de la caja
    this.pdf.setFillColor(this.colors.gray50);
    this.pdf.setDrawColor(this.colors.gray200);
    this.pdf.rect(this.margin, boxY, this.pageWidth - (this.margin * 2), boxHeight, 'FD');
    
    // Grid 2x2 para los datos fiscales
    const colWidth = (this.pageWidth - (this.margin * 2)) / 2;
    const rowHeight = boxHeight / 2;
    
    const fiscalData = [
      { label: 'FOLIO FISCAL (UUID)', value: data.xmlGenerado ? 'Pendiente de timbrado' : 'Pendiente de timbrado' },
      { label: 'ID CARTA PORTE (IdCCP)', value: data.cartaPorteId || `CCP-${Date.now().toString().slice(-8)}` },
      { label: 'No. Certificado Emisor', value: '30001000000400002434' },
      { label: 'No. Certificado SAT', value: '30001000000500001234' }
    ];
    
    fiscalData.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = this.margin + 5 + (col * colWidth);
      const y = boxY + 8 + (row * rowHeight);
      
      // Label
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(this.colors.primary);
      this.pdf.text(item.label, x, y);
      
      // Value
      this.pdf.setFont('courier', 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(this.colors.gray800);
      const maxWidth = colWidth - 15;
      const splitText = this.pdf.splitTextToSize(item.value, maxWidth);
      this.pdf.text(splitText, x, y + 5);
    });
    
    this.currentY += boxHeight + 15;
  }

  private drawEmisorReceptor(data: CartaPorteData) {
    const colWidth = (this.pageWidth - (this.margin * 2) - 10) / 2;
    
    // Emisor
    this.drawSectionTitle('EMISOR', this.margin);
    this.currentY += 8;
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.gray800);
    this.pdf.text(data.nombreEmisor || 'Nombre del Emisor', this.margin, this.currentY);
    
    this.currentY += 6;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.gray600);
    this.pdf.text(`RFC: ${data.rfcEmisor || 'RFC del Emisor'}`, this.margin, this.currentY);
    
    this.currentY += 4;
    this.pdf.text(`Régimen Fiscal: ${data.regimenFiscalEmisor || '601 - General de Ley Personas Morales'}`, this.margin, this.currentY);
    
    // Receptor (columna derecha)
    const receptorX = this.margin + colWidth + 10;
    let receptorY = this.currentY - 18;
    
    this.drawSectionTitle('RECEPTOR', receptorX, receptorY);
    receptorY += 8;
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.gray800);
    this.pdf.text(data.nombreReceptor || 'Nombre del Receptor', receptorX, receptorY);
    
    receptorY += 6;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.gray600);
    this.pdf.text(`RFC: ${data.rfcReceptor || 'RFC del Receptor'}`, receptorX, receptorY);
    
    receptorY += 4;
    this.pdf.text(`Uso CFDI: ${data.usoCfdi || 'S01 - Sin efectos fiscales'}`, receptorX, receptorY);
    
    this.currentY += 15;
  }

  private drawRutaTraslado(data: CartaPorteData, datosRuta?: { distanciaTotal?: number; tiempoEstimado?: number }) {
    this.drawSectionTitle('RUTA DEL TRASLADO');
    this.currentY += 5;
    
    if (!data.ubicaciones || data.ubicaciones.length === 0) {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(this.colors.gray500);
      this.pdf.text('No hay ubicaciones definidas', this.margin, this.currentY);
      this.currentY += 15;
      return;
    }
    
    // Preparar datos para la tabla
    const tableData = data.ubicaciones.map(ubicacion => {
      const tipoColor = ubicacion.tipo_ubicacion === 'Origen' ? this.colors.cyan600 : this.colors.blue600;
      const domicilio = ubicacion.domicilio ? 
        `${ubicacion.domicilio.calle} ${ubicacion.domicilio.numero_exterior || ''}, ${ubicacion.domicilio.colonia || ''}, ${ubicacion.domicilio.municipio || ''}, ${ubicacion.domicilio.estado || ''}, CP ${ubicacion.domicilio.codigo_postal || ''}` :
        'Domicilio no especificado';
      
      return [
        ubicacion.tipo_ubicacion || 'N/A',
        ubicacion.nombre_remitente_destinatario || ubicacion.rfc_remitente_destinatario || 'N/A',
        ubicacion.fecha_hora_salida_llegada ? new Date(ubicacion.fecha_hora_salida_llegada).toISOString().slice(0, 19) : 'N/A',
        domicilio,
        ubicacion.distancia_recorrida ? `${ubicacion.distancia_recorrida} Km` : 
          (datosRuta?.distanciaTotal && ubicacion.tipo_ubicacion === 'Destino' ? `${datosRuta.distanciaTotal} Km` : 'N/A')
      ];
    });
    
    (this.pdf as any).autoTable({
      startY: this.currentY,
      head: [['Tipo', 'Entidad', 'Fecha/Hora', 'Domicilio', 'Distancia']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.gray100,
        textColor: this.colors.gray600,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: this.colors.gray800,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        3: { cellWidth: 70 },
        4: { cellWidth: 20 }
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 15;
  }

  private drawMercancias(data: CartaPorteData) {
    this.drawSectionTitle('MERCANCÍAS TRANSPORTADAS');
    this.currentY += 5;
    
    if (!data.mercancias || data.mercancias.length === 0) {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(this.colors.gray500);
      this.pdf.text('No hay mercancías definidas', this.margin, this.currentY);
      this.currentY += 15;
      return;
    }
    
    // Totales
    const pesoTotal = data.mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
    const totalMercancias = data.mercancias.length;
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.gray500);
    this.pdf.text(`Peso Bruto Total: `, this.margin, this.currentY);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.gray800);
    this.pdf.text(`${pesoTotal.toFixed(2)} Kg`, this.margin + 35, this.currentY);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.colors.gray500);
    this.pdf.text(` | No. Total de Mercancías: `, this.margin + 65, this.currentY);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.gray800);
    this.pdf.text(`${totalMercancias}`, this.margin + 110, this.currentY);
    
    this.currentY += 8;
    
    // Tabla de mercancías
    const tableData = data.mercancias.map(mercancia => [
      mercancia.bienes_transp || 'N/A',
      mercancia.descripcion || 'Sin descripción',
      mercancia.cantidad?.toString() || 'N/A',
      mercancia.clave_unidad || 'N/A',
      mercancia.peso_kg ? `${mercancia.peso_kg} Kg` : 'N/A',
      mercancia.valor_mercancia ? `$${mercancia.valor_mercancia.toLocaleString('es-MX')}` : 'N/A'
    ]);
    
    (this.pdf as any).autoTable({
      startY: this.currentY,
      head: [['Clave Bienes', 'Descripción Detallada', 'Cant.', 'Unidad', 'Peso', 'Valor']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.gray100,
        textColor: this.colors.gray600,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: this.colors.gray800,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 15 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 }
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 15;
  }

  private drawAutotransporteFiguras(data: CartaPorteData) {
    const colWidth = (this.pageWidth - (this.margin * 2) - 10) / 2;
    
    // Autotransporte
    this.drawSectionTitle('AUTOTRANSPORTE', this.margin);
    this.currentY += 8;
    
    const auto = data.autotransporte;
    if (auto) {
      this.drawInfoLine(`Permiso SICT: ${auto.perm_sct || 'N/A'} - Permiso General`, this.margin);
      this.drawInfoLine(`No. Permiso: ${auto.num_permiso_sct || 'N/A'}`, this.margin);
      this.drawInfoLine(`Vehículo: ${auto.config_vehicular || 'N/A'}`, this.margin);
      this.drawInfoLine(`Placa: ${auto.placa_vm || 'N/A'} | Año: ${auto.anio_modelo_vm || 'N/A'}`, this.margin);
      this.drawInfoLine(`Aseguradora RC: ${auto.asegura_resp_civil || 'N/A'} (Póliza: ${auto.poliza_resp_civil || 'N/A'})`, this.margin);
    } else {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(this.colors.gray500);
      this.pdf.text('No hay información de autotransporte', this.margin, this.currentY);
      this.currentY += 6;
    }
    
    // Figuras (columna derecha)
    const figurasX = this.margin + colWidth + 10;
    let figurasY = this.currentY - (auto ? 35 : 15);
    
    this.drawSectionTitle('FIGURA: OPERADOR', figurasX, figurasY);
    figurasY += 8;
    
    const figura = data.figuras?.[0];
    if (figura) {
      this.drawInfoLine(`Nombre: ${figura.nombre_figura || 'N/A'}`, figurasX, figurasY);
      figurasY += 6;
      this.drawInfoLine(`RFC: ${figura.rfc_figura || 'N/A'}`, figurasX, figurasY);
      figurasY += 6;
      this.drawInfoLine(`No. Licencia: ${figura.num_licencia || 'N/A'}`, figurasX, figurasY);
      figurasY += 6;
      
      if (figura.domicilio) {
        const domicilioFigura = `${figura.domicilio.calle || ''} ${figura.domicilio.numero_exterior || ''}, ${figura.domicilio.municipio || ''}, ${figura.domicilio.estado || ''}, CP ${figura.domicilio.codigo_postal || ''}`;
        this.drawInfoLine(`Domicilio: ${domicilioFigura}`, figurasX, figurasY);
      }
    } else {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(this.colors.gray500);
      this.pdf.text('No hay figuras de transporte', figurasX, figurasY);
    }
    
    this.currentY += 25;
  }

  private drawFooterFiscal(data: CartaPorteData) {
    this.currentY += 10;
    
    // Línea separadora
    this.pdf.setDrawColor(this.colors.gray200);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
    
    // QR Code placeholder (izquierda)
    const qrSize = 30;
    this.pdf.setDrawColor(this.colors.gray200);
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(this.margin, this.currentY, qrSize, qrSize, 'FD');
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(this.colors.gray400);
    this.pdf.text('QR SAT', this.margin + qrSize/2, this.currentY + qrSize/2, { align: 'center' });
    
    // Sellos digitales (derecha)
    const sellosX = this.margin + qrSize + 10;
    const sellosWidth = this.pageWidth - sellosX - this.margin;
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(this.colors.gray600);
    this.pdf.text('Sello Digital del CFDI', sellosX, this.currentY);
    
    this.currentY += 6;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(this.colors.gray500);
    const selloCFDI = data.xmlGenerado ? 'abc...xyz' : 'Pendiente de timbrado';
    const selloSplit = this.pdf.splitTextToSize(selloCFDI, sellosWidth);
    this.pdf.text(selloSplit, sellosX, this.currentY);
    
    this.currentY += 8;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(this.colors.gray600);
    this.pdf.text('Sello Digital del SAT', sellosX, this.currentY);
    
    this.currentY += 6;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(this.colors.gray500);
    const selloSAT = '123...789';
    const selloSATSplit = this.pdf.splitTextToSize(selloSAT, sellosWidth);
    this.pdf.text(selloSATSplit, sellosX, this.currentY);
    
    this.currentY += 8;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(this.colors.gray600);
    this.pdf.text('Cadena Original del Complemento', sellosX, this.currentY);
    
    this.currentY += 6;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(7);
    this.pdf.setTextColor(this.colors.gray500);
    const cadenaOriginal = '||1.1|T|...||';
    const cadenaSplit = this.pdf.splitTextToSize(cadenaOriginal, sellosWidth);
    this.pdf.text(cadenaSplit, sellosX, this.currentY);
  }

  private drawCopyright() {
    this.currentY += 15;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(this.colors.gray400);
    const copyright = `Este documento es una representación impresa de un CFDI. © ${new Date().getFullYear()} Interconecta.`;
    this.pdf.text(copyright, this.pageWidth / 2, this.currentY, { align: 'center' });
  }

  private drawSectionTitle(title: string, x?: number, y?: number) {
    if (x === undefined) x = this.margin;
    if (y === undefined) y = this.currentY;
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(title, x, y);
    
    // Línea debajo del título
    const textWidth = this.pdf.getTextWidth(title);
    this.pdf.setDrawColor(this.colors.gray200);
    this.pdf.setLineWidth(0.2);
    this.pdf.line(x, y + 2, x + textWidth, y + 2);
    
    if (y === this.currentY) {
      this.currentY = y + 8;
    }
  }

  private drawInfoLine(text: string, x: number, y?: number) {
    if (y === undefined) {
      y = this.currentY;
      this.currentY += 6;
    }
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.gray500);
    
    // Separar label y valor
    const colonIndex = text.indexOf(':');
    if (colonIndex > 0) {
      const label = text.substring(0, colonIndex + 1);
      const value = text.substring(colonIndex + 1).trim();
      
      this.pdf.text(label, x, y);
      
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.gray800);
      const labelWidth = this.pdf.getTextWidth(label);
      this.pdf.text(value, x + labelWidth + 2, y);
    } else {
      this.pdf.text(text, x, y);
    }
  }
}
