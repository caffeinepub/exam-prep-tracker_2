import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
  ocid: string;
  activeClass: string;
  hoverClass: string;
  dotClass: string;
  iconBg: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
    activeClass: "bg-violet-500/15 text-violet-300",
    hoverClass: "hover:bg-violet-500/10 hover:text-violet-300",
    dotClass: "bg-violet-400",
    iconBg: "text-violet-400",
  },
  {
    id: "subjects",
    label: "Subjects & Topics",
    icon: BookOpen,
    ocid: "nav.subjects.link",
    activeClass: "bg-sky-500/15 text-sky-300",
    hoverClass: "hover:bg-sky-500/10 hover:text-sky-300",
    dotClass: "bg-sky-400",
    iconBg: "text-sky-400",
  },
  {
    id: "studylog",
    label: "Study Log",
    icon: ClipboardList,
    ocid: "nav.studylog.link",
    activeClass: "bg-emerald-500/15 text-emerald-300",
    hoverClass: "hover:bg-emerald-500/10 hover:text-emerald-300",
    dotClass: "bg-emerald-400",
    iconBg: "text-emerald-400",
  },
  {
    id: "mocktests",
    label: "Mock Tests",
    icon: Trophy,
    ocid: "nav.mocktests.link",
    activeClass: "bg-amber-500/15 text-amber-300",
    hoverClass: "hover:bg-amber-500/10 hover:text-amber-300",
    dotClass: "bg-amber-400",
    iconBg: "text-amber-400",
  },
];

interface LayoutProps {
  page: Page;
  setPage: (p: Page) => void;
  children: React.ReactNode;
}

export default function Layout({ page, setPage, children }: LayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal ? `${principal.slice(0, 10)}...` : "";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background:
            "linear-gradient(170deg, oklch(0.19 0.09 272) 0%, oklch(0.15 0.07 265) 60%, oklch(0.13 0.05 255) 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.22 55) 0%, oklch(0.68 0.2 30) 100%)",
            }}
          >
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-none tracking-tight">
              ExamPrep
            </div>
            <div className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">
              Exam Tracker
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={item.ocid}
                onClick={() => {
                  setPage(item.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? item.activeClass
                    : cn("text-white/50", item.hoverClass),
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors",
                    active ? item.iconBg : "text-white/40",
                  )}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {active && (
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      item.dotClass,
                    )}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-1.5 mb-1">
            <p className="text-[11px] text-white/30 truncate">
              {shortPrincipal}
            </p>
          </div>
          <button
            type="button"
            data-ocid="nav.logout.button"
            onClick={clear}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-150"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display font-bold text-foreground">
            ExamPrep
          </span>
          {mobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>

        <footer className="px-6 py-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
