
import { AlertCircle } from 'lucide-react';

interface FormValidationProps {
  error?: string;
}

export function FormValidation({ error }: FormValidationProps) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-red-600">
      <AlertCircle className="h-3 w-3" />
      {error}
    </div>
  );
}
