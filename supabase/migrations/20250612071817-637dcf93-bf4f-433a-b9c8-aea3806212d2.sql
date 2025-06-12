
-- Create viajes table for trip management
CREATE TABLE public.viajes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carta_porte_id TEXT NOT NULL,
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  conductor_id UUID REFERENCES public.conductores(id),
  vehiculo_id UUID REFERENCES public.vehiculos(id),
  estado TEXT NOT NULL DEFAULT 'programado' CHECK (estado IN ('programado', 'en_transito', 'completado', 'cancelado', 'retrasado')),
  fecha_inicio_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_inicio_real TIMESTAMP WITH TIME ZONE,
  fecha_fin_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin_real TIMESTAMP WITH TIME ZONE,
  observaciones TEXT,
  tracking_data JSONB,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create eventos_viaje table for trip events
CREATE TABLE public.eventos_viaje (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viaje_id UUID NOT NULL REFERENCES public.viajes(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('inicio', 'parada', 'incidente', 'entrega', 'retraso', 'ubicacion')),
  descripcion TEXT NOT NULL,
  ubicacion TEXT,
  coordenadas JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  automatico BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB
);

-- Add RLS policies for viajes
ALTER TABLE public.viajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own viajes" 
  ON public.viajes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own viajes" 
  ON public.viajes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own viajes" 
  ON public.viajes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own viajes" 
  ON public.viajes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for eventos_viaje
ALTER TABLE public.eventos_viaje ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events of their own viajes" 
  ON public.eventos_viaje 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.viajes 
    WHERE viajes.id = eventos_viaje.viaje_id 
    AND viajes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create events for their own viajes" 
  ON public.eventos_viaje 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.viajes 
    WHERE viajes.id = eventos_viaje.viaje_id 
    AND viajes.user_id = auth.uid()
  ));

-- Add indexes for better performance
CREATE INDEX idx_viajes_user_id ON public.viajes(user_id);
CREATE INDEX idx_viajes_estado ON public.viajes(estado);
CREATE INDEX idx_eventos_viaje_viaje_id ON public.eventos_viaje(viaje_id);
CREATE INDEX idx_eventos_viaje_timestamp ON public.eventos_viaje(timestamp);

-- Enable realtime for these tables
ALTER TABLE public.viajes REPLICA IDENTITY FULL;
ALTER TABLE public.eventos_viaje REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.viajes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos_viaje;
