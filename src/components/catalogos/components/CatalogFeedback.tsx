
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface CatalogFeedbackProps {
  error?: string;
  searchTerm: string;
  filteredCount: number;
  value?: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export function CatalogFeedback({
  error,
  searchTerm,
  filteredCount,
  value,
  options
}: CatalogFeedbackProps) {
  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {searchTerm && filteredCount > 0 && (
        <div className="text-xs text-muted-foreground">
          {filteredCount} resultado(s) encontrado(s)
        </div>
      )}

      {value && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Seleccionado: {options.find(opt => opt.value === value)?.label || value}
          </Badge>
        </div>
      )}
    </>
  );
}
