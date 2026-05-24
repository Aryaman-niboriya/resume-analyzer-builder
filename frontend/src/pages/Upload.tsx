import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { UploadCloud, File, X, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// We'll use a local mock simulation here as requested before moving to the real report page, 
// to instantly show the AI SaaS simulation feel. We'll pass the state around or use a central store later.
// For now, let's keep the useUpload hook but change its routing destination to the new report page.
import { useUpload } from "@/hooks/use-upload";

export default function Upload() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, progress, uploadResume } = useUpload();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    
    // Using the real API we set up in the backend
    uploadResume(file, jobDesc, (data) => {
      // Pass the response data to the analysis report page state
      console.log('Live AI Analysis Done:', data);
      
      // Since wouter doesn't have built-in strict state passing in setLocation,
      // we can use sessionStorage for a quick handoff of this massive JSON object.
      sessionStorage.setItem('latest_analysis_report', JSON.stringify(data));
      
      setLocation("/analysis-report");
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground sm:text-4xl">New Analysis</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Upload your resume and the job description to get started with the AI evaluation.
          </p>
        </div>

        {/* Side-by-side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT SECTION: Resume Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground/90">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs border border-primary/20">1</span>
              Upload Resume
            </h3>
            
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`
                relative w-full min-h-[220px] h-[240px] sm:min-h-[280px] sm:h-[320px] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group overflow-hidden
                ${file ? 'border-primary/50 bg-primary/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]' : 'border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-primary/40 hover:bg-white/[0.04]'}
              `}
            >
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center z-10"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                      <UploadCloud className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-lg font-medium mb-2 text-foreground/80">Drag & Drop your Resume</p>
                    <p className="text-sm text-muted-foreground mb-6">Supports PDF or DOCX</p>
                    <Button 
                      variant="secondary" 
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full px-8 bg-white/10 hover:bg-white/20 text-foreground transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                      Select File
                    </Button>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.docx" 
                      onChange={(e) => e.target.files && setFile(e.target.files[0])} 
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="filled"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center w-full z-10"
                  >
                    <div className="w-24 h-32 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center mb-6 relative shadow-2xl group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-shadow">
                      <File className="w-10 h-10 text-primary" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-destructive hover:scale-110 transition-all border border-white/10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-base font-medium truncate max-w-[80%] px-4 text-foreground">{file.name}</p>
                    <p className="text-sm text-primary mt-2 flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      <Sparkles className="w-4 h-4" /> Ready for AI Analysis
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Decorative background circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
            </div>
          </div>

          {/* RIGHT SECTION: Job Description */}
          <div className="space-y-4 flex flex-col">
            <h3 className="font-semibold text-lg flex items-center justify-between text-foreground/90">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs border border-primary/20">2</span>
                Job Description
              </div>
              <span className={`text-xs font-normal ${jobDesc.length > 5000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {jobDesc.length} / 5000 chars
              </span>
            </h3>
            
            <div className="relative flex-1 flex flex-col">
              <Textarea 
                placeholder="Paste the job description here (responsibilities, requirements, technical skills, etc)..."
                className="flex-1 min-h-[220px] h-[240px] sm:min-h-[280px] sm:h-[320px] resize-none bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-[2rem] p-4 sm:p-6 text-sm sm:text-base leading-relaxed focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300 shadow-inner"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                maxLength={5000}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Action Bar */}
        <div className="relative mt-12 overflow-hidden">
          {/* Glassmorphic Action Card */}
          <div className="glass flex flex-col sm:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-[2rem] border border-white/10 relative z-10">
            
            <div className="flex-1 w-full max-w-lg">
              {isUploading ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-medium flex items-center gap-2">
                      <Wand2 className="w-4 h-4 animate-spin-slow" /> 
                      AI is parsing and evaluating the resume...
                    </span>
                    <span className="font-mono text-primary w-12 text-right">{progress}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <p>Our AI will compare your experience, skills, and keywords directly against the job requirements.</p>
                </div>
              )}
            </div>

            <Button 
              size="lg" 
              className={`
                group rounded-full px-8 h-14 w-full sm:w-auto text-base font-semibold transition-all duration-300 
                ${(!file || isUploading) 
                  ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground' 
                  : 'bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 text-white border border-white/20'
                }
              `}
              disabled={!file || isUploading}
              onClick={handleAnalyze}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  Analyzing <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>...</motion.span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Generate Analysis Report <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </span>
              )}
            </Button>
          </div>
          
          {/* Subtle background glow for the bottom card */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent blur-3xl -z-10" />
        </div>

      </div>
    </DashboardLayout>
  );
}
