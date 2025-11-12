import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';

interface FormFieldWithHelpProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  helpText: string;
  example?: string;
  required?: boolean;
  icon?: React.ReactNode;
  validationRule?: (value: string) => { valid: boolean; message: string };
  type?: string;
}

export function FormFieldWithHelp({ 
  label, 
  value, 
  onChange, 
  placeholder,
  helpText, 
  example,
  required,
  icon,
  validationRule,
  type = "text"
}: FormFieldWithHelpProps) {
  const [touched, setTouched] = useState(false);
  const validation = validationRule && touched ? validationRule(value) : null;
  
  return (
    <div className="form-field-with-help space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          {icon}
          {label}
          {required && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-destructive border-destructive/20">
              Obligatorio
            </Badge>
          )}
        </Label>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="focus:outline-none">
                <Info className="h-4 w-4 text-primary cursor-help hover:text-primary/80 transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border" side="left">
              <p className="text-sm">{helpText}</p>
              {example && (
                <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                  <strong>Ejemplo:</strong> {example}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        className={`
          transition-all duration-200
          ${touched && validation && !validation.valid
            ? 'border-destructive focus-visible:ring-destructive'
            : touched && value && validation?.valid
            ? 'border-success focus-visible:ring-success'
            : 'border-border'
          }
        `}
      />
      
      {touched && validation && !validation.valid && (
        <p className="text-xs text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-3 w-3" />
          {validation.message}
        </p>
      )}
      
      {touched && value && validation?.valid && (
        <p className="text-xs text-success flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <CheckCircle className="h-3 w-3" />
          ¡Correcto!
        </p>
      )}
    </div>
  );
}
