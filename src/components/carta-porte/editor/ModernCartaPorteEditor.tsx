import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  Settings,
  MapPin,
  Package,
  Truck,
  Users,
  FileText
} from 'lucide-react';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { toast } from 'sonner';
import { UUIDService } from '@/services/uuid/UUIDService';
import { AutotransporteCompleto } from '@/types/cartaPorte';

// Import section components
import { ConfiguracionGeneralSection } from './sections/ConfiguracionGeneralSection';
import { UbicacionesSection } from './sections/UbicacionesSection';
import { MercanciasSection } from './sections/MercanciasSection';
import { AutotransporteSection } from './sections/AutotransporteSection';
import { FigurasTransporteSection } from './sections/FigurasTransporteSection';
import { GeneracionSection } from './sections/GeneracionSection';

interface ModernCartaPorteEditorProps {
  documentId?: string;
}

type SectionKey = 'configuracion' | 'ubicaciones' | 'mercancias' | 'autotransporte' | 'figuras' | 'generacion';

export function ModernCartaPorteEditor({ documentId }: ModernCartaPorteEditorProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey>('configuracion');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const {
    configuracion,
    ubicaciones,
    mercancias,
    autotransporte,
    figuras,
    currentCartaPorteId,
    idCCP,
    borradorCargado,
    validationSummary,
    isGuardando,
    handleConfiguracionChange,
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    handleGuardarBorrador,
    handleGuardarCartaPorteOficial,
    handleGuardarYSalir
  } = useCartaPorteFormManager(documentId);

  useEffect(() => {
    if (isGuardando) {
      setLastSaved(new Date());
    }
  }, [isGuardando]);

  const sections = [
    {
      key: 'configuracion' as SectionKey,
      title: 'Configuración General',
      icon: Settings,
      description: 'Emisor, Receptor y Tipo de CFDI',
      component: ConfiguracionGeneralSection,
      isValid: validationSummary.sectionStatus.configuracion === 'complete'
    },
    {
      key: 'ubicaciones' as SectionKey,
      title: 'Ubicaciones',
      icon: MapPin,
      description: 'Origen y Destino del Transporte',
      component: UbicacionesSection,
      isValid: validationSummary.sectionStatus.ubicaciones === 'complete'
    },
    {
      key: 'mercancias' as SectionKey,
      title: 'Mercancías',
      icon: Package,
      description: 'Productos a Transportar',
      component: MercanciasSection,
      isValid: validationSummary.sectionStatus.mercancias === 'complete'
    },
    {
      key: 'autotransporte' as SectionKey,
      title: 'Autotransporte',
      icon: Truck,
      description: 'Vehículo, Conductor y Seguros',
      component: AutotransporteSection,
      isValid: validationSummary.sectionStatus.autotransporte === 'complete'
    },
    {
      key: 'figuras' as SectionKey,
      title: 'Figuras del Transporte',
      icon: Users,
      description: 'Operadores y Responsables',
      component: FigurasTransporteSection,
      isValid: validationSummary.sectionStatus.figuras === 'complete'
    },
    {
      key: 'generacion' as SectionKey,
      title: 'Generación y Timbrado',
      icon: FileText,
      description: 'XML, PDF y Timbrado Fiscal',
      component: GeneracionSection,
      isValid: validationSummary.sectionStatus.xml === 'complete'
    }
  ];

  const calculateProgress = () => {
    const completedSections = sections.filter(section => section.isValid).length;
    return Math.round((completedSections / sections.length) * 100);
  };

  const progress = calculateProgress();

  const getDocumentStatus = () => {
    if (progress === 100) return { status: 'complete', label: 'Completo', variant: 'default' as const };
    if (progress > 50) return { status: 'progress', label: 'En Progreso', variant: 'default' as const };
    return { status: 'draft', label: 'Borrador', variant: 'secondary' as const };
  };

  const documentStatus = getDocumentStatus();

  const handleSave = async () => {
    try {
      await handleGuardarBorrador();
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleActivate = async () => {
    if (progress < 100) {
      toast.error('Complete todas las secciones antes de activar el documento');
      return;
    }
    
    try {
      await handleGuardarCartaPorteOficial();
      toast.success('Documento activado exitosamente');
      navigate('/cartas-porte');
    } catch (error) {
      console.error('Error activando documento:', error);
    }
  };

  // Create a complete default autotransporte object
  const defaultAutotransporte: AutotransporteCompleto = {
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    asegura_med_ambiente: '',
    poliza_med_ambiente: '',
    peso_bruto_vehicular: 0,
    tipo_carroceria: '',
    remolques: [],
    marca_vehiculo: '',
    modelo_vehiculo: '',
    numero_serie_vin: '',
    vigencia_permiso: '',
    numero_permisos_adicionales: [],
    capacidad_carga: 0,
    dimensiones: {
      largo: 0,
      ancho: 0,
      alto: 0
    }
  };

  const renderActiveSection = () => {
    const activeConfig = sections.find(s => s.key === activeSection);
    if (!activeConfig) return null;

    const Component = activeConfig.component;
    
    const commonProps = {
      data: activeSection === 'configuracion' ? configuracion : 
            activeSection === 'ubicaciones' ? ubicaciones :
            activeSection === 'mercancias' ? mercancias :
            activeSection === 'autotransporte' ? (autotransporte || defaultAutotransporte) :
            activeSection === 'figuras' ? figuras : null,
      onChange: activeSection === 'configuracion' ? handleConfiguracionChange :
                activeSection === 'ubicaciones' ? setUbicaciones :
                activeSection === 'mercancias' ? setMercancias :
                activeSection === 'autotransporte' ? setAutotransporte :
                activeSection === 'figuras' ? setFiguras : () => {}
    };

    if (activeSection === 'generacion') {
      return (
        <GeneracionSection
          cartaPorteData={{
            rfcEmisor: configuracion.rfcEmisor,
            nombreEmisor: configuracion.nombreEmisor,
            rfcReceptor: configuracion.rfcReceptor,
            nombreReceptor: configuracion.nombreReceptor,
            tipoCfdi: configuracion.tipoCfdi,
            cartaPorteVersion: configuracion.cartaPorteVersion,
            transporteInternacional: configuracion.transporteInternacional,
            registroIstmo: configuracion.registroIstmo,
            ubicaciones,
            mercancias,
            autotransporte: autotransporte || defaultAutotransporte,
            figuras
          }}
          cartaPorteId={currentCartaPorteId}
          onXMLGenerated={(xml: string) => {
            console.log('XML generado:', xml);
          }}
          onTimbrado={() => {
            console.log('CFDI timbrado');
            navigate('/cartas-porte');
          }}
        />
      );
    }

    return <Component {...commonProps} />;
  };

  if (!borradorCargado && documentId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p>Cargando documento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header pegajoso */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/cartas-porte')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>

              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold">
                    {documentId ? 'Editar Carta Porte' : 'Nueva Carta Porte'}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>IdCCP: {UUIDService.formatIdCCPForDisplay(idCCP)}</span>
                    <Badge variant={documentStatus.variant}>
                      {documentStatus.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lastSaved && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Guardado {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              
              {isGuardando && (
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <Clock className="h-3 w-3 animate-spin" />
                  <span>Guardando...</span>
                </div>
              )}

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isGuardando}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>

              {progress === 100 && (
                <Button
                  onClick={handleActivate}
                  disabled={isGuardando}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Eye className="h-4 w-4" />
                  Activar Documento
                </Button>
              )}

              <Button
                onClick={handleGuardarYSalir}
                disabled={isGuardando}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Guardar y Salir
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progreso del documento
              </span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Secciones</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.key;
                    
                    return (
                      <button
                        key={section.key}
                        onClick={() => setActiveSection(section.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          isActive ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                              {section.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {section.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {section.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {sections.find(s => s.key === activeSection)?.icon && 
                        React.createElement(sections.find(s => s.key === activeSection)!.icon, { className: "h-5 w-5" })
                      }
                      {sections.find(s => s.key === activeSection)?.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {sections.find(s => s.key === activeSection)?.description}
                    </p>
                  </div>
                  {sections.find(s => s.key === activeSection)?.isValid && (
                    <Badge variant="outline" className="flex items-center gap-1 text-green-700 bg-green-100">
                      <CheckCircle className="h-3 w-3" />
                      Completa
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderActiveSection()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
