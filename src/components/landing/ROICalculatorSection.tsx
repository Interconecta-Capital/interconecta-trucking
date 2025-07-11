
import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { AlertTriangle, BarChart3 } from "lucide-react";

const ROICalculatorSection = () => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.1 });
  const [viajesPorMes, setViajesPorMes] = useState(50);
  const [multasEvitadas, setMultasEvitadas] = useState(2);

  // Cálculos
  const ahorroTiempo = viajesPorMes * 105; // 105 minutos ahorrados por viaje (2 horas a 15 min)
  const costoMulta = 500000; // $500,000 MXN promedio multa SAT
  const ahorroMultas = multasEvitadas * costoMulta;
  const ahorroAnual = (ahorroTiempo * 12 * 350) + (ahorroMultas * 12); // 350 pesos por hora
  const ahorroMensual = Math.round(ahorroAnual / 12);

  const beneficios = [
    { value: "$500,000", label: "Multa máxima SAT" },
    { value: "15 min", label: "vs 1.5 horas manual" },
    { value: "99.9%", label: "Precisión IA" },
    { value: "#1", label: "Plataforma IA México" }
  ];

  return (
    <section className="py-32 bg-pure-white">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Section Header */}
        <div ref={ref} className={`text-center mb-20 ${isRevealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-full text-xs font-bold text-red-600 uppercase tracking-wide mb-8">
            <AlertTriangle className="h-4 w-4" />
            <span>Calculadora de Pérdidas</span>
          </div>
          
          <h2 className="text-display font-bold leading-display tracking-display text-pure-black mb-6">
            ¿Cuánto pierdes SIN Interconecta Trucking?
          </h2>
          
          <p className="text-body-lg text-gray-60 leading-relaxed">
            Calcula el costo real de seguir con procesos manuales y el riesgo de multas SAT
          </p>
        </div>

        {/* Calculator Card with Mac Window Style */}
        <div className={`card-premium shadow-xl overflow-hidden ${isRevealed ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          
          {/* Mac Window Header */}
          <div className="flex items-center gap-2 p-4 border-b border-gray-20 bg-gray-05">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="ml-auto text-sm font-semibold text-gray-70">Calculadora de ROI — Interconecta Trucking</div>
          </div>

          {/* Calculator Header */}
          <div className="bg-blue-interconecta text-pure-white p-6">
            <div className="flex items-center justify-center gap-3">
              <BarChart3 className="h-6 w-6" />
              <h3 className="text-subtitle font-bold">Calculadora de ROI</h3>
            </div>
          </div>

          <div className="p-10">
            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <label className="block text-body font-semibold text-gray-70 mb-4">
                  Número de viajes por mes: {viajesPorMes}
                </label>
                <input
                  type="range"
                  min="5"
                  max="300"
                  value={viajesPorMes}
                  onChange={(e) => setViajesPorMes(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-light rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-50 mt-2">
                  <span>5</span>
                  <span>300</span>
                </div>
              </div>

              <div>
                <label className="block text-body font-semibold text-gray-70 mb-4">
                  Multas SAT evitadas por mes: {multasEvitadas}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={multasEvitadas}
                  onChange={(e) => setMultasEvitadas(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-light rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-50 mt-2">
                  <span>0</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Savings Calculation */}
              <div>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <BarChart3 className="h-6 w-6 text-blue-interconecta" />
                    <span className="text-subtitle font-bold text-gray-70">Ahorro Anual Estimado</span>
                  </div>
                  <div className="text-xl font-extrabold text-blue-interconecta text-mono">
                    ${ahorroAnual.toLocaleString()} MXN
                  </div>
                  <div className="text-body text-gray-60">
                    ${ahorroMensual.toLocaleString()} MXN por mes
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-05 rounded-8">
                    <span className="text-body-sm text-gray-70">Ahorro en tiempo:</span>
                    <span className="font-semibold text-pure-black">${(ahorroTiempo * 12 * 350).toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-05 rounded-8">
                    <span className="text-body-sm text-gray-70">Multas evitadas:</span>
                    <span className="font-semibold text-pure-black">${(ahorroMultas * 12).toLocaleString()} MXN</span>
                  </div>
                </div>
              </div>

              {/* Benefits Stats */}
              <div>
                <div className="grid grid-cols-2 gap-4">
                  {beneficios.map((beneficio, index) => (
                    <div key={index} className="text-center p-4 card-premium">
                      <div className="text-lg font-bold text-blue-interconecta text-mono mb-2">
                        {beneficio.value}
                      </div>
                      <div className="text-caption text-gray-60">
                        {beneficio.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default ROICalculatorSection;
