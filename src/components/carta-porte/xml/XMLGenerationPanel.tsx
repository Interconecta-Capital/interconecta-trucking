
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { PDFGenerationPanel } from './PDFGenerationPanel';

interface XMLGenerationPanelProps {
  cartaPorteData: CartaPorteData;
  cartaPorteId?: string | null;
  onXMLGenerated: (xml: string) => void;
  onTimbrado: (data: any) => void;
  xmlGenerado?: string | null;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  } | null;
}

export function XMLGenerationPanel({
  cartaPorteData,
  cartaPorteId,
  onXMLGenerated,
  onTimbrado,
  xmlGenerado,
  datosCalculoRuta
}: XMLGenerationPanelProps) {

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <FileText className="w-5 h-5" />
            Generación XML
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Funcionalidad de XML en Desarrollo
            </h3>
            <p className="text-sm text-green-700 mb-4">
              La generación de XML está siendo implementada y estará disponible próximamente.
            </p>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-xs text-green-600">
                💡 Mientras tanto, puedes generar un PDF con todos los datos de tu Carta Porte
              </p>
            </div>
            
            {xmlGenerado && (
              <div className="mt-4 p-3 bg-green-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">XML Disponible</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NUEVO: Panel de generación de PDF */}
      <PDFGenerationPanel
        cartaPorteData={cartaPorteData}
        cartaPorteId={cartaPorteId}
        xmlGenerado={xmlGenerado}
      />

      {/* Información adicional */}
      {datosCalculoRuta && datosCalculoRuta.distanciaTotal && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-center">
              <h4 className="font-medium text-blue-800 mb-2">Datos de Ruta Calculados</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Distancia Total:</span>
                  <p className="font-semibold text-blue-800">{datosCalculoRuta.distanciaTotal.toFixed(1)} km</p>
                </div>
                <div>
                  <span className="text-blue-600">Tiempo Estimado:</span>
                  <p className="font-semibold text-blue-800">
                    {Math.round(datosCalculoRuta.tiempoEstimado || 0)} min
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default XMLGenerationPanel;
