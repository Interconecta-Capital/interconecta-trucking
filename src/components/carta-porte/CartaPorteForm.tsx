
import React from 'react';
import { OptimizedCartaPorteForm } from './form/OptimizedCartaPorteForm';

// Re-export CartaPorteData for backward compatibility using export type
export type { CartaPorteData } from '@/types/cartaPorte';

interface CartaPorteFormProps {
  cartaPorteId?: string;
}

export function CartaPorteForm({ cartaPorteId }: CartaPorteFormProps) {
  return <OptimizedCartaPorteForm currentCartaPorteId={cartaPorteId} />;
}

export default CartaPorteForm;
