
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Phone, Mail, Building2 } from "lucide-react";

export const ContactSalesModal = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    flota: '',
    mensaje: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí se integraría con el servicio de email/CRM
    console.log('Datos de contacto:', formData);
    
    toast.success("¡Gracias! Nuestro equipo de ventas se pondrá en contacto contigo en menos de 24 horas.");
    
    // Reset form
    setFormData({
      nombre: '',
      empresa: '',
      email: '',
      telefono: '',
      flota: '',
      mensaje: ''
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary text-white font-sora font-semibold">
          Contactar Ventas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-sora text-interconecta-text-primary text-center">
            Plan Enterprise Sin Límites
          </DialogTitle>
          <p className="text-center text-interconecta-text-secondary font-inter">
            Obtén una propuesta personalizada para tu empresa
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="font-inter">Nombre completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
                className="font-inter"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <Label htmlFor="empresa" className="font-inter">Empresa *</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                required
                className="font-inter"
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email" className="font-inter">Email corporativo *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="font-inter"
              placeholder="tu.email@empresa.com"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono" className="font-inter">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                required
                className="font-inter"
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div>
              <Label htmlFor="flota" className="font-inter">Tamaño de flota *</Label>
              <Select value={formData.flota} onValueChange={(value) => setFormData({...formData, flota: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30-50">30-50 vehículos</SelectItem>
                  <SelectItem value="51-100">51-100 vehículos</SelectItem>
                  <SelectItem value="101-500">101-500 vehículos</SelectItem>
                  <SelectItem value="500+">500+ vehículos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="mensaje" className="font-inter">Mensaje (opcional)</Label>
            <Textarea
              id="mensaje"
              value={formData.mensaje}
              onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
              className="font-inter"
              placeholder="Cuéntanos sobre tus necesidades específicas..."
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1 bg-interconecta-primary hover:bg-interconecta-accent text-white font-sora">
              <Mail className="mr-2 h-4 w-4" />
              Enviar Solicitud
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <div className="flex items-center justify-center space-x-4 text-sm text-interconecta-text-secondary font-inter">
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
