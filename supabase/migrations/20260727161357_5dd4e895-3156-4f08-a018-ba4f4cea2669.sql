
-- ============ ENUMS ============
CREATE TYPE public.student_status AS ENUM ('active', 'inactive', 'graduated', 'transferred', 'left');
CREATE TYPE public.enrollment_status AS ENUM ('active', 'transferred', 'left', 'completed');

-- ============ class_sections ============
CREATE TABLE public.class_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade text NOT NULL,
  section text NOT NULL,
  academic_year text NOT NULL DEFAULT '2025-2026',
  capacity integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (grade, section, academic_year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_sections TO anon, authenticated;
GRANT ALL ON public.class_sections TO service_role;
ALTER TABLE public.class_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view class sections (demo)" ON public.class_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert class sections (demo)" ON public.class_sections FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update class sections (demo)" ON public.class_sections FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete class sections (demo)" ON public.class_sections FOR DELETE TO anon, authenticated USING (true);
CREATE TRIGGER trg_class_sections_updated_at BEFORE UPDATE ON public.class_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ students ============
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_no text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender public.admission_gender NOT NULL,
  nationality text NOT NULL,
  religion text,
  guardian_name text NOT NULL,
  guardian_relation text NOT NULL DEFAULT 'Father',
  guardian_phone text NOT NULL,
  guardian_email text,
  address text NOT NULL,
  passport_no text,
  qid_no text,
  birth_certificate_no text,
  medical_notes text,
  photo_url text,
  status public.student_status NOT NULL DEFAULT 'active',
  admission_application_id uuid REFERENCES public.admission_applications(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon, authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view students (demo)" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert students (demo)" ON public.students FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update students (demo)" ON public.students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete students (demo)" ON public.students FOR DELETE TO anon, authenticated USING (true);
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ enrollments ============
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_section_id uuid NOT NULL REFERENCES public.class_sections(id) ON DELETE RESTRICT,
  academic_year text NOT NULL,
  roll_no text,
  status public.enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, class_section_id, academic_year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO anon, authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view enrollments (demo)" ON public.enrollments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert enrollments (demo)" ON public.enrollments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update enrollments (demo)" ON public.enrollments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete enrollments (demo)" ON public.enrollments FOR DELETE TO anon, authenticated USING (true);
CREATE TRIGGER trg_enrollments_updated_at BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_section ON public.enrollments(class_section_id);

-- ============ Seed class sections for 2025-2026 ============
INSERT INTO public.class_sections (grade, section, academic_year, capacity) VALUES
  ('KG-1','A','2025-2026',25),('KG-1','B','2025-2026',25),
  ('KG-2','A','2025-2026',25),('KG-2','B','2025-2026',25),
  ('Grade 1','A','2025-2026',30),('Grade 1','B','2025-2026',30),
  ('Grade 2','A','2025-2026',30),('Grade 2','B','2025-2026',30),
  ('Grade 3','A','2025-2026',30),('Grade 3','B','2025-2026',30),
  ('Grade 4','A','2025-2026',30),('Grade 4','B','2025-2026',30),
  ('Grade 5','A','2025-2026',30),('Grade 5','B','2025-2026',30),
  ('Grade 6','A','2025-2026',32),('Grade 6','B','2025-2026',32),
  ('Grade 7','A','2025-2026',32),('Grade 7','B','2025-2026',32),
  ('Grade 8','A','2025-2026',32),('Grade 8','B','2025-2026',32),
  ('Grade 9','A','2025-2026',35),('Grade 9','B','2025-2026',35),
  ('Grade 10','A','2025-2026',35),('Grade 10','B','2025-2026',35),
  ('Grade 11','A','2025-2026',35),('Grade 11','B','2025-2026',35),
  ('Grade 12','A','2025-2026',35),('Grade 12','B','2025-2026',35);
