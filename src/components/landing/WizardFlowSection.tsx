
const WizardFlowSection = () => {
  return (
    <section className="py-20 md:py-32 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 scroll-animation">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
            Un Viaje, 4 Pasos.
          </h2>
          <p className="mt-6 text-lg text-gray-400">
            El ViajeWizard te guía en un flujo simple e intuitivo. En minutos, tu operación está lista y tus documentos generados.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="scroll-animation">
            <div className="space-y-12">
              <div>
                <h4 className="text-xl font-bold text-blue-400">Paso 1: La Misión</h4>
                <p className="text-gray-400">Define tu cliente y describe tu carga. Nuestra IA analiza y prepara todo.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-blue-400">Paso 2: La Ruta</h4>
                <p className="text-gray-400">Selecciona origen y destino. El sistema traza la ruta y calcula la distancia.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-blue-400">Paso 3: Los Activos</h4>
                <p className="text-gray-400">Asigna tu vehículo y conductor. Te alertamos sobre cualquier inconsistencia.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-blue-400">Paso 4: El Despacho</h4>
                <p className="text-gray-400">Confirma el viaje. La Carta Porte se genera y timbra automáticamente.</p>
              </div>
            </div>
          </div>
          
          <div className="scroll-animation">
            <div className="feature-card p-4">
              <div className="bg-gray-700 h-96 rounded-lg flex items-center justify-center text-gray-400">
                Animación del Wizard
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WizardFlowSection;
