
import { useState, useEffect } from "react";
import { CheckCircle, Truck, MapPin, Users, FileText } from "lucide-react";

const WizardFlowSection = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev === 4 ? 1 : prev + 1);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 1,
      title: "La Misión",
      description: "Define tu cliente y describe tu carga. Nuestra IA analiza y prepara todo.",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-100",
      details: {
        client: "Transportes ABC S.A.",
        cargo: "Electrónicos - 2.5 tons",
        status: "Validado por IA"
      }
    },
    {
      id: 2,
      title: "La Ruta",
      description: "Selecciona origen y destino. El sistema traza la ruta y calcula la distancia.",
      icon: MapPin,
      color: "text-green-400",
      bgColor: "bg-green-100",
      details: {
        origin: "Ciudad de México",
        destination: "Guadalajara, JAL",
        distance: "542 km - 6h 30min"
      }
    },
    {
      id: 3,
      title: "Los Activos",
      description: "Asigna tu vehículo y conductor. Te alertamos sobre cualquier inconsistencia.",
      icon: Truck,
      color: "text-purple-400",
      bgColor: "bg-purple-100",
      details: {
        vehicle: "Freightliner - ABC123",
        driver: "Juan Pérez López",
        status: "Licencia vigente ✓"
      }
    },
    {
      id: 4,
      title: "El Despacho",
      description: "Confirma el viaje. La Carta Porte se genera y timbra automáticamente.",
      icon: FileText,
      color: "text-orange-400",
      bgColor: "bg-orange-100",
      details: {
        document: "Carta Porte 3.1",
        status: "Timbrada",
        folio: "A1B2C3D4E5F6"
      }
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <section className="py-12 md:py-20 lg:py-32 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 scroll-animation">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
            Un Viaje, 4 Pasos.
          </h2>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-400">
            El ViajeWizard te guía en un flujo simple e intuitivo. En minutos, tu operación está lista y tus documentos generados.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Steps List */}
          <div className="scroll-animation order-2 lg:order-1">
            <div className="space-y-6 md:space-y-8">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`transition-all duration-500 ${
                    currentStep === step.id 
                      ? 'transform scale-105 opacity-100' 
                      : 'opacity-70 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full ${step.bgColor} flex items-center justify-center transition-all duration-300`}>
                      <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-lg md:text-xl font-bold ${step.color} mb-2`}>
                        Paso {step.id}: {step.title}
                      </h4>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        {step.description}
                      </p>
                      {currentStep === step.id && (
                        <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700 animate-fade-in">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vista previa</div>
                          <div className="space-y-1">
                            {Object.entries(step.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-400 capitalize">{key}:</span>
                                <span className="text-white font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {currentStep === step.id && (
                      <CheckCircle className="w-5 h-5 text-green-400 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Interactive Wizard Animation */}
          <div className="scroll-animation order-1 lg:order-2">
            <div className="feature-card p-4 md:p-6">
              {/* Wizard Header */}
              <div className="bg-gray-800 rounded-t-lg p-3 md:p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm md:text-base">ViajeWizard - Crear Nuevo Viaje</h3>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3 md:mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Progreso</span>
                    <span className="text-xs text-gray-400">{currentStep}/4</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Current Step Content */}
              <div className={`bg-gray-900 rounded-b-lg p-4 md:p-6 min-h-[250px] md:min-h-[300px] transition-all duration-500 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                {currentStepData && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-4 md:mb-6">
                      <currentStepData.icon className={`w-6 h-6 md:w-8 md:h-8 ${currentStepData.color}`} />
                      <h4 className="text-lg md:text-xl font-bold text-white">{currentStepData.title}</h4>
                    </div>

                    {/* Step-specific UI mockup */}
                    <div className="flex-1 space-y-3 md:space-y-4">
                      {currentStep === 1 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Cliente</label>
                            <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
                              {currentStepData.details.client}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Descripción de Carga</label>
                            <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
                              {currentStepData.details.cargo}
                            </div>
                          </div>
                          <div className="bg-green-800 border border-green-600 rounded px-3 py-2 text-xs text-green-200">
                            ✓ {currentStepData.details.status}
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Origen</label>
                              <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
                                {currentStepData.details.origin}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Destino</label>
                              <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
                                {currentStepData.details.destination}
                              </div>
                            </div>
                          </div>
                          <div className="bg-blue-800 border border-blue-600 rounded px-3 py-2 text-xs text-blue-200">
                            📍 Ruta calculada: {currentStepData.details.distance}
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Vehículo Asignado</label>
                            <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
                              {currentStepData.details.vehicle}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Conductor</label>
                            <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
                              {currentStepData.details.driver}
                            </div>
                          </div>
                          <div className="bg-green-800 border border-green-600 rounded px-3 py-2 text-xs text-green-200">
                            ✓ {currentStepData.details.status}
                          </div>
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-3">
                          <div className="text-center py-4">
                            <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-400 mx-auto mb-3 animate-pulse" />
                            <h5 className="font-semibold text-white mb-2">¡Viaje Creado Exitosamente!</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Documento:</span>
                                <span className="text-white">{currentStepData.details.document}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Estado:</span>
                                <span className="text-green-400">{currentStepData.details.status}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Folio:</span>
                                <span className="text-white font-mono text-xs">{currentStepData.details.folio}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step indicator dots */}
                    <div className="flex justify-center space-x-2 mt-4 md:mt-6">
                      {steps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index + 1 === currentStep ? 'bg-blue-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WizardFlowSection;
