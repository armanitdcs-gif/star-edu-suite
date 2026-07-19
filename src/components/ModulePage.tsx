import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import type { ModuleDef } from "@/lib/modules";

export function ModulePage({ module: m }: { module: ModuleDef }) {
  const { lang, t } = useI18n();
  const Icon = m.icon;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Link to="/" className="hover:text-foreground">{lang === "en" ? "Dashboard" : "ড্যাশবোর্ড"}</Link>
        <span>/</span>
        <span className="text-foreground">{t("module")} {String(m.no).padStart(2, "0")}</span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elegant md:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary-glow/25 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-gold text-gold-foreground shadow-gold">
              <Icon className="h-8 w-8" strokeWidth={2.2} />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-gold/20 text-gold hover:bg-gold/25 border-gold/30">
                  Module {String(m.no).padStart(2, "0")}
                </Badge>
                <Badge variant="outline" className="border-white/25 text-primary-foreground/80">
                  {t("coming_soon")}
                </Badge>
              </div>
              <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
                {m.title[lang]}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/75 md:text-base">
                {m.desc[lang]}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="gap-2 bg-white/10 text-primary-foreground hover:bg-white/15 backdrop-blur">
              <Settings2 className="h-4 w-4" />
              {t("configure")}
            </Button>
            <Button className="gap-2 bg-gold text-gold-foreground hover:bg-gold/90 shadow-gold">
              <Sparkles className="h-4 w-4" />
              {lang === "en" ? "Enable" : "চালু করুন"}
            </Button>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">{t("features")}</h2>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {m.features.length} {lang === "en" ? "capabilities" : "ফিচার"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {m.features.map((f) => (
            <Card
              key={f}
              className="group flex items-center gap-3 p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-elegant"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-gold/15 group-hover:text-gold">
                <Check className="h-4 w-4" strokeWidth={2.6} />
              </div>
              <span className="text-sm font-medium text-foreground">{f}</span>
            </Card>
          ))}
        </div>
      </div>

      <Card className="flex flex-col items-start gap-4 border-dashed p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-base font-semibold">
            {lang === "en" ? "Ready to build this module?" : "এই মডিউল তৈরির জন্য প্রস্তুত?"}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "en"
              ? "This is a placeholder. Ask us to implement full workflows, database, and permissions for this module."
              : "এটি একটি প্লেসহোল্ডার। এই মডিউলের সম্পূর্ণ ওয়ার্কফ্লো, ডেটাবেস ও পারমিশন তৈরির জন্য আমাদের বলুন।"}
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            {lang === "en" ? "Back to Dashboard" : "ড্যাশবোর্ডে ফিরুন"}
          </Link>
        </Button>
      </Card>
    </div>
  );
}
