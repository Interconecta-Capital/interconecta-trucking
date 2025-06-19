
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle, Leaf } from 'lucide-react';
import { CatalogosFaunaSilvestre } from '@/services/catalogos/CatalogosFaunaSilvestre';

interface FaunaSilvestreFormProps {
  onMercanciaGenerated: (mercancia: any) => void;
  onCancel: () => void;
  editingData?: any;
}

export function FaunaSilvestreForm({ onMercanciaGenerated, onCancel, editingData }: FaunaSilvestreFormProps) {
  const [formData, setFormData] = useState({
    nombreComun: editingData?.nombreComun || '',
    sexo: editingData?.sexo || '',
    edad: editingData?.edad || '',
    microchip: editingData?.microchip || '',
    autorizacionSEMARNAT: editingData?.autorizacionSEMARNAT || '',
    acreditacionLegal: editingData?.acreditacionLegal || '',
    cantidad: editingData?.cantidad || 1,
    pesoEnKg: editingData?.pesoEnKg || 0,
    valorMercancia: editingData?.valorMercancia || 0,
    observaciones: editingData?.observaciones || ''
  });

  const [especieInfo, setEspecieInfo] = useState<any>(null);
  const [validacion, setValidacion] = useState<any>(null);
  const [descripcionGenerada, setDescripcionGenerada] = useState('');

  useEffect(() => {
    if (formData.nombreComun) {
      const info = CatalogosFaunaSilvestre.getEspecieInfo(formData.nombreComun);
      setEspecieInfo(info);
      
      if (info) {
        const validacionDoc = CatalogosFaunaSilvestre.validarDocumentacionRequerida(
          formData.nombreComun,
          {
            tieneAutorizacionTraslado: !!formData.autorizacionSEMARNAT,
            tieneAcreditacionLegal: !!formData.acreditacionLegal,
            cumpleNOM051: true // Asumimos cumplimiento
          }
        );
        setValidacion(validacionDoc);
      }
    }
  }, [formData.nombreComun, formData.autorizacionSEMARNAT, formData.acreditacionLegal]);

  useEffect(() => {
    if (especieInfo && validacion?.esValido) {
      try {
        const descripcion = CatalogosFaunaSilvestre.generarDescripcionCartaPorte({
          nombreComun: formData.nombreComun,
          sexo: formData.sexo,
          edad: formData.edad,
          microchip: formData.microchip,
          autorizacionSEMARNAT: formData.autorizacionSEMARNAT,
          acreditacionLegal: formData.acreditacionLegal,
          observaciones: formData.observaciones
        });
        setDescripcionGenerada(descripcion);
      } catch (error) {
        setDescripcionGenerada('');
      }
    }
  }, [formData, especieInfo, validacion]);

  const handleSubmit = () => {
    if (!validacion?.esValido) {
      return;
    }

    const mercancia = {
      bienesTransp: CatalogosFaunaSilvestre.getClaveBienesTransp(),
      descripcion: descripcionGenerada,
      cantidad: formData.cantidad,
      claveUnidad: CatalogosFaunaSilvestre.getClaveUnidad(),
      unidad: 'Pieza',
      pesoEnKg: formData.pesoEnKg,
      valorMercancia: formData.valorMercancia,
      materialPeligroso: CatalogosFaunaSilvestre.esMaterialPeligroso() ? 'Sí' : 'No',
      // Datos adicionales para referencia
      _faunaSilvestre: {
        ...formData,
        nombreCientifico: especieInfo?.nombreCientifico,
        estatusProteccion: especieInfo?.estatusProteccion,
        cites: especieInfo?.cites
      }
    };

    onMercanciaGenerated(mercancia);
  };

  const especiesDisponibles = ['jaguar', 'ocelote', 'quetzal'];

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          Configurar Fauna Silvestre para Carta Porte 3.1
        </CardTitle>
        {especieInfo && (
          <div className="flex gap-2">
            <Badge variant="outline" className="text-green-700">
              {especieInfo.nombreCientifico}
            </Badge>
            <Badge variant="secondary">
              {especieInfo.estatusProteccion}
            </Badge>
            <Badge variant="destructive">
              CITES {especieInfo.cites}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selección de especie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Especie *</label>
            <Select value={formData.nombreComun} onValueChange={(value) => setFormData(prev => ({ ...prev, nombreComun: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar especie" />
              </SelectTrigger>
              <SelectContent>
                {especiesDisponibles.map(especie => (
                  <SelectItem key={especie} value={especie}>
                    {especie.charAt(0).toUpperCase() + especie.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sexo</label>
            <Select value={formData.sexo} onValueChange={(value) => setFormData(prev => ({ ...prev, sexo: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Macho">Macho</SelectItem>
                <SelectItem value="Hembra">Hembra</SelectItem>
                <SelectItem value="Indeterminado">Indeterminado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Información física */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Edad/Años</label>
            <Input
              value={formData.edad}
              onChange={(e) => setFormData(prev => ({ ...prev, edad: e.target.value }))}
              placeholder="ej. 5 años"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cantidad *</label>
            <Input
              type="number"
              min="1"
              value={formData.cantidad}
              onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Peso Total (Kg) *</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.pesoEnKg}
              onChange={(e) => setFormData(prev => ({ ...prev, pesoEnKg: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        {/* Identificación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Número de Microchip</label>
            <Input
              value={formData.microchip}
              onChange={(e) => setFormData(prev => ({ ...prev, microchip: e.target.value }))}
              placeholder="ej. 985100012345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Valor Comercial ($)</label>
            <Input
              type="number"
              min="0"
              value={formData.valorMercancia}
              onChange={(e) => setFormData(prev => ({ ...prev, valorMercancia: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        {/* Documentación SEMARNAT */}
        <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-medium text-amber-900 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Documentación SEMARNAT (Obligatoria)
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">No. Autorización de Traslado SEMARNAT *</label>
              <Input
                value={formData.autorizacionSEMARNAT}
                onChange={(e) => setFormData(prev => ({ ...prev, autorizacionSEMARNAT: e.target.value }))}
                placeholder="ej. GTO-123/2025"
                className="border-amber-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">No. Acreditación de Legal Procedencia *</label>
              <Input
                value={formData.acreditacionLegal}
                onChange={(e) => setFormData(prev => ({ ...prev, acreditacionLegal: e.target.value }))}
                placeholder="ej. Factura UMA-001-2025"
                className="border-amber-300"
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium mb-2">Observaciones Adicionales</label>
          <Textarea
            value={formData.observaciones}
            onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
            placeholder="Información adicional relevante..."
            rows={3}
          />
        </div>

        {/* Validación */}
        {validacion && (
          <div className="space-y-2">
            {validacion.errores.map((error: string, index: number) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ))}
            
            {validacion.advertencias.map((advertencia: string, index: number) => (
              <Alert key={index}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{advertencia}</AlertDescription>
              </Alert>
            ))}
            
            {validacion.esValido && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Documentación completa según normativa SEMARNAT
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Descripción generada */}
        {descripcionGenerada && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Descripción para Carta Porte:</h4>
            <p className="text-sm text-blue-800">{descripcionGenerada}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!validacion?.esValido || !descripcionGenerada}
            className="bg-green-600 hover:bg-green-700"
          >
            <Leaf className="h-4 w-4 mr-2" />
            Generar Mercancía
          </Button>
          
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
