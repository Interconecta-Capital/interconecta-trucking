
import React from 'react';
import { useInputSanitization } from '@/hooks/useInputSanitization';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SecurityEnhancedFormProps {
  children: React.ReactNode;
  onSubmit: (formData: FormData, csrfToken: string) => Promise<void>;
  className?: string;
}

export function SecurityEnhancedForm({ children, onSubmit, className }: SecurityEnhancedFormProps) {
  const { sanitizeInput, sanitizationErrors, clearErrors } = useInputSanitization();
  const { csrfToken, protectedRequest } = useCSRFProtection();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    const formData = new FormData(e.currentTarget);
    
    try {
      await protectedRequest(() => onSubmit(formData, csrfToken));
    } catch (error) {
      console.error('Protected request failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      
      {Object.keys(sanitizationErrors).length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {Object.values(sanitizationErrors).join(', ')}
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </form>
  );
}

interface SecureInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SecureInput({ 
  name, 
  label, 
  type = 'text', 
  placeholder, 
  maxLength = 255,
  required = false,
  className,
  value,
  onChange
}: SecureInputProps) {
  const { sanitizeInput, sanitizationErrors } = useInputSanitization();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value, name, { maxLength });
    if (onChange) {
      onChange(sanitized);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label} {required && '*'}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
        className={className}
        maxLength={maxLength}
      />
      {sanitizationErrors[name] && (
        <p className="text-sm text-red-600">{sanitizationErrors[name]}</p>
      )}
    </div>
  );
}
