
import { useParams } from 'react-router-dom';
import { CartaPorteForm } from '@/components/carta-porte/CartaPorteForm';

export default function EditCartaPorte() {
  const { id } = useParams<{ id: string }>();
  
  return <CartaPorteForm cartaPorteId={id} />;
}
