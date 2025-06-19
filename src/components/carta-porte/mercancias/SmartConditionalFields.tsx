
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Snowflake, Truck, Shield, Package } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';

interface SmartConditionalFieldsProps {
  mercancia: MercanciaCompleta;
  onChange: (field: keyof MercanciaCompleta, value: any) => void;
  showSemarnatFields: boolean;
  showMaterialPeligrosoFields: boolean;
  showRefrigeracionFields: boolean;
  showEspecializadoFields: boolean;
}

export function SmartConditionalFields({
  mercancia,
  onChange,
  showSemarnatFields,
  showMaterialPeligrosoFields,
  showRefrigeracionFields,
  showEspecializadoFields
}: SmartConditionalFieldsProps) {

  return (
    <div className="space-y-4">
      {/* Campos SEMARNAT - Aparecen dinámicamente */}
      {showSemarnatFields && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Autorización SEMARNAT Requerida
              <Badge variant="destructive">Detectado Automáticamente</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Material regulado detectado. Se requiere documentación SEMARNAT para el transporte.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número de Autorización SEMARNAT *</Label>
                <Input
                  value={mercancia.numero_autorizacion || ''}
                  onChange={(e) => onChange('numero_autorizacion', e.target.value)}
                  placeholder="Número de autorización"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Folio de Acreditación *</Label>
                <Input
                  value={mercancia.folio_acreditacion || ''}
                  onChange={(e) => onChange('folio_acreditacion', e.target.value)}
                  placeholder="Folio de acreditación"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campos Material Peligroso Avanzados */}
      {showMaterialPeligrosoFields && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Shield className="h-5 w-5" />
              Campos Avanzados - Material Peligroso
              <Badge variant="destructive">IA Detectado</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <Shield className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Sistema inteligente detectó material peligroso. Campos adicionales requeridos.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Tipo de Embalaje Especializado</Label>
              <Input
                value={mercancia.embalaje || ''}
                onChange={(e) => onChange('embalaje', e.target.value)}
                placeholder="Contenedor especializado, tanque certificado..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campos de Refrigeración - Aparecen dinámicamente */}
      {showRefrigeracionFields && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Snowflake className="h-5 w-5" />
              Control de Temperatura Detectado
              <Badge variant="outline">IA Sugerido</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Snowflake className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Producto que requiere control de temperatura durante el transporte.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperatura de Transporte (°C)</Label>
                <Input
                  value={mercancia.temperatura_transporte || ''}
                  onChange={(e) => onChange('temperatura_transporte', e.target.value)}
                  placeholder="Ej: -18, 2-8, 15-25"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Refrigeración</Label>
                <Input
                  value={mercancia.tipo_refrigeracion || ''}
                  onChange={(e) => onChange('tipo_refrigeracion', e.target.value)}
                  placeholder="Congelado, Refrigerado, Temperatura controlada"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campos Transporte Especializado - Aparecen dinámicamente */}
      {showEspecializadoFields && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Truck className="h-5 w-5" />
              Transporte Especializado Requerido
              <Badge variant="outline">IA Detectado</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-purple-200 bg-purple-50">
              <Truck className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Mercancía que requiere vehículo o manejo especializado.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dimensiones Especiales</Label>
                <Input
                  value={mercancia.dimensiones_especiales || ''}
                  onChange={(e) => onChange('dimensiones_especiales', e.target.value)}
                  placeholder="Largo x Ancho x Alto"
                />
              </div>

              <div className="space-y-2">
                <Label>Peso Especial (kg)</Label>
                <Input
                  value={mercancia.peso_especial || ''}
                  onChange={(e) => onChange('peso_especial', e.target.value)}
                  placeholder="Peso que requiere manejo especial"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observaciones Especiales</Label>
              <Textarea
                placeholder="Describa los requisitos especiales de transporte..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
