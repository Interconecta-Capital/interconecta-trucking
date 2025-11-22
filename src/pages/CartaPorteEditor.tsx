
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ModernCartaPorteEditor } from '@/components/carta-porte/editor/ModernCartaPorteEditor';

export default function CartaPorteEditor() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  // FASE 1: Detectar si es un borrador basándose en la ruta
  const isBorrador = location.pathname.includes('/borrador-carta-porte/');
  
  return <ModernCartaPorteEditor documentId={id} isBorrador={isBorrador} />;
}
