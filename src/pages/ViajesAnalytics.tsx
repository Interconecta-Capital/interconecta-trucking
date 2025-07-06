
import React from 'react';
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import { ViajesAnalytics } from '@/components/analytics/ViajesAnalytics';

export default function ViajesAnalyticsPage() {
  return (
    <div className="space-y-6">
      <DashboardNavigation />
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics de Viajes</h1>
          <p className="text-gray-600 mt-2">
            Análisis detallado y métricas avanzadas de tus operaciones de transporte
          </p>
        </div>
        <ViajesAnalytics />
      </div>
    </div>
  );
}
