import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MOCK_INTERVIEW_QUESTIONS } from "@/hooks/use-mock-data";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Interview() {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Interview Prep</h1>
            <p className="text-muted-foreground mt-2">Questions tailored to your resume and the job description.</p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            {isGenerating ? "Thinking..." : <><Sparkles className="w-4 h-4 mr-2" /> Generate More</>}
          </Button>
        </div>

        <div className="space-y-4">
          {MOCK_INTERVIEW_QUESTIONS.map((q) => (
            <motion.div 
              key={q.id}
              layout
              className="glass-card rounded-3xl border border-white/10 overflow-hidden"
            >
              <button 
                className="w-full p-6 text-left flex items-start gap-4 hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-primary/20 text-primary uppercase tracking-wider">
                      {q.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium pr-8">{q.question}</h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${expandedId === q.id ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {expandedId === q.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0">
                      <div className="p-4 rounded-2xl bg-black/30 border border-white/5 relative group">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          <strong className="text-foreground">AI Hint:</strong> {q.hint}
                        </p>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(q.question, q.id)}
                        >
                          {copiedId === q.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
