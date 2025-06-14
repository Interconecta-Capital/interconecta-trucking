
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Search, Star } from 'lucide-react';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';
import { useConductores } from '@/hooks/useConductores';

interface FiguraFormOptimizadaProps {
  figura: any;
  onUpdate: (figura: any) => void;
  onRemove: () => void;
  index: number;
}

export function FiguraFormOptimizada({ 
  figura, 
  onUpdate, 
  onRemove,
  index 
}: FiguraFormOptimizadaProps) {
  const { conductores, loading: loadingConductores } = useConductores();
  
  const [formData, setFormData] = React.useState({
    id: figura?.id || `figura-${Date.now()}`,
    tipo_figura: figura?.tipo_figura || '01',
    rfc_figura: figura?.rfc_figura || '',
    nombre_figura: figura?.nombre_figura || '',
    num_licencia: figura?.num_licencia || '',
    residencia_fiscal_figura: figura?.residencia_fiscal_figura || 'MEX',
    num_reg_id_trib_figura: figura?.num_reg_id_trib_figura || '',
    domicilio: figura?.domicilio || {
      pais: 'México',
      codigo_postal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numero_exterior: ''
    }
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showConductorSearch, setShowConductorSearch] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'rfc_figura':
        if (!value?.trim()) {
          newErrors[field] = 'El RFC es requerido';
        } else if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(value)) {
          newErrors[field] = 'Formato de RFC inválido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'nombre_figura':
        if (!value?.trim()) {
          newErrors[field] = 'El nombre es requerido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'num_licencia':
        if (formData.tipo_figura === '01' && !value?.trim()) {
          newErrors[field] = 'La licencia es requerida para operadores';
        } else {
          delete newErrors[field];
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleDomicilioChange = (campo: keyof DomicilioUnificado, valor: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        [campo]: valor
      }
    }));
  };

  const cargarDatosConductor = (conductor: any) => {
    setFormData(prev => ({
      ...prev,
      rfc_figura: conductor.rfc || '',
      nombre_figura: conductor.nombre || '',
      num_licencia: conductor.num_licencia || '',
      residencia_fiscal_figura: conductor.residencia_fiscal || 'MEX',
      domicilio: conductor.direccion || prev.domicilio
    }));
    setShowConductorSearch(false);
    setSearchTerm('');
  };

  const conductoresFiltrados = React.useMemo(() => {
    if (!searchTerm.trim()) return conductores.slice(0, 5);
    
    return conductores.filter(conductor => 
      conductor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.num_licencia?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [conductores, searchTerm]);

  const tiposFigura = [
    { value: '01', label: '01 - Operador' },
    { value: '02', label: '02 - Propietario' },
    { value: '03', label: '03 - Arrendador' },
    { value: '04', label: '04 - Notificado' }
  ];

  const paisesResidencia = [
    { value: 'MEX', label: 'México' },
    { value: 'USA', label: 'Estados Unidos' },
    { value: 'CAN', label: 'Canadá' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Figura de Transporte #{index + 1}
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700"
          >
            Eliminar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Auto-búsqueda de Conductores */}
        {formData.tipo_figura === '01' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar Conductor Registrado
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowConductorSearch(!showConductorSearch)}
              >
                {showConductorSearch ? 'Ocultar' : 'Mostrar'} Búsqueda
              </Button>
            </div>

            {showConductorSearch && (
              <div className="space-y-3">
                <Input
                  placeholder="Buscar por nombre, RFC o licencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />

                {conductoresFiltrados.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {conductoresFiltrados.map((conductor) => (
                      <div
                        key={conductor.id}
                        className="p-3 border rounded cursor-pointer hover:bg-white transition-colors"
                        onClick={() => cargarDatosConductor(conductor)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{conductor.nombre}</div>
                            <div className="text-sm text-muted-foreground">
                              RFC: {conductor.rfc} | Licencia: {conductor.num_licencia}
                            </div>
                          </div>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchTerm && conductoresFiltrados.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No se encontraron conductores que coincidan con la búsqueda.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Información Básica */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Información Básica
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`tipo_figura_${index}`}>Tipo de Figura *</Label>
              <Select value={formData.tipo_figura} onValueChange={(value) => handleFieldChange('tipo_figura', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposFigura.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`residencia_fiscal_${index}`}>Residencia Fiscal</Label>
              <Select value={formData.residencia_fiscal_figura} onValueChange={(value) => handleFieldChange('residencia_fiscal_figura', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paisesResidencia.map((pais) => (
                    <SelectItem key={pais.value} value={pais.value}>
                      {pais.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`rfc_figura_${index}`}>RFC *</Label>
              <Input
                id={`rfc_figura_${index}`}
                value={formData.rfc_figura}
                onChange={(e) => handleFieldChange('rfc_figura', e.target.value.toUpperCase())}
                placeholder="RFC de la figura"
                className={errors.rfc_figura ? 'border-red-500' : ''}
              />
              {errors.rfc_figura && <p className="text-sm text-red-500 mt-1">{errors.rfc_figura}</p>}
            </div>

            <div>
              <Label htmlFor={`nombre_figura_${index}`}>Nombre/Razón Social *</Label>
              <Input
                id={`nombre_figura_${index}`}
                value={formData.nombre_figura}
                onChange={(e) => handleFieldChange('nombre_figura', e.target.value)}
                placeholder="Nombre completo o razón social"
                className={errors.nombre_figura ? 'border-red-500' : ''}
              />
              {errors.nombre_figura && <p className="text-sm text-red-500 mt-1">{errors.nombre_figura}</p>}
            </div>
          </div>

          {formData.tipo_figura === '01' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`num_licencia_${index}`}>Número de Licencia *</Label>
                <Input
                  id={`num_licencia_${index}`}
                  value={formData.num_licencia}
                  onChange={(e) => handleFieldChange('num_licencia', e.target.value)}
                  placeholder="Número de licencia de conducir"
                  className={errors.num_licencia ? 'border-red-500' : ''}
                />
                {errors.num_licencia && <p className="text-sm text-red-500 mt-1">{errors.num_licencia}</p>}
              </div>

              {formData.residencia_fiscal_figura !== 'MEX' && (
                <div>
                  <Label htmlFor={`num_reg_id_trib_${index}`}>Registro ID Tributario</Label>
                  <Input
                    id={`num_reg_id_trib_${index}`}
                    value={formData.num_reg_id_trib_figura}
                    onChange={(e) => handleFieldChange('num_reg_id_trib_figura', e.target.value)}
                    placeholder="Registro tributario extranjero"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Domicilio */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Domicilio
          </h4>
          
          <FormularioDomicilioUnificado
            domicilio={formData.domicilio}
            onDomicilioChange={handleDomicilioChange}
            camposOpcionales={['numInterior', 'referencia']}
          />
        </div>
      </CardContent>
    </Card>
  );
}
