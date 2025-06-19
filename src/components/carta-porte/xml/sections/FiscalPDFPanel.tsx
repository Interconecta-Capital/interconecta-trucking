
import React from 'react';
import { FiscalPDFSection } from '@/components/carta-porte/pdf/FiscalPDFSection';
import { CartaPorteData } from '@/types/cartaPorte';

interface FiscalPDFPanelProps {
  cartaPorteData: CartaPorteData;
  datosTimbre?: {
    uuid?: string;
    idCCP?: string;
    selloDigital?: string;
    selloSAT?: string;
    cadenaOriginal?: string;
    fechaTimbrado?: string;
    noCertificadoSAT?: string;
    noCertificadoEmisor?: string;
  } | null;
  xmlTimbrado?: string | null;
}

export function FiscalPDFPanel(props: FiscalPDFPanelProps) {
  return (
    <div className="space-y-6">
      <FiscalPDFSection 
        {...props}
        companyLogoUrl="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png"
      />
    </div>
  );
}
