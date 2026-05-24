import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Upload, Users, Briefcase, Send, Award, FileText, ChevronRight, XCircle, Sparkles } from "lucide-react";

export default function HrMode() {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setCandidates([]);
    setInsights(null);
  }

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({ title: "Error", description: "Please enter a Job Description.", variant: "destructive" });
      return;
    }
    if (files.length === 0) {
      toast({ title: "Error", description: "Please select candidate resumes.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    files.forEach(file => formData.append("files", file));

    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(apiUrl("/api/hr_mode/analyze_batch"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze candidates.");

      setCandidates(data.candidates || []);
      setInsights(data.poolInsights || null);
      
      toast({ title: "Analysis Complete", description: `Ranked ${data.candidates?.length} candidates successfully.`, variant: "default" });
    } catch (err: any) {
      toast({ title: "Processing Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const triggerN8nAutomation = async (candidate: any) => {
    try {
      const n8nWebhook = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (!n8nWebhook) {
        toast({ 
          title: "n8n Triggered", 
          description: `Simulated: Sent interview invite draft task to n8n AI Agent for ${candidate.name}. Configure .env to fire real requests.`,
        });
        return;
      }
      
      await fetch(n8nWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "draft_interview_invite", candidateName: candidate.name, candidateEmail: candidate.email, score: candidate.score, matchReason: candidate.verdict })
      });
      toast({ title: "Success", description: "n8n Workflow triggered successfully!" });
    } catch {
      toast({ title: "Error", description: "Failed to reach n8n webhook.", variant: "destructive" });
    }
  };

  const formatRadarData = (metrics: any) => {
    if (!metrics) return [];
    return Object.keys(metrics).map(key => ({
      subject: key,
      A: metrics[key],
      fullMark: 10,
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 py-6 text-white sm:space-y-12 sm:py-10 min-h-0 sm:min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background rounded-3xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-2">
          <Sparkles className="w-4 h-4" /> Enterprise Beta
        </div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 sm:text-4xl md:text-5xl">
          Smart HR Dashboard
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-2">
          Instantly evaluate bulk applicants. Upload resumes, benchmark against your requirements, and let AI build the ultimate candidate leaderboard.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 w-full max-w-7xl mx-auto">
        <Card className="glass-card shadow-2xl shadow-blue-900/5 hover:border-blue-500/30 transition-all duration-300 flex flex-col min-h-[280px] h-auto sm:min-h-[350px]">
          <CardHeader className="pb-4 shrink-0">
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Briefcase className="w-6 h-6 text-blue-400" /></div>
              Target Requisition
            </CardTitle>
            <CardDescription className="text-sm pt-1 text-gray-400">Core Job Description & Requirements.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-6 w-full h-full flex flex-col">
            <Textarea 
              placeholder="e.g., We are looking for a highly skilled React Developer with experience in NextJS..." 
              className="flex-1 w-full h-full min-h-0 resize-none bg-black/20 border-white/5 focus-visible:ring-blue-500/50 text-white rounded-xl text-base p-4 custom-scrollbar"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card className="glass-card shadow-2xl shadow-purple-900/5 hover:border-purple-500/30 transition-all duration-300 flex flex-col min-h-[280px] h-auto sm:min-h-[350px]">
          <CardHeader className="pb-4 shrink-0">
            <CardTitle className="flex flex-col gap-3 text-xl font-semibold w-full sm:flex-row sm:items-center sm:justify-between sm:text-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg"><Upload className="w-6 h-6 text-purple-400" /></div>
                Bulk Upload Pool
              </div>
              {files.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFiles} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                  <XCircle className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-sm pt-1 text-gray-400">Drag and drop applicant PDF resumes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-end w-full pb-6">
            <div className="flex-1 border-[2px] border-dashed border-white/10 rounded-2xl p-6 text-center bg-black/10 flex flex-col items-center justify-center relative hover:bg-white/5 hover:border-white/20 transition-all group overflow-hidden">
               <input 
                 type="file" multiple accept=".pdf"
                 onChange={handleFileChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <FileText className="w-10 h-10 text-gray-500 group-hover:text-purple-400 transition-colors mb-2 group-hover:scale-110 duration-500" />
               <p className="text-lg font-bold text-gray-200">{files.length > 0 ? `${files.length} Candidates Loaded` : "Upload Candidate PDFs"}</p>
               <p className="text-xs text-gray-400 mt-1 font-medium">Click to append to your pool</p>
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={loading || files.length === 0 || !jobDescription.trim()} 
              className="w-full h-14 shrink-0 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] border-0 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin shadow-[0_0_15px_rgba(255,255,255,0.8)]" /> 
                  Scanning Architectures...
                </span>
              ) : (
                <span className="flex items-center gap-2">Execute Predictive Analysis <ChevronRight className="w-5 h-5" /></span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {insights && insights.commonMissingSkills && insights.commonMissingSkills.length > 0 && (
         <div className="w-full max-w-7xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 shadow-lg shadow-orange-500/5 animate-in slide-in-from-left-4 duration-700">
           <h3 className="font-bold text-orange-400 mb-2 flex items-center gap-2 text-lg"><AlertCircleIcon /> Corporate Skill-Gap Insight</h3>
           <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
             We detected a localized market trend: <span className="font-bold bg-orange-500/20 px-3 py-1 rounded border border-orange-500/30 text-orange-300 mx-1">{insights.commonMissingSkills.join(", ")}</span> are missing across your candidate pool. 
             If these are mandatory, consider extending your search parameters.
           </p>
         </div>
      )}

      {/* AI Leaderboard Output */}
      {candidates.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 mt-12 relative w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-extrabold text-white">The Leaderboard</h2>
            <div className="h-px bg-gradient-to-r from-white/20 to-transparent flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {candidates.map((c, index) => {
              const radarData = formatRadarData(c.metrics);
              const isTopPick = index === 0;

              return (
                <Card key={index} className={`glass-card overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl flex flex-col ${isTopPick ? 'ring-2 ring-cyan-500/50 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'border-white/5 bg-white/[0.02]'}`}>
                  {isTopPick && (
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />
                  )}
                  
                  <CardHeader className="pb-4 border-b border-white/5 px-6 pt-6 relative">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-1">
                          {isTopPick ? <span className="text-cyan-400 flex items-center gap-1"><Award className="w-4 h-4" /> Top Match</span> : <span className="text-gray-500">Rank #{index + 1}</span>}
                        </div>
                        <CardTitle className="text-2xl font-bold truncate pr-4 text-gray-100" title={c.name}>{c.name || "Unknown Applicant"}</CardTitle>
                        <p className="text-xs font-medium text-gray-500 truncate">{c.filename}</p>
                      </div>
                      <div className="flex flex-col items-center bg-black/40 px-4 py-3 rounded-xl border border-white/5 shadow-inner">
                        <div className={`text-3xl font-black font-display tracking-tighter ${c.score > 80 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : c.score > 60 ? 'text-amber-400' : 'text-red-400'}`}>
                          {c.score}
                        </div>
                        <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">ATS Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6 px-6 space-y-6 flex-1 flex flex-col justify-between">
                    
                    <div className="space-y-6">
                      {/* Interactive Radar Chart */}
                      {radarData.length > 0 && (
                        <div className="h-[220px] w-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                              <PolarGrid stroke="rgba(255,255,255,0.05)" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 10]} content={(props: any) => <g />} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                              <Radar name="Candidate" dataKey="A" stroke={isTopPick ? "#38bdf8" : "#8b5cf6"} strokeWidth={2} fill={isTopPick ? "#38bdf8" : "#8b5cf6"} fillOpacity={0.25} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      <div>
                        <h4 className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-widest border-b border-white/5 pb-1">AI Verdict Analysis</h4>
                        <p className="text-sm text-gray-300 leading-snug font-medium italic">"{c.verdict}"</p>
                      </div>

                      {c.missingSkills && c.missingSkills.length > 0 && (
                        <div>
                          <h4 className="text-[10px] text-red-500/80 font-bold mb-2 uppercase tracking-widest">Crucial Deficiencies</h4>
                          <div className="flex flex-wrap gap-2">
                            {c.missingSkills.map((skill: string, i: number) => (
                              <span key={i} className="text-xs bg-red-500/10 text-red-400 px-2.5 py-1 rounded-md border border-red-500/20 font-semibold">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => triggerN8nAutomation(c)} 
                      variant={isTopPick ? "default" : "secondary"} 
                      className={`w-full gap-2 h-12 font-bold transition-all ${isTopPick ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                    >
                      <Send className="w-4 h-4" /> n8n Execute Auto-Invite
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}

// Quick inline icon component to avoid missing import errors
function AlertCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle w-5 h-5">
      <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
  );
}
