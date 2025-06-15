import { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { useCatalogosReal } from '@/hooks/useCatalogosReal';
import { useDebounce } from '@/hooks/useDebounce';
import { useCatalogQuery } from './hooks/useCatalogQuery';
import { CatalogSearchInput } from './components/CatalogSearchInput';
import { CatalogSelect } from './components/CatalogSelect';
import { CatalogActions } from './components/CatalogActions';
import { CatalogFeedback } from './components/CatalogFeedback';

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
  const { limpiarCache } = useCatalogosReal();

  const queryEnabled = !disabled && (tipo !== 'materiales_peligrosos' || debouncedSearch.length >= 2);
  const currentQuery = useCatalogQuery(tipo, debouncedSearch, queryEnabled);
  const { data: options = [], isLoading, error: queryError, refetch } = currentQuery;

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
    limpiarCache();
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
                searchTerm={debouncedSearch}
                tipo={tipo}
              />
            )}
          </div>
          
          <CatalogActions
            allowSearch={allowSearch}
            showRefresh={showRefresh}
            showSearch={showSearch}
            disabled={disabled}
            showLoading={showLoading}
            onSearchToggle={handleSearchToggle}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      <CatalogFeedback
        error={displayError}
        searchTerm={debouncedSearch}
        filteredCount={filteredOptions.length}
        value={value}
        options={options}
      />
    </div>
  );
}
