
import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Search, X, RefreshCw } from 'lucide-react';
import { 
  useBuscarProductosServicios,
  useBuscarClaveUnidad,
  useTiposPermiso,
  useConfiguracionesVehiculo,
  useFigurasTransporte,
  useSubtiposRemolque,
  useBuscarMaterialesPeligrosos,
  useTiposEmbalaje,
  useEstados,
  useCatalogosReal
} from '@/hooks/useCatalogosReal';
import { useDebounce } from '@/hooks/useDebounce';

interface CatalogItem {
  value: string;
  label: string;
  descripcion?: string;
  id?: string;
  clave?: string;
}

interface CatalogoSelectorMejoradoProps {
  tipo: 'unidades' | 'productos' | 'embalajes' | 'materiales_peligrosos' | 'figuras_transporte' | 'tipos_permiso' | 'configuraciones_vehiculares' | 'remolques' | 'estados';
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onSelectionData?: (data: any) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  allowSearch?: boolean;
  showRefresh?: boolean;
  className?: string;
}

export function CatalogoSelectorMejorado({
  tipo,
  value,
  onChange,
  onValueChange,
  onSelectionData,
  label,
  placeholder = 'Selecciona una opción',
  required = false,
  error,
  disabled = false,
  allowSearch = true,
  showRefresh = true,
  className
}: CatalogoSelectorMejoradoProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [localError, setLocalError] = useState<string>('');
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { clearCache } = useCatalogosReal();

  // Determinar qué hook usar según el tipo
  const queryEnabled = !disabled && (tipo !== 'materiales_peligrosos' || debouncedSearch.length >= 2);
  
  const productosQuery = useBuscarProductosServicios(debouncedSearch, tipo === 'productos' && queryEnabled);
  const unidadesQuery = useBuscarClaveUnidad(debouncedSearch, tipo === 'unidades' && queryEnabled);
  const permisosQuery = useTiposPermiso(debouncedSearch);
  const configuracionesQuery = useConfiguracionesVehiculo(debouncedSearch);
  const figurasQuery = useFigurasTransporte(debouncedSearch);
  const remolquesQuery = useSubtiposRemolque(debouncedSearch);
  const materialesQuery = useBuscarMaterialesPeligrosos(debouncedSearch, tipo === 'materiales_peligrosos' && queryEnabled);
  const embalajesQuery = useTiposEmbalaje(debouncedSearch);
  const estadosQuery = useEstados(debouncedSearch);

  // Seleccionar la query correcta
  const currentQuery = useMemo(() => {
    switch (tipo) {
      case 'productos': return productosQuery;
      case 'unidades': return unidadesQuery;
      case 'tipos_permiso': return permisosQuery;
      case 'configuraciones_vehiculares': return configuracionesQuery;
      case 'figuras_transporte': return figurasQuery;
      case 'remolques': return remolquesQuery;
      case 'materiales_peligrosos': return materialesQuery;
      case 'embalajes': return embalajesQuery;
      case 'estados': return estadosQuery;
      default: return { data: [], isLoading: false, error: null, refetch: () => {} };
    }
  }, [tipo, productosQuery, unidadesQuery, permisosQuery, configuracionesQuery, figurasQuery, remolquesQuery, materialesQuery, embalajesQuery, estadosQuery]);

  const { data: options = [], isLoading, error: queryError, refetch } = currentQuery;

  // Manejar errores
  useEffect(() => {
    if (queryError) {
      setLocalError(`Error cargando catálogo: ${queryError.message || 'Error desconocido'}`);
    } else {
      setLocalError('');
    }
  }, [queryError]);

  // Limpiar búsqueda al cambiar de tipo
  useEffect(() => {
    setSearchTerm('');
    setShowSearch(false);
    setLocalError('');
  }, [tipo]);

  const handleValueChange = (selectedValue: string) => {
    const changeCallback = onValueChange || onChange;
    if (changeCallback) {
      changeCallback(selectedValue);
    }

    // Pasar datos adicionales si se requiere
    if (onSelectionData) {
      const selectedOption = options.find(opt => opt.value === selectedValue);
      if (selectedOption) {
        onSelectionData({
          value: selectedValue,
          label: selectedOption.label,
          descripcion: selectedOption.descripcion,
          clave: selectedOption.clave
        });
      }
    }

    setShowSearch(false);
  };

  const handleRefresh = () => {
    clearCache();
    refetch();
    setLocalError('');
  };

  const displayError = error || localError;
  const showLoading = isLoading && debouncedSearch === searchTerm;

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    
    const term = searchTerm.toLowerCase();
    return options.filter(option => 
      option.value.toLowerCase().includes(term) ||
      option.label.toLowerCase().includes(term) ||
      option.descripcion?.toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  const getPlaceholderText = () => {
    if (showLoading) return 'Cargando...';
    if (tipo === 'materiales_peligrosos' && debouncedSearch.length < 2) {
      return 'Escribe al menos 2 caracteres para buscar';
    }
    return placeholder;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1">
            {allowSearch && showSearch ? (
              <div className="flex gap-1">
                <Input
                  type="text"
                  placeholder={`Buscar ${tipo}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={displayError ? 'border-red-500' : ''}
                  disabled={disabled}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm('');
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Select 
                value={value} 
                onValueChange={handleValueChange}
                disabled={disabled || showLoading}
              >
                <SelectTrigger className={displayError ? 'border-red-500' : ''}>
                  <SelectValue placeholder={getPlaceholderText()} />
                  {showLoading && (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          {option.descripcion && option.descripcion !== option.label && (
                            <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {option.descripcion}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      {tipo === 'materiales_peligrosos' && debouncedSearch.length < 2
                        ? 'Escribe al menos 2 caracteres'
                        : showLoading 
                          ? 'Cargando...' 
                          : 'No hay datos disponibles'
                      }
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {allowSearch && !showSearch && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(true)}
              disabled={disabled}
              title="Buscar"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          {showRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={disabled || showLoading}
              title="Actualizar catálogo"
            >
              <RefreshCw className={`h-4 w-4 ${showLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      {debouncedSearch && filteredOptions.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {filteredOptions.length} resultado(s) encontrado(s)
        </div>
      )}

      {value && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Seleccionado: {options.find(opt => opt.value === value)?.label || value}
          </Badge>
        </div>
      )}
    </div>
  );
}
