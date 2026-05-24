import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MOCK_ANALYSIS_REPORT as fallback_report } from "@/hooks/mock-analysis";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { 
  CheckCircle2, XCircle, AlertCircle, Briefcase, GraduationCap, 
  Mail, User, Star, ArrowRight, BookOpen, Lightbulb, Check, Target, MessageSquare,
  Loader2, Download
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

// Helper for Circular Progress
const CircularProgress = ({ value, label, size = 120, strokeWidth = 8 }: { value: number, label: string, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle 
          cx={size / 2} cy={size / 2} r={radius} 
          stroke="currentColor" strokeWidth={strokeWidth} 
          fill="transparent" className="text-white/10" 
        />
        <circle 
          cx={size / 2} cy={size / 2} r={radius} 
          stroke="url(#gradient)" strokeWidth={strokeWidth} 
          fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out" strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{value}%</span>
      </div>
      <span className="mt-4 text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

export default function AnalysisReport() {
  const [report, setReport] = useState(fallback_report);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Attempt to load live data from sessionStorage
    const liveDataStr = sessionStorage.getItem('latest_analysis_report');
    if (liveDataStr) {
      try {
        const liveData = JSON.parse(liveDataStr);
        setReport(liveData);
      } catch (e) {
        console.error("Failed to parse live report data, falling back to mock.", e);
      }
    }
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const handleDownloadPDF = async () => {
    if (!reportRef.current || isGenerating) return;
    
    setIsGenerating(true);
    toast({
      title: "Generating PDF",
      description: "Working on your high-quality report...",
    });

    try {
      // html-to-image is much better with modern CSS (oklab, oklch)
      const dataUrl = await toPng(reportRef.current, {
        quality: 0.95,
        backgroundColor: "#030014",
        cacheBust: true,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const ratio = img.width / pdfWidth;
      const imgHeight = img.height / ratio;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add more pages if content is taller than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      const safeName = report.extractedData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`AI_Resume_Report_${safeName || 'user'}.pdf`);
      
      toast({
        title: "Success!",
        description: "Full multi-page report downloaded.",
      });
    } catch (error: any) {
      console.error("Capture Error:", error);
      toast({
        title: "Download Failed",
        description: "Browser blocked rendering. Please refresh and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const breakdownData = [
    { name: 'Skills', score: report.scoreBreakdown.skillsMatch },
    { name: 'Keywords', score: report.scoreBreakdown.keywordMatch },
    { name: 'Experience', score: report.scoreBreakdown.experienceRelevance },
    { name: 'ATS', score: report.scoreBreakdown.atsCompatibility },
  ];

  const pieData = [
    { name: 'Matching', value: report.skillsAnalysis.matching.length, color: '#4ade80' },
    { name: 'Missing', value: report.skillsAnalysis.missing.length, color: '#f87171' },
    { name: 'Extra', value: report.skillsAnalysis.extra.length, color: '#60a5fa' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        <div ref={reportRef} className="space-y-8 p-4">
          {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground sm:text-4xl">AI Analysis Dashboard</h1>
            <p className="text-muted-foreground text-base sm:text-lg mt-2">Comprehensive AI evaluation of your resume against the job description.</p>
          </div>
          <div className="glass px-6 py-3 rounded-full flex items-center gap-3 border-primary/20">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-semibold">Match Score: {report.overallScore}/100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Section 1: Overall Score & Section 2: Extracted Data */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center border-white/10 text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px]" />
              <h3 className="text-lg font-semibold mb-6 w-full text-left">Overall Match</h3>
              <CircularProgress value={report.overallScore} label="Resume Score" size={160} strokeWidth={12} />
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-white/10 space-y-4">
              <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Profile Extracted</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-3 text-foreground/80"><User className="w-4 h-4 text-primary" /> {report.extractedData.name}</p>
                <p className="flex items-center gap-3 text-foreground/80"><Mail className="w-4 h-4 text-primary" /> {report.extractedData.email}</p>
                <p className="flex items-center gap-3 text-foreground/80"><GraduationCap className="w-4 h-4 text-primary" /> {report.extractedData.education}</p>
                <p className="flex items-center gap-3 text-foreground/80"><Briefcase className="w-4 h-4 text-primary" /> {report.extractedData.experienceYears} Years Experience</p>
              </div>
              <div className="pt-4 flex flex-wrap gap-2">
                {report.extractedData.allSkills.slice(0, 5).map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-muted-foreground border border-white/10">{skill}</span>
                ))}
                <span className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-muted-foreground">+{report.extractedData.allSkills.length - 5} more</span>
              </div>
            </div>
          </div>

          {/* Core Analytics Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 3: Skills Match */}
            <div className="glass-card p-6 rounded-[2rem] border-white/10">
              <h3 className="text-lg font-semibold border-b border-white/10 pb-4 mb-4">Skills Match Analysis</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Matching Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.skillsAnalysis.matching.map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-sm">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-red-400 mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> Missing Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.skillsAnalysis.missing.map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-blue-400 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Extra Skills (Bonus)</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.skillsAnalysis.extra.map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 & 5: Keywords & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-[2rem] border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                <h3 className="text-lg font-semibold mb-2">Keyword Coverage</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-bold text-primary">{report.keywordCoverage.percentage}%</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${report.keywordCoverage.percentage}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Missing: {report.keywordCoverage.missing.slice(0, 2).join(", ")}...</p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-[2rem] border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                <h3 className="text-lg font-semibold mb-2">Experience Match</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-bold text-purple-400">{report.experienceAnalysis.score}%</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                  {report.experienceAnalysis.summary}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section 6: ATS Compatibility */}
          <div className="glass-card p-6 rounded-[2rem] border-white/10">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-semibold">ATS Compatibility</h3>
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-bold">{report.atsCompatibility.score} / 100</span>
            </div>
            <div className="space-y-3">
              {report.atsCompatibility.checks.map((check, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-sm text-foreground/90">{check.name}</span>
                  {check.passed 
                    ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                    : <XCircle className="w-5 h-5 text-red-400" />
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Suggestions */}
          <div className="glass-card p-6 rounded-[2rem] border-primary/20 bg-primary/5">
            <h3 className="text-lg font-semibold border-b border-primary/20 pb-4 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" /> AI Improvement Suggestions
            </h3>
            <div className="space-y-4">
              {report.suggestions.map((sug, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs">{i+1}</div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{sug}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 10: Visual Analytics */}
        <div className="glass-card p-6 rounded-[2rem] border-white/10">
          <h3 className="text-lg font-semibold mb-6">Visual Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[220px] sm:min-h-[280px] md:min-h-[300px]">
            <div className="w-full h-full flex flex-col items-center">
              <h4 className="text-sm text-muted-foreground mb-2">Category Scores</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#818cf8' : '#c084fc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full h-full flex flex-col items-center">
              <h4 className="text-sm text-muted-foreground mb-2">Skills Distribution</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-400" /> Match</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-400" /> Missing</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-400" /> Extra</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 8 & 9: Skill Gap & Interview Questions */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-[2rem] border-red-500/20 bg-red-500/5">
            <h3 className="text-lg font-semibold mb-4 border-b border-red-500/20 pb-4 text-red-400 flex items-center gap-2">
              <Target className="w-5 h-5" /> Skill Gap Analyzer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Critical Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {report.skillGap.missingRequired.map(s => (
                    <span key={s} className="px-3 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/20 text-sm">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm text-blue-400 font-medium mb-3">Recommended to Learn</h4>
                <div className="flex flex-wrap gap-2">
                  {report.skillGap.recommendedToLearn.map(s => (
                    <span key={s} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 text-sm">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5">
              <span className="text-xs font-bold text-primary uppercase">Learning Path:</span>
              <p className="text-sm mt-1 text-muted-foreground">{report.skillGap.fastestLearningPath}</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[2rem] border-white/10">
            <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> AI Interview Prep Generator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {report.interviewQuestions.map((iq, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{iq.category}</span>
                  <p className="text-sm font-medium mt-3 mb-2">{iq.question}</p>
                  <p className="text-xs text-muted-foreground flex gap-2 items-start bg-black/20 p-3 rounded-lg"><Lightbulb className="w-4 h-4 text-yellow-400 shrink-0" /> {iq.hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Refined Final AI Verdict - Premium & Compact */}
          <div className="glass-card p-8 rounded-[2rem] border-primary/30 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                  <Star className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground">Expert AI Analysis</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold tracking-tighter uppercase">Premium</span>
                </div>
                <p className="text-lg text-foreground/80 leading-snug font-medium italic">
                  "{report.finalVerdict}"
                </p>
              </div>
            </div>
            {/* Subtle background decoration */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </div>

        </div>

        {/* Final Verdict Action (Outside ref to avoid being in PDF) */}
        <div className="relative overflow-hidden rounded-[2rem] p-1">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-[2rem] opacity-30 blur-sm" />
          <div className="relative bg-background/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 text-center">
            <h3 className="text-xl font-bold mb-4">Ready to take the next step?</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="rounded-full px-8 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Full PDF Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
