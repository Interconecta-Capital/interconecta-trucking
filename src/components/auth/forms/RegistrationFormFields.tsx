
import React from 'react';
import { ImprovedFormField } from '../ImprovedFormField';
import { Mail, Lock, User, Building, Hash, Phone } from 'lucide-react';

interface RegistrationFormFieldsProps {
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    nombre: string;
    empresa: string;
    rfc: string;
    telefono: string;
  };
  fieldErrors: Record<string, string>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onInputChange: (field: string, value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

export function RegistrationFormFields({
  formData,
  fieldErrors,
  showPassword,
  showConfirmPassword,
  onInputChange,
  onTogglePassword,
  onToggleConfirmPassword
}: RegistrationFormFieldsProps) {
  return (
    <div className="space-y-4">
      <ImprovedFormField
        id="email"
        label="Correo Electrónico"
        type="email"
        value={formData.email}
        onChange={(value) => onInputChange('email', value)}
        placeholder="tu@empresa.com"
        required
        error={fieldErrors.email}
        icon={<Mail className="h-4 w-4 text-gray-500" />}
      />

      <div className="grid grid-cols-2 gap-4">
        <ImprovedFormField
          id="password"
          label="Contraseña"
          value={formData.password}
          onChange={(value) => onInputChange('password', value)}
          required
          error={fieldErrors.password}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
          icon={<Lock className="h-4 w-4 text-gray-500" />}
        />

        <ImprovedFormField
          id="confirmPassword"
          label="Confirmar"
          value={formData.confirmPassword}
          onChange={(value) => onInputChange('confirmPassword', value)}
          required
          error={fieldErrors.confirmPassword}
          showPasswordToggle
          showPassword={showConfirmPassword}
          onTogglePassword={onToggleConfirmPassword}
          icon={<Lock className="h-4 w-4 text-gray-500" />}
        />
      </div>

      <ImprovedFormField
        id="nombre"
        label="Nombre Completo"
        value={formData.nombre}
        onChange={(value) => onInputChange('nombre', value)}
        placeholder="Tu nombre completo"
        required
        error={fieldErrors.nombre}
        icon={<User className="h-4 w-4 text-gray-500" />}
      />

      <div className="grid grid-cols-2 gap-4">
        <ImprovedFormField
          id="empresa"
          label="Empresa"
          value={formData.empresa}
          onChange={(value) => onInputChange('empresa', value)}
          placeholder="Nombre de tu empresa"
          icon={<Building className="h-4 w-4 text-gray-500" />}
        />

        <ImprovedFormField
          id="telefono"
          label="Teléfono"
          type="tel"
          value={formData.telefono}
          onChange={(value) => onInputChange('telefono', value)}
          placeholder="55 1234 5678"
          icon={<Phone className="h-4 w-4 text-gray-500" />}
        />
      </div>

      <ImprovedFormField
        id="rfc"
        label="RFC"
        value={formData.rfc}
        onChange={(value) => onInputChange('rfc', value)}
        placeholder="XAXX010101000"
        maxLength={13}
        error={fieldErrors.rfc}
        icon={<Hash className="h-4 w-4 text-gray-500" />}
      />
    </div>
  );
}
