
import React from 'react';
import { ChevronRight, Home, FileText, Plus, Edit } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface CartaPorteBreadcrumbsProps {
  cartaPorteId?: string;
  currentStep?: number;
  borradorCargado?: boolean;
}

const steps = [
  'Configuración',
  'Ubicaciones', 
  'Mercancías',
  'Autotransporte',
  'Figuras',
  'XML'
];

export function CartaPorteBreadcrumbs({ 
  cartaPorteId, 
  currentStep = 0,
  borradorCargado = false
}: CartaPorteBreadcrumbsProps) {
  const location = useLocation();
  const isEditing = location.pathname.includes('/editar/');
  const isCreating = location.pathname.includes('/nueva');

  return (
    <div className="bg-white border-b px-4 py-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/cartas-porte" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Cartas de Porte
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          {isEditing ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  {borradorCargado ? 'Continuar Borrador' : 'Editar'}
                  {cartaPorteId && (
                    <span className="text-xs text-muted-foreground ml-1">
                      #{cartaPorteId.slice(-6)}
                    </span>
                  )}
                </BreadcrumbPage>
              </BreadcrumbItem>
              
              {currentStep !== undefined && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-blue-600 font-medium">
                      {steps[currentStep]} ({currentStep + 1}/6)
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </>
          ) : isCreating ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Nueva Carta Porte
                </BreadcrumbPage>
              </BreadcrumbItem>
              
              {currentStep !== undefined && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-blue-600 font-medium">
                      {steps[currentStep]} ({currentStep + 1}/6)
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Lista</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Progress indicator for form steps */}
      {(isEditing || isCreating) && currentStep !== undefined && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progreso del formulario</span>
            <span>{currentStep + 1} de {steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
