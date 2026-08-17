-- ============ generic audit log (shared by all approval modules) ============
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  action text NOT NULL,
  actor_id uuid,
  actor_email text,
  record_ids uuid[] NOT NULL DEFAULT '{}',
  record_refs text[] NOT NULL DEFAULT '{}',
  affected_count integer NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_module_created ON public.audit_logs (module, created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO anon, authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view audit logs (demo)" ON public.audit_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert audit logs (demo)" ON public.audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.audit_logs (module, action, actor_id, actor_email, record_ids, record_refs, affected_count, details, created_at)
SELECT 'admission', action, actor_id, actor_email, application_ids, application_nos, affected_count, details, created_at
FROM public.admission_audit_logs;

DROP TABLE public.admission_audit_logs;

-- ============ leave management (shared approval flow) ============
CREATE TYPE public.leave_status AS ENUM ('pending', 'review', 'approved', 'rejected');
CREATE TYPE public.leave_applicant_type AS ENUM ('staff', 'student');
CREATE TYPE public.leave_type AS ENUM ('casual', 'sick', 'annual', 'emergency', 'unpaid', 'maternity');

CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_no text NOT NULL UNIQUE DEFAULT ('LV-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random()*10000))::text, 4, '0')),
  applicant_type public.leave_applicant_type NOT NULL DEFAULT 'staff',
  applicant_name text NOT NULL,
  applicant_ref text,
  department text,
  contact_phone text NOT NULL,
  contact_email text,
  leave_type public.leave_type NOT NULL DEFAULT 'casual',
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL DEFAULT 1,
  reason text NOT NULL,
  substitute_name text,
  status public.leave_status NOT NULL DEFAULT 'pending',
  approver_notes text,
  decided_by_email text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_requests TO anon, authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view leave requests (demo)" ON public.leave_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit leave requests (demo)" ON public.leave_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update leave requests (demo)" ON public.leave_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete leave requests (demo)" ON public.leave_requests FOR DELETE TO anon, authenticated USING (true);
CREATE TRIGGER trg_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_leave_requests_status ON public.leave_requests (status);
CREATE INDEX idx_leave_requests_created_at ON public.leave_requests (created_at DESC);

INSERT INTO public.leave_requests (applicant_type, applicant_name, applicant_ref, department, contact_phone, contact_email, leave_type, start_date, end_date, total_days, reason, substitute_name, status) VALUES
('staff','Ahmed Al-Mansoori','EMP-1021','Mathematics','+974 5512 3344','ahmed.m@starschool.qa','annual','2026-09-01','2026-09-07',7,'Family vacation to home country.','Sara Khan','pending'),
('staff','Fatima Rahman','EMP-1044','Science','+974 5533 7788','fatima.r@starschool.qa','sick','2026-08-19','2026-08-20',2,'Fever and doctor advised rest.','Nadia Islam','pending'),
('student','Yusuf Karim','Grade 6 - A','Grade 6','+974 5544 1122','parent.karim@gmail.com','emergency','2026-08-18','2026-08-19',2,'Family emergency travel.',NULL,'review'),
('staff','Mohammed Siddique','EMP-1078','Administration','+974 5566 9900','m.siddique@starschool.qa','casual','2026-08-25','2026-08-25',1,'Personal work at embassy.',NULL,'pending'),
('student','Layla Hassan','Grade 9 - B','Grade 9','+974 5577 2233','hassan.family@gmail.com','sick','2026-08-17','2026-08-21',5,'Hospital admission, medical report attached.',NULL,'approved');