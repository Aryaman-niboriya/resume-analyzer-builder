import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  ScanSearch, 
  Target, 
  MessageSquare, 
  FileText, 
  Users,
  LogOut,
  BrainCircuit,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, logout, User } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/upload", label: "Resume Analyzer", icon: ScanSearch },
  { href: "/skill-gap", label: "Skill Gap Analysis", icon: Target },
  { href: "/interview", label: "Interview Prep", icon: MessageSquare },
  { href: "/resume-builder", label: "Resume Builder", icon: FileText },
  { href: "/hr-mode", label: "HR Mode", icon: Users },
  { href: "/profile", label: "My Profile", icon: UserIcon },
];

type SidebarContentProps = {
  onNavigate?: () => void;
  className?: string;
};

export function SidebarContent({ onNavigate, className }: SidebarContentProps) {
  const [location] = useLocation();
  const [user, setUserData] = useState<User | null>(null);

  useEffect(() => {
    setUserData(getUser());
  }, [location]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex h-16 shrink-0 items-center border-b border-black/5 px-6 dark:border-white/5">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold tracking-tight">
            Resume<span className="text-primary">AI</span>
          </span>
        </Link>
      </div>
      
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5 md:hover:translate-x-1"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-black/5 p-4 dark:border-white/5">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="group flex cursor-pointer items-center gap-3 rounded-xl border border-black/5 bg-foreground/5 px-3 py-2 text-left transition-colors hover:bg-foreground/10 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">{user?.name || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
          </div>
        </Link>
        <div className="mt-4 flex flex-col gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              logout();
            }}
            className="group flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5 transition-colors group-hover:text-destructive" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-64 shrink-0 flex-col border-r border-black/5 bg-card/50 backdrop-blur-xl dark:border-white/5 md:flex">
      <SidebarContent />
    </aside>
  );
}
