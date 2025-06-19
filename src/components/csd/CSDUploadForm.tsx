
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileX, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { CSDUploadData } from '@/types/certificados';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSDUploadFormProps {
  onSubmit: (data: CSDUploadData) => Promise<void>;
  isLoading: boolean;
}

export function CSDUploadForm({ onSubmit, isLoading }: CSDUploadFormProps) {
  const [formData, setFormData] = useState({
    nombreCertificado: '',
    passwordKey: '',
    archivoCer: null as File | null,
    archivoKey: null as File | null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (field: 'archivoCer' | 'archivoKey') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      // Limpiar errores cuando se selecciona un archivo
      if (errors.length > 0) {
        setErrors([]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    const newErrors: string[] = [];
    
    if (!formData.nombreCertificado.trim()) {
      newErrors.push('El nombre del certificado es obligatorio');
    }
    
    if (!formData.archivoCer) {
      newErrors.push('Debe seleccionar el archivo .cer');
    }
    
    if (!formData.archivoKey) {
      newErrors.push('Debe seleccionar el archivo .key');
    }
    
    if (!formData.passwordKey.trim()) {
      newErrors.push('La contraseña de la llave privada es obligatoria');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        nombreCertificado: formData.nombreCertificado.trim(),
        passwordKey: formData.passwordKey,
        archivoCer: formData.archivoCer!,
        archivoKey: formData.archivoKey!
      });
      
      // Limpiar formulario en caso de éxito
      setFormData({
        nombreCertificado: '',
        passwordKey: '',
        archivoCer: null,
        archivoKey: null
      });
      setErrors([]);
      
      // Limpiar inputs de archivo
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => input.value = '');
      
    } catch (error) {
      // Los errores se manejan en el hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Certificado Digital (CSD)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mostrar errores */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Nombre del certificado */}
          <div className="space-y-2">
            <Label htmlFor="nombreCertificado">
              Nombre del Certificado *
            </Label>
            <Input
              id="nombreCertificado"
              type="text"
              placeholder="Ej: Certificado Principal 2024"
              value={formData.nombreCertificado}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                nombreCertificado: e.target.value 
              }))}
              disabled={isLoading}
            />
          </div>

          {/* Archivo .cer */}
          <div className="space-y-2">
            <Label htmlFor="archivoCer">
              Archivo de Certificado (.cer) *
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="archivoCer"
                type="file"
                accept=".cer"
                onChange={handleFileChange('archivoCer')}
                disabled={isLoading}
                className="flex-1"
              />
              {formData.archivoCer && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <FileX className="h-4 w-4" />
                  {formData.archivoCer.name}
                </div>
              )}
            </div>
          </div>

          {/* Archivo .key */}
          <div className="space-y-2">
            <Label htmlFor="archivoKey">
              Archivo de Llave Privada (.key) *
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="archivoKey"
                type="file"
                accept=".key"
                onChange={handleFileChange('archivoKey')}
                disabled={isLoading}
                className="flex-1"
              />
              {formData.archivoKey && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <FileX className="h-4 w-4" />
                  {formData.archivoKey.name}
                </div>
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="passwordKey">
              Contraseña de la Llave Privada *
            </Label>
            <div className="relative">
              <Input
                id="passwordKey"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingrese la contraseña"
                value={formData.passwordKey}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  passwordKey: e.target.value 
                }))}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Botón de envío */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>Procesando certificado...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir Certificado
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
