
import { useQuery } from '@tanstack/react-query';

export function useTiposEmbalaje(searchTerm: string = '') {
  return useQuery({
    queryKey: ['tipos-embalaje', searchTerm],
    queryFn: async () => {
      // Mock data for now
      return [
        { value: '1A1', label: '1A1 - Bidón de acero' },
        { value: '1A2', label: '1A2 - Bidón de acero con tapa no desmontable' },
        { value: '4G', label: '4G - Caja de cartón' },
        { value: '3H1', label: '3H1 - Bidón de plástico' },
      ].filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    enabled: true
  });
}

export function useFraccionesArancelarias(searchTerm: string = '', enabled: boolean = true) {
  return useQuery({
    queryKey: ['fracciones-arancelarias', searchTerm],
    queryFn: async () => {
      // Mock data for now
      return [
        { value: '01012100', label: '01012100 - Caballos reproductores de raza pura' },
        { value: '02011000', label: '02011000 - Canales y medias canales de bovino' },
        { value: '03011100', label: '03011100 - Peces ornamentales' },
      ].filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    enabled: enabled && searchTerm.length >= 2
  });
}
