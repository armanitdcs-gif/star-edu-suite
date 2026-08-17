CREATE TABLE public.admission_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_id uuid,
  actor_email text,
  application_ids uuid[] NOT NULL DEFAULT '{}',
  application_nos text[] NOT NULL DEFAULT '{}',
  affected_count integer NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_admission_audit_logs_created_at ON public.admission_audit_logs (created_at DESC);
GRANT SELECT, INSERT ON public.admission_audit_logs TO anon, authenticated;
GRANT ALL ON public.admission_audit_logs TO service_role;
ALTER TABLE public.admission_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view admission audit logs (demo)" ON public.admission_audit_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert admission audit logs (demo)" ON public.admission_audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);