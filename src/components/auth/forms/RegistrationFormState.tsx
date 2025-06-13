
import { useState } from 'react';

export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  empresa: string;
  rfc: string;
  telefono: string;
}

export function useRegistrationFormState() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    empresa: '',
    rfc: '',
    telefono: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string, sanitizeInput: (value: string) => string) => {
    const sanitizedValue = field === 'rfc' ? value.toUpperCase() : sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      email: '', password: '', confirmPassword: '',
      nombre: '', empresa: '', rfc: '', telefono: ''
    });
  };

  return {
    formData,
    showPassword,
    showConfirmPassword,
    isLoading,
    fieldErrors,
    setShowPassword,
    setShowConfirmPassword,
    setIsLoading,
    setFieldErrors,
    handleInputChange,
    resetForm
  };
}
