
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConductorBasicFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export function ConductorBasicFields({ formData, onFieldChange, errors }: ConductorBasicFieldsProps) {
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      onFieldChange('foto_preview', previewUrl);
      onFieldChange('foto_file', file);
    }
  };

  const removePhoto = () => {
    onFieldChange('foto_preview', null);
    onFieldChange('foto_file', null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Foto del Conductor */}
        <div className="space-y-2">
          <Label>Foto del Conductor</Label>
          <div className="flex items-center gap-4">
            {formData.foto_preview ? (
              <div className="relative">
                <img
                  src={formData.foto_preview}
                  alt="Foto del conductor"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  loading="lazy"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removePhoto}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="foto-upload"
              />
              <label htmlFor="foto-upload">
                <Button type="button" variant="outline" className="cursor-pointer" asChild>
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Subir Foto
                  </span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG hasta 2MB
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="nombre">Nombre completo *</Label>
          <Input
            id="nombre"
            value={formData.nombre || ''}
            onChange={(e) => onFieldChange('nombre', e.target.value)}
            placeholder="Nombre completo del conductor"
            className={errors?.nombre ? 'border-red-500' : ''}
          />
          {errors?.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              value={formData.rfc || ''}
              onChange={(e) => onFieldChange('rfc', e.target.value.toUpperCase())}
              placeholder="RFC del conductor"
              maxLength={13}
              className="uppercase"
            />
          </div>

          <div>
            <Label htmlFor="curp">CURP</Label>
            <Input
              id="curp"
              value={formData.curp || ''}
              onChange={(e) => onFieldChange('curp', e.target.value.toUpperCase())}
              placeholder="CURP del conductor"
              maxLength={18}
              className="uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono || ''}
              onChange={(e) => onFieldChange('telefono', e.target.value)}
              placeholder="Número de teléfono"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
