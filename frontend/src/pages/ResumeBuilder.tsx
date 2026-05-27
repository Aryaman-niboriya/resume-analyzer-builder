import { useState, useRef } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Upload, ChevronRight, ChevronLeft, Bot, FileText, Download, Briefcase, Mail, MapPin, Phone, Linkedin, Github } from "lucide-react";

export default function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [masterProfile, setMasterProfile] = useState<any>({
    personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
    summary: "",
    experience: [],
    education: [],
    skills: "",
    projects: []
  });
  
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await apiFetch("/api/builder/extract", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extract PDF");
      
      setMasterProfile((prev: any) => ({ ...prev, ...data }));
      toast({ title: "Magic Fill Complete", description: "Successfully extracted data from your resume document." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast({ title: "Error", description: "Please paste a job description first.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await apiFetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ masterProfile, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate tailored resume");
      
      setTailoredResume(data);
      setStep(3);
      generateCoverLetter(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateCoverLetter = async (resumeData: any) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await apiFetch("/api/builder/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tailoredResume: resumeData, jobDescription }),
      });
      const data = await res.json();
      if (res.ok && data.coverLetter) {
        setCoverLetter(data.coverLetter);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const printResume = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="py-8 space-y-8 print:py-0 print:space-y-0 text-white">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white flex flex-wrap items-center gap-2 sm:text-3xl sm:gap-3">
            <FileText className="w-7 h-7 shrink-0 text-primary sm:w-8 sm:h-8" />
            AI Auto-Tailored Resume
          </h1>
          <p className="text-muted-foreground mt-2">Create a Master Profile once, and auto-generate 100s of tailored resumes instantly.</p>
        </div>
        
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {step === 1 && (
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="gap-2 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" disabled={loading}>
                <Upload className="w-4 h-4" />
                {loading ? "Extracting..." : "Magic Fill via PDF"}
              </Button>
            </div>
          )}
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          )}
          {step === 3 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Adjust JD</Button>
              <Button onClick={printResume} className="gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps - Hidden on Print */}
      <div className="flex flex-col gap-3 text-sm font-medium print:hidden sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-border'}`}>1</div>
          <span className="whitespace-nowrap">Master Profile</span>
        </div>
        <div className="hidden h-px w-8 bg-border sm:block sm:w-12" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-border'}`}>2</div>
          <span className="whitespace-nowrap">Job Description</span>
        </div>
        <div className="hidden h-px w-8 bg-border sm:block sm:w-12" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-border'}`}>3</div>
          <span className="whitespace-nowrap">Tailored Export</span>
        </div>
      </div>

      {/* Step 1: Master Profile Form */}
      {step === 1 && (
        <Card className="glass-card border-none text-white print:hidden">
          <CardHeader>
            <CardTitle>Your Background Brain</CardTitle>
            <CardDescription className="text-gray-400">Fill this out manually or use "Magic Fill" above to extract from your old resume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input className="bg-white/5 border-white/10" value={masterProfile.personalInfo?.fullName || ''} onChange={e => setMasterProfile({...masterProfile, personalInfo: {...masterProfile.personalInfo, fullName: e.target.value}})} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input className="bg-white/5 border-white/10" value={masterProfile.personalInfo?.phone || ''} onChange={e => setMasterProfile({...masterProfile, personalInfo: {...masterProfile.personalInfo, phone: e.target.value}})} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input className="bg-white/5 border-white/10" value={masterProfile.personalInfo?.email || ''} onChange={e => setMasterProfile({...masterProfile, personalInfo: {...masterProfile.personalInfo, email: e.target.value}})} />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input className="bg-white/5 border-white/10" value={masterProfile.personalInfo?.linkedin || ''} onChange={e => setMasterProfile({...masterProfile, personalInfo: {...masterProfile.personalInfo, linkedin: e.target.value}})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Executive Summary</Label>
              <Textarea className="bg-white/5 border-white/10 h-32" value={masterProfile.summary || ''} onChange={e => setMasterProfile({...masterProfile, summary: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>All Skills (Comma separated)</Label>
              <Textarea className="bg-white/5 border-white/10" value={masterProfile.skills || ''} onChange={e => setMasterProfile({...masterProfile, skills: e.target.value})} />
            </div>

            {/* Experience Placeholder Note */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3">
              <Bot className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm text-primary/90">
                <p className="font-semibold">AI Database Active</p>
                <p>When you use "Magic Fill", we extract your entire job history and education into memory. When generating the resume, our AI will automatically select the perfect bullet points and enhance them via the STAR method.</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} className="w-full md:w-auto gap-2">
                Next: Target Job <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Job Description */}
      {step === 2 && (
        <Card className="glass-card border-none print:hidden">
          <CardHeader>
            <CardTitle>Target Job Description</CardTitle>
            <CardDescription className="text-gray-400">Paste the exact JD. Our AI will dynamically rewrite and restructure your master profile to perfectly fit this role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea 
              placeholder="Paste the job requirements and description here..."
              className="min-h-[300px] bg-white/5 border-white/10 text-white"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
            
            <Button onClick={handleGenerate} className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" disabled={loading || !jobDescription.trim()}>
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Crafting Tailored Resume...</span>
              ) : (
                <span className="flex items-center gap-2"><Bot className="w-5 h-5" /> Generate Perfect Match</span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generation Preview */}
      {step === 3 && tailoredResume && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cover Letter Panel - Hidden on exact print, can be enabled via options later */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> Auto Cover Letter</CardTitle>
                <CardDescription className="text-gray-400">Generated to perfectly supplement your targeted resume.</CardDescription>
              </CardHeader>
              <CardContent>
                {coverLetter ? (
                  <Textarea className="min-h-[400px] bg-white/5 border-white/10 text-sm whitespace-pre-wrap leading-relaxed focus-visible:ring-1" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground animate-pulse">Drafting cover letter...</div>
                )}
                <Button className="w-full mt-4" variant="secondary" onClick={() => navigator.clipboard.writeText(coverLetter)}>Copy Cover Letter</Button>
              </CardContent>
            </Card>
          </div>

          {/* Resume Blueprint Preview (Print Surface) */}
          <div className="lg:col-span-8">
            <div className="bg-white text-black p-6 sm:p-8 md:p-12 min-h-0 sm:min-h-[600px] md:min-h-[1056px] shadow-2xl rounded-sm print:shadow-none print:m-0 print:p-0 overflow-x-auto">
              {/* Actual Standard Resume Layout */}
              <div className="space-y-6 max-w-4xl mx-auto font-sans">
                
                {/* Header Section */}
                <div className="text-center border-b-2 border-gray-300 pb-4">
                  <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900 mb-2">{tailoredResume.personalInfo?.fullName}</h1>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600">
                    {tailoredResume.personalInfo?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {tailoredResume.personalInfo.email}</span>}
                    {tailoredResume.personalInfo?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {tailoredResume.personalInfo.phone}</span>}
                    {tailoredResume.personalInfo?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {tailoredResume.personalInfo.location}</span>}
                    {tailoredResume.personalInfo?.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {tailoredResume.personalInfo.linkedin}</span>}
                  </div>
                </div>

                {/* Professional Summary */}
                {tailoredResume.summary && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Professional Summary</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">{tailoredResume.summary}</p>
                  </div>
                )}

                {/* Skills Section */}
                {tailoredResume.skills && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Core Competencies</h2>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                      {typeof tailoredResume.skills === 'string' 
                        ? tailoredResume.skills 
                        : Array.isArray(tailoredResume.skills) 
                          ? tailoredResume.skills.join(', ') 
                          : typeof tailoredResume.skills === 'object' && tailoredResume.skills !== null
                            ? Object.entries(tailoredResume.skills).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
                            : ''}
                    </p>
                  </div>
                )}

                {/* Professional Experience */}
                {tailoredResume.experience && tailoredResume.experience.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Professional Experience</h2>
                    <div className="space-y-4">
                      {tailoredResume.experience.map((exp: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-gray-900">{exp.role} <span className="text-gray-500 font-normal">| {exp.company}</span></h3>
                            <span className="text-sm text-gray-600 italic">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
                            {/* Assuming the AI sends bullet points as either an array or a newline separated string */}
                            {Array.isArray(exp.description) 
                              ? exp.description.map((bullet: string, j: number) => <li key={j} className="pl-1 leading-relaxed">{bullet}</li>)
                              : typeof exp.description === 'string' 
                                ? exp.description.split('\n').filter((b: string) => b.trim()).map((b: string, j: number) => <li key={j} className="pl-1 leading-relaxed">{b.replace(/^- /, '')}</li>)
                                : null}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {tailoredResume.projects && tailoredResume.projects.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Selected Projects</h2>
                    <div className="space-y-4">
                      {tailoredResume.projects.map((proj: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-gray-900">{proj.name}</h3>
                            {proj.link && <span className="text-sm text-blue-600 italic truncate w-32 text-right">{proj.link}</span>}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {tailoredResume.education && tailoredResume.education.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Education</h2>
                    <div className="space-y-2">
                      {tailoredResume.education.map((edu: any, i: number) => (
                        <div key={i} className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-gray-900">{edu.degree}</span>
                            <span className="text-gray-600">, {edu.institution}</span>
                          </div>
                          <div className="text-sm text-gray-600 text-right">
                            <span>{edu.graduationYear}</span>
                            {edu.gpa && <span> | GPA: {edu.gpa}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
            {/* Inline CSS applied only during printing to ensure perfect native PDF generation via browser */}
            <style>
              {`
                @media print {
                  @page { size: auto; margin: 0mm; }
                  body { -webkit-print-color-adjust: exact; background-color: white !important; }
                  nav, aside, header, footer, .toast-viewport { display: none !important; }
                  * { color: black !important; border-color: #e5e7eb !important; }
                  .glass-card { background: white !important; border: none !important; box-shadow: none !important; }
                }
              `}
            </style>
          </div>
        </div>
      )}
    </div>
  </DashboardLayout>
);
}
