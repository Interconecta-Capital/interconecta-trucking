
import React from 'react';
import { MantenimientoDashboard } from '@/components/mantenimiento/MantenimientoDashboard';

const Mantenimiento = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sistema de Mantenimiento Predictivo</h1>
        <p className="text-gray-600 mt-2">
          Gestiona y optimiza el mantenimiento de tu flota con inteligencia artificial
        </p>
      </div>
      
      <MantenimientoDashboard />
    </div>
  );
};

export default Mantenimiento;
