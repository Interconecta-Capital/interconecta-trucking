
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Zap,
  FileCode,
  Receipt
} from 'lucide-react';
import { XMLCartaPorteGenerator } from '@/services/xml/xmlGenerator';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { toast } from 'sonner';
import { CartaPorteData } from '@/types/cartaPorte';

interface GeneracionSectionProps {
  cartaPorteData: CartaPorteData;
  cartaPorteId?: string;
  onXMLGenerated?: (xml: string) => void;
  onTimbrado?: () => void;
}

export function GeneracionSection({ 
  cartaPorteData, 
  cartaPorteId, 
  onXMLGenerated, 
  onTimbrado 
}: GeneracionSectionProps) {
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(null);
  const [generandoXML, setGenerandoXML] = useState(false);
  const [validacionCompleta, setValidacionCompleta] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([]);
  const [timbrandoCFDI, setTimbrandoCFDI] = useState(false);

  const {
    isGenerating: generandoPDF,
    pdfUrl,
    pdfBlob,
    generarPDF,
    descargarPDF,
    limpiarPDF
  } = usePDFGeneration();

  useEffect(() => {
    validarDatos();
  }, [cartaPorteData]);

  const validarDatos = async () => {
    const errores: string[] = [];

    // Validaciones básicas
    if (!cartaPorteData.rfcEmisor) errores.push('RFC del emisor es requerido');
    if (!cartaPorteData.nombreEmisor) errores.push('Nombre del emisor es requerido');
    if (!cartaPorteData.rfcReceptor) errores.push('RFC del receptor es requerido');
    if (!cartaPorteData.nombreReceptor) errores.push('Nombre del receptor es requerido');

    // Validar ubicaciones
    if (!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length < 2) {
      errores.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }

    // Validar mercancías
    if (!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) {
      errores.push('Se requiere al menos una mercancía');
    }

    // Validar autotransporte
    if (!cartaPorteData.autotransporte?.placa_vm) {
      errores.push('La placa del vehículo es requerida');
    }

    // Validar figuras
    if (!cartaPorteData.figuras || cartaPorteData.figuras.length === 0) {
      errores.push('Se requiere al menos una figura de transporte');
    }

    setErroresValidacion(errores);
    setValidacionCompleta(errores.length === 0);
  };

  const handleGenerarXML = async () => {
    if (!validacionCompleta) {
      toast.error('Complete todos los campos requeridos antes de generar el XML');
      return;
    }

    setGenerandoXML(true);
    try {
      const resultado = await XMLCartaPorteGenerator.generarXML(cartaPorteData);
      
      if (resultado.success && resultado.xml) {
        setXmlGenerado(resultado.xml);
        onXMLGenerated?.(resultado.xml);
        toast.success('XML generado correctamente');
        
        if (resultado.warnings && resultado.warnings.length > 0) {
          resultado.warnings.forEach(warning => toast.warning(warning));
        }
      } else {
        toast.error('Error generando XML: ' + (resultado.errors?.join(', ') || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error generando XML:', error);
      toast.error('Error crítico generando XML');
    } finally {
      setGenerandoXML(false);
    }
  };

  const handleGenerarPDF = async () => {
    if (!xmlGenerado) {
      toast.error('Primero debe generar el XML');
      return;
    }

    try {
      await generarPDF(cartaPorteData);
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

  const handleDescargarXML = () => {
    if (!xmlGenerado) return;

    const blob = new Blob([xmlGenerado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta-porte-${cartaPorteId || 'nuevo'}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('XML descargado');
  };

  const handleTimbrar = async () => {
    if (!xmlGenerado) {
      toast.error('Primero debe generar el XML');
      return;
    }

    setTimbrandoCFDI(true);
    try {
      // Aquí iría la lógica de timbrado con el PAC
      // Por ahora simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      onTimbrado?.();
      toast.success('CFDI timbrado exitosamente');
    } catch (error) {
      console.error('Error timbrando CFDI:', error);
      toast.error('Error al timbrar CFDI');
    } finally {
      setTimbrandoCFDI(false);
    }
  };

  const getValidacionProgress = () => {
    const totalChecks = 5; // Configuración, Ubicaciones, Mercancías, Autotransporte, Figuras
    const completedChecks = totalChecks - erroresValidacion.length;
    return Math.round((completedChecks / totalChecks) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Estado de Validación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {validacionCompleta ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
            Estado de Validación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Progreso de validación
            </span>
            <span className="text-sm text-gray-600">
              {getValidacionProgress()}%
            </span>
          </div>
          <Progress value={getValidacionProgress()} className="h-2" />
          
          {erroresValidacion.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-700">
                Errores que deben corregirse:
              </h4>
              <ul className="space-y-1">
                {erroresValidacion.map((error, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validacionCompleta && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Todos los datos están completos y válidos
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generación de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Generación de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="xml" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="xml">XML</TabsTrigger>
              <TabsTrigger value="pdf">PDF</TabsTrigger>
              <TabsTrigger value="timbrado">Timbrado</TabsTrigger>
            </TabsList>

            <TabsContent value="xml" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Generar XML</h3>
                  <p className="text-sm text-gray-600">
                    Crear el archivo XML del Complemento Carta Porte
                  </p>
                </div>
                <Button
                  onClick={handleGenerarXML}
                  disabled={!validacionCompleta || generandoXML}
                  className="flex items-center gap-2"
                >
                  {generandoXML ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileCode className="h-4 w-4" />
                  )}
                  {generandoXML ? 'Generando...' : 'Generar XML'}
                </Button>
              </div>

              {xmlGenerado && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          XML generado correctamente
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDescargarXML}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-3 w-3" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                  
                  <details className="bg-gray-50 border rounded-lg">
                    <summary className="p-3 cursor-pointer font-medium">
                      Ver XML generado
                    </summary>
                    <pre className="p-3 text-xs overflow-auto max-h-64 bg-white border-t">
                      {xmlGenerado}
                    </pre>
                  </details>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pdf" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Generar PDF</h3>
                  <p className="text-sm text-gray-600">
                    Crear la representación impresa de la Carta Porte
                  </p>
                </div>
                <Button
                  onClick={handleGenerarPDF}
                  disabled={!xmlGenerado || generandoPDF}
                  className="flex items-center gap-2"
                >
                  {generandoPDF ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {generandoPDF ? 'Generando...' : 'Generar PDF'}
                </Button>
              </div>

              {pdfUrl && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          PDF generado correctamente
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(pdfUrl, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-3 w-3" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => descargarPDF(`carta-porte-${cartaPorteId || 'nuevo'}.pdf`)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-3 w-3" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timbrado" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Timbrar CFDI</h3>
                  <p className="text-sm text-gray-600">
                    Enviar al PAC para obtener el timbre fiscal
                  </p>
                </div>
                <Button
                  onClick={handleTimbrar}
                  disabled={!xmlGenerado || timbrandoCFDI}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {timbrandoCFDI ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  {timbrandoCFDI ? 'Timbrando...' : 'Timbrar CFDI'}
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Receipt className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Importante sobre el timbrado:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• El XML debe estar completamente validado</li>
                      <li>• Se requiere certificado digital vigente</li>
                      <li>• El proceso es irreversible una vez completado</li>
                      <li>• Se generará un UUID único para el CFDI</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
