
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save, Stamp, Brain } from 'lucide-react';

interface CartaPorteCompletionCardProps {
  canGenerateXML: boolean;
  hasAIEnhancements: boolean;
  onSaveTemplate: () => void;
  onGenerateXML: () => void;
}

export function CartaPorteCompletionCard({
  canGenerateXML,
  hasAIEnhancements,
  onSaveTemplate,
  onGenerateXML,
}: CartaPorteCompletionCardProps) {
  if (!canGenerateXML) return null;

  return (
    <Card className={`border-green-200 ${hasAIEnhancements ? 'bg-gradient-to-r from-green-50 to-purple-50' : 'bg-green-50'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800 flex items-center gap-2">
                Carta Porte Lista para Generar XML
                {hasAIEnhancements && <Brain className="h-4 w-4 text-purple-600" />}
              </h3>
              <p className="text-sm text-green-600">
                {hasAIEnhancements 
                  ? 'Validada con IA - Sin errores detectados' 
                  : 'Todos los datos requeridos han sido completados'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              type="button"
              variant="outline"
              onClick={onSaveTemplate}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Plantilla</span>
            </Button>
            <Button 
              type="button"
              onClick={onGenerateXML}
              className="flex items-center space-x-2"
            >
              <Stamp className="h-4 w-4" />
              <span>Generar XML y Timbrar</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
