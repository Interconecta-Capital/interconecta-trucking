
import React from 'react';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { AddressAutocomplete } from './AddressAutocomplete';

interface UbicacionAddressSearchProps {
  searchAddress: string;
  onSearchAddressChange: (value: string) => void;
  onAddressSelect: (addressData: any) => void;
}

export function UbicacionAddressSearch({
  searchAddress,
  onSearchAddressChange,
  onAddressSelect
}: UbicacionAddressSearchProps) {
  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 text-gray-700 font-medium">
        <Search className="h-4 w-4" />
        Buscar Dirección Completa
      </Label>
      <AddressAutocomplete
        value={searchAddress}
        onChange={onSearchAddressChange}
        onAddressSelect={onAddressSelect}
        placeholder="Buscar dirección completa (ej: Av. Insurgentes 123, Roma Norte, CDMX)..."
        className="w-full border-gray-100 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm"
      />
      <p className="text-sm text-gray-600">
        💡 Busca la dirección completa para auto-completar todos los campos automáticamente
      </p>
    </div>
  );
}
