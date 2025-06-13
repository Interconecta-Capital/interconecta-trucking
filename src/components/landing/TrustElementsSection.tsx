
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, Users, Clock, CheckCircle, Zap, Trophy, Star } from "lucide-react";

const TrustElementsSection = () => {
  const certifications = [
    {
      icon: Shield,
      title: "Certificado SAT",
      description: "Cumplimiento 100% con regulaciones mexicanas",
      badge: "Oficial"
    },
    {
      icon: Award,
      title: "ISO 27001",
      description: "Seguridad de información certificada",
      badge: "Seguridad"
    },
    {
      icon: CheckCircle,
      title: "SOC 2 Type II",
      description: "Controles de seguridad auditados",
      badge: "Auditado"
    },
    {
      icon: Zap,
      title: "SLA 99.9%",
      description: "Disponibilidad garantizada",
      badge: "Garantía"
    }
  ];

  const liveStats = [
    { label: "Cartas Porte Generadas", value: "2,547,892", increment: "+1,234 hoy" },
    { label: "Empresas Activas", value: "1,247", increment: "+23 esta semana" },
    { label: "Ahorro Total en Multas", value: "$15.2M MXN", increment: "+$892K este mes" },
    { label: "Tiempo Ahorrado", value: "89,342 hrs", increment: "+2,145 hrs hoy" }
  ];

  const companyLogos = [
    { name: "Transportes del Valle", logo: "🚛" },
    { name: "Logística Moderna", logo: "📦" },
    { name: "Mudanzas Profesionales", logo: "🏠" },
    { name: "Carga Segura", logo: "🔒" },
    { name: "Rutas Eficientes", logo: "🛣️" },
    { name: "Transporte Integral", logo: "🌟" }
  ];

  const securityFeatures = [
    "Cifrado AES-256",
    "Autenticación 2FA",
    "Backups automáticos",
    "Monitoreo 24/7",
    "Cumplimiento GDPR",
    "Auditorías regulares"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        
        {/* Certifications */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold font-sora text-interconecta-text-primary mb-4">
            Certificaciones y Garantías
          </h3>
          <p className="text-lg font-inter text-interconecta-text-secondary mb-12">
            Respaldados por las certificaciones más importantes del sector
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {certifications.map((cert, index) => (
              <Card key={index} className="border-2 border-interconecta-border-subtle hover:border-interconecta-primary transition-all duration-300 hover:shadow-lg group">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="interconecta-gradient p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                      <cert.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {cert.badge}
                    </div>
                  </div>
                  <h4 className="text-lg font-sora font-semibold text-interconecta-text-primary mb-2">
                    {cert.title}
                  </h4>
                  <p className="text-sm font-inter text-interconecta-text-secondary">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Live Statistics */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold font-sora text-interconecta-text-primary mb-4">
              Estadísticas en Tiempo Real
            </h3>
            <p className="text-lg font-inter text-interconecta-text-secondary">
              Datos actualizados de nuestra plataforma en vivo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {liveStats.map((stat, index) => (
              <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border-interconecta-border-subtle hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold font-sora text-interconecta-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-inter text-interconecta-text-body mb-2">
                    {stat.label}
                  </div>
                  <div className="text-xs font-inter text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {stat.increment}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Client Logos */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold font-sora text-interconecta-text-primary mb-4">
              Empresas que Confían en Nosotros
            </h3>
            <p className="text-lg font-inter text-interconecta-text-secondary">
              Desde startups hasta empresas multinacionales
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
            {companyLogos.map((company, index) => (
              <div key={index} className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <span className="text-2xl">{company.logo}</span>
                <span className="font-inter font-medium text-gray-700">{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-interconecta-primary to-interconecta-accent text-white border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-white/90" />
                <h3 className="text-2xl font-bold font-sora mb-2">
                  Seguridad de Grado Empresarial
                </h3>
                <p className="text-white/90 font-inter">
                  Tu información y la de tus clientes está protegida con los más altos estándares
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
                    <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                    <span className="font-inter text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-300" />
                  <span className="font-inter font-medium">
                    Certificado por organismos internacionales
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full px-6 py-3">
            <Star className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-inter font-semibold text-green-700">
              Calificación 4.9/5 ⭐ basada en +500 reseñas verificadas
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustElementsSection;
