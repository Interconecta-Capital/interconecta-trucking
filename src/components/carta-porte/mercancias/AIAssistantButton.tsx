
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { useGeminiAssistant } from '@/hooks/useGeminiAssistant';
import { toast } from 'sonner';

interface AIAssistantButtonProps {
  onSuggestionApply?: (suggestion: any) => void;
  context?: 'mercancias' | 'ubicaciones' | 'autotransporte' | 'figuras';
  disabled?: boolean;
}

export function AIAssistantButton({ 
  onSuggestionApply, 
  context = 'mercancias',
  disabled = false 
}: AIAssistantButtonProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const { generateSuggestion, isLoading, suggestions, clearSuggestions } = useGeminiAssistant();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor ingresa una consulta');
      return;
    }

    try {
      await generateSuggestion(prompt, context);
      setPrompt('');
    } catch (error) {
      console.error('Error generating suggestion:', error);
      toast.error('Error al generar sugerencia');
    }
  };

  const handleApplySuggestion = (suggestion: any) => {
    if (onSuggestionApply) {
      onSuggestionApply(suggestion);
      setOpen(false);
      toast.success('Sugerencia aplicada');
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copiado al portapapeles');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  const getContextPlaceholder = () => {
    switch (context) {
      case 'mercancias':
        return 'Ej: "Necesito datos para transportar cemento en sacos de 50kg" o "¿Cuál es la clave para productos farmacéuticos?"';
      case 'ubicaciones':
        return 'Ej: "Necesito las coordenadas de Guadalajara, Jalisco" o "¿Cuál es el código postal de Polanco?"';
      case 'autotransporte':
        return 'Ej: "¿Qué configuración vehicular necesito para un tráiler?" o "Permisos SCT para transporte de carga"';
      case 'figuras':
        return 'Ej: "Datos del operador para licencia tipo E" o "¿Qué información necesito del propietario?"';
      default:
        return 'Describe lo que necesitas para tu carta porte...';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Asistente IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Asistente IA - {context.charAt(0).toUpperCase() + context.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Textarea
              placeholder={getContextPlaceholder()}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generar Sugerencia
                </>
              )}
            </Button>
            
            {suggestions.length > 0 && (
              <Button
                variant="outline"
                onClick={clearSuggestions}
                disabled={isLoading}
              >
                Limpiar
              </Button>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium">Sugerencias:</h4>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">{suggestion.title}</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {suggestion.description}
                      </p>
                      
                      {suggestion.data && (
                        <div className="space-y-2">
                          {Object.entries(suggestion.data).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 text-xs">
                              <Badge variant="secondary">{key}</Badge>
                              <span className="font-mono">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(JSON.stringify(suggestion, null, 2), index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      
                      {onSuggestionApply && (
                        <Button
                          size="sm"
                          onClick={() => handleApplySuggestion(suggestion)}
                        >
                          Aplicar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
