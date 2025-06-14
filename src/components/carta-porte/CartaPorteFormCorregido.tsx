
import React from 'react';
import { OptimizedCartaPorteFormCorregido } from './form/OptimizedCartaPorteFormCorregido';

export type { CartaPorteData } from '@/types/cartaPorte';

interface CartaPorteFormCorregidoProps {
  cartaPorteId?: string;
}

export function CartaPorteFormCorregido({ cartaPorteId }: CartaPorteFormCorregidoProps) {
  return <OptimizedCartaPorteFormCorregido cartaPorteId={cartaPorteId} />;
}

export default CartaPorteFormCorregido;
