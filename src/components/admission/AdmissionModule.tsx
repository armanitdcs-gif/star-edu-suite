import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft, UserPlus, Search, Loader2, Check, X, Sparkles,
  Users, Clock, CheckCircle2, XCircle, IdCard, Filter, CheckSquare,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["admission_applications"]["Row"];
type Status = Database["public"]["Enums"]["admission_status"];
type ClassSection = Database["public"]["Tables"]["class_sections"]["Row"];


const grades = [
  "KG-1", "KG-2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
];

const applicationSchema = z.object({
  student_first_name: z.string().trim().min(1, "Required").max(80),
  student_last_name: z.string().trim().min(1, "Required").max(80),
  date_of_birth: z.string().min(1, "Required"),
  gender: z.enum(["male", "female", "other"]),
  nationality: z.string().trim().min(1, "Required").max(60),
  religion: z.string().trim().max(60).optional().or(z.literal("")),
  applying_for_grade: z.string().min(1, "Required"),
  academic_year: z.string().trim().min(1).max(20),
  previous_school: z.string().trim().max(160).optional().or(z.literal("")),
  guardian_name: z.string().trim().min(1, "Required").max(120),
  guardian_relation: z.string().trim().min(1).max(40),
  guardian_phone: z.string().trim().min(5, "Invalid phone").max(30),
  guardian_email: z.string().trim().email("Invalid email").max(160).optional().or(z.literal("")),
  address: z.string().trim().min(1, "Required").max(400),
  passport_no: z.string().trim().max(40).optional().or(z.literal("")),
  qid_no: z.string().trim().max(40).optional().or(z.literal("")),
  birth_certificate_no: z.string().trim().max(60).optional().or(z.literal("")),
  medical_notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormState = z.infer<typeof applicationSchema>;

const emptyForm: FormState = {
  student_first_name: "", student_last_name: "", date_of_birth: "",
  gender: "male", nationality: "", religion: "",
  applying_for_grade: "", academic_year: "2025-2026", previous_school: "",
  guardian_name: "", guardian_relation: "Father", guardian_phone: "", guardian_email: "",
  address: "", passport_no: "", qid_no: "", birth_certificate_no: "", medical_notes: "",
};

const statusStyles: Record<Status, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  interview: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-600 border-red-500/30",
};

type AuditLog = Database["public"]["Tables"]["admission_audit_logs"]["Row"];

const auditActionStyles: Record<string, string> = {
  admit: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  bulk_admit: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  reject: "bg-red-500/15 text-red-600 border-red-500/30",
  bulk_reject: "bg-red-500/15 text-red-600 border-red-500/30",
  status_change: "bg-sky-500/15 text-sky-600 border-sky-500/30",
};

const auditActionLabel = (action: string, T: (en: string, bn: string) => string) => {
  switch (action) {
    case "admit": return T("Admitted", "ভর্তি");
    case "bulk_admit": return T("Bulk admit", "বাল্ক ভর্তি");
    case "reject": return T("Rejected", "প্রত্যাখ্যাত");
    case "bulk_reject": return T("Bulk reject", "বাল্ক প্রত্যাখ্যান");
    case "status_change": return T("Status change", "স্ট্যাটাস পরিবর্তন");
    default: return action;
  }
};

const formatAuditDetails = (details: unknown) => {
  if (!details || typeof details !== "object") return "—";
  const entries = Object.entries(details as Record<string, unknown>);
  if (entries.length === 0) return "—";
  return entries.map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`).join(" · ");
};


export function AdmissionModule() {
  const { lang } = useI18n();
  const [tab, setTab] = useState("apply");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [rows, setRows] = useState<Application[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [admitting, setAdmitting] = useState<Application | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAdmitOpen, setBulkAdmitOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  const T = (en: string, bn: string) => (lang === "en" ? en : bn);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admission_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  };

  const loadAudit = async () => {
    setAuditLoading(true);
    const { data } = await supabase
      .from("admission_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setAudit(data ?? []);
    setAuditLoading(false);
  };

  const logAudit = async (
    action: string,
    apps: Application[],
    details: Record<string, unknown> = {},
  ) => {
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("admission_audit_logs").insert({
      action,
      actor_id: auth.user?.id ?? null,
      actor_email: auth.user?.email ?? null,
      application_ids: apps.map((a) => a.id),
      application_nos: apps.map((a) => a.application_no),
      affected_count: apps.length,
      details: details as never,
    } as never);
    if (error) toast.error(error.message);
    void loadAudit();
  };

  useEffect(() => {
    void load();
    void loadAudit();
    void (async () => {
      const { data } = await supabase.from("class_sections").select("*").order("grade").order("section");
      setSections(data ?? []);
    })();
  }, []);



  const stats = useMemo(() => ({
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  }), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [
        r.application_no, r.student_first_name, r.student_last_name,
        r.guardian_name, r.guardian_phone, r.applying_for_grade, r.student_id ?? "",
      ].join(" ").toLowerCase().includes(q);
    });
  }, [rows, search, statusFilter]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k as string]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error(T("Please fix the errors below", "নিচের ত্রুটিগুলি সংশোধন করুন"));
      return;
    }
    setSubmitting(true);
    const payload = Object.fromEntries(
      Object.entries(parsed.data).map(([k, v]) => [k, v === "" ? null : v]),
    );
    const { data, error } = await supabase
      .from("admission_applications")
      .insert(payload as never)
      .select("application_no")
      .single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(
      T(`Application submitted: ${data.application_no}`,
        `আবেদন জমা হয়েছে: ${data.application_no}`),
    );
    setForm(emptyForm);
    setErrors({});
    setTab("list");
    void load();
  };

  const updateStatus = async (id: string, status: Status) => {
    if (status === "approved") {
      const app = rows.find((r) => r.id === id) ?? (selected?.id === id ? selected : null);
      if (app) {
        setSelected(null);
        setAdmitting(app);
      }
      return;
    }
    const { error } = await supabase
      .from("admission_applications")
      .update({ status } as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(T("Status updated", "স্ট্যাটাস আপডেট হয়েছে"));
    setSelected((s) => (s && s.id === id ? { ...s, status } as Application : s));
    void load();
  };

  const performAdmit = async (
    app: Application,
    classSectionId: string,
    rollNo: string,
  ): Promise<{ ok: true; studentNo: string; section: ClassSection } | { ok: false; error: string }> => {
    const section = sections.find((s) => s.id === classSectionId);
    if (!section) return { ok: false, error: "Section not found" };

    const studentNo = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: student, error: sErr } = await supabase
      .from("students")
      .insert({
        student_no: studentNo,
        first_name: app.student_first_name,
        last_name: app.student_last_name,
        date_of_birth: app.date_of_birth,
        gender: app.gender,
        nationality: app.nationality,
        religion: app.religion,
        guardian_name: app.guardian_name,
        guardian_relation: app.guardian_relation,
        guardian_phone: app.guardian_phone,
        guardian_email: app.guardian_email,
        address: app.address,
        passport_no: app.passport_no,
        qid_no: app.qid_no,
        birth_certificate_no: app.birth_certificate_no,
        medical_notes: app.medical_notes,
        admission_application_id: app.id,
      } as never)
      .select("id, student_no")
      .single();
    if (sErr || !student) return { ok: false, error: sErr?.message ?? "Failed to create student" };

    const { error: eErr } = await supabase.from("enrollments").insert({
      student_id: (student as { id: string }).id,
      class_section_id: classSectionId,
      academic_year: section.academic_year,
      roll_no: rollNo.trim() || null,
    } as never);
    if (eErr) return { ok: false, error: eErr.message };

    const { error: aErr } = await supabase
      .from("admission_applications")
      .update({ status: "approved", student_id: studentNo } as never)
      .eq("id", app.id);
    if (aErr) return { ok: false, error: aErr.message };

    return { ok: true, studentNo, section };
  };

  const admitStudent = async (app: Application, classSectionId: string, rollNo: string) => {
    const res = await performAdmit(app, classSectionId, rollNo);
    if (!res.ok) return toast.error(res.error);
    toast.success(
      T(`Admitted ${app.student_first_name} → ${res.section.grade} ${res.section.section} (${res.studentNo})`,
        `${app.student_first_name} ভর্তি হয়েছে → ${res.section.grade} ${res.section.section} (${res.studentNo})`),
    );
    setAdmitting(null);
    void load();
  };

  const bulkAdmit = async (assignments: Record<string, string>) => {
    // assignments: applicationId -> classSectionId
    setBulkBusy(true);
    let success = 0;
    let failed = 0;
    for (const app of rows) {
      const sid = assignments[app.id];
      if (!sid) continue;
      if (app.status === "approved") continue;
      const res = await performAdmit(app, sid, "");
      if (res.ok) success++; else failed++;
    }
    setBulkBusy(false);
    setBulkAdmitOpen(false);
    setSelectedIds(new Set());
    void load();
    toast.success(
      T(`Bulk admission complete: ${success} admitted${failed ? `, ${failed} failed` : ""}`,
        `বাল্ক ভর্তি সম্পন্ন: ${success} জন ভর্তি${failed ? `, ${failed} ব্যর্থ` : ""}`),
    );
  };

  const bulkReject = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const { error } = await supabase
      .from("admission_applications")
      .update({ status: "rejected" } as never)
      .in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(T(`Rejected ${ids.length} applications`, `${ids.length}টি আবেদন প্রত্যাখ্যাত`));
    setSelectedIds(new Set());
    void load();
  };




  const saveNotes = async (id: string, notes: string) => {
    const { error } = await supabase
      .from("admission_applications")
      .update({ admin_notes: notes } as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(T("Notes saved", "নোট সংরক্ষণ হয়েছে"));
    void load();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Link to="/" className="hover:text-foreground">{T("Dashboard", "ড্যাশবোর্ড")}</Link>
        <span>/</span>
        <span className="text-foreground">{T("Module 05", "মডিউল ০৫")}</span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elegant md:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary-glow/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-gold text-gold-foreground shadow-gold">
              <UserPlus className="h-8 w-8" strokeWidth={2.2} />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-gold/20 text-gold hover:bg-gold/25 border-gold/30">Module 05</Badge>
                <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/15 text-emerald-200">
                  <Sparkles className="mr-1 h-3 w-3" /> {T("Live", "চালু")}
                </Badge>
              </div>
              <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
                {T("Student Admission", "শিক্ষার্থী ভর্তি")}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/75 md:text-base">
                {T("End-to-end online admission workflow with document capture, interview & approval.",
                   "ডকুমেন্ট সংগ্রহ, ইন্টারভিউ ও অনুমোদনসহ সম্পূর্ণ অনলাইন ভর্তি প্রক্রিয়া।")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Users} label={T("Total", "মোট")} value={stats.total} tone="primary" />
        <StatCard icon={Clock} label={T("Pending", "অপেক্ষমাণ")} value={stats.pending} tone="amber" />
        <StatCard icon={CheckCircle2} label={T("Approved", "অনুমোদিত")} value={stats.approved} tone="emerald" />
        <StatCard icon={XCircle} label={T("Rejected", "প্রত্যাখ্যাত")} value={stats.rejected} tone="red" />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="apply">{T("New Application", "নতুন আবেদন")}</TabsTrigger>
          <TabsTrigger value="list">{T("Applications", "সব আবেদন")} · {rows.length}</TabsTrigger>
        </TabsList>

        {/* APPLY */}
        <TabsContent value="apply">
          <Card className="p-6 md:p-8 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-8">
              <Section title={T("Student information", "শিক্ষার্থীর তথ্য")}>
                <Field label={T("First name", "নামের প্রথম অংশ") + " *"} error={errors.student_first_name}>
                  <Input value={form.student_first_name} onChange={(e) => setField("student_first_name", e.target.value)} />
                </Field>
                <Field label={T("Last name", "নামের শেষ অংশ") + " *"} error={errors.student_last_name}>
                  <Input value={form.student_last_name} onChange={(e) => setField("student_last_name", e.target.value)} />
                </Field>
                <Field label={T("Date of birth", "জন্ম তারিখ") + " *"} error={errors.date_of_birth}>
                  <Input type="date" value={form.date_of_birth} onChange={(e) => setField("date_of_birth", e.target.value)} />
                </Field>
                <Field label={T("Gender", "লিঙ্গ") + " *"} error={errors.gender}>
                  <Select value={form.gender} onValueChange={(v) => setField("gender", v as FormState["gender"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{T("Male", "পুরুষ")}</SelectItem>
                      <SelectItem value="female">{T("Female", "মহিলা")}</SelectItem>
                      <SelectItem value="other">{T("Other", "অন্যান্য")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={T("Nationality", "জাতীয়তা") + " *"} error={errors.nationality}>
                  <Input value={form.nationality} onChange={(e) => setField("nationality", e.target.value)} placeholder="Qatari, Indian, Bangladeshi…" />
                </Field>
                <Field label={T("Religion", "ধর্ম")} error={errors.religion}>
                  <Input value={form.religion ?? ""} onChange={(e) => setField("religion", e.target.value)} />
                </Field>
              </Section>

              <Section title={T("Application", "আবেদন")}>
                <Field label={T("Applying for grade", "কোন গ্রেডের জন্য") + " *"} error={errors.applying_for_grade}>
                  <Select value={form.applying_for_grade} onValueChange={(v) => setField("applying_for_grade", v)}>
                    <SelectTrigger><SelectValue placeholder={T("Select grade", "গ্রেড নির্বাচন")} /></SelectTrigger>
                    <SelectContent>
                      {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={T("Academic year", "একাডেমিক বছর") + " *"} error={errors.academic_year}>
                  <Input value={form.academic_year} onChange={(e) => setField("academic_year", e.target.value)} />
                </Field>
                <Field label={T("Previous school", "পূর্ববর্তী স্কুল")} error={errors.previous_school} full>
                  <Input value={form.previous_school ?? ""} onChange={(e) => setField("previous_school", e.target.value)} />
                </Field>
              </Section>

              <Section title={T("Guardian", "অভিভাবক")}>
                <Field label={T("Guardian name", "অভিভাবকের নাম") + " *"} error={errors.guardian_name}>
                  <Input value={form.guardian_name} onChange={(e) => setField("guardian_name", e.target.value)} />
                </Field>
                <Field label={T("Relation", "সম্পর্ক") + " *"} error={errors.guardian_relation}>
                  <Select value={form.guardian_relation} onValueChange={(v) => setField("guardian_relation", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Father","Mother","Guardian","Uncle","Aunt","Other"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={T("Phone", "ফোন") + " *"} error={errors.guardian_phone}>
                  <Input value={form.guardian_phone} onChange={(e) => setField("guardian_phone", e.target.value)} placeholder="+974 ..." />
                </Field>
                <Field label={T("Email", "ইমেইল")} error={errors.guardian_email}>
                  <Input type="email" value={form.guardian_email ?? ""} onChange={(e) => setField("guardian_email", e.target.value)} />
                </Field>
                <Field label={T("Address", "ঠিকানা") + " *"} error={errors.address} full>
                  <Textarea rows={2} value={form.address} onChange={(e) => setField("address", e.target.value)} />
                </Field>
              </Section>

              <Section title={T("Documents", "ডকুমেন্ট")}>
                <Field label={T("Passport no.", "পাসপোর্ট নং")} error={errors.passport_no}>
                  <Input value={form.passport_no ?? ""} onChange={(e) => setField("passport_no", e.target.value)} />
                </Field>
                <Field label={T("QID no.", "কিউআইডি নং")} error={errors.qid_no}>
                  <Input value={form.qid_no ?? ""} onChange={(e) => setField("qid_no", e.target.value)} />
                </Field>
                <Field label={T("Birth certificate no.", "জন্মনিবন্ধন নং")} error={errors.birth_certificate_no}>
                  <Input value={form.birth_certificate_no ?? ""} onChange={(e) => setField("birth_certificate_no", e.target.value)} />
                </Field>
                <Field label={T("Medical notes / allergies", "মেডিকেল নোট / অ্যালার্জি")} error={errors.medical_notes} full>
                  <Textarea rows={2} value={form.medical_notes ?? ""} onChange={(e) => setField("medical_notes", e.target.value)} />
                </Field>
              </Section>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-6">
                <Button type="button" variant="ghost" onClick={() => { setForm(emptyForm); setErrors({}); }}>
                  {T("Reset", "রিসেট")}
                </Button>
                <Button type="submit" disabled={submitting} className="gap-2 bg-gold text-gold-foreground hover:bg-gold/90 shadow-gold">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {T("Submit application", "আবেদন জমা দিন")}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* LIST */}
        <TabsContent value="list" className="space-y-4">
          <Card className="p-4 shadow-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder={T("Search name, phone, application no…", "নাম, ফোন, আবেদন নং…")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{T("All statuses", "সব স্ট্যাটাস")}</SelectItem>
                    <SelectItem value="pending">{T("Pending", "অপেক্ষমাণ")}</SelectItem>
                    <SelectItem value="interview">{T("Interview", "ইন্টারভিউ")}</SelectItem>
                    <SelectItem value="approved">{T("Approved", "অনুমোদিত")}</SelectItem>
                    <SelectItem value="rejected">{T("Rejected", "প্রত্যাখ্যাত")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {selectedIds.size > 0 && (
            <Card className="flex flex-col items-start justify-between gap-3 border-primary/40 bg-primary/5 p-3 shadow-card sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {T(`${selectedIds.size} selected`, `${selectedIds.size} নির্বাচিত`)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(() => {
                    const admittable = filtered.filter(
                      (r) => selectedIds.has(r.id) && r.status !== "approved",
                    ).length;
                    return T(`${admittable} admittable`, `${admittable} ভর্তিযোগ্য`);
                  })()}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                  {T("Clear", "মুছুন")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={bulkReject}
                >
                  <X className="mr-1 h-4 w-4" />{T("Reject", "প্রত্যাখ্যান")}
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => setBulkAdmitOpen(true)}
                >
                  <Check className="mr-1 h-4 w-4" />{T("Admit selected", "নির্বাচিতদের ভর্তি করুন")}
                </Button>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        filtered.length > 0 &&
                        filtered.every((r) => selectedIds.has(r.id))
                      }
                      onCheckedChange={(v) => {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (v) filtered.forEach((r) => next.add(r.id));
                          else filtered.forEach((r) => next.delete(r.id));
                          return next;
                        });
                      }}
                      aria-label={T("Select all", "সব নির্বাচন")}
                    />
                  </TableHead>
                  <TableHead>{T("Application", "আবেদন")}</TableHead>
                  <TableHead>{T("Student", "শিক্ষার্থী")}</TableHead>
                  <TableHead>{T("Grade", "গ্রেড")}</TableHead>
                  <TableHead>{T("Guardian", "অভিভাবক")}</TableHead>
                  <TableHead>{T("Status", "স্ট্যাটাস")}</TableHead>
                  <TableHead>{T("Student ID", "স্টুডেন্ট আইডি")}</TableHead>
                  <TableHead className="text-right">{T("Action", "অ্যাকশন")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    {T("No applications found.", "কোনো আবেদন পাওয়া যায়নি।")}
                  </TableCell></TableRow>
                ) : filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(r.id)}
                        onCheckedChange={(v) => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (v) next.add(r.id); else next.delete(r.id);
                            return next;
                          });
                        }}
                        aria-label={T("Select row", "সারি নির্বাচন")}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.application_no}</TableCell>
                    <TableCell className="font-medium">{r.student_first_name} {r.student_last_name}</TableCell>
                    <TableCell>{r.applying_for_grade}</TableCell>
                    <TableCell>
                      <div>{r.guardian_name}</div>
                      <div className="text-xs text-muted-foreground">{r.guardian_phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[r.status]}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.student_id ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(r); }}>
                        {T("Review", "পর্যালোচনা")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

        </TabsContent>

        {/* AUDIT LOG */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="overflow-hidden shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{T("When", "কখন")}</TableHead>
                  <TableHead>{T("Action", "অ্যাকশন")}</TableHead>
                  <TableHead>{T("Actor", "কে করেছে")}</TableHead>
                  <TableHead>{T("Applications", "আবেদনসমূহ")}</TableHead>
                  <TableHead>{T("Details", "বিস্তারিত")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLoading ? (
                  <TableRow><TableCell colSpan={5} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell></TableRow>
                ) : audit.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    {T("No audit entries yet.", "এখনো কোনো অডিট এন্ট্রি নেই।")}
                  </TableCell></TableRow>
                ) : audit.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={auditActionStyles[a.action] ?? "bg-muted"}>
                        {auditActionLabel(a.action, T)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{a.actor_email ?? T("System / demo", "সিস্টেম / ডেমো")}</TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="text-xs font-medium">
                        {T(`${a.affected_count} application(s)`, `${a.affected_count}টি আবেদন`)}
                      </div>
                      <div className="truncate font-mono text-[11px] text-muted-foreground">
                        {(a.application_nos ?? []).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                      {formatAuditDetails(a.details)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>


      <ReviewDialog
        app={selected}
        onClose={() => setSelected(null)}
        onStatus={updateStatus}
        onSaveNotes={saveNotes}
        T={T}
      />

      <AdmitDialog
        app={admitting}
        sections={sections}
        onClose={() => setAdmitting(null)}
        onAdmit={admitStudent}
        T={T}
      />

      <BulkAdmitDialog
        open={bulkAdmitOpen}
        apps={rows.filter((r) => selectedIds.has(r.id) && r.status !== "approved")}
        sections={sections}
        busy={bulkBusy}
        onClose={() => setBulkAdmitOpen(false)}
        onConfirm={bulkAdmit}
        T={T}
      />




      <Card className="flex flex-col items-start gap-4 border-dashed p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-base font-semibold">
            {T("Approved students flow into SIS", "অনুমোদিত শিক্ষার্থী SIS-এ যাবে")}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {T("On approval a Student ID is auto-generated. SIS module will consume these.",
               "অনুমোদনের সাথে সাথে স্টুডেন্ট আইডি স্বয়ংক্রিয়ভাবে তৈরি হয়। SIS মডিউল এগুলো ব্যবহার করবে।")}
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/"><ArrowLeft className="h-4 w-4" />{T("Back to Dashboard", "ড্যাশবোর্ডে ফিরুন")}</Link>
        </Button>
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, error, children, full }: {
  label: string; error?: string; children: React.ReactNode; full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: {
  icon: typeof Users; label: string; value: number; tone: "primary" | "amber" | "emerald" | "red";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/15 text-amber-600",
    emerald: "bg-emerald-500/15 text-emerald-600",
    red: "bg-red-500/15 text-red-600",
  } as const;
  return (
    <Card className="flex items-center gap-4 p-4 shadow-card">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-display text-2xl font-semibold">{value}</div>
      </div>
    </Card>
  );
}

function ReviewDialog({ app, onClose, onStatus, onSaveNotes, T }: {
  app: Application | null;
  onClose: () => void;
  onStatus: (id: string, s: Status) => void;
  onSaveNotes: (id: string, notes: string) => void;
  T: (en: string, bn: string) => string;
}) {
  const [notes, setNotes] = useState("");
  useEffect(() => { setNotes(app?.admin_notes ?? ""); }, [app]);
  if (!app) return null;

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-gold" />
            {app.student_first_name} {app.student_last_name}
            <Badge variant="outline" className={statusStyles[app.status]}>{app.status}</Badge>
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">{app.application_no}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Info label={T("Grade", "গ্রেড")} value={app.applying_for_grade} />
          <Info label={T("Academic year", "একাডেমিক বছর")} value={app.academic_year} />
          <Info label={T("Date of birth", "জন্ম তারিখ")} value={app.date_of_birth} />
          <Info label={T("Gender", "লিঙ্গ")} value={app.gender} />
          <Info label={T("Nationality", "জাতীয়তা")} value={app.nationality} />
          <Info label={T("Religion", "ধর্ম")} value={app.religion ?? "—"} />
          <Info label={T("Guardian", "অভিভাবক")} value={`${app.guardian_name} (${app.guardian_relation})`} />
          <Info label={T("Phone", "ফোন")} value={app.guardian_phone} />
          <Info label={T("Email", "ইমেইল")} value={app.guardian_email ?? "—"} />
          <Info label={T("Previous school", "পূর্ববর্তী স্কুল")} value={app.previous_school ?? "—"} />
          <Info label={T("Passport", "পাসপোর্ট")} value={app.passport_no ?? "—"} />
          <Info label={T("QID", "কিউআইডি")} value={app.qid_no ?? "—"} />
          <Info label={T("Birth cert.", "জন্মনিবন্ধন")} value={app.birth_certificate_no ?? "—"} />
          <Info label={T("Student ID", "স্টুডেন্ট আইডি")} value={app.student_id ?? "—"} />
          <div className="col-span-2">
            <Info label={T("Address", "ঠিকানা")} value={app.address} />
          </div>
          {app.medical_notes && (
            <div className="col-span-2">
              <Info label={T("Medical notes", "মেডিকেল নোট")} value={app.medical_notes} />
            </div>
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label className="text-xs font-medium text-muted-foreground">
            {T("Admin notes", "অ্যাডমিন নোট")}
          </Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button size="sm" variant="outline" onClick={() => onSaveNotes(app.id, notes)}>
            {T("Save notes", "নোট সংরক্ষণ")}
          </Button>
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <Button variant="outline" className="gap-2" onClick={() => onStatus(app.id, "interview")}>
            {T("Mark interview", "ইন্টারভিউ")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700"
                    onClick={() => onStatus(app.id, "rejected")}>
              <X className="h-4 w-4" />{T("Reject", "প্রত্যাখ্যান")}
            </Button>
            <Button className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => onStatus(app.id, "approved")}>
              <Check className="h-4 w-4" />{T("Approve", "অনুমোদন")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function AdmitDialog({ app, sections, onClose, onAdmit, T }: {
  app: Application | null;
  sections: ClassSection[];
  onClose: () => void;
  onAdmit: (app: Application, classSectionId: string, rollNo: string) => Promise<unknown> | unknown;
  T: (en: string, bn: string) => string;
}) {
  const [sectionId, setSectionId] = useState<string>("");
  const [rollNo, setRollNo] = useState("");
  const [busy, setBusy] = useState(false);

  const options = useMemo(() => {
    if (!app) return [];
    return sections.filter(
      (s) => s.grade === app.applying_for_grade && s.academic_year === app.academic_year,
    );
  }, [sections, app]);

  useEffect(() => {
    setSectionId(options[0]?.id ?? "");
    setRollNo("");
  }, [app, options]);

  if (!app) return null;

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600" />
            {T("Admit to SIS", "SIS-এ ভর্তি করুন")}
          </DialogTitle>
          <DialogDescription>
            {T(
              `Approve ${app.student_first_name} ${app.student_last_name} and create their student record and class enrollment.`,
              `${app.student_first_name} ${app.student_last_name}-কে অনুমোদন দিয়ে ছাত্র রেকর্ড ও ক্লাস এনরোলমেন্ট তৈরি করুন।`,
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{T("Grade", "গ্রেড")}</span>
              <span className="font-medium">{app.applying_for_grade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{T("Academic year", "একাডেমিক বছর")}</span>
              <span className="font-medium">{app.academic_year}</span>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {T("Class section", "ক্লাস সেকশন")} *
            </Label>
            {options.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                {T(
                  `No sections found for ${app.applying_for_grade} (${app.academic_year}). Create one in School Setup.`,
                  `${app.applying_for_grade} (${app.academic_year}) এর জন্য কোনো সেকশন নেই। School Setup-এ তৈরি করুন।`,
                )}
              </div>
            ) : (
              <Select value={sectionId} onValueChange={setSectionId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.grade} — {T("Section", "সেকশন")} {s.section}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({T("cap", "ধারণ")} {s.capacity})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {T("Roll no. (optional)", "রোল নং (ঐচ্ছিক)")}
            </Label>
            <Input value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="e.g. 12" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{T("Cancel", "বাতিল")}</Button>
          <Button
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={!sectionId || busy}
            onClick={async () => {
              setBusy(true);
              await onAdmit(app, sectionId, rollNo);
              setBusy(false);
            }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {T("Confirm admission", "ভর্তি নিশ্চিত করুন")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkAdmitDialog({ open, apps, sections, busy, onClose, onConfirm, T }: {
  open: boolean;
  apps: Application[];
  sections: ClassSection[];
  busy: boolean;
  onClose: () => void;
  onConfirm: (assignments: Record<string, string>) => Promise<unknown> | unknown;
  T: (en: string, bn: string) => string;
}) {
  // Group apps by grade + academic_year for one section pick per group.
  const groups = useMemo(() => {
    const map = new Map<string, { grade: string; year: string; apps: Application[] }>();
    for (const a of apps) {
      const key = `${a.applying_for_grade}__${a.academic_year}`;
      if (!map.has(key)) map.set(key, { grade: a.applying_for_grade, year: a.academic_year, apps: [] });
      map.get(key)!.apps.push(a);
    }
    return Array.from(map.entries()).map(([key, v]) => ({ key, ...v }));
  }, [apps]);

  const [groupSection, setGroupSection] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const initial: Record<string, string> = {};
    for (const g of groups) {
      const opts = sections.filter((s) => s.grade === g.grade && s.academic_year === g.year);
      if (opts[0]) initial[g.key] = opts[0].id;
    }
    setGroupSection(initial);
  }, [open, groups, sections]);

  const confirm = () => {
    const assignments: Record<string, string> = {};
    for (const g of groups) {
      const sid = groupSection[g.key];
      if (!sid) continue;
      for (const a of g.apps) assignments[a.id] = sid;
    }
    void onConfirm(assignments);
  };

  const anyMissing = groups.some((g) => !groupSection[g.key]);
  const totalAssigned = groups.reduce(
    (acc, g) => acc + (groupSection[g.key] ? g.apps.length : 0),
    0,
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-emerald-600" />
            {T("Bulk admit to SIS", "বাল্ক SIS ভর্তি")}
          </DialogTitle>
          <DialogDescription>
            {T(
              `Assign a class section for each grade group. ${apps.length} applications will be admitted.`,
              `প্রতিটি গ্রেড গ্রুপের জন্য সেকশন নির্বাচন করুন। ${apps.length}টি আবেদন ভর্তি হবে।`,
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-3 overflow-y-auto">
          {groups.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              {T("No admittable applications selected.", "কোনো ভর্তিযোগ্য আবেদন নির্বাচিত নেই।")}
            </div>
          ) : groups.map((g) => {
            const opts = sections.filter(
              (s) => s.grade === g.grade && s.academic_year === g.year,
            );
            return (
              <div key={g.key} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <div className="font-medium">
                    {g.grade} <span className="text-xs text-muted-foreground">· {g.year}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {g.apps.length} {T("students", "শিক্ষার্থী")}
                  </Badge>
                </div>
                {opts.length === 0 ? (
                  <div className="rounded-md border border-dashed p-2 text-xs text-muted-foreground">
                    {T(
                      `No sections for ${g.grade} (${g.year}). Skipped.`,
                      `${g.grade} (${g.year}) এর জন্য সেকশন নেই। বাদ পড়েছে।`,
                    )}
                  </div>
                ) : (
                  <Select
                    value={groupSection[g.key] ?? ""}
                    onValueChange={(v) => setGroupSection((s) => ({ ...s, [g.key]: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={T("Select section", "সেকশন নির্বাচন")} />
                    </SelectTrigger>
                    <SelectContent>
                      {opts.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {T("Section", "সেকশন")} {s.section}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({T("cap", "ধারণ")} {s.capacity})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  {g.apps.slice(0, 3).map((a) => `${a.student_first_name} ${a.student_last_name}`).join(", ")}
                  {g.apps.length > 3 ? ` +${g.apps.length - 3}` : ""}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {T(`${totalAssigned} of ${apps.length} will be admitted`,
               `${apps.length} এর মধ্যে ${totalAssigned} জন ভর্তি হবে`)}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={busy}>
              {T("Cancel", "বাতিল")}
            </Button>
            <Button
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={busy || totalAssigned === 0 || anyMissing}
              onClick={confirm}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {T(`Admit ${totalAssigned}`, `${totalAssigned} জন ভর্তি করুন`)}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
