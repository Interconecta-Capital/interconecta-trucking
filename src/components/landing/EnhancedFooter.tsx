
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const EnhancedFooter = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('¡Gracias! Te mantendremos informado de las novedades.');
      setEmail('');
    }
  };

  const footerSections = [
    {
      title: "Producto",
      links: [
        { name: "Características", href: "#features" },
        { name: "Precios", href: "#pricing" },
        { name: "Demo Interactivo", href: "#demo" },
        { name: "Casos de Éxito", href: "#testimonials" },
        { name: "Integraciones", href: "#" },
        { name: "API", href: "#" }
      ]
    },
    {
      title: "Soporte",
      links: [
        { name: "Centro de Ayuda", href: "#" },
        { name: "Documentación", href: "#" },
        { name: "Tutoriales", href: "#" },
        { name: "Webinars", href: "#" },
        { name: "Estado del Sistema", href: "#" },
        { name: "Contacto", href: "#" }
      ]
    },
    {
      title: "Empresa",
      links: [
        { name: "Acerca de Nosotros", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Carreras", href: "#" },
        { name: "Prensa", href: "#" },
        { name: "Inversionistas", href: "#" },
        { name: "Responsabilidad Social", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Términos de Servicio", href: "#" },
        { name: "Política de Privacidad", href: "#" },
        { name: "Política de Cookies", href: "#" },
        { name: "GDPR", href: "#" },
        { name: "Cumplimiento SAT", href: "#" },
        { name: "Seguridad", href: "#" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#", color: "hover:text-blue-600" },
    { name: "Twitter", icon: Twitter, href: "#", color: "hover:text-blue-400" },
    { name: "LinkedIn", icon: Linkedin, href: "#", color: "hover:text-blue-700" },
    { name: "Instagram", icon: Instagram, href: "#", color: "hover:text-pink-600" }
  ];

  const certifications = [
    "ISO 27001 Certificado",
    "SOC 2 Type II Auditado",
    "Cumplimiento GDPR",
    "Certificación SAT"
  ];

  return (
    <footer className="bg-gradient-to-br from-interconecta-text-primary to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-interconecta-primary to-interconecta-accent rounded-2xl p-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold font-sora mb-4">
              Mantente al día con las últimas actualizaciones
            </h3>
            <p className="text-lg font-inter mb-6 text-white/90">
              Recibe noticias sobre nuevas funciones, casos de éxito y tips para optimizar tu operación
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
                required
              />
              <Button 
                type="submit"
                variant="secondary"
                className="bg-white text-interconecta-primary hover:bg-gray-100 font-sora font-semibold"
              >
                Suscribirme
              </Button>
            </form>
            <p className="text-xs text-white/70 mt-3">
              No spam. Cancela cuando quieras.
            </p>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                alt="Interconecta Trucking Logo"
                className="h-10 w-10 rounded-lg"
              />
              <h4 className="text-2xl font-bold font-sora">Interconecta Trucking</h4>
            </div>
            <p className="font-inter text-gray-300 mb-6 leading-relaxed">
              La plataforma líder con inteligencia artificial para gestión de transporte en México. 
              Automatiza tus cartas porte y cumple con el SAT sin complicaciones.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-interconecta-accent" />
                <span className="font-inter text-sm">soporte@interconecta.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-interconecta-accent" />
                <span className="font-inter text-sm">+52 55 1234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="h-4 w-4 text-interconecta-accent" />
                <span className="font-inter text-sm">Ciudad de México, México</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`p-2 bg-white/10 rounded-lg transition-all duration-300 hover:bg-white/20 ${social.color} hover:scale-110`}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h5 className="font-semibold font-sora mb-4 text-lg">{section.title}</h5>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="font-inter text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center gap-1 group"
                    >
                      {link.name}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <h5 className="font-semibold font-sora mb-4 text-center">Certificaciones y Cumplimiento</h5>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert) => (
              <div 
                key={cert}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm font-inter text-gray-300"
              >
                {cert}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="font-inter text-gray-400 text-sm mb-4 md:mb-0">
            &copy; 2024 Interconecta Trucking. Todos los derechos reservados.
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#" className="font-inter text-gray-400 hover:text-white transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="font-inter text-gray-400 hover:text-white transition-colors">
              Términos de Servicio
            </a>
            <a href="#" className="font-inter text-gray-400 hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-2">
            <span className="font-inter text-sm text-gray-300">
              Hecho con 💚 en México para transportistas mexicanos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
