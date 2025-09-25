-- Crear tabla para almacenar las respuestas de la encuesta
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  seats_reserved INTEGER NOT NULL CHECK (seats_reserved > 0),
  transport_option TEXT NOT NULL CHECK (transport_option IN ('bus', 'individual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir inserción y lectura pública (sin autenticación requerida)
CREATE POLICY "Allow public insert" ON public.survey_responses 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public select" ON public.survey_responses 
  FOR SELECT 
  USING (true);
