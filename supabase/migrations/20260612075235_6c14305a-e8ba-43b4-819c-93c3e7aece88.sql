
-- Prescripto AI core tables

CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled prescription',
  image_url TEXT,
  ocr_text TEXT,
  analysis JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prescriptions select" ON public.prescriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own prescriptions insert" ON public.prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own prescriptions update" ON public.prescriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own prescriptions delete" ON public.prescriptions FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.saved_medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic_name TEXT,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_medicines TO authenticated;
GRANT ALL ON public.saved_medicines TO service_role;
ALTER TABLE public.saved_medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved meds all" ON public.saved_medicines FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.saved_doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT,
  name TEXT NOT NULL,
  specialization TEXT,
  address TEXT,
  phone TEXT,
  rating NUMERIC,
  lat NUMERIC,
  lng NUMERIC,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_doctors TO authenticated;
GRANT ALL ON public.saved_doctors TO service_role;
ALTER TABLE public.saved_doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved docs all" ON public.saved_doctors FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger for prescriptions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER prescriptions_set_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
