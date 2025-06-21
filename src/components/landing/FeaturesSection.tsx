
const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Características Principales
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Tecnología avanzada para simplificar tu operación logística
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="feature-card p-4 sm:p-6 md:p-8 scroll-animation">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded"></div>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Tu Copiloto IA</h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Describe tu carga como lo harías normalmente. Nuestra IA la clasifica, detecta riesgos como materiales peligrosos y te guía para asegurar el cumplimiento total antes de arrancar.
            </p>
          </div>
          
          <div className="feature-card p-4 sm:p-6 md:p-8 scroll-animation" style={{ transitionDelay: '100ms' }}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded"></div>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Escudo Anti-Multas</h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Con validaciones en tiempo real contra los catálogos del SAT y alertas contextuales sobre licencias o permisos por vencer, te damos la tranquilidad de que cada viaje cumple con la ley.
            </p>
          </div>
          
          <div className="feature-card p-4 sm:p-6 md:p-8 scroll-animation md:col-span-2 lg:col-span-1" style={{ transitionDelay: '200ms' }}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded"></div>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Rutas Inteligentes</h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Integramos la mejor tecnología de mapas para calcular distancias, visualizar rutas óptimas y considerar restricciones de camino. La planeación de rutas nunca fue tan clara y precisa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
