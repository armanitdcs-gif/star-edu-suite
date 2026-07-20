
CREATE TYPE public.admission_status AS ENUM ('pending', 'interview', 'approved', 'rejected');
CREATE TYPE public.admission_gender AS ENUM ('male', 'female', 'other');

CREATE TABLE public.admission_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_no TEXT NOT NULL UNIQUE DEFAULT ('APP-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random()*10000))::text, 4, '0')),
  student_first_name TEXT NOT NULL,
  student_last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender public.admission_gender NOT NULL,
  nationality TEXT NOT NULL,
  religion TEXT,
  applying_for_grade TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2025-2026',
  previous_school TEXT,
  guardian_name TEXT NOT NULL,
  guardian_relation TEXT NOT NULL DEFAULT 'Father',
  guardian_phone TEXT NOT NULL,
  guardian_email TEXT,
  address TEXT NOT NULL,
  passport_no TEXT,
  qid_no TEXT,
  birth_certificate_no TEXT,
  medical_notes TEXT,
  status public.admission_status NOT NULL DEFAULT 'pending',
  student_id TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admission_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admission_applications TO authenticated;
GRANT ALL ON public.admission_applications TO service_role;

ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;

-- Demo/skeleton phase: public can submit and admin console (no auth yet) can view/manage.
-- TODO: tighten once User & Role Management module is wired up.
CREATE POLICY "Anyone can submit an application"
  ON public.admission_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view applications (demo)"
  ON public.admission_applications FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update applications (demo)"
  ON public.admission_applications FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete applications (demo)"
  ON public.admission_applications FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_admission_applications_updated_at
  BEFORE UPDATE ON public.admission_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_admission_status ON public.admission_applications(status);
CREATE INDEX idx_admission_created_at ON public.admission_applications(created_at DESC);
