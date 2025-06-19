
import React from 'react';
import { useParams } from 'react-router-dom';
import { ModernCartaPorteEditor } from '@/components/carta-porte/editor/ModernCartaPorteEditor';

export default function CartaPorteEditor() {
  const { id } = useParams<{ id: string }>();
  
  return <ModernCartaPorteEditor documentId={id} />;
}
