
import { CartaPorteForm } from '@/components/carta-porte/CartaPorteForm';
import { BaseLayout } from '@/components/layout/BaseLayout';

export default function NewCartaPorte() {
  return (
    <BaseLayout showSidebar={false} fullWidth>
      <CartaPorteForm />
    </BaseLayout>
  );
}
