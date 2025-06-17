
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const TrustSection = () => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const stats = [
    { number: "98%", label: "Reducción errores" },
    { number: "2,847", label: "Cartas porte" },
    { number: "0", label: "Multas SAT" },
    { number: "24/7", label: "Automatización" }
  ];

  return (
    <section className="py-20 bg-gray-05">
      <div className="container mx-auto px-6 max-w-screen-xl">
        
        <div ref={ref} className={`text-center mb-12 ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}>
          <h2 className="text-title text-pure-black mb-4">Resultados que cambian el juego</h2>
          <p className="text-body-lg text-gray-60">
            Más de 2,500 transportistas confían en Interconecta para automatizar completamente sus operaciones SAT.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center ${isVisible ? 'scroll-reveal revealed' : 'scroll-reveal'}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="text-[48px] font-extrabold text-pure-black mb-2 text-mono">
                {stat.number}
              </div>
              <div className="text-caption text-gray-60">{stat.label}</div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default TrustSection;
