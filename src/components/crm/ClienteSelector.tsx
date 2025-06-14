
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useClientesProveedores, ClienteProveedor } from '@/hooks/crm/useClientesProveedores';
import { RFCValidator } from '@/utils/rfcValidation';
import { 
  Search, 
  Plus, 
  Building2, 
  Phone, 
  Mail,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface ClienteSelectorProps {
  label: string;
  value?: ClienteProveedor | null;
  onChange: (cliente: ClienteProveedor | null) => void;
  tipo?: 'cliente' | 'proveedor' | 'ambos';
  placeholder?: string;
  required?: boolean;
  showCreateButton?: boolean;
  className?: string;
}

export function ClienteSelector({
  label,
  value,
  onChange,
  tipo = 'ambos',
  placeholder = "Buscar por RFC, nombre o razón social...",
  required = false,
  showCreateButton = true,
  className
}: ClienteSelectorProps) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<ClienteProveedor[]>([]);
  const [showResultados, setShowResultados] = useState(false);
  const [showCrearForm, setShowCrearForm] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [buscando, setBuscando] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { buscarClientes, crearCliente, obtenerClientePorRFC, loading } = useClientesProveedores();

  // Actualizar busqueda cuando hay un value seleccionado
  useEffect(() => {
    if (value) {
      setBusqueda(value.razon_social);
      setShowResultados(false);
      setShowCrearForm(false);
    }
  }, [value]);

  useEffect(() => {
    const buscarConDelay = setTimeout(async () => {
      if (busqueda.length >= 2 && !value) {
        setBuscando(true);
        try {
          const clientes = await buscarClientes(busqueda);
          const clientesFiltrados = tipo === 'ambos' 
            ? clientes 
            : clientes.filter(c => c.tipo === tipo || c.tipo === 'ambos');
          
          setResultados(clientesFiltrados);
          setShowResultados(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Error en búsqueda:', error);
          toast.error('Error al buscar clientes');
        } finally {
          setBuscando(false);
        }
      } else if (busqueda.length < 2) {
        setResultados([]);
        setShowResultados(false);
        setShowCrearForm(false);
      }
    }, 300);

    return () => clearTimeout(buscarConDelay);
  }, [busqueda, buscarClientes, tipo, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResultados || resultados.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < resultados.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : resultados.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          seleccionarCliente(resultados[selectedIndex]);
        } else if (resultados.length === 1) {
          seleccionarCliente(resultados[0]);
        }
        break;
      
      case 'Escape':
        setShowResultados(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const seleccionarCliente = (cliente: ClienteProveedor) => {
    console.log('Seleccionando cliente:', cliente);
    onChange(cliente);
    setBusqueda(cliente.razon_social);
    setShowResultados(false);
    setShowCrearForm(false);
    setSelectedIndex(-1);
  };

  const limpiarSeleccion = () => {
    onChange(null);
    setBusqueda('');
    setShowResultados(false);
    setShowCrearForm(false);
    inputRef.current?.focus();
  };

  const handleCrearCliente = () => {
    setShowCrearForm(true);
    setShowResultados(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setBusqueda(newValue);
    
    // Si el usuario está editando y hay un value seleccionado, limpiar la selección
    if (value && newValue !== value.razon_social) {
      onChange(null);
    }
  };

  const validarRFC = (rfc: string) => {
    if (rfc.length < 10) return null;
    const validacion = RFCValidator.validarRFC(rfc);
    return validacion.esValido;
  };

  const shouldShowCreateButton = showCreateButton && 
    busqueda.length >= 3 && 
    resultados.length === 0 && 
    !buscando && 
    !value && 
    !showCrearForm;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={`cliente-selector-${label}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            id={`cliente-selector-${label}`}
            value={busqueda}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (resultados.length > 0 && !value) {
                setShowResultados(true);
              }
            }}
            onBlur={() => {
              // Delay para permitir clicks en resultados
              setTimeout(() => {
                setShowResultados(false);
                setShowCrearForm(false);
              }, 200);
            }}
            placeholder={placeholder}
            className="pl-10 pr-10"
            disabled={loading}
          />
          
          {buscando && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={limpiarSeleccion}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Resultados de búsqueda */}
        {showResultados && resultados.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {resultados.map((cliente, index) => (
                  <div
                    key={cliente.id}
                    onClick={() => seleccionarCliente(cliente)}
                    className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-muted/50 ${
                      index === selectedIndex ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">{cliente.razon_social}</span>
                          <Badge variant="outline" className="text-xs">
                            {cliente.tipo}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-mono">{cliente.rfc}</span>
                            {validarRFC(cliente.rfc) && (
                              <Check className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                          
                          {cliente.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{cliente.email}</span>
                            </div>
                          )}
                          
                          {cliente.telefono && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{cliente.telefono}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={cliente.estatus === 'activo' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {cliente.estatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opción para crear nuevo cliente */}
        {shouldShowCreateButton && (
          <Card className="absolute z-50 w-full mt-1 shadow-lg">
            <CardContent className="p-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCrearCliente}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Crear nuevo {tipo === 'proveedor' ? 'proveedor' : 'cliente'}: "{busqueda}"</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cliente seleccionado */}
      {value && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">{value.razon_social}</span>
                  <Badge variant="outline">{value.tipo}</Badge>
                  <Badge 
                    variant={value.estatus === 'activo' ? 'default' : 'secondary'}
                  >
                    {value.estatus}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">RFC:</span>
                    <span className="font-mono">{value.rfc}</span>
                  </div>
                  
                  {value.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{value.email}</span>
                    </div>
                  )}
                  
                  {value.telefono && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{value.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={limpiarSeleccion}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario rápido de creación */}
      {showCrearForm && (
        <CrearClienteRapido
          busquedaInicial={busqueda}
          tipo={tipo}
          onCreado={(cliente) => {
            console.log('Cliente creado, seleccionando:', cliente);
            seleccionarCliente(cliente);
            setShowCrearForm(false);
            toast.success('Cliente creado y seleccionado correctamente');
          }}
          onCancelar={() => setShowCrearForm(false)}
        />
      )}
    </div>
  );
}

// Componente para crear cliente rápidamente
interface CrearClienteRapidoProps {
  busquedaInicial: string;
  tipo: 'cliente' | 'proveedor' | 'ambos';
  onCreado: (cliente: ClienteProveedor) => void;
  onCancelar: () => void;
}

function CrearClienteRapido({
  busquedaInicial,
  tipo,
  onCreado,
  onCancelar
}: CrearClienteRapidoProps) {
  const [formData, setFormData] = useState({
    razon_social: busquedaInicial,
    rfc: '',
    email: '',
    telefono: '',
    direccion: {}
  });
  const [loading, setLoading] = useState(false);
  const { crearCliente } = useClientesProveedores();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.razon_social || !formData.rfc || !formData.email) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const nuevoCliente = await crearCliente({
        tipo: (tipo === 'ambos' ? 'cliente' : tipo) as 'cliente' | 'proveedor' | 'ambos',
        razon_social: formData.razon_social,
        rfc: formData.rfc.toUpperCase(),
        email: formData.email,
        telefono: formData.telefono,
        direccion_fiscal: formData.direccion,
        estatus: 'activo',
        credito_limite: 0,
        credito_disponible: 0,
        dias_credito: 0,
        notas: '',
        documentos: []
      });

      if (nuevoCliente) {
        const clienteFormateado: ClienteProveedor = {
          id: nuevoCliente.id,
          tipo: (nuevoCliente.tipo_persona as 'cliente' | 'proveedor' | 'ambos') || 'cliente',
          rfc: nuevoCliente.rfc,
          razon_social: nuevoCliente.nombre_razon_social,
          email: nuevoCliente.email || '',
          telefono: nuevoCliente.telefono || '',
          direccion_fiscal: nuevoCliente.direccion || {},
          estatus: nuevoCliente.estado === 'activo' ? 'activo' : 'inactivo',
          fecha_registro: nuevoCliente.created_at,
          user_id: nuevoCliente.user_id,
          credito_limite: 0,
          credito_disponible: 0,
          dias_credito: 0
        };
        
        onCreado(clienteFormateado);
      }
    } catch (error) {
      console.error('Error creando cliente:', error);
      toast.error('Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-blue-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Crear Nuevo {tipo === 'proveedor' ? 'Proveedor' : 'Cliente'}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="razon-social">Razón Social *</Label>
              <Input
                id="razon-social"
                value={formData.razon_social}
                onChange={(e) => setFormData(prev => ({ ...prev, razon_social: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="rfc">RFC *</Label>
              <Input
                id="rfc"
                value={formData.rfc}
                onChange={(e) => setFormData(prev => ({ ...prev, rfc: e.target.value.toUpperCase() }))}
                placeholder="RFC12345678901"
                maxLength={13}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="55 1234 5678"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Crear {tipo === 'proveedor' ? 'Proveedor' : 'Cliente'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
