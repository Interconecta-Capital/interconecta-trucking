
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CartaPorteData } from '@/types/cartaPorte';

interface PDFGenerationPanelProps {
  cartaPorteData: CartaPorteData;
  cartaPorteId?: string | null;
  xmlGenerado?: string | null;
}

export function PDFGenerationPanel({
  cartaPorteData,
  cartaPorteId,
  xmlGenerado
}: PDFGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // NUEVO: Generar PDF de Carta Porte
  const generateCartaPortePDF = useCallback(async () => {
    if (!cartaPorteData) {
      toast.error('No hay datos para generar el PDF');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF de Carta Porte...');

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CARTA PORTE', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Folio: ${cartaPorteId || 'PENDIENTE'}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Datos del Emisor
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DEL EMISOR', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`RFC: ${cartaPorteData.rfcEmisor || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Nombre: ${cartaPorteData.nombreEmisor || 'N/A'}`, 20, yPosition);
      yPosition += 15;

      // Datos del Receptor
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DEL RECEPTOR', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`RFC: ${cartaPorteData.rfcReceptor || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Nombre: ${cartaPorteData.nombreReceptor || 'N/A'}`, 20, yPosition);
      yPosition += 15;

      // Ubicaciones
      if (cartaPorteData.ubicaciones && cartaPorteData.ubicaciones.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('UBICACIONES', 20, yPosition);
        yPosition += 10;

        const ubicacionesData = cartaPorteData.ubicaciones.map((ub, index) => [
          `${index + 1}`,
          ub.tipoUbicacion || 'N/A',
          ub.domicilio?.codigoPostal || 'N/A',
          ub.nombre_remitente_destinatario || 'N/A'
        ]);

        (pdf as any).autoTable({
          head: [['#', 'Tipo', 'C.P.', 'Nombre']],
          body: ubicacionesData,
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          margin: { left: 20 }
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 15;
      }

      // Mercancías
      if (cartaPorteData.mercancias && cartaPorteData.mercancias.length > 0) {
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MERCANCÍAS', 20, yPosition);
        yPosition += 10;

        const mercanciasData = cartaPorteData.mercancias.map((merc, index) => [
          `${index + 1}`,
          merc.descripcion || 'N/A',
          `${merc.cantidad || 0}`,
          `${merc.peso_kg || 0} kg`,
          `$${merc.valor_mercancia || 0}`
        ]);

        (pdf as any).autoTable({
          head: [['#', 'Descripción', 'Cantidad', 'Peso', 'Valor']],
          body: mercanciasData,
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          margin: { left: 20 }
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 15;
      }

      // Autotransporte
      if (cartaPorteData.autotransporte?.placa_vm) {
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AUTOTRANSPORTE', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Placa: ${cartaPorteData.autotransporte.placa_vm}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Año: ${cartaPorteData.autotransporte.anio_modelo_vm || 'N/A'}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Configuración: ${cartaPorteData.autotransporte.config_vehicular || 'N/A'}`, 20, yPosition);
        yPosition += 15;
      }

      // Footer
      const currentDate = new Date().toLocaleDateString('es-MX');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Generado el ${currentDate}`, pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });

      // Descargar PDF
      const fileName = `carta-porte-${cartaPorteId || Date.now()}.pdf`;
      pdf.save(fileName);

      toast.success('PDF generado exitosamente');
      console.log('✅ PDF generado:', fileName);

    } catch (error: any) {
      console.error('❌ Error generando PDF:', error);
      toast.error(`Error generando PDF: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [cartaPorteData, cartaPorteId]);

  const canGeneratePDF = cartaPorteData && (
    cartaPorteData.rfcEmisor || 
    cartaPorteData.rfcReceptor || 
    (cartaPorteData.ubicaciones && cartaPorteData.ubicaciones.length > 0)
  );

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <FileText className="w-5 h-5" />
          Generación de PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Estado */}
          <div className="flex items-center gap-2">
            {canGeneratePDF ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Listo para generar PDF
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700 font-medium">
                  Completa los datos básicos para generar PDF
                </span>
              </>
            )}
          </div>

          {/* Información */}
          <div className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg">
            <p className="font-medium mb-1">El PDF incluirá:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Datos del emisor y receptor</li>
              <li>Ubicaciones de origen y destino</li>
              <li>Listado de mercancías</li>
              <li>Información del autotransporte</li>
              <li>Figuras del transporte</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              onClick={generateCartaPortePDF}
              disabled={!canGeneratePDF || isGenerating}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generar PDF
                </>
              )}
            </Button>
          </div>

          {xmlGenerado && (
            <div className="mt-4 pt-3 border-t border-purple-200">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  XML disponible - PDF con datos completos
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
