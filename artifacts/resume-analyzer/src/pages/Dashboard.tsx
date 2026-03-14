import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { MOCK_ANALYSIS } from "@/hooks/use-mock-data";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function Dashboard() {
  const { skills, suggestions } = MOCK_ANALYSIS;
  
  const matchedSkills = skills.filter(s => s.matched);
  const missingSkills = skills.filter(s => !s.matched);

  const pieData = [
    { name: 'Matched', value: matchedSkills.length, color: '#818cf8' },
    { name: 'Missing', value: missingSkills.length, color: '#334155' },
  ];

  const barData = skills.map(s => ({
    name: s.name,
    level: s.level || 10 // Give a tiny bar for 0 to show it exists
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Overview</h1>
            <p className="text-muted-foreground mt-1">Here is how your resume stacks up against the job.</p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <ScoreRing score={MOCK_ANALYSIS.overallScore} label="Overall Match" />
            <p className="mt-4 text-sm text-muted-foreground">Strong candidate profile.</p>
          </div>
          
          <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <ScoreRing score={MOCK_ANALYSIS.atsScore} label="ATS Score" />
            <p className="mt-4 text-sm text-muted-foreground">Highly readable by bots.</p>
          </div>

          <div className="glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI Suggestions</h3>
            </div>
            <ul className="space-y-3 z-10">
              {suggestions.slice(0,2).map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground bg-black/20 p-3 rounded-xl border border-white/5">
                  {s}
                </li>
              ))}
            </ul>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
          </div>
        </div>

        {/* Charts and Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Breakdown */}
          <div className="glass-card rounded-3xl p-6 space-y-6">
            <h3 className="font-semibold text-lg">Skill Alignment</h3>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Detected Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map(skill => (
                  <span key={skill.name} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map(skill => (
                  <span key={skill.name} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="glass-card rounded-3xl p-6 flex flex-col">
            <h3 className="font-semibold text-lg mb-6">Keyword Coverage</h3>
            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                  />
                  <Bar dataKey="level" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
