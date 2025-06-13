
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ImprovedFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  maxLength?: number;
  icon?: React.ReactNode;
}

export function ImprovedFormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  maxLength,
  icon
}: ImprovedFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className="font-inter font-medium text-interconecta-text-body flex items-center gap-2"
      >
        {icon}
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className={`
            h-12 border-2 font-inter transition-all duration-200
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-200 focus:border-interconecta-primary focus:ring-interconecta-primary-light'
            }
            ${showPasswordToggle ? 'pr-12' : ''}
            hover:border-gray-300 focus:ring-2
          `}
        />
        {showPasswordToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={onTogglePassword}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1 font-inter">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
