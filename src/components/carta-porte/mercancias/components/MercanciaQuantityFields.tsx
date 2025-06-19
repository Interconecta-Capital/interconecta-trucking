
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { Mercancia } from '@/hooks/useMercancias';

interface MercanciaQuantityFieldsProps {
  control: Control<Mercancia>;
}

export function MercanciaQuantityFields({ control }: MercanciaQuantityFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={control}
        name="cantidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Cantidad *</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="peso_kg"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Peso (kg)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0.00"
                step="0.01"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="valor_mercancia"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Valor ($)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0.00"
                step="0.01"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
