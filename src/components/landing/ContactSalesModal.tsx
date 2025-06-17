
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Phone, Mail, Building2, Send } from "lucide-react";

interface ContactSalesModalProps {
  children?: React.ReactNode;
}

export const ContactSalesModal = ({ children }: ContactSalesModalProps) => {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    flota: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Aquí integrarías con tu SendGrid
      console.log('Enviando datos de contacto:', formData);
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("¡Gracias! Nuestro equipo se pondrá en contacto contigo en menos de 24 horas.");
      
      // Reset form
      setFormData({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        flota: '',
        mensaje: ''
      });
    } catch (error) {
      toast.error("Hubo un error al enviar el mensaje. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="btn-premium border border-gray-60 hover:border-pure-white text-pure-white hover:bg-white/10 px-8 py-4 text-base font-semibold rounded-12 interactive">
            <span>Contactar Ventas</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-pure-white border-0 shadow-2xl">
        
        {/* Mac Window Header */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-20 bg-gray-05">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="ml-auto text-sm font-semibold text-gray-70">Contacto — Interconecta Trucking</div>
        </div>

        {/* Header */}
        <div className="bg-blue-interconecta text-pure-white p-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Mail className="h-6 w-6" />
            <h2 className="text-xl font-bold">Contacta con Ventas</h2>
          </div>
          <p className="text-center text-blue-light text-sm">
            Obtén una demostración personalizada y una propuesta para tu empresa
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="text-gray-70 font-medium">Nombre completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
                className="mt-1 border-gray-30 focus:border-blue-interconecta"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <Label htmlFor="empresa" className="text-gray-70 font-medium">Empresa *</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                required
                className="mt-1 border-gray-30 focus:border-blue-interconecta"
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email" className="text-gray-70 font-medium">Email corporativo *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="mt-1 border-gray-30 focus:border-blue-interconecta"
              placeholder="tu.email@empresa.com"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono" className="text-gray-70 font-medium">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                required
                className="mt-1 border-gray-30 focus:border-blue-interconecta"
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div>
              <Label htmlFor="flota" className="text-gray-70 font-medium">Tamaño de flota *</Label>
              <Select value={formData.flota} onValueChange={(value) => setFormData({...formData, flota: value})}>
                <SelectTrigger className="mt-1 border-gray-30 focus:border-blue-interconecta">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 vehículos</SelectItem>
                  <SelectItem value="11-30">11-30 vehículos</SelectItem>
                  <SelectItem value="31-50">31-50 vehículos</SelectItem>
                  <SelectItem value="51-100">51-100 vehículos</SelectItem>
                  <SelectItem value="100+">100+ vehículos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="mensaje" className="text-gray-70 font-medium">Mensaje (opcional)</Label>
            <Textarea
              id="mensaje"
              value={formData.mensaje}
              onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
              className="mt-1 border-gray-30 focus:border-blue-interconecta"
              placeholder="Cuéntanos sobre tus necesidades específicas..."
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-interconecta hover:bg-blue-hover text-pure-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-pure-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-60">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <span>Respuesta en 24hrs</span>
              </div>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                <span>Demo personalizada</span>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
