import { useState } from "react";
import { useLocation } from "wouter";
import { UploadCloud, File, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMockUpload } from "@/hooks/use-mock-data";

export default function Upload() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const { isUploading, progress, simulateUpload } = useMockUpload();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    simulateUpload(() => {
      setLocation("/dashboard");
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">New Analysis</h1>
          <p className="text-muted-foreground mt-2">Upload your resume and the job description to get started.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Zone */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">1</span>
              Upload Resume
            </h3>
            
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`
                relative w-full h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300
                ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-black/20 hover:border-primary/30 hover:bg-black/30'}
              `}
            >
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium mb-1">Drag & drop your PDF</p>
                    <p className="text-xs text-muted-foreground mb-4">or click to browse files</p>
                    <Button variant="secondary" size="sm" className="rounded-full" onClick={() => document.getElementById('file-upload')?.click()}>
                      Select File
                    </Button>
                    <input id="file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="filled"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-4 relative">
                      <File className="w-8 h-8" />
                      <button 
                        onClick={() => setFile(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-medium truncate max-w-full px-4">{file.name}</p>
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Ready for analysis
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-4 flex flex-col">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">2</span>
              Job Description
            </h3>
            
            <Textarea 
              placeholder="Paste the job description here..."
              className="flex-1 min-h-[16rem] resize-none bg-black/20 border-white/10 rounded-3xl p-6 focus-visible:ring-primary/50"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div className="flex-1 w-full">
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" /> 
                    Analyzing with AI...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <Button 
            size="lg" 
            className="rounded-full px-8 h-14 min-w-[200px] shadow-[0_0_20px_rgba(99,102,241,0.3)] w-full sm:w-auto"
            disabled={!file || isUploading}
            onClick={handleAnalyze}
          >
            {isUploading ? "Processing..." : "Generate Report"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
