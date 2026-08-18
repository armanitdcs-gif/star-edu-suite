-- Roles infrastructure
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','staff')
  )
$$;

-- admission_applications
DROP POLICY IF EXISTS "Anyone can view applications (demo)" ON public.admission_applications;
DROP POLICY IF EXISTS "Anyone can update applications (demo)" ON public.admission_applications;
DROP POLICY IF EXISTS "Anyone can delete applications (demo)" ON public.admission_applications;
CREATE POLICY "Staff can view applications" ON public.admission_applications
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update applications" ON public.admission_applications
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete applications" ON public.admission_applications
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- students
DROP POLICY IF EXISTS "Anyone can view students (demo)" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students (demo)" ON public.students;
DROP POLICY IF EXISTS "Anyone can update students (demo)" ON public.students;
DROP POLICY IF EXISTS "Anyone can delete students (demo)" ON public.students;
CREATE POLICY "Staff can view students" ON public.students
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert students" ON public.students
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update students" ON public.students
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete students" ON public.students
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.students FROM anon;

-- enrollments
DROP POLICY IF EXISTS "Anyone can view enrollments (demo)" ON public.enrollments;
DROP POLICY IF EXISTS "Anyone can insert enrollments (demo)" ON public.enrollments;
DROP POLICY IF EXISTS "Anyone can update enrollments (demo)" ON public.enrollments;
DROP POLICY IF EXISTS "Anyone can delete enrollments (demo)" ON public.enrollments;
CREATE POLICY "Staff can view enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert enrollments" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update enrollments" ON public.enrollments
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete enrollments" ON public.enrollments
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.enrollments FROM anon;

-- class_sections (public read kept for the application form)
DROP POLICY IF EXISTS "Anyone can insert class sections (demo)" ON public.class_sections;
DROP POLICY IF EXISTS "Anyone can update class sections (demo)" ON public.class_sections;
DROP POLICY IF EXISTS "Anyone can delete class sections (demo)" ON public.class_sections;
CREATE POLICY "Staff can insert class sections" ON public.class_sections
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update class sections" ON public.class_sections
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete class sections" ON public.class_sections
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
REVOKE INSERT, UPDATE, DELETE ON public.class_sections FROM anon;

-- leave_requests
DROP POLICY IF EXISTS "Anyone can view leave requests (demo)" ON public.leave_requests;
DROP POLICY IF EXISTS "Anyone can update leave requests (demo)" ON public.leave_requests;
DROP POLICY IF EXISTS "Anyone can delete leave requests (demo)" ON public.leave_requests;
CREATE POLICY "Staff can view leave requests" ON public.leave_requests
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update leave requests" ON public.leave_requests
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete leave requests" ON public.leave_requests
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- audit_logs
DROP POLICY IF EXISTS "Anyone can view audit logs (demo)" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can insert audit logs (demo)" ON public.audit_logs;
CREATE POLICY "Staff can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.audit_logs FROM anon;