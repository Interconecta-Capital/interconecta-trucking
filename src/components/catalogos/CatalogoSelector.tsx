
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCatalogos } from '@/hooks/useCatalogos';

interface CatalogoOption {
  value: string;
  label: string;
  descripcion?: string;
}

interface CatalogoSelectorProps {
  tipo: 'unidades' | 'productos' | 'embalajes' | 'materiales_peligrosos' | 'figuras_transporte' | 'tipos_permiso' | 'configuraciones_vehiculares';
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  onSelectionData?: (data: any) => void;
}

export function CatalogoSelector({
  tipo,
  value,
  onChange,
  label,
  placeholder = 'Selecciona una opción',
  required = false,
  error,
  disabled = false,
  onSelectionData
}: CatalogoSelectorProps) {
  const [options, setOptions] = useState<CatalogoOption[]>([]);
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
    loadCatalogData();
  }, [tipo]);

  const loadCatalogData = async () => {
    setLoading(true);
    setLoadError('');

    try {
      let data: any[] = [];

      switch (tipo) {
        case 'unidades':
          data = await obtenerUnidades();
          setOptions(data.map(item => ({
            value: item.clave_unidad,
            label: `${item.clave_unidad} - ${item.nombre}`,
            descripcion: item.descripcion
          })));
          break;

        case 'productos':
          data = await obtenerProductosServicios();
          setOptions(data.map(item => ({
            value: item.clave_prod_serv,
            label: `${item.clave_prod_serv} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'embalajes':
          data = await obtenerTiposEmbalaje();
          setOptions(data.map(item => ({
            value: item.clave_embalaje,
            label: `${item.clave_embalaje} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'materiales_peligrosos':
          data = await obtenerMaterialesPeligrosos();
          setOptions(data.map(item => ({
            value: item.clave_material,
            label: `${item.clave_material} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'figuras_transporte':
          data = await obtenerFigurasTransporte();
          setOptions(data.map(item => ({
            value: item.clave_figura,
            label: `${item.clave_figura} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'tipos_permiso':
          data = await obtenerTiposPermiso();
          setOptions(data.map(item => ({
            value: item.clave_permiso,
            label: `${item.clave_permiso} - ${item.descripcion}`,
            descripcion: item.descripcion
          })));
          break;

        case 'configuraciones_vehiculares':
          data = await obtenerConfiguracionesVehiculares();
          setOptions(data.map(item => ({
            value: item.clave_config,
            label: `${item.clave_config} - ${item.descripcion}`,
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
    if (onChange) {
      onChange(selectedValue);
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
        disabled={disabled || loading}
      >
        <SelectTrigger className={displayError ? 'border-red-500' : ''}>
          <SelectValue placeholder={
            loading ? 'Cargando...' : placeholder
          } />
          {loading && (
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
          {options.length === 0 && !loading && (
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
