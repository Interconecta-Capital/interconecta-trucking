
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 text-center bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto mb-16 scroll-animation">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
            Planes para cada flota.
          </h2>
          <p className="mt-6 text-lg text-gray-400">
            Empieza con lo que necesitas y escala a medida que tu operación crece. Simple y transparente.
          </p>
        </div>
        
        {/* Pricing Toggle */}
        <div className="flex justify-center items-center space-x-4 mb-10 scroll-animation">
          <span className="font-medium">Mensual</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="font-medium text-gray-400">Anual (Ahorra 20%)</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto scroll-animation">
          {/* Plan Operador */}
          <div className="feature-card p-8 flex flex-col">
            <h3 className="text-2xl font-bold mb-4">Operador</h3>
            <p className="text-4xl font-bold mb-6">$149<span className="text-lg font-normal text-gray-400">/mes</span></p>
            <ul className="text-left space-y-3 mb-8 text-gray-300 flex-grow">
              <li>✔️ Hasta 50 viajes al mes</li>
              <li>✔️ Validaciones SAT</li>
              <li>✔️ Soporte por correo</li>
            </ul>
            <Link to="/auth">
              <Button className="btn-secondary w-full py-3 rounded-full font-semibold">
                Empezar
              </Button>
            </Link>
          </div>

          {/* Plan Flota (Popular) */}
          <div className="feature-card p-8 flex flex-col border-2 border-blue-500 relative">
            <span className="absolute top-0 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Más Popular
            </span>
            <h3 className="text-2xl font-bold mb-4">Flota</h3>
            <p className="text-4xl font-bold mb-6">$299<span className="text-lg font-normal text-gray-400">/mes</span></p>
            <ul className="text-left space-y-3 mb-8 text-gray-300 flex-grow">
              <li>✔️ Hasta 200 viajes al mes</li>
              <li>✔️ Todas las funciones de IA</li>
              <li>✔️ Alertas y validaciones avanzadas</li>
              <li>✔️ Soporte prioritario</li>
            </ul>
            <Link to="/auth">
              <Button className="btn-primary w-full py-3 rounded-full font-semibold">
                Prueba Gratis 14 días
              </Button>
            </Link>
          </div>

          {/* Plan Enterprise */}
          <div className="feature-card p-8 flex flex-col">
            <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
            <p className="text-4xl font-bold mb-6">Personalizado</p>
            <ul className="text-left space-y-3 mb-8 text-gray-300 flex-grow">
              <li>✔️ Viajes ilimitados</li>
              <li>✔️ Integración con ERP/WMS vía API</li>
              <li>✔️ Manager de cuenta dedicado</li>
              <li>✔️ Analítica avanzada</li>
            </ul>
            <Button className="btn-secondary w-full py-3 rounded-full font-semibold">
              Contactar Ventas
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
