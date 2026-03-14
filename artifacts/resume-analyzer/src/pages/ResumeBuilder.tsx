import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Download, LayoutTemplate } from "lucide-react";

export default function ResumeBuilder() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Resume Builder</h1>
            <p className="text-muted-foreground">Edit content and preview in real-time.</p>
          </div>
          <Button className="rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Editor Panel */}
          <div className="glass-card rounded-3xl p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Personal Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue="Alex Developer" className="bg-black/20 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input defaultValue="Senior Frontend Engineer" className="bg-black/20 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue="alex@example.com" className="bg-black/20 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input defaultValue="+1 (555) 123-4567" className="bg-black/20 border-white/10" />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Summary</h3>
                <Textarea 
                  className="min-h-[100px] resize-none bg-black/20 border-white/10" 
                  defaultValue="Passionate frontend engineer with 5+ years of experience building scalable web applications using React, TypeScript, and modern web technologies."
                />
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Experience</h3>
                <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                  <Input defaultValue="Tech Corp Inc." placeholder="Company" className="bg-transparent border-white/10 font-medium" />
                  <Input defaultValue="Senior Developer" placeholder="Role" className="bg-transparent border-white/10 text-sm" />
                  <Textarea 
                    defaultValue="- Led migration to React 18&#10;- Improved bundle size by 40%&#10;- Mentored 3 junior devs" 
                    className="min-h-[100px] resize-none bg-transparent border-white/10 text-sm" 
                  />
                </div>
                <Button variant="outline" className="w-full border-dashed border-white/20">Add Experience</Button>
              </section>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="hidden lg:flex flex-col bg-muted/30 rounded-3xl overflow-hidden border border-white/5">
            <div className="h-12 bg-black/40 border-b border-white/5 flex items-center justify-between px-4">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4" /> Minimalist Template
              </span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto flex justify-center bg-[#1e293b]">
              {/* Mock PDF Sheet */}
              <div className="w-full max-w-[500px] bg-white text-black p-8 shadow-2xl origin-top" style={{ minHeight: '700px' }}>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Alex Developer</h1>
                <p className="text-sm text-slate-600 mb-4 border-b border-slate-200 pb-4">Senior Frontend Engineer • alex@example.com • +1 (555) 123-4567</p>
                
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider mb-2 mt-6">Summary</h2>
                <p className="text-sm text-slate-700 leading-relaxed">Passionate frontend engineer with 5+ years of experience building scalable web applications using React, TypeScript, and modern web technologies.</p>

                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider mb-2 mt-6">Experience</h2>
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-800">Senior Developer, Tech Corp Inc.</h3>
                    <span className="text-xs text-slate-500">2020 - Present</span>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>Led migration to React 18</li>
                    <li>Improved bundle size by 40%</li>
                    <li>Mentored 3 junior devs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
