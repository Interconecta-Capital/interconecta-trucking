
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, CheckCircle, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { useCatalogosSATInteligente } from '@/hooks/useCatalogosSATInteligente';

interface CatalogoSelectorInteligenteProps {
  tipo: string;
  value?: string;
  onChange?: (value: string) => void;
  onSelectionData?: (data: any) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  enableIA?: boolean;
  contextualData?: Record<string, any>;
  showValidation?: boolean;
  showSuggestions?: boolean;
  className?: string;
}

export function CatalogoSelectorInteligente({
  tipo,
  value,
  onChange,
  onSelectionData,
  label,
  placeholder = 'Buscar o seleccionar...',
  required = false,
  disabled = false,
  enableIA = true,
  contextualData = {},
  showValidation = true,
  showSuggestions = true,
  className
}: CatalogoSelectorInteligenteProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const {
    searchTerm,
    setSearchTerm,
    actualizarContexto,
    datos,
    sugerenciasIA,
    isLoading,
    error,
    refetch,
    validarCodigoSAT,
    obtenerSugerenciasPorDescripcion,
    stats
  } = useCatalogosSATInteligente({
    tipo,
    enableIA,
    minSearchLength: 2,
    maxSuggestions: 8,
    prioritizeSAT: true
  });

  // Actualizar contexto cuando cambie
  useEffect(() => {
    if (Object.keys(contextualData).length > 0) {
      actualizarContexto(contextualData);
    }
  }, [contextualData, actualizarContexto]);

  // Validar valor actual cuando cambie
  useEffect(() => {
    if (value && showValidation && value !== searchTerm) {
      validarCodigoSAT(value).then(setValidationResult);
    }
  }, [value, showValidation, validarCodigoSAT, searchTerm]);

  // Filtrar y ordenar datos mostrados
  const datosParaMostrar = useMemo(() => {
    if (!searchTerm) return datos.slice(0, 10);
    
    const filtered = datos.filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clave?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.slice(0, 15);
  }, [datos, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setShowDropdown(true);
    onChange?.(newValue);
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setSearchTerm(item.label);
    onChange?.(item.clave || item.value);
    setShowDropdown(false);
    
    onSelectionData?.({
      ...item,
      isValidated: item.source === 'sat_oficial',
      confidence: item.confidence
    });
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // Delay para permitir clicks en dropdown
    setTimeout(() => setShowDropdown(false), 200);
  };

  const getValidationIcon = () => {
    if (!showValidation || !value) return null;
    
    if (validationResult?.valido) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (validationResult?.valido === false) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getSourceBadge = (source: string, confidence?: number) => {
    switch (source) {
      case 'sat_oficial':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            SAT Oficial
          </Badge>
        );
      case 'ia_sugerencia':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Sparkles className="h-3 w-3 mr-1" />
            IA {confidence ? `${Math.round(confidence * 100)}%` : ''}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            Cache
          </Badge>
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
          {enableIA && <Sparkles className="h-3 w-3 text-purple-500" />}
        </Label>
      )}

      <div className="relative">
        <div className="relative">
          <Input
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-12"
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
            {getValidationIcon()}
          </div>
        </div>

        {/* Dropdown de sugerencias */}
        {showDropdown && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="p-3 text-center text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Consultando catálogos SAT...
              </div>
            )}

            {!isLoading && datosParaMostrar.length === 0 && searchTerm && (
              <div className="p-3 text-center text-gray-500">
                <Search className="h-4 w-4 mx-auto mb-2" />
                No se encontraron resultados para "{searchTerm}"
              </div>
            )}

            {!isLoading && datosParaMostrar.map((item, index) => (
              <div
                key={`${item.value}-${index}`}
                onClick={() => handleItemSelect(item)}
                className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {item.descripcion || item.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      Clave: {item.clave || item.value}
                    </div>
                    {item.metadata?.razonamiento && (
                      <div className="text-xs text-purple-600 mt-1">
                        💡 {item.metadata.razonamiento}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-2 flex flex-col items-end gap-1">
                    {getSourceBadge(item.source, item.confidence)}
                    {item.metadata?.contexto && (
                      <span className="text-xs text-gray-400">
                        {item.metadata.contexto}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Estadísticas del catálogo */}
            {!isLoading && stats.totalItems > 0 && (
              <div className="p-2 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
                <span>
                  {stats.totalItems} resultados 
                  ({stats.satOficial} SAT, {stats.iaSugerencias} IA)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refetch}
                  className="h-6 px-2"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alertas de validación */}
      {showValidation && validationResult && !validationResult.valido && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {validationResult.mensaje || 'Código no válido en catálogos SAT'}
          </AlertDescription>
        </Alert>
      )}

      {/* Información del elemento seleccionado */}
      {selectedItem && selectedItem.source === 'ia_sugerencia' && (
        <Alert className="bg-purple-50 border-purple-200">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Sugerencia de IA:</strong> {selectedItem.metadata?.razonamiento}
            <br />
            <span className="text-sm">
              Confianza: {Math.round((selectedItem.confidence || 0) * 100)}%
            </span>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error cargando catálogos: {error.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
