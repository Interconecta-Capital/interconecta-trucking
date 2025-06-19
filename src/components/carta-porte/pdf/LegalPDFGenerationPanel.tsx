
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, Loader2, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { useCartaPorteLegalPDF } from '@/hooks/useCartaPorteLegalPDF';
import { toast } from 'sonner';

interface LegalPDFGenerationPanelProps {
  cartaPorteData: CartaPorteData;
  datosTimbre?: {
    uuid: string;
    idCCP: string;
    selloDigital: string;
    selloSAT: string;
    cadenaOriginal: string;
    fechaTimbrado: string;
    numeroCertificadoSAT: string;
    rfc_proveedor_certificacion: string;
  };
  onPDFGenerated?: (pdfUrl: string) => void;
}

export function LegalPDFGenerationPanel({ 
  cartaPorteData, 
  datosTimbre,
  onPDFGenerated 
}: LegalPDFGenerationPanelProps) {
  const { isGenerating, pdfData, generateLegalPDF, downloadPDF, clearPDF } = useCartaPorteLegalPDF();

  const validarDatosFiscales = () => {
    const errores: string[] = [];
    
    if (!datosTimbre?.uuid) errores.push('UUID (Folio Fiscal)');
    if (!datosTimbre?.idCCP) errores.push('IdCCP');
    if (!datosTimbre?.selloDigital) errores.push('Sello Digital CFDI');
    if (!datosTimbre?.selloSAT) errores.push('Sello Digital SAT');
    if (!datosTimbre?.cadenaOriginal) errores.push('Cadena Original');
    if (!datosTimbre?.fechaTimbrado) errores.push('Fecha de Timbrado');
    
    return errores;
  };

  const erroresFiscales = validarDatosFiscales();
  const puedeGenerar = erroresFiscales.length === 0;

  const handleGeneratePDF = async () => {
    if (!puedeGenerar) {
      toast.error('Faltan datos fiscales obligatorios para generar PDF legal');
      return;
    }

    const result = await generateLegalPDF(cartaPorteData, {
      datosTimbre: datosTimbre!
    });

    if (result?.success && result.pdfUrl) {
      onPDFGenerated?.(result.pdfUrl);
    }
  };

  const handleDownload = () => {
    const filename = `carta-porte-legal-${cartaPorteData.folio || Date.now()}.pdf`;
    downloadPDF(filename);
  };

  const handlePreview = () => {
    if (pdfData.url) {
      window.open(pdfData.url, '_blank');
    }
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800">
            <Shield className="h-5 w-5" />
            <span>PDF Legal - Cumplimiento SAT</span>
          </div>
          <div className="flex items-center gap-2">
            {pdfData.url && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Generado
              </Badge>
            )}
            <Badge variant="destructive" className="text-xs">
              OBLIGATORIO
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Validación de datos fiscales */}
        {erroresFiscales.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Faltan datos fiscales obligatorios:</strong>
              <ul className="mt-2 list-disc pl-5">
                {erroresFiscales.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm">
                El documento debe ser timbrado antes de generar el PDF legal.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Estado de datos fiscales */}
        {puedeGenerar && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Datos fiscales completos</strong>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>• UUID: {datosTimbre?.uuid?.substring(0, 8)}...</div>
                <div>• IdCCP: {datosTimbre?.idCCP?.substring(0, 8)}...</div>
                <div>• Sellos digitales: ✓</div>
                <div>• Cadena original: ✓</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Botones de acción */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating || !puedeGenerar}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isGenerating ? 'Generando...' : 'Generar PDF Legal'}
          </Button>
          
          {pdfData.url && (
            <>
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Previsualizar
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </>
          )}
        </div>

        {/* Información del PDF legal */}
        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <strong>PDF Legal incluye:</strong>
          <ul className="mt-1 list-disc pl-4 space-y-1">
            <li>Folio Fiscal (UUID) y todos los datos fiscales obligatorios</li>
            <li>Código QR funcional con URL de verificación SAT</li>
            <li>Sellos digitales completos (CFDI y SAT)</li>
            <li>Cadena original para verificación</li>
            <li>Formato de tablas limpio y profesional</li>
            <li>Cumplimiento 100% con normativa SAT v3.1</li>
          </ul>
        </div>

        {/* Características del PDF */}
        {puedeGenerar && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="text-center p-2 bg-white rounded border">
              <Shield className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <div className="font-medium">100% Legal</div>
              <div className="text-gray-600">Cumple SAT v3.1</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <CheckCircle className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <div className="font-medium">QR Funcional</div>
              <div className="text-gray-600">Verificable en SAT</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <FileText className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <div className="font-medium">Profesional</div>
              <div className="text-gray-600">Diseño limpio</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
