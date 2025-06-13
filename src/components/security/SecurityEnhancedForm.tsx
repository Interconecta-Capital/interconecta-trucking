
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInputSanitization } from '@/hooks/useInputSanitization';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { toast } from 'sonner';

export function SecurityEnhancedForm() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    rfc: '',
    phone: ''
  });

  const { sanitizeInput, validateEmail, validateRFC, sanitizationErrors, clearErrors } = useInputSanitization();
  const { csrfToken, protectedRequest } = useCSRFProtection();

  const handleInputChange = (field: string, value: string) => {
    let sanitizedValue = value;
    
    switch (field) {
      case 'email':
        sanitizedValue = sanitizeInput(value, 'email');
        break;
      case 'rfc':
        sanitizedValue = sanitizeInput(value, 'rfc');
        break;
      case 'phone':
        sanitizedValue = sanitizeInput(value, 'phone');
        break;
      case 'name':
        sanitizedValue = sanitizeInput(value, 'nombre');
        break;
      case 'company':
        sanitizedValue = sanitizeInput(value, 'empresa');
        break;
      default:
        sanitizedValue = sanitizeInput(value, 'text');
        break;
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    clearErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error || 'Email inválido');
      return;
    }

    // Validate RFC if provided
    if (formData.rfc) {
      const rfcValidation = validateRFC(formData.rfc);
      if (!rfcValidation.isValid) {
        toast.error(rfcValidation.error || 'RFC inválido');
        return;
      }
    }

    try {
      const response = await protectedRequest('/api/secure-endpoint', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          csrfToken
        })
      });

      if (response.ok) {
        toast.success('Formulario enviado de forma segura');
        setFormData({ email: '', name: '', company: '', rfc: '', phone: '' });
      } else {
        toast.error('Error al enviar formulario');
      }
    } catch (error) {
      toast.error('Error de red');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Formulario Seguro</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="csrf_token" value={csrfToken} />
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={sanitizationErrors?.email ? 'border-red-500' : ''}
            />
            {sanitizationErrors?.email && (
              <p className="text-sm text-red-600">{sanitizationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              value={formData.rfc}
              onChange={(e) => handleInputChange('rfc', e.target.value)}
              maxLength={13}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Enviar de forma segura
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
