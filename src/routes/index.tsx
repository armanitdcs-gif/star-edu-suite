import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, GraduationCap, Briefcase, School, ClipboardCheck, UserPlus, Wallet,
  TrendingUp, Bell, Cake, CalendarDays, Bus, FileWarning, ArrowUpRight,
  ArrowRight, Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { modules } from "@/lib/modules";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — STAR School ERP" },
      { name: "description", content: "Real-time KPIs, attendance, revenue and alerts across your schools." },
    ],
  }),
  component: Dashboard,
});

interface Kpi {
  label: string;
  labelBn: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  tone: "primary" | "gold" | "success" | "warning";
}

const kpis: Kpi[] = [
  { label: "Total Students", labelBn: "মোট শিক্ষার্থী", value: "3,847", delta: "+124", icon: Users, tone: "primary" },
  { label: "Total Teachers", labelBn: "মোট শিক্ষক", value: "218", delta: "+6", icon: GraduationCap, tone: "primary" },
  { label: "Total Staff", labelBn: "মোট স্টাফ", value: "94", delta: "+2", icon: Briefcase, tone: "primary" },
  { label: "Active Classes", labelBn: "সক্রিয় ক্লাস", value: "142", delta: "Today", icon: School, tone: "primary" },
  { label: "Attendance Today", labelBn: "আজকের উপস্থিতি", value: "96.4%", delta: "+1.2%", icon: ClipboardCheck, tone: "success" },
  { label: "New Admissions", labelBn: "নতুন ভর্তি", value: "38", delta: "This week", icon: UserPlus, tone: "gold" },
  { label: "Pending Fees", labelBn: "বকেয়া ফি", value: "QAR 214K", delta: "42 parents", icon: Wallet, tone: "warning" },
  { label: "Today's Revenue", labelBn: "আজকের আয়", value: "QAR 48.2K", delta: "+8.4%", icon: TrendingUp, tone: "gold" },
];

const toneStyles: Record<Kpi["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
};

function Dashboard() {
  const { lang, t } = useI18n();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elegant md:p-10">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-primary-glow/25 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              {t("app_tag")}
            </div>
            <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
              {lang === "en" ? "Good morning, Ahmed." : "শুভ সকাল, আহমেদ।"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-primary-foreground/70 md:text-base">
              {lang === "en"
                ? "Here's what's happening across your 3 campuses today — Sunday, 19 Jul 2026."
                : "আপনার ৩টি ক্যাম্পাসে আজ যা যা ঘটছে — রবিবার, ১৯ জুলাই ২০২৬।"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="gap-2 bg-white/10 text-primary-foreground hover:bg-white/15 backdrop-blur">
              <Link to="/m/$slug" params={{ slug: "reports" }}>
                <ArrowUpRight className="h-4 w-4" />
                {lang === "en" ? "Executive Report" : "এক্সিকিউটিভ রিপোর্ট"}
              </Link>
            </Button>
            <Button asChild className="gap-2 bg-gold text-gold-foreground hover:bg-gold/90 shadow-gold">
              <Link to="/m/$slug" params={{ slug: "admission" }}>
                <UserPlus className="h-4 w-4" />
                {lang === "en" ? "New Admission" : "নতুন ভর্তি"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="group relative overflow-hidden p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant">
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneStyles[k.tone]}`}>
                <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {lang === "en" ? k.label : k.labelBn}
              </div>
              <div className="mt-1 font-display text-2xl font-semibold text-foreground">
                {k.value}
              </div>
              <div className="mt-1 text-[11px] font-medium text-muted-foreground">{k.delta}</div>
            </Card>
          );
        })}
      </div>

      {/* Main grid: finance + notifications */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 shadow-card lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {lang === "en" ? "Monthly Finance" : "মাসিক ফিন্যান্স"}
              </div>
              <h3 className="font-display text-xl font-semibold">July 2026</h3>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/m/$slug" params={{ slug: "accounting" }}>
                {t("view_all")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { label: t("monthly_income"), value: "QAR 1.42M", pct: 82, tone: "bg-success" },
              { label: t("expenses"), value: "QAR 0.87M", pct: 58, tone: "bg-warning" },
              { label: t("profit"), value: "QAR 0.55M", pct: 38, tone: "bg-gold" },
            ].map((row) => (
              <div key={row.label}>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{row.label}</div>
                <div className="mt-1 font-display text-2xl font-semibold">{row.value}</div>
                <Progress value={row.pct} className="mt-3 h-1.5" />
              </div>
            ))}
          </div>

          <div className="mt-8 flex h-40 items-end gap-1.5">
            {[42, 55, 48, 62, 70, 58, 74, 82, 76, 88, 92, 84].map((h, i) => (
              <div
                key={i}
                className="group flex-1 rounded-t-sm bg-primary/15 transition-all hover:bg-gold"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">{t("notifications")}</h3>
            <Badge variant="secondary" className="bg-gold/15 text-gold hover:bg-gold/20">7</Badge>
          </div>
          <ul className="space-y-4 text-sm">
            {[
              { icon: Cake, tone: "text-gold", text: lang === "en" ? "3 students have birthdays today" : "আজ ৩ জন শিক্ষার্থীর জন্মদিন" },
              { icon: CalendarDays, tone: "text-primary", text: lang === "en" ? "Physics mid-term exam on Wednesday" : "বুধবার ফিজিক্স মিড-টার্ম পরীক্ষা" },
              { icon: Bus, tone: "text-success", text: lang === "en" ? "Bus 07 arrived — Al Rayyan route" : "বাস ০৭ পৌঁছেছে — আল রাইয়ান রুট" },
              { icon: FileWarning, tone: "text-warning", text: lang === "en" ? "5 QIDs expire in the next 30 days" : "আগামী ৩০ দিনে ৫টি কিউআইডি মেয়াদ শেষ" },
              { icon: Bell, tone: "text-primary", text: lang === "en" ? "Parent meeting scheduled for Saturday" : "শনিবার প্যারেন্ট মিটিং নির্ধারিত" },
            ].map((n, i) => {
              const NIcon = n.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <NIcon className={`h-4 w-4 shrink-0 mt-0.5 ${n.tone}`} />
                  <span className="text-foreground/85">{n.text}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Modules grid */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {lang === "en" ? "All Modules" : "সব মডিউল"}
            </div>
            <h2 className="font-display text-2xl font-semibold">
              {lang === "en" ? "40 Modules · Enterprise Edition" : "৪০টি মডিউল · এন্টারপ্রাইজ সংস্করণ"}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.filter((m) => m.slug !== "dashboard").map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.slug}
                to="/m/$slug"
                params={{ slug: m.slug }}
                className="group"
              >
                <Card className="h-full p-5 shadow-card transition-all group-hover:-translate-y-0.5 group-hover:border-gold/40 group-hover:shadow-elegant">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-gold/15 group-hover:text-gold">
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      M{String(m.no).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="font-display text-base font-semibold text-foreground">
                    {m.title[lang]}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {m.desc[lang]}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
