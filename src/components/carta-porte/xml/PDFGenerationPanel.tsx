
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Loader2, CheckCircle } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PDFGenerationPanelProps {
  cartaPorteData: CartaPorteData;
  xmlGenerado?: string | null;
  onPDFGenerated?: (pdfUrl: string) => void;
}

export function PDFGenerationPanel({ 
  cartaPorteData, 
  xmlGenerado,
  onPDFGenerated 
}: PDFGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const generatePDF = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF de carta porte...');
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      let yPosition = 20;

      // Función helper para agregar texto
      const addText = (text: string, x: number = 20, fontSize: number = 12, style: 'normal' | 'bold' = 'normal') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', style);
        pdf.text(text, x, yPosition);
        yPosition += fontSize * 0.5 + 2;
      };

      // Función helper para agregar separador
      const addSeparator = () => {
        yPosition += 5;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 10;
      };

      // Encabezado
      addText('CARTA PORTE - COMPLEMENTO CFDI', 20, 18, 'bold');
      addText(`Folio: CP-${Date.now().toString().slice(-8)}`, 20, 12);
      addText(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 20, 12);
      addSeparator();

      // Información del CFDI
      addText('INFORMACIÓN DEL CFDI', 20, 14, 'bold');
      addText(`Tipo de CFDI: ${cartaPorteData.tipoCfdi || 'Traslado'}`, 25, 11);
      addText(`Versión Carta Porte: ${cartaPorteData.cartaPorteVersion || '3.1'}`, 25, 11);
      addText(`Transporte Internacional: ${cartaPorteData.transporteInternacional === true || cartaPorteData.transporteInternacional === 'Sí' ? 'Sí' : 'No'}`, 25, 11);
      addSeparator();

      // Emisor y Receptor
      addText('EMISOR', 20, 14, 'bold');
      addText(`RFC: ${cartaPorteData.rfcEmisor || 'No especificado'}`, 25, 11);
      addText(`Nombre: ${cartaPorteData.nombreEmisor || 'No especificado'}`, 25, 11);
      yPosition += 5;

      addText('RECEPTOR', 20, 14, 'bold');
      addText(`RFC: ${cartaPorteData.rfcReceptor || 'No especificado'}`, 25, 11);
      addText(`Nombre: ${cartaPorteData.nombreReceptor || 'No especificado'}`, 25, 11);
      addSeparator();

      // Ubicaciones
      if (cartaPorteData.ubicaciones && cartaPorteData.ubicaciones.length > 0) {
        addText('UBICACIONES', 20, 14, 'bold');
        cartaPorteData.ubicaciones.forEach((ubicacion, index) => {
          addText(`${index + 1}. ${ubicacion.tipo_ubicacion}: ${ubicacion.id_ubicacion}`, 25, 11);
          if (ubicacion.domicilio) {
            addText(`   ${ubicacion.domicilio.calle} ${ubicacion.domicilio.numero_exterior}`, 30, 10);
            addText(`   ${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}`, 30, 10);
            addText(`   CP: ${ubicacion.domicilio.codigo_postal}, ${ubicacion.domicilio.estado}`, 30, 10);
          }
          if (ubicacion.rfc_remitente_destinatario) {
            addText(`   RFC: ${ubicacion.rfc_remitente_destinatario}`, 30, 10);
          }
          if (ubicacion.nombre_remitente_destinatario) {
            addText(`   Nombre: ${ubicacion.nombre_remitente_destinatario}`, 30, 10);
          }
          yPosition += 3;
        });
        addSeparator();
      }

      // Mercancías
      if (cartaPorteData.mercancias && cartaPorteData.mercancias.length > 0) {
        addText('MERCANCÍAS', 20, 14, 'bold');
        cartaPorteData.mercancias.forEach((mercancia, index) => {
          addText(`${index + 1}. ${mercancia.bienes_transp}`, 25, 11);
          if (mercancia.descripcion) {
            addText(`   Descripción: ${mercancia.descripcion}`, 30, 10);
          }
          if (mercancia.cantidad) {
            addText(`   Cantidad: ${mercancia.cantidad} ${mercancia.clave_unidad || ''}`, 30, 10);
          }
          if (mercancia.peso_kg) {
            addText(`   Peso: ${mercancia.peso_kg} kg`, 30, 10);
          }
          if (mercancia.valor_mercancia) {
            addText(`   Valor: $${mercancia.valor_mercancia} ${mercancia.moneda || 'MXN'}`, 30, 10);
          }
          yPosition += 3;
        });
        addSeparator();
      }

      // Autotransporte
      if (cartaPorteData.autotransporte) {
        addText('AUTOTRANSPORTE', 20, 14, 'bold');
        const auto = cartaPorteData.autotransporte;
        if (auto.placa_vm) addText(`Placa: ${auto.placa_vm}`, 25, 11);
        if (auto.config_vehicular) addText(`Configuración: ${auto.config_vehicular}`, 25, 11);
        if (auto.anio_modelo_vm) addText(`Año: ${auto.anio_modelo_vm}`, 25, 11);
        if (auto.perm_sct) addText(`Permiso SCT: ${auto.perm_sct}`, 25, 11);
        if (auto.num_permiso_sct) addText(`Núm. Permiso: ${auto.num_permiso_sct}`, 25, 11);
        if (auto.asegura_resp_civil) addText(`Aseguradora: ${auto.asegura_resp_civil}`, 25, 11);
        if (auto.poliza_resp_civil) addText(`Póliza: ${auto.poliza_resp_civil}`, 25, 11);
        addSeparator();
      }

      // Figuras de Transporte
      if (cartaPorteData.figuras && cartaPorteData.figuras.length > 0) {
        addText('FIGURAS DE TRANSPORTE', 20, 14, 'bold');
        cartaPorteData.figuras.forEach((figura, index) => {
          addText(`${index + 1}. ${figura.tipo_figura}`, 25, 11);
          addText(`   RFC: ${figura.rfc_figura}`, 30, 10);
          addText(`   Nombre: ${figura.nombre_figura}`, 30, 10);
          if (figura.num_licencia) {
            addText(`   Licencia: ${figura.num_licencia}`, 30, 10);
          }
          yPosition += 3;
        });
        addSeparator();
      }

      // Información de XML si existe
      if (xmlGenerado) {
        addText('ESTADO DEL XML', 20, 14, 'bold');
        addText('✓ XML generado correctamente', 25, 11);
        addText(`Generado: ${new Date().toLocaleString('es-MX')}`, 25, 11);
      }

      // Generar URL del PDF
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      if (onPDFGenerated) {
        onPDFGenerated(url);
      }

      console.log('✅ PDF generado exitosamente');
      toast.success('PDF generado correctamente');
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `carta-porte-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('PDF descargado');
  };

  const previewPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-800">
            <FileText className="h-5 w-5" />
            <span>Generación de PDF</span>
          </div>
          {pdfUrl && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Disponible
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isGenerating ? 'Generando...' : 'Generar PDF'}
          </Button>
          
          {pdfUrl && (
            <>
              <Button
                variant="outline"
                onClick={previewPDF}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Previsualizar
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <strong>Representación Impresa:</strong> Este PDF contiene una representación 
          visual de la Carta Porte con todos los datos capturados en el formulario.
        </div>
      </CardContent>
    </Card>
  );
}
