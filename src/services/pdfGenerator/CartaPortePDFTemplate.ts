
import jsPDF from 'jspdf';
import { CartaPorteData } from '@/types/cartaPorte';

export class CartaPortePDFTemplate {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  public generatePDF(data: CartaPorteData): Blob {
    this.addHeader(data);
    this.addConfigurationSection(data);
    this.addUbicacionesSection(data);
    this.addMercanciasSection(data);
    this.addAutotransporteSection(data);
    this.addFigurasSection(data);
    this.addFooter();

    return this.doc.output('blob');
  }

  private addHeader(data: CartaPorteData) {
    // Logo/Header section
    this.doc.setFillColor(59, 130, 246); // Blue
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CARTA PORTE CFDI 4.0', this.pageWidth / 2, this.currentY + 10, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.text(`Complemento Carta Porte ${data.cartaPorteVersion || '3.1'}`, this.pageWidth / 2, this.currentY + 18, { align: 'center' });
    
    this.currentY += 35;
    this.doc.setTextColor(0, 0, 0);
  }

  private addConfigurationSection(data: CartaPorteData) {
    this.addSectionHeader('CONFIGURACIÓN INICIAL');
    
    // Convert transporteInternacional to string
    const transporteInternacionalStr = typeof data.transporteInternacional === 'boolean' 
      ? (data.transporteInternacional ? 'Sí' : 'No') 
      : (data.transporteInternacional || 'No');
    
    // Información básica en recuadros
    this.addInfoBox([
      { label: 'Tipo CFDI', value: data.tipoCfdi || '' },
      { label: 'Transporte Internacional', value: transporteInternacionalStr },
      { label: 'Versión', value: data.version || '4.0' }
    ], 2);

    this.addInfoBox([
      { label: 'RFC Emisor', value: data.rfcEmisor || '' },
      { label: 'Nombre Emisor', value: data.nombreEmisor || '' }
    ], 1);

    this.addInfoBox([
      { label: 'RFC Receptor', value: data.rfcReceptor || '' },
      { label: 'Nombre Receptor', value: data.nombreReceptor || '' }
    ], 1);

    this.currentY += 10;
  }

  private addUbicacionesSection(data: CartaPorteData) {
    this.addSectionHeader('UBICACIONES');
    
    if (data.ubicaciones && data.ubicaciones.length > 0) {
      data.ubicaciones.forEach((ubicacion, index) => {
        this.checkPageBreak(40);
        
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 'F');
        this.doc.setDrawColor(200, 200, 200);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35);
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`${index + 1}. ${ubicacion.tipo_ubicacion || ''}`, this.margin + 5, this.currentY + 7);
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`RFC: ${ubicacion.rfc_remitente_destinatario || ''}`, this.margin + 5, this.currentY + 14);
        this.doc.text(`Nombre: ${ubicacion.nombre_remitente_destinatario || ''}`, this.margin + 5, this.currentY + 21);
        
        if (ubicacion.domicilio) {
          const direccion = `${ubicacion.domicilio.calle || ''} ${ubicacion.domicilio.numero_exterior || ''}, ${ubicacion.domicilio.colonia || ''}, ${ubicacion.domicilio.municipio || ''}, ${ubicacion.domicilio.estado || ''} ${ubicacion.domicilio.codigo_postal || ''}`;
          this.doc.text(`Dirección: ${direccion}`, this.margin + 5, this.currentY + 28);
        }
        
        this.currentY += 40;
      });
    } else {
      this.doc.setFontSize(10);
      this.doc.text('No se han registrado ubicaciones', this.margin + 5, this.currentY + 10);
      this.currentY += 20;
    }
  }

  private addMercanciasSection(data: CartaPorteData) {
    this.addSectionHeader('MERCANCÍAS');
    
    if (data.mercancias && data.mercancias.length > 0) {
      data.mercancias.forEach((mercancia, index) => {
        this.checkPageBreak(30);
        
        this.doc.setFillColor(254, 249, 195);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
        this.doc.setDrawColor(200, 200, 200);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25);
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`${index + 1}. ${mercancia.descripcion || 'Sin descripción'}`, this.margin + 5, this.currentY + 7);
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`Cantidad: ${mercancia.cantidad || 0} ${mercancia.clave_unidad || ''}`, this.margin + 5, this.currentY + 14);
        this.doc.text(`Peso: ${mercancia.peso_kg || 0} kg`, this.margin + 5, this.currentY + 21);
        
        this.currentY += 30;
      });
    } else {
      this.doc.setFontSize(10);
      this.doc.text('No se han registrado mercancías', this.margin + 5, this.currentY + 10);
      this.currentY += 20;
    }
  }

  private addAutotransporteSection(data: CartaPorteData) {
    this.addSectionHeader('AUTOTRANSPORTE');
    
    if (data.autotransporte) {
      this.addInfoBox([
        { label: 'Placa', value: data.autotransporte.placa_vm || '' },
        { label: 'Año Modelo', value: String(data.autotransporte.anio_modelo_vm || '') },
        { label: 'Configuración Vehicular', value: data.autotransporte.config_vehicular || '' }
      ], 2);

      this.addInfoBox([
        { label: 'Permiso SCT', value: data.autotransporte.perm_sct || '' },
        { label: 'Número Permiso', value: data.autotransporte.num_permiso_sct || '' }
      ], 1);

      this.addInfoBox([
        { label: 'Aseguradora', value: data.autotransporte.asegura_resp_civil || '' },
        { label: 'Póliza', value: data.autotransporte.poliza_resp_civil || '' }
      ], 1);
    } else {
      this.doc.setFontSize(10);
      this.doc.text('No se ha registrado información de autotransporte', this.margin + 5, this.currentY + 10);
      this.currentY += 20;
    }
  }

  private addFigurasSection(data: CartaPorteData) {
    this.addSectionHeader('FIGURAS DEL TRANSPORTE');
    
    if (data.figuras && data.figuras.length > 0) {
      data.figuras.forEach((figura, index) => {
        this.checkPageBreak(25);
        
        this.doc.setFillColor(220, 252, 231);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 'F');
        this.doc.setDrawColor(200, 200, 200);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20);
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`${index + 1}. ${figura.tipo_figura || ''}`, this.margin + 5, this.currentY + 7);
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`RFC: ${figura.rfc_figura || ''} - ${figura.nombre_figura || ''}`, this.margin + 5, this.currentY + 14);
        
        this.currentY += 25;
      });
    } else {
      this.doc.setFontSize(10);
      this.doc.text('No se han registrado figuras del transporte', this.margin + 5, this.currentY + 10);
      this.currentY += 20;
    }
  }

  private addSectionHeader(title: string) {
    this.checkPageBreak(20);
    
    this.doc.setFillColor(229, 231, 235);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 'F');
    this.doc.setDrawColor(156, 163, 175);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 5, this.currentY + 8);
    
    this.currentY += 17;
  }

  private addInfoBox(items: Array<{label: string, value: string}>, columns: number) {
    const boxHeight = Math.ceil(items.length / columns) * 8 + 8;
    this.checkPageBreak(boxHeight);
    
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight);
    
    const columnWidth = (this.pageWidth - 2 * this.margin) / columns;
    
    this.doc.setFontSize(9);
    items.forEach((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = this.margin + 5 + col * columnWidth;
      const y = this.currentY + 6 + row * 8;
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${item.label}:`, x, y);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(item.value, x + 35, y);
    });
    
    this.currentY += boxHeight + 5;
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleString('es-MX')}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }
}
