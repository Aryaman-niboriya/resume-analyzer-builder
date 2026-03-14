import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileUp, 
  Target, 
  MessageSquare, 
  FileText, 
  Users,
  LogOut,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_USER } from "@/hooks/use-mock-data";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Resume", icon: FileUp },
  { href: "/skill-gap", label: "Skill Gap", icon: Target },
  { href: "/interview", label: "Interview Prep", icon: MessageSquare },
  { href: "/resume-builder", label: "Resume Builder", icon: FileText },
  { href: "/hr-mode", label: "HR Mode", icon: Users },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card/50 backdrop-blur-xl border-r border-white/5 flex-shrink-0 flex flex-col sticky top-0 md:h-screen">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl tracking-tight">
              Resume<span className="text-primary">AI</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
            <img src={MOCK_USER.avatar} alt="User" className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{MOCK_USER.name}</p>
              <p className="text-xs text-muted-foreground truncate">{MOCK_USER.email}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group">
            <LogOut className="w-5 h-5 group-hover:text-destructive" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background/50 relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-6xl mx-auto p-4 md:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
