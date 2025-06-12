
import { useState, useMemo, useCallback } from 'react';

interface UseVirtualizedDataProps<T> {
  data: T[];
  searchFields?: (keyof T)[];
  sortField?: keyof T;
  pageSize?: number;
}

interface UseVirtualizedDataReturn<T> {
  filteredData: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  currentSortField: keyof T | null;
  sortBy: (field: keyof T) => void;
  totalItems: number;
  isFiltered: boolean;
}

export function useVirtualizedData<T>({
  data,
  searchFields = [],
  sortField,
  pageSize = 100
}: UseVirtualizedDataProps<T>): UseVirtualizedDataReturn<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentSortField, setCurrentSortField] = useState<keyof T | null>(sortField || null);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Aplicar filtro de búsqueda
    if (searchTerm && searchFields.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Aplicar ordenamiento
    if (currentSortField) {
      filtered.sort((a, b) => {
        const aValue = a[currentSortField];
        const bValue = b[currentSortField];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, searchFields, currentSortField, sortDirection]);

  const sortBy = useCallback((field: keyof T) => {
    if (currentSortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setCurrentSortField(field);
      setSortDirection('asc');
    }
  }, [currentSortField]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    sortDirection,
    setSortDirection,
    currentSortField,
    sortBy,
    totalItems: data.length,
    isFiltered: searchTerm !== '' || currentSortField !== null
  };
}
