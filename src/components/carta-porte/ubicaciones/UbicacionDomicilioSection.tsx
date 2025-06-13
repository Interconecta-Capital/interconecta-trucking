
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';
import { useFormContext } from 'react-hook-form';
import { useColoniasPorCP } from '@/hooks/useCatalogos';

interface DomicilioData {
  pais: string;
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad?: string;
  colonia: string;
  calle: string;
  numExterior: string;
  numInterior?: string;
  referencia?: string;
}

interface UbicacionDomicilioSectionProps {
  index: number;
}

export function UbicacionDomicilioSection({ index }: UbicacionDomicilioSectionProps) {
  const form = useFormContext();
  const codigoPostalValue = form.watch(`ubicaciones.${index}.domicilio.codigoPostal`);
  
  const { data: colonias = [], isLoading: loadingColonias } = useColoniasPorCP(
    codigoPostalValue,
    !!codigoPostalValue && codigoPostalValue.length === 5
  );

  const handleCodigoPostalChange = (cpData: { 
    codigo_postal: string; 
    estado?: string; 
    municipio?: string; 
  } | null) => {
    if (cpData) {
      // Solo actualizar los campos si vienen del catálogo
      form.setValue(`ubicaciones.${index}.domicilio.codigoPostal`, cpData.codigo_postal);
      if (cpData.estado) {
        form.setValue(`ubicaciones.${index}.domicilio.estado`, cpData.estado);
      }
      if (cpData.municipio) {
        form.setValue(`ubicaciones.${index}.domicilio.municipio`, cpData.municipio);
      }
      // Limpiar colonia cuando cambia el CP
      form.setValue(`ubicaciones.${index}.domicilio.colonia`, '');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Domicilio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`ubicaciones.${index}.domicilio.pais`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>País *</FormLabel>
                <FormControl>
                  <Input placeholder="México" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <CodigoPostalInput
            value={codigoPostalValue || ''}
            onChange={handleCodigoPostalChange}
            onManualChange={(value) => {
              form.setValue(`ubicaciones.${index}.domicilio.codigoPostal`, value);
            }}
            placeholder="Código postal"
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`ubicaciones.${index}.domicilio.estado`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <FormControl>
                  <Input placeholder="Estado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`ubicaciones.${index}.domicilio.municipio`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Municipio *</FormLabel>
                <FormControl>
                  <Input placeholder="Municipio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`ubicaciones.${index}.domicilio.localidad`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localidad</FormLabel>
                <FormControl>
                  <Input placeholder="Localidad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`ubicaciones.${index}.domicilio.colonia`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colonia *</FormLabel>
                <FormControl>
                  {colonias.length > 0 ? (
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      disabled={loadingColonias}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingColonias ? "Cargando colonias..." : "Seleccionar colonia"} />
                      </SelectTrigger>
                      <SelectContent>
                        {colonias.map((colonia) => (
                          <SelectItem key={colonia.clave_colonia} value={colonia.descripcion}>
                            {colonia.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      placeholder="Colonia" 
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`ubicaciones.${index}.domicilio.calle`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calle *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la calle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={`ubicaciones.${index}.domicilio.numExterior`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número Exterior *</FormLabel>
                <FormControl>
                  <Input placeholder="No. Ext." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`ubicaciones.${index}.domicilio.numInterior`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número Interior</FormLabel>
                <FormControl>
                  <Input placeholder="No. Int." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`ubicaciones.${index}.domicilio.referencia`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencias</FormLabel>
                <FormControl>
                  <Input placeholder="Referencias adicionales" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
