import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MOCK_ANALYSIS } from "@/hooks/use-mock-data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, AlertCircle } from "lucide-react";

export default function SkillGap() {
  const { skills } = MOCK_ANALYSIS;
  const matched = skills.filter(s => s.matched);
  const missing = skills.filter(s => !s.matched);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Skill Gap Analysis</h1>
          <p className="text-muted-foreground mt-2">Identify what's missing to land the job.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detected Skills */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="font-semibold text-xl mb-6">Current Proficiency</h3>
            <div className="space-y-6">
              {matched.map(skill => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2 bg-black/40">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${skill.level}%` }} />
                  </Progress>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border-amber-500/20">
              <h3 className="font-semibold text-xl mb-6 flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-5 h-5" /> Required to Learn
              </h3>
              <div className="space-y-4">
                {missing.map(skill => (
                  <div key={skill.name} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                    <div>
                      <h4 className="font-medium">{skill.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{skill.category}</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">High Priority</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Recommended Resources
              </h3>
              <div className="space-y-3">
                <a href="#" className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="font-medium text-sm">Advanced Docker for Node.js</p>
                  <p className="text-xs text-primary mt-1">Udemy Course • 4 hours</p>
                </a>
                <a href="#" className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="font-medium text-sm">GraphQL API Design Pattern</p>
                  <p className="text-xs text-primary mt-1">Documentation • 45 mins read</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
