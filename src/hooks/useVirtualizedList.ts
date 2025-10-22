import { useMemo, useState, useCallback, useRef, useEffect } from 'react';

interface UseVirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface UseVirtualizedListReturn<T> {
  virtualItems: T[];
  totalHeight: number;
  scrollTop: number;
  setScrollTop: (scrollTop: number) => void;
  startIndex: number;
  endIndex: number;
}

/**
 * Hook reutilizable para virtualización de listas
 * Renderiza solo los items visibles + overscan para mejor performance
 */
export function useVirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3
}: UseVirtualizedListProps<T>): UseVirtualizedListReturn<T> {
  const [scrollTop, setScrollTop] = useState(0);

  // Calcular índices de items visibles
  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);
    
    return { startIndex: start, endIndex: end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Items virtualizados
  const virtualItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  // Altura total del scroll
  const totalHeight = items.length * itemHeight;

  return {
    virtualItems,
    totalHeight,
    scrollTop,
    setScrollTop,
    startIndex,
    endIndex
  };
}

/**
 * Hook para manejar scroll restoration
 */
export function useScrollRestoration(key: string) {
  const scrollPosRef = useRef<number>(0);

  useEffect(() => {
    // Restaurar posición guardada
    const savedPos = sessionStorage.getItem(`scroll-${key}`);
    if (savedPos) {
      scrollPosRef.current = parseInt(savedPos, 10);
    }

    return () => {
      // Guardar posición al desmontar
      sessionStorage.setItem(`scroll-${key}`, scrollPosRef.current.toString());
    };
  }, [key]);

  const updateScrollPosition = useCallback((position: number) => {
    scrollPosRef.current = position;
  }, []);

  return {
    initialScrollPosition: scrollPosRef.current,
    updateScrollPosition
  };
}

/**
 * Cache de alturas calculadas para filas de tamaño variable
 */
export function useVariableHeightCache() {
  const cacheRef = useRef<Map<number, number>>(new Map());

  const setHeight = useCallback((index: number, height: number) => {
    cacheRef.current.set(index, height);
  }, []);

  const getHeight = useCallback((index: number, defaultHeight: number): number => {
    return cacheRef.current.get(index) ?? defaultHeight;
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return { setHeight, getHeight, clear };
}
