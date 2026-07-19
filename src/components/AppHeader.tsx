import { Bell, Search, Globe } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";

export function AppHeader() {
  const { lang, setLang, t } = useI18n();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md">
      <SidebarTrigger className="text-foreground" />

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("search")}
          className="h-9 bg-muted/50 pl-9 focus-visible:ring-primary/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
          className="gap-1.5 font-medium"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">{lang === "en" ? "EN" : "বাং"}</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
        </Button>

        <div className="ml-1 flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 shadow-card">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
              AH
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left text-xs leading-tight sm:block">
            <div className="font-semibold text-foreground">Ahmed Hassan</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Super Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
