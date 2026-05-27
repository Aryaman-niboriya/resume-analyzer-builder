import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Sparkles, Activity, FileText, CheckCircle2, MessageSquare } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getToken, getUser } from "@/lib/auth";
import { apiFetch, apiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // Important: keep user reference stable to avoid refetch loops.
  const user = useMemo(() => getUser(), []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        const userIdParam = user ? `?user_id=${user.id}` : '';
        const res = await apiFetch(`/api/dashboard/stats${userIdParam}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          throw new Error("Failed to load dashboard data");
        }
      } catch (error: any) {
        toast({ title: "Warning", description: "Using offline/default dashboard mode. Backend might be unreachable.", variant: "default" });
        // Fallback stats
        setStats({
          totalAnalyses: 0,
          averageScore: 0,
          totalResumesBuilt: 0,
          interviewsCompleted: 0,
          recentActivity: [],
          scoreHistory: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user, toast]);

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!</h1>
            <p className="text-muted-foreground mt-1">Here is the overview of your resume and interview activities.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/upload">
               <button className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary/20 transition-colors border border-primary/20 flex items-center gap-2">
                 <Sparkles className="w-4 h-4" /> New Analysis
               </button>
             </Link>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-3xl p-6 flex flex-col justify-center border-t border-white/10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Analyses</p>
            <h3 className="text-3xl font-bold">{stats.totalAnalyses}</h3>
          </div>
          
          <div className="glass-card rounded-3xl p-6 flex flex-col justify-center border-t border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Average Match Score</p>
            <div className="flex items-end gap-2">
               <h3 className="text-3xl font-bold">{stats.averageScore}</h3>
               <span className="text-sm text-muted-foreground mb-1">/ 100</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 flex flex-col justify-center border-t border-white/10">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 text-green-400">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Resumes Built</p>
            <h3 className="text-3xl font-bold">{stats.totalResumesBuilt}</h3>
          </div>
          
          <div className="glass-card rounded-3xl p-6 flex flex-col justify-center border-t border-white/10">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 text-orange-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Mock Interviews</p>
            <h3 className="text-3xl font-bold">{stats.interviewsCompleted}</h3>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Performance Chart */}
          <div className="glass-card rounded-3xl p-6 lg:col-span-2 flex flex-col border-white/10">
            <h3 className="font-semibold text-lg mb-6">Match Score Trend</h3>
            {stats.scoreHistory && stats.scoreHistory.length > 0 ? (
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                    />
                    <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p>Not enough data yet. Run some analyses!</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-3xl p-6 border-white/10 flex flex-col">
            <h3 className="font-semibold text-lg mb-6">Recent Activity</h3>
            
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {stats.recentActivity.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                        <span className="text-xs font-semibold text-primary">{item.score}% Match</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm text-center">
                <FileText className="w-10 h-10 mb-3 opacity-20" />
                <p>No recent activity found.</p>
                <Link href="/upload">
                  <p className="text-primary mt-2 cursor-pointer hover:underline">Start your first analysis</p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
