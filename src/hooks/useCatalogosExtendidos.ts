
import { useQuery } from "@tanstack/react-query";
import { CatalogosSATExtendido } from "@/services/catalogosSATExtendido";

// Hook para tipos de embalaje
export const useTiposEmbalaje = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos', 'embalajes', busqueda],
    queryFn: () => CatalogosSATExtendido.buscarTiposEmbalaje(busqueda),
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para tipos de carrocería
export const useTiposCarroceria = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos', 'carrocerias', busqueda],
    queryFn: () => CatalogosSATExtendido.buscarTiposCarroceria(busqueda),
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para tipos de licencia
export const useTiposLicenciaExtendidos = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos', 'licencias', busqueda],
    queryFn: () => CatalogosSATExtendido.buscarTiposLicencia(busqueda),
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para fracciones arancelarias
export const useFraccionesArancelarias = (busqueda: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'fracciones', busqueda],
    queryFn: () => CatalogosSATExtendido.buscarFraccionesArancelarias(busqueda),
    enabled: enabled && busqueda.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para coordenadas GPS
export const useCoordenadas = (codigoPostal: string, enabled = true) => {
  return useQuery({
    queryKey: ['coordenadas', codigoPostal],
    queryFn: () => CatalogosSATExtendido.calcularCoordenadas(codigoPostal),
    enabled: enabled && codigoPostal.length === 5,
    staleTime: 30 * 60 * 1000,
  });
};
