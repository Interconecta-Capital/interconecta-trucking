import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CotizacionBasicInfo } from "./steps/CotizacionBasicInfo";
import { CotizacionRoute } from "./steps/CotizacionRoute";
import { CotizacionResources } from "./steps/CotizacionResources";
import { CotizacionCosts } from "./steps/CotizacionCosts";
import { CotizacionPreview } from "./steps/CotizacionPreview";
import { useCotizaciones } from "@/hooks/useCotizaciones";
import { useAuthStore } from "@/stores/authStore";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { toast } from "sonner";

interface CotizacionWizardProps {
  open: boolean;
  onClose: () => void;
  editingCotizacion?: any;
}

const STEPS = [
  { id: "basic", title: "Información Básica", description: "Datos del cliente y cotización" },
  { id: "route", title: "Ruta y Ubicaciones", description: "Origen, destino y paradas" },
  { id: "resources", title: "Recursos", description: "Vehículo, conductor y remolque" },
  { id: "costs", title: "Costos", description: "Cálculo de precios y márgenes" },
  { id: "preview", title: "Vista Previa", description: "Revisar antes de guardar" }
];

export function CotizacionWizard({ open, onClose, editingCotizacion }: CotizacionWizardProps) {
  const { user } = useAuthStore();
  const { createCotizacion, updateCotizacion } = useCotizaciones();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Información básica
    nombre_cotizacion: "",
    cliente_tipo: "nuevo" as "nuevo" | "existente",
    cliente_existente_id: "",
    cliente_nuevo_datos: {},
    condiciones_comerciales: "",
    tiempo_validez_dias: 15,
    
    // Ruta
    origen: "",
    destino: "",
    ubicaciones_intermedias: [],
    tieneParadasAutorizadas: false,
    distancia_total: 0,
    tiempo_estimado: 0,
    mapa_datos: {},
    
    // Recursos
    vehiculo_id: "",
    conductor_id: "",
    remolque_id: "",
    
    // Costos
    costos_internos: {},
    margen_ganancia: 15,
    costo_total_interno: 0,
    precio_cotizado: 0,
    notas_internas: "",
    
    // Metadatos
    empresa_datos: {}
  });

  useEffect(() => {
    if (editingCotizacion) {
      setFormData({
        nombre_cotizacion: editingCotizacion.nombre_cotizacion || "",
        cliente_tipo: editingCotizacion.cliente_tipo || "nuevo",
        cliente_existente_id: editingCotizacion.cliente_existente_id || "",
        cliente_nuevo_datos: editingCotizacion.cliente_nuevo_datos || {},
        condiciones_comerciales: editingCotizacion.condiciones_comerciales || "",
        tiempo_validez_dias: editingCotizacion.tiempo_validez_dias || 15,
        origen: editingCotizacion.origen || "",
        destino: editingCotizacion.destino || "",
        ubicaciones_intermedias: editingCotizacion.ubicaciones_intermedias || [],
        tieneParadasAutorizadas: editingCotizacion.ubicaciones_intermedias?.length > 0 || false,
        distancia_total: editingCotizacion.distancia_total || 0,
        tiempo_estimado: editingCotizacion.tiempo_estimado || 0,
        mapa_datos: editingCotizacion.mapa_datos || {},
        vehiculo_id: editingCotizacion.vehiculo_id || "",
        conductor_id: editingCotizacion.conductor_id || "",
        remolque_id: editingCotizacion.remolque_id || "",
        costos_internos: editingCotizacion.costos_internos || {},
        margen_ganancia: editingCotizacion.margen_ganancia || 15,
        costo_total_interno: editingCotizacion.costo_total_interno || 0,
        precio_cotizado: editingCotizacion.precio_cotizado || 0,
        notas_internas: editingCotizacion.notas_internas || "",
        empresa_datos: editingCotizacion.empresa_datos || {}
      });
    } else {
      // Reset form for new cotizacion
      setFormData({
        nombre_cotizacion: "",
        cliente_tipo: "nuevo",
        cliente_existente_id: "",
        cliente_nuevo_datos: {},
        condiciones_comerciales: "",
        tiempo_validez_dias: 15,
        origen: "",
        destino: "",
        ubicaciones_intermedias: [],
        tieneParadasAutorizadas: false,
        distancia_total: 0,
        tiempo_estimado: 0,
        mapa_datos: {},
        vehiculo_id: "",
        conductor_id: "",
        remolque_id: "",
        costos_internos: {},
        margen_ganancia: 15,
        costo_total_interno: 0,
        precio_cotizado: 0,
        notas_internas: "",
        empresa_datos: {}
      });
    }
  }, [editingCotizacion, open]);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return formData.nombre_cotizacion.trim() !== "";
      case 1: // Route
        return formData.origen.trim() !== "" && formData.destino.trim() !== "";
      case 2: // Resources
        return formData.vehiculo_id !== "";
      case 3: // Costs
        return formData.precio_cotizado > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1 && canProceedToNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Limpiar campos UUID vacíos y convertir a null
      const cleanFormData = {
        ...formData,
        cliente_existente_id: formData.cliente_existente_id?.trim() || null,
        conductor_id: formData.conductor_id?.trim() || null,
        vehiculo_id: formData.vehiculo_id?.trim() || null,
        remolque_id: formData.remolque_id?.trim() || null,
      };

      // Validar que no hay strings vacíos en campos UUID
      Object.keys(cleanFormData).forEach(key => {
        if (key.endsWith('_id') && cleanFormData[key] === '') {
          cleanFormData[key] = null;
        }
      });

      console.log('💾 Guardando borrador con datos limpios:', cleanFormData);

      const cotizacionData = {
        ...cleanFormData,
        estado: "borrador" as const,
        user_id: user?.id
      };

      if (editingCotizacion) {
        await updateCotizacion.mutateAsync({
          id: editingCotizacion.id,
          updates: cotizacionData
        });
        toast.success('Borrador actualizado correctamente');
      } else {
        await createCotizacion.mutateAsync(cotizacionData);
        toast.success('Borrador guardado correctamente');
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      toast.error('Error al guardar el borrador');
    }
  };

  const handleSend = async () => {
    try {
      // Validar campos obligatorios
      if (!formData.nombre_cotizacion?.trim()) {
        toast.error('El nombre de la cotización es obligatorio');
        return;
      }
      if (!formData.origen?.trim() || !formData.destino?.trim()) {
        toast.error('El origen y destino son obligatorios');
        return;
      }
      if (!formData.vehiculo_id?.trim()) {
        toast.error('Debes seleccionar un vehículo');
        return;
      }
      if (formData.precio_cotizado <= 0) {
        toast.error('El precio cotizado debe ser mayor a 0');
        return;
      }

      // Limpiar campos UUID vacíos y convertir a null
      const cleanFormData = {
        ...formData,
        cliente_existente_id: formData.cliente_existente_id?.trim() || null,
        conductor_id: formData.conductor_id?.trim() || null,
        vehiculo_id: formData.vehiculo_id?.trim() || null,
        remolque_id: formData.remolque_id?.trim() || null,
      };

      // Validar que no hay strings vacíos en campos UUID
      Object.keys(cleanFormData).forEach(key => {
        if (key.endsWith('_id') && cleanFormData[key] === '') {
          cleanFormData[key] = null;
        }
      });

      console.log('📤 Enviando cotización con datos limpios:', cleanFormData);

      const cotizacionData = {
        ...cleanFormData,
        estado: "enviada" as const,
        fecha_envio: new Date().toISOString(),
        user_id: user?.id
      };

      if (editingCotizacion) {
        await updateCotizacion.mutateAsync({
          id: editingCotizacion.id,
          updates: cotizacionData
        });
        toast.success('Cotización actualizada y enviada');
      } else {
        await createCotizacion.mutateAsync(cotizacionData);
        toast.success('Cotización creada y enviada');
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error sending cotizacion:', error);
      toast.error('Error al enviar la cotización');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <CotizacionBasicInfo formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <CotizacionRoute formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <CotizacionResources formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <CotizacionCosts formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <CotizacionPreview formData={formData} />;
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {editingCotizacion ? "Editar Cotización" : "Nueva Cotización"}
          </DialogTitle>
        </DialogHeader>

        {/* Fixed Progress */}
        <div className="space-y-2 flex-shrink-0">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Paso {currentStep + 1} de {STEPS.length}</span>
            <span>{Math.round(progressPercentage)}% completado</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-center">
            <h3 className="font-medium">{STEPS[currentStep].title}</h3>
            <p className="text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          <Card className="h-full">
            <CardContent className="p-6 h-full overflow-y-auto">
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Fixed Navigation */}
        <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
              <Save className="h-4 w-4" />
              Guardar Borrador
            </Button>

            {currentStep === STEPS.length - 1 ? (
              <Button onClick={handleSend} className="gap-2">
                <Send className="h-4 w-4" />
                Crear Cotización
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="gap-2"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}