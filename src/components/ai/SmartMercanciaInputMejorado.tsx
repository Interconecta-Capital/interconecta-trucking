
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Sparkles, AlertTriangle } from 'lucide-react';
import { Mercancia } from '@/types/mercancias';

interface SmartMercanciaInputMejoradoProps {
  mercancia: Mercancia;
  onMercanciaChange: (updates: Partial<Mercancia>) => void;
  showAdvancedOptions?: boolean;
  autoFocus?: boolean;
}

export function SmartMercanciaInputMejorado({
  mercancia,
  onMercanciaChange,
  showAdvancedOptions = false,
  autoFocus = false
}: SmartMercanciaInputMejoradoProps) {
  const [showAdvanced, setShowAdvanced] = useState(showAdvancedOptions);

  const handleFieldChange = (field: keyof Mercancia, value: any) => {
    onMercanciaChange({ [field]: value });
  };

  const detectarDatosDesdescripcion = (descripcion: string) => {
    const texto = descripcion.toLowerCase();
    
    // Detectar peso
    const pesoMatch = texto.match(/(\d+(?:\.\d+)?)\s*(ton|toneladas|kg|kilogramos)/i);
    if (pesoMatch) {
      const cantidad = parseFloat(pesoMatch[1]);
      const unidad = pesoMatch[2].toLowerCase();
      const pesoKg = unidad.includes('ton') ? cantidad * 1000 : cantidad;
      
      handleFieldChange('pesoKg', pesoKg);
      handleFieldChange('cantidad', cantidad);
    }
    
    // Detectar si es material peligroso
    if (texto.includes('químico') || texto.includes('tóxico') || texto.includes('peligroso') || 
        texto.includes('inflamable') || texto.includes('corrosivo')) {
      handleFieldChange('esMaterialPeligroso', true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Descripción principal */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción de la Mercancía *</Label>
        <Textarea
          id="descripcion"
          value={mercancia.descripcion}
          onChange={(e) => {
            handleFieldChange('descripcion', e.target.value);
            detectarDatosDesdescripcion(e.target.value);
          }}
          placeholder="Ej: 30 toneladas de aguacate Hass para exportación..."
          className="min-h-[80px]"
          autoFocus={autoFocus}
        />
        {mercancia.aiGenerated && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Sparkles className="h-4 w-4" />
            <span>Datos detectados automáticamente por IA</span>
            <Badge variant="outline" className="text-xs">
              Confianza: {mercancia.aiConfidence === 'alta' ? 'Alta' : 
                         mercancia.aiConfidence === 'media' ? 'Media' : 'Baja'}
            </Badge>
          </div>
        )}
      </div>

      {/* Campos básicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input
            id="cantidad"
            type="number"
            value={mercancia.cantidad}
            onChange={(e) => handleFieldChange('cantidad', parseFloat(e.target.value) || 0)}
            placeholder="1"
            min="0.01"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pesoKg">Peso (kg)</Label>
          <Input
            id="pesoKg"
            type="number"
            value={mercancia.pesoKg}
            onChange={(e) => handleFieldChange('pesoKg', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unidad">Unidad</Label>
          <Select 
            value={mercancia.unidad} 
            onValueChange={(value) => handleFieldChange('unidad', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KGM">Kilogramo (KGM)</SelectItem>
              <SelectItem value="TNE">Tonelada (TNE)</SelectItem>
              <SelectItem value="LTR">Litro (LTR)</SelectItem>
              <SelectItem value="MTQ">Metro cúbico (MTQ)</SelectItem>
              <SelectItem value="PZA">Pieza (PZA)</SelectItem>
              <SelectItem value="SET">Conjunto (SET)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botón para opciones avanzadas */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showAdvanced ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
      </Button>

      {/* Opciones avanzadas */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">Opciones Avanzadas</h4>
          
          {/* Valor de la mercancía */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorMercancia">Valor de la Mercancía (MXN)</Label>
              <Input
                id="valorMercancia"
                type="number"
                value={mercancia.valorMercancia}
                onChange={(e) => handleFieldChange('valorMercancia', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorUnitario">Valor Unitario (MXN)</Label>
              <Input
                id="valorUnitario"
                type="number"
                value={mercancia.valorUnitario || ''}
                onChange={(e) => handleFieldChange('valorUnitario', parseFloat(e.target.value) || undefined)}
                placeholder="Se calcula automáticamente"
              />
            </div>
          </div>

          {/* Claves SAT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="claveProdServ">Clave Producto/Servicio SAT</Label>
              <Input
                id="claveProdServ"
                value={mercancia.claveProdServ}
                onChange={(e) => handleFieldChange('claveProdServ', e.target.value)}
                placeholder="Ej: 01010101"
                maxLength={8}
              />
              {mercancia.validacionSAT?.claveProdServ?.valid && (
                <div className="text-sm text-green-600">
                  ✓ Clave válida: {mercancia.validacionSAT.claveProdServ.item?.descripcion}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="claveUnidad">Clave Unidad SAT</Label>
              <Input
                id="claveUnidad"
                value={mercancia.claveUnidad}
                onChange={(e) => handleFieldChange('claveUnidad', e.target.value)}
                placeholder="Ej: KGM"
                maxLength={3}
              />
              {mercancia.validacionSAT?.claveUnidad?.valid && (
                <div className="text-sm text-green-600">
                  ✓ Unidad válida: {mercancia.validacionSAT.claveUnidad.item?.descripcion}
                </div>
              )}
            </div>
          </div>

          {/* Material peligroso */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Switch
                id="materialPeligroso"
                checked={mercancia.esMaterialPeligroso || false}
                onCheckedChange={(checked) => handleFieldChange('esMaterialPeligroso', checked)}
              />
              <Label htmlFor="materialPeligroso" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                ¿Es material peligroso?
              </Label>
            </div>

            {mercancia.esMaterialPeligroso && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="materialPeligroso">Clave Material Peligroso</Label>
                  <Input
                    id="materialPeligroso"
                    value={mercancia.materialPeligroso || ''}
                    onChange={(e) => handleFieldChange('materialPeligroso', e.target.value)}
                    placeholder="Ej: 1993"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="embalaje">Tipo de Embalaje</Label>
                  <Select 
                    value={mercancia.embalaje || ''} 
                    onValueChange={(value) => handleFieldChange('embalaje', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar embalaje" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4G">Caja de cartón (4G)</SelectItem>
                      <SelectItem value="1A1">Tambor de acero (1A1)</SelectItem>
                      <SelectItem value="3H1">Saco de material textil (3H1)</SelectItem>
                      <SelectItem value="5H1">Saco de material textil (5H1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Dimensiones */}
          <div className="space-y-2">
            <Label>Dimensiones (opcional)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                value={mercancia.dimensiones?.largo || ''}
                onChange={(e) => handleFieldChange('dimensiones', {
                  ...mercancia.dimensiones,
                  largo: parseFloat(e.target.value) || 0
                })}
                placeholder="Largo (cm)"
                min="0"
                step="0.1"
              />
              <Input
                type="number"
                value={mercancia.dimensiones?.ancho || ''}
                onChange={(e) => handleFieldChange('dimensiones', {
                  ...mercancia.dimensiones,
                  ancho: parseFloat(e.target.value) || 0
                })}
                placeholder="Ancho (cm)"
                min="0"
                step="0.1"
              />
              <Input
                type="number"
                value={mercancia.dimensiones?.alto || ''}
                onChange={(e) => handleFieldChange('dimensiones', {
                  ...mercancia.dimensiones,
                  alto: parseFloat(e.target.value) || 0
                })}
                placeholder="Alto (cm)"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
