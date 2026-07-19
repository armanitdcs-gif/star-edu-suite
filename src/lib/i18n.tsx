import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

type Dict = Record<string, { en: string; bn: string }>;

// Central UI dictionary. Module titles live in modules.ts.
export const dict: Dict = {
  app_name: { en: "STAR School ERP", bn: "স্টার স্কুল ইআরপি" },
  app_tag: { en: "Enterprise Edition · Qatar & GCC", bn: "এন্টারপ্রাইজ সংস্করণ · কাতার ও জিসিসি" },
  search: { en: "Search modules, students, staff…", bn: "মডিউল, শিক্ষার্থী, স্টাফ খুঁজুন…" },
  quick_actions: { en: "Quick Actions", bn: "দ্রুত অ্যাকশন" },
  today: { en: "Today", bn: "আজ" },
  overview: { en: "Overview", bn: "সারসংক্ষেপ" },
  coming_soon: { en: "Coming soon", bn: "শীঘ্রই আসছে" },
  module: { en: "Module", bn: "মডিউল" },
  features: { en: "Features", bn: "ফিচারসমূহ" },
  configure: { en: "Configure", bn: "কনফিগার করুন" },
  view_all: { en: "View all", bn: "সব দেখুন" },
  total_students: { en: "Total Students", bn: "মোট শিক্ষার্থী" },
  total_teachers: { en: "Total Teachers", bn: "মোট শিক্ষক" },
  total_staff: { en: "Total Staff", bn: "মোট স্টাফ" },
  active_classes: { en: "Active Classes", bn: "সক্রিয় ক্লাস" },
  attendance_today: { en: "Today's Attendance", bn: "আজকের উপস্থিতি" },
  new_admissions: { en: "New Admissions", bn: "নতুন ভর্তি" },
  pending_fees: { en: "Pending Fees", bn: "বকেয়া ফি" },
  today_revenue: { en: "Today's Revenue", bn: "আজকের আয়" },
  monthly_income: { en: "Monthly Income", bn: "মাসিক আয়" },
  expenses: { en: "Expenses", bn: "ব্যয়" },
  profit: { en: "Profit", bn: "লাভ" },
  notifications: { en: "Notifications", bn: "নোটিফিকেশন" },
  upcoming_exams: { en: "Upcoming Exams", bn: "আসন্ন পরীক্ষা" },
  bus_status: { en: "School Bus Status", bn: "স্কুল বাস স্ট্যাটাস" },
  doc_expiry: { en: "Document Expiry", bn: "ডকুমেন্ট মেয়াদ" },
  birthdays: { en: "Birthday Alerts", bn: "জন্মদিন" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict | string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("app.lang")) as Lang | null;
    if (saved === "en" || saved === "bn") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("app.lang", l);
  };

  const t = (key: string) => {
    const entry = dict[key as keyof typeof dict];
    if (!entry) return key;
    return entry[lang];
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function bi(en: string, bn: string) {
  return { en, bn };
}
