
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCatalogos } from '@/hooks/useCatalogos';

interface CatalogItem {
  value: string;
  label: string;
  descripcion?: string;
  id?: string;
  clave?: string;
}

interface CatalogoSelectorProps {
  tipo?: 'unidades' | 'productos' | 'embalajes' | 'materiales_peligrosos' | 'figuras_transporte' | 'tipos_permiso' | 'configuraciones_vehiculares';
  items?: CatalogItem[];
  loading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  onSelectionData?: (data: any) => void;
  allowManualInput?: boolean;
  manualInputPlaceholder?: string;
}

export function CatalogoSelector({
  tipo,
  items: externalItems,
  loading: externalLoading = false,
  value,
  onChange,
  onValueChange,
  onSearchChange,
  searchValue,
  label,
  placeholder = 'Selecciona una opción',
  required = false,
  error,
  disabled = false,
  onSelectionData,
  allowManualInput = false,
  manualInputPlaceholder
}: CatalogoSelectorProps) {
  const [options, setOptions] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string>('');
  
  const { 
    obtenerUnidades,
    obtenerProductosServicios, 
    obtenerTiposEmbalaje,
    obtenerMaterialesPeligrosos,
    obtenerFigurasTransporte,
    obtenerTiposPermiso,
    obtenerConfiguracionesVehiculares
  } = useCatalogos();

  useEffect(() => {
    // Si se proporcionan items externos, usarlos
    if (externalItems) {
      setOptions(externalItems);
      return;
    }

    // Si no hay tipo definido, no cargar datos
    if (!tipo) {
      return;
    }

    loadCatalogData();
  }, [tipo, externalItems]);

  const loadCatalogData = async () => {
    if (!tipo) return;

    setLoading(true);
    setLoadError('');

    try {
      let data: any[] = [];

      switch (tipo) {
        case 'unidades':
          data = await obtenerUnidades();
          setOptions(data.map(item => ({
            value: item.clave || item.value,
            label: `${item.clave || item.value} - ${item.nombre || item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'productos':
          data = await obtenerProductosServicios();
          setOptions(data.map(item => ({
            value: item.clave || item.value,
            label: `${item.clave || item.value} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'embalajes':
          data = await obtenerTiposEmbalaje();
          setOptions(data.map(item => ({
            value: item.clave || item.value,
            label: `${item.clave || item.value} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'materiales_peligrosos':
          data = await obtenerMaterialesPeligrosos();
          setOptions(data.map(item => ({
            value: item.clave || item.value,
            label: `${item.clave || item.value} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'figuras_transporte':
          data = await obtenerFigurasTransporte();
          setOptions(data.map(item => ({
            value: item.clave || item.value,
            label: `${item.clave || item.value} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'tipos_permiso':
          data = await obtenerTiposPermiso();
          setOptions(data.map(item => ({
            value: item.clave || item.value,
            label: `${item.clave || item.value} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'configuraciones_vehiculares':
          data = await obtenerConfiguracionesVehiculares();
          setOptions(data.map(item => ({
            value: item.clave || item.value,
            label: `${item.clave || item.value} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        default:
          setLoadError('Tipo de catálogo no soportado');
          return;
      }

    } catch (error) {
      console.error(`Error loading catalog ${tipo}:`, error);
      setLoadError('Error al cargar el catálogo');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (selectedValue: string) => {
    // Usar onChange o onValueChange según lo que esté disponible
    const changeCallback = onValueChange || onChange;
    if (changeCallback) {
      changeCallback(selectedValue);
    }

    // Pass additional data if callback provided
    if (onSelectionData) {
      const selectedOption = options.find(opt => opt.value === selectedValue);
      if (selectedOption) {
        onSelectionData({
          value: selectedValue,
          label: selectedOption.label,
          descripcion: selectedOption.descripcion
        });
      }
    }
  };

  const isLoading = loading || externalLoading;
  const displayError = error || loadError;

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <Select 
        value={value} 
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className={displayError ? 'border-red-500' : ''}>
          <SelectValue placeholder={
            isLoading ? 'Cargando...' : placeholder
          } />
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                {option.descripcion && (
                  <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {option.descripcion}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
          {options.length === 0 && !isLoading && (
            <SelectItem value="no-data" disabled>
              No hay datos disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {displayError && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
