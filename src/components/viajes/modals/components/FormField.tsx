
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormValidation } from './FormValidation';
import type { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: LucideIcon;
  min?: string;
}

export function FormField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  icon: Icon,
  min
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={Icon ? "flex items-center gap-1" : ""}>
        {Icon && <Icon className="h-4 w-4" />}
        {label} {required && '*'}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={error ? 'border-red-500' : ''}
        min={min}
      />
      <FormValidation error={error} />
    </div>
  );
}
