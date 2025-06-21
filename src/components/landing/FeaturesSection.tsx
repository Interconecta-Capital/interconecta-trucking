
const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="feature-card p-8 scroll-animation">
            <h3 className="text-2xl font-bold mb-4">Tu Copiloto IA</h3>
            <p className="text-gray-400">
              Describe tu carga como lo harías normalmente. Nuestra IA la clasifica, detecta riesgos como materiales peligrosos y te guía para asegurar el cumplimiento total antes de arrancar.
            </p>
          </div>
          <div className="feature-card p-8 scroll-animation" style={{ transitionDelay: '100ms' }}>
            <h3 className="text-2xl font-bold mb-4">Escudo Anti-Multas</h3>
            <p className="text-gray-400">
              Con validaciones en tiempo real contra los catálogos del SAT y alertas contextuales sobre licencias o permisos por vencer, te damos la tranquilidad de que cada viaje cumple con la ley.
            </p>
          </div>
          <div className="feature-card p-8 scroll-animation" style={{ transitionDelay: '200ms' }}>
            <h3 className="text-2xl font-bold mb-4">Rutas Inteligentes</h3>
            <p className="text-gray-400">
              Integramos la mejor tecnología de mapas para calcular distancias, visualizar rutas óptimas y considerar restricciones de camino. La planeación de rutas nunca fue tan clara y precisa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
