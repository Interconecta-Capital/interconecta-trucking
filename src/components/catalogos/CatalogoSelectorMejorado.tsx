import { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';
import { CatalogSearchInput } from './components/CatalogSearchInput';
import { CatalogSelect } from './components/CatalogSelect';
import { CatalogActions } from './components/CatalogActions';
import { CatalogFeedback } from './components/CatalogFeedback';
import { useAdaptedCatalogQuery } from './hooks/useAdaptedCatalogQuery';
import { CatalogosSATService } from '@/services/catalogosSAT';

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
  showAllOptions?: boolean;
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
  showAllOptions = false,
  className
}: CatalogoSelectorMejoradoProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [localError, setLocalError] = useState<string>('');
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Configuración mejorada para habilitar queries
  const queryEnabled = !disabled && (
    showAllOptions || 
    (tipo === 'materiales_peligrosos' ? debouncedSearch.length >= 2 : true)
  );
  
  // Para showAllOptions, usar string vacío para obtener todas las opciones
  const searchQuery = showAllOptions ? '' : debouncedSearch;
  
  const { data: options = [], isLoading, error: queryError, refetch } = useAdaptedCatalogQuery(tipo, searchQuery, queryEnabled);

  // Handle errors
  useEffect(() => {
    if (queryError) {
      setLocalError(`Error cargando catálogo: ${queryError.message || 'Error desconocido'}`);
    } else {
      setLocalError('');
    }
  }, [queryError]);

  // Clear search when type changes
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
    CatalogosSATService.clearCache();
    refetch();
    setLocalError('');
  };

  const handleSearchToggle = () => {
    setShowSearch(true);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchTerm('');
  };

  const displayError = error || localError;
  const showLoading = isLoading && (showAllOptions || debouncedSearch === searchTerm);

  const filteredOptions = useMemo(() => {
    if (showAllOptions) {
      // Si showAllOptions es true, mostrar todas las opciones sin filtrado adicional
      return options;
    }
    
    if (!searchTerm || debouncedSearch !== searchTerm) return options;
    
    const term = searchTerm.toLowerCase();
    return options.filter(option => 
      option.value.toLowerCase().includes(term) ||
      option.label.toLowerCase().includes(term) ||
      option.descripcion?.toLowerCase().includes(term)
    );
  }, [options, searchTerm, debouncedSearch, showAllOptions]);

  const getPlaceholderText = () => {
    if (showLoading) return 'Cargando...';
    if (showAllOptions) return placeholder;
    if (tipo === 'materiales_peligrosos' && debouncedSearch.length < 2) {
      return 'Escribe al menos 2 caracteres para buscar';
    }
    if (options.length === 0 && !isLoading) {
      return 'No hay datos disponibles';
    }
    return placeholder;
  };

  // Si showAllOptions es true, no mostrar búsqueda ni acciones de búsqueda
  const shouldShowSearchActions = allowSearch && !showAllOptions;

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
            {shouldShowSearchActions && showSearch ? (
              <CatalogSearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onClose={handleSearchClose}
                tipo={tipo}
                disabled={disabled}
              />
            ) : (
              <CatalogSelect
                value={value}
                onValueChange={handleValueChange}
                disabled={disabled}
                showLoading={showLoading}
                placeholder={getPlaceholderText()}
                options={filteredOptions}
                searchTerm={showAllOptions ? '' : debouncedSearch}
                tipo={tipo}
              />
            )}
          </div>
          
          {shouldShowSearchActions && (
            <CatalogActions
              allowSearch={allowSearch}
              showRefresh={showRefresh}
              showSearch={showSearch}
              disabled={disabled}
              showLoading={showLoading}
              onSearchToggle={handleSearchToggle}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </div>

      <CatalogFeedback
        error={displayError}
        searchTerm={showAllOptions ? '' : debouncedSearch}
        filteredCount={filteredOptions.length}
        value={value}
        options={options}
      />
    </div>
  );
}
