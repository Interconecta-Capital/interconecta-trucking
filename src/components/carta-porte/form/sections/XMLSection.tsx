
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';

interface XMLSectionProps {
  data: CartaPorteData;
  onSave: () => Promise<void>;
}

export function XMLSection({ data, onSave }: XMLSectionProps) {
  const handleGenerateXML = async () => {
    await onSave();
    // Aquí iría la lógica de generación XML
    console.log('Generando XML para:', data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generación de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Genera los documentos XML y PDF de la carta porte
            </p>
            <div className="space-y-2">
              <Button onClick={handleGenerateXML} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generar XML
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
