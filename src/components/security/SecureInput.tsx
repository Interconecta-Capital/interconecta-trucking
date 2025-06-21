
import { forwardRef, useState } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { cn } from '@/lib/utils';

interface SecureInputProps extends InputProps {
  validationType?: 'rfc' | 'email' | 'text';
  maxLength?: number;
  showValidation?: boolean;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ 
    validationType = 'text', 
    maxLength = 255, 
    showValidation = true,
    className,
    onChange,
    ...props 
  }, ref) => {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isValid, setIsValid] = useState(true);
    const { sanitizeInput, validateRFC, validateEmail } = useEnhancedSecurity();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const sanitizedValue = sanitizeInput(rawValue, maxLength);
      
      // Update the input value with sanitized content
      e.target.value = sanitizedValue;
      
      // Validate based on type
      let validation = { isValid: true, errors: [] as string[] };
      
      if (sanitizedValue && validationType === 'rfc') {
        validation = validateRFC(sanitizedValue);
      } else if (sanitizedValue && validationType === 'email') {
        validation = validateEmail(sanitizedValue);
      }
      
      setValidationErrors(validation.errors);
      setIsValid(validation.isValid);
      
      // Call original onChange if provided
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="space-y-1">
        <Input
          ref={ref}
          {...props}
          onChange={handleChange}
          className={cn(
            className,
            !isValid && showValidation && 'border-red-500 focus:border-red-500'
          )}
          maxLength={maxLength}
        />
        {showValidation && !isValid && validationErrors.length > 0 && (
          <div className="text-xs text-red-600 space-y-1">
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

SecureInput.displayName = 'SecureInput';
