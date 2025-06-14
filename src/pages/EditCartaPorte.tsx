
import { useParams } from 'react-router-dom';
import { OptimizedCartaPorteForm } from '@/components/carta-porte/form/OptimizedCartaPorteForm';

export default function EditCartaPorte() {
  const { id } = useParams<{ id: string }>();
  
  return <OptimizedCartaPorteForm cartaPorteId={id} />;
}
