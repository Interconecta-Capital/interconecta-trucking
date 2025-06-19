
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { CatalogSelect } from '@/components/catalogos/components/CatalogSelect';
import { Control } from 'react-hook-form';
import { Mercancia } from '@/hooks/useMercancias';

interface MercanciaDangerousFieldsProps {
  control: Control<Mercancia>;
  materialPeligroso: boolean;
  materialesQuery: any;
  materialesSearch: string;
  setMaterialesSearch: (value: string) => void;
}

export function MercanciaDangerousFields({
  control,
  materialPeligroso,
  materialesQuery,
  materialesSearch,
  setMaterialesSearch
}: MercanciaDangerousFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="material_peligroso"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
            <div className="space-y-0.5">
              <FormLabel className="text-sm font-medium text-gray-700">Material Peligroso</FormLabel>
              <div className="text-sm text-gray-500">
                ¿Esta mercancía es considerada material peligroso?
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {materialPeligroso && (
        <FormField
          control={control}
          name="cve_material_peligroso"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Clave Material Peligroso *</FormLabel>
              <FormControl>
                <CatalogSelect
                  value={field.value || ''}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setMaterialesSearch('');
                  }}
                  disabled={materialesQuery.isPending}
                  showLoading={materialesQuery.isPending}
                  placeholder="Buscar material peligroso..."
                  options={materialesQuery.data || []}
                  searchTerm={materialesSearch}
                  tipo="materiales_peligrosos"
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </>
  );
}
