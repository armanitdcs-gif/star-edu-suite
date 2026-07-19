import { Link, useRouterState } from "@tanstack/react-router";
import { Star } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { groups, modulesInGroup } from "@/lib/modules";
import { useI18n } from "@/lib/i18n";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { lang, t } = useI18n();

  const isActive = (to: string) => pathname === to;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-gold shadow-gold">
            <Star className="h-5 w-5" strokeWidth={2.4} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate font-display text-base font-semibold leading-tight text-sidebar-primary">
                {t("app_name")}
              </div>
              <div className="truncate text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                Enterprise · GCC
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard shortcut */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")} tooltip={t("overview")}>
                  <Link to="/">
                    {(() => {
                      const Dash = modulesInGroup("core").find((m) => m.slug === "dashboard")!.icon;
                      return <Dash className="h-4 w-4" />;
                    })()}
                    <span>{lang === "en" ? "Dashboard" : "ড্যাশবোর্ড"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {groups.map((g) => {
          const items = modulesInGroup(g.key).filter((m) => m.slug !== "dashboard");
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={g.key}>
              <SidebarGroupLabel>{lang === "en" ? g.en : g.bn}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((m) => {
                    const to = `/m/${m.slug}`;
                    const Icon = m.icon;
                    return (
                      <SidebarMenuItem key={m.slug}>
                        <SidebarMenuButton asChild isActive={isActive(to)} tooltip={m.title[lang]}>
                          <Link to="/m/$slug" params={{ slug: m.slug }}>
                            <Icon className="h-4 w-4" />
                            <span className="truncate">{m.title[lang]}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2 text-[10px] leading-relaxed text-sidebar-foreground/60">
            © STAR ERP · v1.0 Enterprise
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
