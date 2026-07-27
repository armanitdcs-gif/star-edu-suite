import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft, UserPlus, Search, Loader2, Check, X, Sparkles,
  Users, Clock, CheckCircle2, XCircle, IdCard, Filter,
} from "lucide-react";
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

export function AdmissionModule() {
  const { lang } = useI18n();
  const [tab, setTab] = useState("apply");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Application | null>(null);

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

  useEffect(() => { void load(); }, []);

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
    const patch: Partial<Application> = { status };
    if (status === "approved") {
      patch.student_id = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const { error } = await supabase
      .from("admission_applications")
      .update(patch as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(T("Status updated", "স্ট্যাটাস আপডেট হয়েছে"));
    setSelected((s) => (s && s.id === id ? { ...s, ...patch } as Application : s));
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

          <Card className="overflow-hidden shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableRow><TableCell colSpan={7} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {T("No applications found.", "কোনো আবেদন পাওয়া যায়নি।")}
                  </TableCell></TableRow>
                ) : filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
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
      </Tabs>

      <ReviewDialog
        app={selected}
        onClose={() => setSelected(null)}
        onStatus={updateStatus}
        onSaveNotes={saveNotes}
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
