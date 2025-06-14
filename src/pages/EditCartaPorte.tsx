
import { useParams } from 'react-router-dom';
import { OptimizedCartaPorteForm } from '@/components/carta-porte/form/OptimizedCartaPorteForm';
import { BaseLayout } from '@/components/layout/BaseLayout';

export default function EditCartaPorte() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <BaseLayout showSidebar={false} fullWidth>
      <OptimizedCartaPorteForm cartaPorteId={id} />
    </BaseLayout>
  );
}
