import { supabase } from '@/integrations/supabase/client';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

export interface GenerarPDFParams {
  uuid: string;
  rfcEmisor: string;
  rfcReceptor: string;
  nombreEmisor?: string;
  nombreReceptor?: string;
  cadenaOriginal: string;
  selloDigital: string;
  fechaTimbrado: string;
  logoUrl?: string;
  xml: string;
}

export interface GenerarPDFResultado {
  success: boolean;
  pdfUrl?: string;
  satStatus?: string;
  error?: string;
}

export class TimbradoPDFService {
  static async generarYGuardarPDF(params: GenerarPDFParams): Promise<GenerarPDFResultado> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = height - 50;

      // Logo
      if (params.logoUrl) {
        try {
          const res = await fetch(params.logoUrl);
          const bytes = await res.arrayBuffer();
          const img = await pdfDoc.embedPng(bytes);
          const imgDims = img.scale(0.25);
          page.drawImage(img, { x: 50, y: y - imgDims.height, width: imgDims.width, height: imgDims.height });
        } catch (err) {
          console.warn('No se pudo cargar el logo:', err);
        }
      }

      page.drawText('CFDI Carta Porte', {
        x: 50,
        y,
        size: 18,
        font: fontBold,
        color: rgb(0, 0, 0)
      });
      y -= 30;

      // Datos fiscales
      const fiscalLines = [
        `UUID: ${params.uuid}`,
        `RFC Emisor: ${params.rfcEmisor}`,
        `RFC Receptor: ${params.rfcReceptor}`,
        `Nombre Emisor: ${params.nombreEmisor || ''}`,
        `Nombre Receptor: ${params.nombreReceptor || ''}`,
        `Fecha Timbrado: ${params.fechaTimbrado}`
      ];
      fiscalLines.forEach(line => {
        page.drawText(line, { x: 50, y, size: 12, font });
        y -= 15;
      });

      y -= 10;
      page.drawText('Cadena Original:', { x: 50, y, size: 12, fontBold });
      y -= 15;
      page.drawText(params.cadenaOriginal, { x: 50, y, size: 10, font, maxWidth: width - 100 });
      y -= 30;

      page.drawText('Sello Digital:', { x: 50, y, size: 12, fontBold });
      y -= 15;
      page.drawText(params.selloDigital, { x: 50, y, size: 10, font, maxWidth: width - 100 });
      y -= 40;

      // QR
      const verificationUrl = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${params.uuid}&re=${params.rfcEmisor}&rr=${params.rfcReceptor}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl);
      const qrImage = await pdfDoc.embedPng(await fetch(qrDataUrl).then(r => r.arrayBuffer()));
      const qrDims = qrImage.scale(0.5);
      page.drawImage(qrImage, { x: 50, y: y - qrDims.height, width: qrDims.width, height: qrDims.height });

      const pdfBytes = await pdfDoc.save();

      const filePath = `cartas_porte/${params.uuid}.pdf`;
      const { error: uploadError } = await supabase.storage.from('cfdi').upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });
      if (uploadError) throw uploadError;

      // Guardar ruta y datos en DB
      const { error: updateError } = await supabase
        .from('cartas_porte')
        .update({ pdf_path: filePath, timbre_data: { cadena_original: params.cadenaOriginal, sello_digital: params.selloDigital, fecha_timbrado: params.fechaTimbrado } })
        .eq('uuid_fiscal', params.uuid);
      if (updateError) throw updateError;

      const { data: urlData } = await supabase.storage.from('cfdi').createSignedUrl(filePath, 60 * 60);
      const satStatus = await this.obtenerEstadoSAT(params.uuid);
      return { success: true, pdfUrl: urlData?.signedUrl, satStatus };
    } catch (error) {
      console.error('Error generando o guardando PDF:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async obtenerEstadoSAT(uuid: string): Promise<string> {
    try {
      const service = new (await import('../fiscal/FiscalApiService')).FiscalApiService('');
      return await service.getInvoiceStatus(uuid);
    } catch {
      return 'desconocido';
    }
  }
}
