import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft, IdCard, Users, GraduationCap, Search, Filter, Loader2, Sparkles, School as SchoolIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Student = Database["public"]["Tables"]["students"]["Row"];
type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
type ClassSection = Database["public"]["Tables"]["class_sections"]["Row"];

interface EnrichedEnrollment extends Enrollment {
  section?: ClassSection;
}
interface EnrichedStudent extends Student {
  enrollment?: EnrichedEnrollment;
}

export function SISModule() {
  const { lang } = useI18n();
  const T = (en: string, bn: string) => (lang === "en" ? en : bn);

  const [students, setStudents] = useState<EnrichedStudent[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [selected, setSelected] = useState<EnrichedStudent | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: st, error: sErr }, { data: en }, { data: cs }] = await Promise.all([
      supabase.from("students").select("*").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("*").eq("status", "active"),
      supabase.from("class_sections").select("*").order("grade").order("section"),
    ]);
    if (sErr) toast.error(sErr.message);
    const secMap = new Map((cs ?? []).map((s) => [s.id, s]));
    const enrMap = new Map<string, EnrichedEnrollment>();
    for (const e of en ?? []) enrMap.set(e.student_id, { ...e, section: secMap.get(e.class_section_id) });
    setStudents((st ?? []).map((s) => ({ ...s, enrollment: enrMap.get(s.id) })));
    setSections(cs ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => {
    const enrolled = students.filter((s) => s.enrollment).length;
    const grades = new Set(students.map((s) => s.enrollment?.section?.grade).filter(Boolean));
    return {
      total: students.length,
      enrolled,
      unassigned: students.length - enrolled,
      grades: grades.size,
    };
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (sectionFilter !== "all" && s.enrollment?.class_section_id !== sectionFilter) return false;
      if (!q) return true;
      return [
        s.student_no, s.first_name, s.last_name, s.guardian_name, s.guardian_phone,
        s.enrollment?.section?.grade ?? "", s.enrollment?.section?.section ?? "",
      ].join(" ").toLowerCase().includes(q);
    });
  }, [students, search, sectionFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Link to="/" className="hover:text-foreground">{T("Dashboard", "ড্যাশবোর্ড")}</Link>
        <span>/</span>
        <span className="text-foreground">{T("Module 06", "মডিউল ০৬")}</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elegant md:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary-glow/25 blur-3xl" />
        <div className="relative flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-gold text-gold-foreground shadow-gold">
            <IdCard className="h-8 w-8" strokeWidth={2.2} />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className="bg-gold/20 text-gold hover:bg-gold/25 border-gold/30">Module 06</Badge>
              <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/15 text-emerald-200">
                <Sparkles className="mr-1 h-3 w-3" /> {T("Live", "চালু")}
              </Badge>
            </div>
            <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
              {T("Student Information System", "শিক্ষার্থী তথ্য ব্যবস্থা")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/75 md:text-base">
              {T("360° student profiles auto-populated from approved admissions and enrolled into class sections.",
                 "অনুমোদিত ভর্তি থেকে স্বয়ংক্রিয়ভাবে তৈরি ৩৬০° শিক্ষার্থী প্রোফাইল এবং ক্লাস সেকশনে এনরোলমেন্ট।")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Users} label={T("Total students", "মোট শিক্ষার্থী")} value={stats.total} tone="primary" />
        <StatCard icon={GraduationCap} label={T("Enrolled", "এনরোলড")} value={stats.enrolled} tone="emerald" />
        <StatCard icon={IdCard} label={T("Unassigned", "অ্যাসাইন হয়নি")} value={stats.unassigned} tone="amber" />
        <StatCard icon={SchoolIcon} label={T("Grades", "গ্রেড")} value={stats.grades} tone="primary" />
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={T("Search name, student no, phone…", "নাম, স্টুডেন্ট নং, ফোন…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{T("All sections", "সব সেকশন")}</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.grade} — {T("Section", "সেকশন")} {s.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{T("Student no.", "স্টুডেন্ট নং")}</TableHead>
              <TableHead>{T("Name", "নাম")}</TableHead>
              <TableHead>{T("Class", "ক্লাস")}</TableHead>
              <TableHead>{T("Roll", "রোল")}</TableHead>
              <TableHead>{T("Guardian", "অভিভাবক")}</TableHead>
              <TableHead>{T("Status", "স্ট্যাটাস")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
              </TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                {T("No students yet. Approve an admission to enroll one.",
                   "এখনো কোনো শিক্ষার্থী নেই। ভর্তি অনুমোদন দিলে যোগ হবে।")}
              </TableCell></TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => setSelected(s)}>
                <TableCell className="font-mono text-xs">{s.student_no}</TableCell>
                <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                <TableCell>
                  {s.enrollment?.section
                    ? `${s.enrollment.section.grade} • ${s.enrollment.section.section}`
                    : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>{s.enrollment?.roll_no ?? "—"}</TableCell>
                <TableCell>
                  <div>{s.guardian_name}</div>
                  <div className="text-xs text-muted-foreground">{s.guardian_phone}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{s.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <StudentDialog student={selected} onClose={() => setSelected(null)} T={T} />

      <Card className="flex flex-col items-start gap-4 border-dashed p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-base font-semibold">
            {T("Enrollment comes from Admissions", "এনরোলমেন্ট Admission থেকে আসে")}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {T("Approve an application in the Admission module to auto-create a student here.",
               "Admission মডিউলে আবেদন অনুমোদন করলে এখানে শিক্ষার্থী স্বয়ংক্রিয়ভাবে তৈরি হবে।")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/m/admission">{T("Open Admissions", "Admission খুলুন")}</Link>
          </Button>
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/"><ArrowLeft className="h-4 w-4" />{T("Dashboard", "ড্যাশবোর্ড")}</Link>
          </Button>
        </div>
      </Card>
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

function StudentDialog({ student, onClose, T }: {
  student: EnrichedStudent | null;
  onClose: () => void;
  T: (en: string, bn: string) => string;
}) {
  if (!student) return null;
  return (
    <Dialog open={!!student} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-gold" />
            {student.first_name} {student.last_name}
            <Badge variant="outline" className="capitalize">{student.status}</Badge>
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">{student.student_no}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Info label={T("Class", "ক্লাস")} value={
            student.enrollment?.section
              ? `${student.enrollment.section.grade} — ${T("Section", "সেকশন")} ${student.enrollment.section.section}`
              : "—"
          } />
          <Info label={T("Roll no.", "রোল নং")} value={student.enrollment?.roll_no ?? "—"} />
          <Info label={T("Academic year", "একাডেমিক বছর")} value={student.enrollment?.academic_year ?? "—"} />
          <Info label={T("Date of birth", "জন্ম তারিখ")} value={student.date_of_birth} />
          <Info label={T("Gender", "লিঙ্গ")} value={student.gender} />
          <Info label={T("Nationality", "জাতীয়তা")} value={student.nationality} />
          <Info label={T("Religion", "ধর্ম")} value={student.religion ?? "—"} />
          <Info label={T("Guardian", "অভিভাবক")} value={`${student.guardian_name} (${student.guardian_relation})`} />
          <Info label={T("Phone", "ফোন")} value={student.guardian_phone} />
          <Info label={T("Email", "ইমেইল")} value={student.guardian_email ?? "—"} />
          <Info label={T("Passport", "পাসপোর্ট")} value={student.passport_no ?? "—"} />
          <Info label={T("QID", "কিউআইডি")} value={student.qid_no ?? "—"} />
          <div className="col-span-2">
            <Info label={T("Address", "ঠিকানা")} value={student.address} />
          </div>
          {student.medical_notes && (
            <div className="col-span-2">
              <Info label={T("Medical notes", "মেডিকেল নোট")} value={student.medical_notes} />
            </div>
          )}
        </div>
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
