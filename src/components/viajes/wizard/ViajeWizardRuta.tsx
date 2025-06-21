
import React from 'react';
import { ViajeWizardRutaEnhanced } from './ViajeWizardRutaEnhanced';
import { ViajeWizardData } from '../ViajeWizard';

interface ViajeWizardRutaProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardRuta({ data, updateData }: ViajeWizardRutaProps) {
  return <ViajeWizardRutaEnhanced data={data} updateData={updateData} />;
}
