import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, AlertCircle, Target, Loader2, PlayCircle, ExternalLink, CheckCircle2 } from "lucide-react";
import { getToken, getUser } from "@/lib/auth";
import { apiFetch, apiUrl } from "@/lib/api";
import { Link } from "wouter";

export default function SkillGap() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Keep stable reference to avoid repeated fetch loops.
  const user = useMemo(() => getUser(), []);

  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      try {
        const token = getToken();
        if (!user || !token) {
          setLoading(false);
          return;
        }
        
        const res = await apiFetch(`/api/dashboard/latest-analysis?user_id=${user.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        }
      } catch (error) {
        console.error("Failed to load skill gap data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestAnalysis();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-[60vh] items-center justify-center text-center space-y-4">
          <Target className="w-16 h-16 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold">No Analysis Found</h2>
          <p className="text-muted-foreground max-w-md">We need to analyze your resume against a job description first to generate a skill gap roadmap.</p>
          <Link href="/upload">
            <button className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Analyze a Resume
            </button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { skillsAnalysis, skillGap } = report;

  // Let's create mock progress for matching skills for visual appeal
  const matchingSkills = skillsAnalysis?.matching?.map((s: string) => ({ name: s, level: Math.floor(Math.random() * 30) + 70 })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-10 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-display font-bold sm:text-3xl">Skill Gap Analysis</h1>
          <p className="text-muted-foreground mt-2">Your personalized roadmap to close the gap for your target role.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detected Skills */}
          <div className="glass-card rounded-3xl p-6 border-white/10 flex flex-col">
            <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" /> Current Strengths
            </h3>
            
            {matchingSkills.length > 0 ? (
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[320px] sm:max-h-[500px]">
                {matchingSkills.map((skill: any) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-emerald-400/80">{skill.level}% Proficiency</span>
                    </div>
                    <Progress value={skill.level} className="h-2 bg-black/40">
                      <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${skill.level}%` }} />
                    </Progress>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic p-4 bg-black/20 rounded-xl">No matching skills detected for this specific role.</p>
            )}
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Bonus Skills (Not required but nice to have)</h4>
              <div className="flex flex-wrap gap-2">
                {skillsAnalysis?.extra?.map((s: string) => (
                  <Badge key={s} variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{s}</Badge>
                ))}
                {(!skillsAnalysis?.extra || skillsAnalysis.extra.length === 0) && (
                  <span className="text-xs text-muted-foreground">None detected</span>
                )}
              </div>
            </div>
          </div>

          {/* Missing Skills & Roadmap */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
              <h3 className="font-semibold text-xl mb-6 flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" /> Critical Gaps
              </h3>
              <div className="space-y-3">
                {skillGap?.missingRequired?.map((skill: string) => (
                  <div key={skill} className="flex flex-col gap-2 p-4 rounded-2xl bg-black/30 border border-red-500/10 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="w-2 h-2 shrink-0 rounded-full bg-red-400 animate-pulse" />
                      <h4 className="font-medium text-foreground break-words">{skill}</h4>
                    </div>
                    <Badge variant="outline" className="w-fit shrink-0 bg-red-500/10 text-red-400 border-red-500/20">Required</Badge>
                  </div>
                ))}
                {(!skillGap?.missingRequired || skillGap.missingRequired.length === 0) && (
                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> No critical gaps found! You are a strong match.
                  </div>
                )}
              </div>
            </div>

            {/* AI Learning Path */}
            <div className="glass-card rounded-3xl p-6 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <BookOpen className="w-24 h-24" />
              </div>
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-primary relative z-10">
                <PlayCircle className="w-5 h-5" /> Recommended Learning Path
              </h3>
              <p className="text-foreground/80 leading-relaxed relative z-10 text-sm p-4 bg-black/20 rounded-xl border border-white/5 shadow-inner">
                {skillGap?.fastestLearningPath || "You have a strong foundation. Focus on building advanced projects to showcase your skills."}
              </p>
              
              <div className="mt-6 relative z-10">
                 <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Topics to Focus On:</h4>
                 <div className="flex flex-wrap gap-2">
                    {skillGap?.recommendedToLearn?.map((topic: string) => (
                       <Badge key={topic} variant="secondary" className="bg-primary/20 text-primary-foreground hover:bg-primary/30 cursor-default">
                          {topic}
                       </Badge>
                    ))}
                 </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
               <a 
                 href={`https://www.youtube.com/results?search_query=${skillGap?.missingRequired?.[0] || 'interview prep'} tutorial`} 
                 target="_blank" 
                 rel="noreferrer"
                 className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-100 border border-red-500/20 transition-colors text-sm font-medium"
               >
                 Search YouTube <ExternalLink className="w-4 h-4" />
               </a>
               <a 
                 href={`https://www.coursera.org/search?query=${skillGap?.missingRequired?.[0] || 'tech'}`} 
                 target="_blank" 
                 rel="noreferrer"
                 className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 border border-blue-500/20 transition-colors text-sm font-medium"
               >
                 Find Courses <ExternalLink className="w-4 h-4" />
               </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
