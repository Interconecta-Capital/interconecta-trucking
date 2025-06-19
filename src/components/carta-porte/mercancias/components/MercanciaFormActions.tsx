
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Save, X } from 'lucide-react';
import { AIAssistantButton } from '../AIAssistantButton';

interface MercanciaFormActionsProps {
  index: number;
  onRemove?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  onAISuggestion: (suggestion: any) => void;
}

export function MercanciaFormActions({
  index,
  onRemove,
  onCancel,
  isLoading,
  onAISuggestion
}: MercanciaFormActionsProps) {
  return (
    <>
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h4 className="text-lg font-semibold text-gray-900">Mercancía {index + 1}</h4>
        <div className="flex gap-2">
          <AIAssistantButton 
            context="mercancias"
            onSuggestionApply={onAISuggestion}
          />
          {onRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </>
  );
}
