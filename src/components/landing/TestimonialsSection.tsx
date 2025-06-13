
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Carlos Mendoza",
      company: "Transportes del Norte S.A.",
      position: "Director General",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Interconecta Trucking nos ha ahorrado más de 15 horas semanales. La IA es impresionante, genera descripciones perfectas automáticamente.",
      metrics: {
        ahorro: "85%",
        tiempo: "15 horas/semana",
        cartasPorte: "200+"
      }
    },
    {
      name: "María González",
      company: "Logística Integral MX",
      position: "Gerente de Operaciones",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Antes tardábamos 2 horas por carta porte. Ahora con la IA lo hacemos en 10 minutos. Sin errores SAT desde que usamos la plataforma.",
      metrics: {
        ahorro: "90%",
        tiempo: "10 min/carta",
        errores: "0%"
      }
    },
    {
      name: "Roberto Silva",
      company: "Transportes Ejecutivos",
      position: "Coordinador de Flota",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "La automatización es increíble. El OCR lee nuestras facturas perfectamente y la IA sugiere todo automáticamente. ROI positivo desde el mes 1.",
      metrics: {
        roi: "300%",
        precision: "99.8%",
        facturas: "500+/mes"
      }
    },
    {
      name: "Ana Ruiz",
      company: "Mudanzas Profesionales",
      position: "CEO",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Somos una empresa pequeña y esta plataforma nos permite competir con las grandes. El cumplimiento SAT es automático y nunca hemos tenido multas.",
      metrics: {
        multas: "0",
        cumplimiento: "100%",
        crecimiento: "150%"
      }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-interconecta-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-interconecta-accent/10 rounded-full blur-xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-inter font-medium text-green-700">
              Testimonios Reales
            </span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold font-sora text-interconecta-text-primary mb-4">
            Lo que dicen nuestros clientes
          </h3>
          <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
            Empresas que ya transformaron su operación con inteligencia artificial
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Main Testimonial Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Content Side */}
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <Quote className="h-12 w-12 text-interconecta-primary mb-6 opacity-50" />
                    
                    <blockquote className="text-xl md:text-2xl font-inter text-interconecta-text-body leading-relaxed mb-8 italic">
                      "{testimonials[currentTestimonial].text}"
                    </blockquote>
                    
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonials[currentTestimonial].image} 
                        alt={testimonials[currentTestimonial].name}
                        className="w-16 h-16 rounded-full border-4 border-white shadow-lg mr-4"
                      />
                      <div>
                        <div className="font-sora font-semibold text-lg text-interconecta-text-primary">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="font-inter text-interconecta-text-secondary">
                          {testimonials[currentTestimonial].position}
                        </div>
                        <div className="font-inter text-sm text-interconecta-primary font-medium">
                          {testimonials[currentTestimonial].company}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center mb-6">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>

                  {/* Metrics Side */}
                  <div className="bg-gradient-to-br from-interconecta-primary to-interconecta-accent p-8 md:p-12 text-white flex flex-col justify-center">
                    <h4 className="text-2xl font-sora font-bold mb-6">Resultados Reales</h4>
                    
                    <div className="space-y-6">
                      {Object.entries(testimonials[currentTestimonial].metrics).map(([key, value], index) => (
                        <div key={key} className="flex justify-between items-center p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                          <span className="font-inter text-white/90 capitalize">
                            {key === 'ahorro' && 'Ahorro de Tiempo'}
                            {key === 'tiempo' && 'Tiempo por Carta'}
                            {key === 'cartasPorte' && 'Cartas Generadas'}
                            {key === 'errores' && 'Errores SAT'}
                            {key === 'roi' && 'ROI Primer Año'}
                            {key === 'precision' && 'Precisión IA'}
                            {key === 'facturas' && 'Facturas Procesadas'}
                            {key === 'multas' && 'Multas SAT'}
                            {key === 'cumplimiento' && 'Cumplimiento'}
                            {key === 'crecimiento' && 'Crecimiento'}
                          </span>
                          <span className="font-sora font-bold text-xl text-white">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 border-2 border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary hover:text-white shadow-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 border-2 border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary hover:text-white shadow-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-interconecta-primary scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
