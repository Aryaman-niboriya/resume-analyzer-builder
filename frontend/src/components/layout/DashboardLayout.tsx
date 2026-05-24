import { ReactNode, useState } from "react";
import { Link } from "wouter";
import { BrainCircuit, Menu } from "lucide-react";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 md:flex">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-background/80 px-4 backdrop-blur-xl md:hidden dark:border-white/5">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-foreground/5 transition-colors hover:bg-foreground/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw-2rem,280px)] gap-0 border-r border-black/5 bg-card/95 p-0 dark:border-white/5">
              <SidebarContent onNavigate={() => setMobileNavOpen(false)} className="h-full" />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <BrainCircuit className="h-6 w-6 shrink-0 text-primary" />
            <span className="truncate font-display text-lg font-bold tracking-tight">
              Resume<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="w-10" aria-hidden="true" />
        </header>

        <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-background/50">
          <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[400px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          
          <div className="relative z-10 mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
