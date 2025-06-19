
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { Mercancia } from '@/hooks/useMercancias';

interface MercanciaCommercialFieldsProps {
  control: Control<Mercancia>;
}

export function MercanciaCommercialFields({ control }: MercanciaCommercialFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="fraccion_arancelaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Fracción Arancelaria</FormLabel>
              <FormControl>
                <Input 
                  placeholder="8 dígitos (ej: 12345678)" 
                  maxLength={8}
                  {...field}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="regimen_aduanero"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Régimen Aduanero</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: A1, B1, etc." 
                  {...field}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="numero_piezas"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Número de Piezas</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Cantidad de piezas"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="uuid_comercio_ext"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">UUID Comercio Exterior</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Para operaciones de comercio exterior"
                  {...field}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
