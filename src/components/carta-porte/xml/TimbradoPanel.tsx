
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Download, FileText } from 'lucide-react';
import { TimbradoService, TimbradoResponse } from '@/services/timbradoService';
import { useToast } from '@/hooks/use-toast';

interface TimbradoPanelProps {
  xmlContent: string;
  cartaPorteId: string;
  rfcEmisor: string;
  onTimbradoComplete?: (response: TimbradoResponse) => void;
}

export function TimbradoPanel({ 
  xmlContent, 
  cartaPorteId, 
  rfcEmisor, 
  onTimbradoComplete 
}: TimbradoPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [timbradoResult, setTimbradoResult] = useState<TimbradoResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleTimbrar = async () => {
    if (!xmlContent.trim()) {
      toast({
        title: "Error",
        description: "No hay contenido XML para timbrar",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await TimbradoService.timbrarCartaPorte({
        xmlContent,
        cartaPorteId,
        rfcEmisor
      });

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimbradoResult(response);
      onTimbradoComplete?.(response);

      if (response.success) {
        toast({
          title: "Timbrado exitoso",
          description: `UUID: ${response.uuid}`,
        });
      } else {
        toast({
          title: "Error en timbrado",
          description: response.error,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error en timbrado:', error);
      toast({
        title: "Error",
        description: "Error interno en el proceso de timbrado",
        variant: "destructive"
      });
      
      setTimbradoResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const downloadPDF = () => {
    if (timbradoResult?.pdf) {
      const url = URL.createObjectURL(timbradoResult.pdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carta-porte-${cartaPorteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const downloadXML = () => {
    if (timbradoResult?.xmlTimbrado) {
      const blob = new Blob([timbradoResult.xmlTimbrado], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carta-porte-timbrada-${cartaPorteId}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusBadge = () => {
    if (!timbradoResult) return null;
    
    if (timbradoResult.success) {
      return <Badge className="bg-green-600">Timbrado</Badge>;
    } else {
      return <Badge variant="destructive">Error</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (isProcessing) return <Clock className="h-5 w-5 text-blue-600" />;
    if (!timbradoResult) return null;
    if (timbradoResult.success) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Timbrado SAT
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Procesando...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <Button 
          onClick={handleTimbrar}
          disabled={isProcessing || !xmlContent.trim()}
          className="w-full"
        >
          {isProcessing ? 'Timbrando...' : 'Timbrar Carta Porte'}
        </Button>

        {timbradoResult && (
          <div className="space-y-3">
            {timbradoResult.success ? (
              <div className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Timbrado exitoso</div>
                      <div className="text-sm">
                        <div>UUID: {timbradoResult.uuid}</div>
                        <div>Fecha: {timbradoResult.fechaTimbrado}</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  {timbradoResult.pdf && (
                    <Button variant="outline" size="sm" onClick={downloadPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  )}
                  
                  {timbradoResult.xmlTimbrado && (
                    <Button variant="outline" size="sm" onClick={downloadXML}>
                      <FileText className="h-4 w-4 mr-2" />
                      XML Timbrado
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">Error en timbrado</div>
                  <div className="text-sm">{timbradoResult.error}</div>
                  {timbradoResult.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs">Ver detalles</summary>
                      <pre className="text-xs mt-1 bg-gray-100 p-2 rounded">
                        {JSON.stringify(timbradoResult.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
