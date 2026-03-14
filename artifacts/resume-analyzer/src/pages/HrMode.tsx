import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MOCK_CANDIDATES } from "@/hooks/use-mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, Filter, MoreHorizontal } from "lucide-react";

export default function HrMode() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">HR Mode</h1>
            <p className="text-muted-foreground mt-1">Bulk rank candidates against job requirements.</p>
          </div>
          <Button className="rounded-full glass hover:bg-white/10">
            <Upload className="w-4 h-4 mr-2" /> Upload Batch (ZIP)
          </Button>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-10 bg-black/20 border-white/10 rounded-xl" />
            </div>
            <Button variant="outline" className="rounded-xl border-white/10 bg-transparent">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Candidate</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Match Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CANDIDATES.map((candidate, idx) => (
                  <tr key={candidate.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{candidate.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{candidate.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${candidate.matchScore > 80 ? 'text-emerald-400' : candidate.matchScore > 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {candidate.matchScore}%
                        </span>
                        <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${candidate.matchScore > 80 ? 'bg-emerald-400' : candidate.matchScore > 60 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                            style={{ width: `${candidate.matchScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`
                        ${candidate.status === 'Shortlisted' ? 'bg-primary/10 text-primary border-primary/20' : 
                          candidate.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                          'bg-white/5 text-muted-foreground border-white/10'}
                      `}>
                        {candidate.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
