
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';
import { useFormContext } from 'react-hook-form';
import { useColoniasPorCP } from '@/hooks/useCatalogos';

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

  const handleCodigoPostalChange = (codigoPostal: string) => {
    form.setValue(`ubicaciones.${index}.domicilio.codigoPostal`, codigoPostal);
    // Clear colonia when CP changes
    form.setValue(`ubicaciones.${index}.domicilio.colonia`, '');
  };

  const handleInfoChange = (info: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => {
    if (info.estado) {
      form.setValue(`ubicaciones.${index}.domicilio.estado`, info.estado);
    }
    if (info.municipio) {
      form.setValue(`ubicaciones.${index}.domicilio.municipio`, info.municipio);
    }
    if (info.localidad) {
      form.setValue(`ubicaciones.${index}.domicilio.localidad`, info.localidad);
    }
    if (info.colonia) {
      form.setValue(`ubicaciones.${index}.domicilio.colonia`, info.colonia);
    }
  };

  const handleColoniaChange = (colonia: string) => {
    form.setValue(`ubicaciones.${index}.domicilio.colonia`, colonia);
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
            onValueChange={handleCodigoPostalChange}
            onInfoChange={handleInfoChange}
            onColoniaChange={handleColoniaChange}
            coloniaValue={form.watch(`ubicaciones.${index}.domicilio.colonia`)}
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
                        handleColoniaChange(value);
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
