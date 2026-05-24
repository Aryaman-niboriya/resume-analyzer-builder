import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Sparkles, ChevronDown, Target, Loader2, UploadCloud, PlusCircle, History, CalendarDays, FileText, RefreshCw, Pencil, Trash2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getToken, getUser } from "@/lib/auth";
import { apiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type InterviewQuestion = {
  type?: string;
  category?: string;
  question: string;
  hint?: string;
  options?: string[];
  correctAnswerIndex?: number;
};

type InterviewHistoryItem = {
  id: string;
  job_description: string;
  resume_filename?: string;
  resume_preview?: string;
  questions: InterviewQuestion[];
  question_count: number;
  created_at?: string;
  updated_at?: string;
};

const getQuestionsFromPayload = (payload: any): InterviewQuestion[] => {
  if (Array.isArray(payload)) return payload;
  return payload?.questions || [];
};

const formatHistoryDate = (value?: string) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

// Component for Interactive MCQ
const MCQQuestion = ({ q, index, expandedId, setExpandedId, handleCopy, copiedId }: any) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleSelect = (e: React.MouseEvent, optIndex: number) => {
    e.stopPropagation();
    if (selectedOption === null) {
      setSelectedOption(optIndex);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-r from-transparent to-white/[0.01]"
    >
      <button 
        className="w-full p-6 text-left flex items-start gap-4 hover:bg-white/5 transition-colors"
        onClick={() => setExpandedId(expandedId === index ? null : index)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 uppercase tracking-wider">
              {q.category || "MCQ"}
            </span>
          </div>
          <h3 className="text-lg font-medium pr-8 leading-snug">{q.question}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground mt-2 transition-transform duration-300 ${expandedId === index ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expandedId === index && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 space-y-4">
              <div className="space-y-2">
                {q.options?.map((opt: string, optIndex: number) => {
                  let btnClass = "w-full text-left p-4 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 transition-colors text-sm text-foreground/90";
                  if (selectedOption !== null) {
                    if (optIndex === q.correctAnswerIndex) {
                      btnClass = "w-full text-left p-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-sm";
                    } else if (optIndex === selectedOption) {
                      btnClass = "w-full text-left p-4 rounded-xl border border-red-500/50 bg-red-500/10 text-red-400 text-sm";
                    } else {
                      btnClass = "w-full text-left p-4 rounded-xl border border-white/5 bg-black/40 text-muted-foreground text-sm opacity-50";
                    }
                  }
                  return (
                    <button 
                      key={optIndex} 
                      className={btnClass}
                      onClick={(e) => handleSelect(e, optIndex)}
                      disabled={selectedOption !== null}
                    >
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {selectedOption !== null && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 relative group shadow-inner mt-4 animate-in fade-in zoom-in duration-300">
                  <p className="text-sm text-primary-foreground/90 leading-relaxed pr-8">
                    <strong className="text-primary mr-2 flex items-center gap-1 mb-1"><Sparkles className="w-3 h-3"/> Explanation:</strong> 
                    {q.hint}
                  </p>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 hover:bg-white/10"
                    onClick={(e) => { e.stopPropagation(); handleCopy(q.question, index); }}
                  >
                    {copiedId === index ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-primary" />}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RegularQuestion = ({ q, index, expandedId, setExpandedId, handleCopy, copiedId }: any) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-r from-transparent to-white/[0.01]"
    >
      <button 
        className="w-full p-6 text-left flex items-start gap-4 hover:bg-white/5 transition-colors"
        onClick={() => setExpandedId(expandedId === index ? null : index)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-primary/20 text-primary uppercase tracking-wider">
              {q.category}
            </span>
          </div>
          <h3 className="text-lg font-medium pr-8 leading-snug">{q.question}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground mt-2 transition-transform duration-300 ${expandedId === index ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expandedId === index && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/5 relative group shadow-inner">
                <p className="text-sm text-foreground/80 leading-relaxed pr-8">
                  <strong className="text-primary mr-2 flex items-center gap-1 mb-1"><Sparkles className="w-3 h-3"/> AI Coach Hint:</strong> 
                  {q.hint}
                </p>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 hover:bg-white/10"
                  onClick={(e) => { e.stopPropagation(); handleCopy(q.question, index); }}
                >
                  {copiedId === index ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default function Interview() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [historyItems, setHistoryItems] = useState<InterviewHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [activeHistory, setActiveHistory] = useState<InterviewHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [jobDesc, setJobDesc] = useState("");
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [savingHistoryId, setSavingHistoryId] = useState<string | null>(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const user = getUser();

  const fetchHistory = useCallback(async (selectLatest = false) => {
    if (!user?.id) return [];

    setHistoryLoading(true);
    try {
      const token = getToken();
      const res = await fetch(apiUrl(`/api/interview/history?user_id=${user.id}`), {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error("Could not load interview history");

      const items: InterviewHistoryItem[] = await res.json();
      setHistoryItems(items);

      if (selectLatest && items.length > 0) {
        setQuestions(items[0].questions || []);
        setActiveHistoryId(items[0].id);
        setActiveHistory(items[0]);
      }

      return items;
    } catch (error) {
      console.error("Failed to load interview history", error);
      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadInterviewData = async () => {
      try {
        const token = getToken();
        if (!user || !token) return;

        const savedHistory = await fetchHistory(true);
        if (savedHistory.length > 0) return;

        const res = await fetch(apiUrl(`/api/dashboard/latest-analysis?user_id=${user.id}`), {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.interviewQuestions) {
             const mapped = data.interviewQuestions.map((q: any) => ({...q, type: 'Regular'}));
             setQuestions(mapped);
          }
        }
      } catch (error) {
        console.error("Failed to load interview data", error);
      } finally {
        setLoading(false);
      }
    };
    loadInterviewData();
  }, [user?.id, fetchHistory]);

  const handleCopy = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLoadHistory = (item: InterviewHistoryItem) => {
    setQuestions(item.questions || []);
    setActiveHistoryId(item.id);
    setActiveHistory(item);
    setExpandedId(null);
    toast({ title: "History loaded", description: "Previous interview prep session opened." });
  };

  const handleNewPrep = () => {
    setQuestions([]);
    setActiveHistoryId(null);
    setActiveHistory(null);
    setExpandedId(null);
    setCopiedId(null);
    setFile(null);
    setJobDesc("");
    setFileInputKey((key) => key + 1);
  };

  const handleStartEdit = (item: InterviewHistoryItem) => {
    setEditingHistoryId(item.id);
    setEditingTitle(item.job_description || "Interview Prep Session");
  };

  const handleCancelEdit = () => {
    setEditingHistoryId(null);
    setEditingTitle("");
  };

  const handleSaveHistory = async (item: InterviewHistoryItem) => {
    const nextTitle = editingTitle.trim();
    if (!nextTitle) {
      toast({ title: "Title required", description: "History title cannot be empty.", variant: "destructive" });
      return;
    }

    setSavingHistoryId(item.id);
    try {
      const token = getToken();
      const res = await fetch(apiUrl(`/api/interview/history/${item.id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: user?.id, job_description: nextTitle }),
      });

      if (!res.ok) throw new Error("Could not update history");

      const updated: InterviewHistoryItem = await res.json();
      setHistoryItems((items) => items.map((historyItem) => historyItem.id === updated.id ? updated : historyItem));
      if (activeHistoryId === updated.id) setActiveHistory(updated);
      setEditingHistoryId(null);
      setEditingTitle("");
      toast({ title: "Updated", description: "History title updated." });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setSavingHistoryId(null);
    }
  };

  const handleDeleteHistory = async (item: InterviewHistoryItem) => {
    const confirmed = window.confirm(`Delete "${item.job_description || "Interview Prep Session"}" from history?`);
    if (!confirmed) return;

    setDeletingHistoryId(item.id);
    try {
      const token = getToken();
      const res = await fetch(apiUrl(`/api/interview/history/${item.id}?user_id=${user?.id}`), {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Could not delete history");

      setHistoryItems((items) => items.filter((historyItem) => historyItem.id !== item.id));
      if (activeHistoryId === item.id) handleNewPrep();
      if (editingHistoryId === item.id) handleCancelEdit();
      toast({ title: "Deleted", description: "History session removed." });
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } finally {
      setDeletingHistoryId(null);
    }
  };

  const handleUploadAndGenerate = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a resume PDF first.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('job_description', jobDesc || 'Software Engineer');
      if (user) formData.append('user_id', user.id);

      const res = await fetch(apiUrl(`/api/interview/upload-and-generate`), {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData
      });
      
      if (!res.ok) throw new Error("Generation failed");
      const payload = await res.json();
      const newQs = getQuestionsFromPayload(payload);
      setQuestions(newQs);
      setActiveHistoryId(payload.history_id || payload.history?.id || null);
      setActiveHistory(payload.history || null);
      await fetchHistory();
      toast({ title: "Success", description: "New questions generated based on your resume!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleAddMore = async (type: string) => {
    setGeneratingType(type);
    try {
      const token = getToken();
      const res = await fetch(apiUrl(`/api/interview/generate`), {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id: user?.id, question_type: type, history_id: activeHistoryId })
      });
      
      if (!res.ok) throw new Error("Make sure you have uploaded a resume first.");
      const payload = await res.json();
      const newQs = getQuestionsFromPayload(payload);
      setQuestions(prev => [...prev, ...newQs]);
      setActiveHistoryId(payload.history_id || payload.history?.id || activeHistoryId);
      if (payload.history) setActiveHistory(payload.history);
      await fetchHistory();
      toast({ title: "Added", description: `Added 3 more ${type} questions.` });
    } catch (error: any) {
      toast({ title: "Error generating more", description: error.message, variant: "destructive" });
    } finally {
      setGeneratingType(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Categorize questions
  const technicalQs = questions.filter(q => q.category?.toLowerCase().includes('technical'));
  const behavioralQs = questions.filter(q => q.category?.toLowerCase().includes('behavioral') || q.category?.toLowerCase().includes('experience'));
  const mcqQs = questions.filter(q => q.type === 'MCQ' || q.category?.toLowerCase().includes('choice'));

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-6xl gap-3 pb-16 animate-in fade-in duration-500 sm:gap-4 lg:gap-6">
        <div className="min-w-0 flex-1 space-y-8 sm:space-y-10">
          {/* Header & Upload Section */}
          <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-display font-bold sm:text-3xl">Interview Prep Studio</h1>
            <p className="text-muted-foreground mt-2">Upload your resume to get hyper-tailored interview questions and interactive MCQs.</p>
          </div>
          
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Your Resume (PDF)</label>
                <div className="relative">
                   <input 
                     key={fileInputKey}
                     type="file" 
                     accept=".pdf"
                     onChange={(e) => setFile(e.target.files?.[0] || null)}
                     className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                   />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Target Job Description (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Frontend Engineer at Google"
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <Button 
              onClick={handleUploadAndGenerate} 
              disabled={uploading}
              className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20 shrink-0 w-full md:w-auto"
            >
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Processing...</> : <><UploadCloud className="w-4 h-4 mr-2"/> Generate Prep</>}
            </Button>
          </div>
        </div>

        {questions.length === 0 && !uploading && (
          <div className="flex flex-col h-[40vh] items-center justify-center text-center space-y-4">
            <Target className="w-16 h-16 text-muted-foreground opacity-30" />
            <h2 className="text-xl font-bold">No Questions Yet</h2>
            <p className="text-muted-foreground max-w-sm">Upload your resume above to start your personalized interview prep session.</p>
          </div>
        )}

        {questions.length > 0 && (
          <div className="space-y-12">
            {activeHistory && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-primary">Viewing saved session</p>
                    <h2 className="text-xl font-bold">{activeHistory.job_description || "Interview Prep Session"}</h2>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {activeHistory.resume_filename || "Uploaded resume"}
                      </span>
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatHistoryDate(activeHistory.created_at)}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-muted-foreground">
                    {questions.length} questions
                  </span>
                </div>
                {activeHistory.resume_preview && (
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {activeHistory.resume_preview}
                  </p>
                )}
              </div>
            )}
            
            {/* Technical Section */}
            <div className="space-y-4">
               <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2">💻 Technical Questions</h2>
               <div className="space-y-4">
                 {technicalQs.map((q, i) => (
                    <RegularQuestion key={`tech-${i}`} q={q} index={`tech-${i}`} expandedId={expandedId} setExpandedId={setExpandedId} handleCopy={handleCopy} copiedId={copiedId} />
                 ))}
               </div>
               <Button variant="outline" className="w-full rounded-xl border-dashed border-white/20 text-muted-foreground hover:text-foreground" onClick={() => handleAddMore('Technical')} disabled={generatingType === 'Technical'}>
                 {generatingType === 'Technical' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><PlusCircle className="w-4 h-4 mr-2"/> Add More Technical</>}
               </Button>
            </div>

            {/* Behavioral Section */}
            <div className="space-y-4">
               <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2">🤝 Behavioral & Experience</h2>
               <div className="space-y-4">
                 {behavioralQs.map((q, i) => (
                    <RegularQuestion key={`beh-${i}`} q={q} index={`beh-${i}`} expandedId={expandedId} setExpandedId={setExpandedId} handleCopy={handleCopy} copiedId={copiedId} />
                 ))}
               </div>
               <Button variant="outline" className="w-full rounded-xl border-dashed border-white/20 text-muted-foreground hover:text-foreground" onClick={() => handleAddMore('Behavioral')} disabled={generatingType === 'Behavioral'}>
                 {generatingType === 'Behavioral' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><PlusCircle className="w-4 h-4 mr-2"/> Add More Behavioral</>}
               </Button>
            </div>

            {/* MCQ Section */}
            <div className="space-y-4">
               <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2">📝 Multiple Choice Tests</h2>
               <div className="space-y-4">
                 {mcqQs.map((q, i) => (
                    <MCQQuestion key={`mcq-${i}`} q={q} index={`mcq-${i}`} expandedId={expandedId} setExpandedId={setExpandedId} handleCopy={handleCopy} copiedId={copiedId} />
                 ))}
               </div>
               <Button variant="outline" className="w-full rounded-xl border-dashed border-white/20 text-muted-foreground hover:text-foreground" onClick={() => handleAddMore('MCQ')} disabled={generatingType === 'MCQ'}>
                 {generatingType === 'MCQ' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><PlusCircle className="w-4 h-4 mr-2"/> Add More MCQs</>}
               </Button>
            </div>

          </div>
        )}
      </div>

        <aside className="sticky top-0 z-10 w-[9.75rem] shrink-0 self-start sm:w-[13.5rem] lg:w-[20rem] max-h-[calc(100dvh-4.5rem)]">
          <div className="glass-card flex h-full max-h-[calc(100dvh-4.5rem)] min-h-[220px] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 sm:rounded-3xl sm:p-4 lg:min-h-[360px]">
            <div className="mb-3 flex items-center justify-between gap-1 sm:mb-4 sm:gap-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 sm:h-9 sm:w-9">
                  <History className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold sm:text-sm">History</h2>
                  <p className="hidden text-xs text-muted-foreground sm:block">Interview sessions</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fetchHistory()}
                disabled={historyLoading}
                className="h-8 w-8 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 sm:h-9 sm:w-9"
                title="Refresh history"
              >
                {historyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleNewPrep}
              className="mb-3 w-full justify-center rounded-xl border-white/10 bg-black/20 px-2 text-xs hover:bg-white/10 sm:mb-4 sm:justify-start sm:text-sm"
              title="New Prep"
            >
              <PlusCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Prep</span>
            </Button>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {historyLoading && historyItems.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
                  Loading saved sessions...
                </div>
              ) : historyItems.length > 0 ? (
                <div className="space-y-2">
                  {historyItems.map((item) => {
                    const isActive = item.id === activeHistoryId;
                    const isEditing = item.id === editingHistoryId;
                    return (
                      <div
                        key={item.id}
                        className={`group rounded-xl border p-2 transition-all sm:rounded-2xl sm:p-3 ${
                          isActive
                            ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
                            : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.06]"
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSaveHistory(item)}
                                disabled={savingHistoryId === item.id}
                                className="h-8 flex-1 rounded-xl"
                              >
                                {savingHistoryId === item.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
                                Save
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 rounded-xl border-white/10 bg-black/20"
                                title="Cancel edit"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button type="button" onClick={() => handleLoadHistory(item)} className="w-full text-left">
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground sm:text-sm">
                                  {item.job_description || "Interview Prep Session"}
                                </p>
                                <span className="shrink-0 rounded-full border border-white/10 bg-black/20 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:px-2 sm:text-[11px]">
                                  {item.question_count || item.questions?.length || 0}
                                </span>
                              </div>
                              <p className="flex items-center gap-1 text-[10px] text-muted-foreground sm:gap-1.5 sm:text-xs">
                                <CalendarDays className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                                <span className="line-clamp-1">{formatHistoryDate(item.created_at)}</span>
                              </p>
                              <p className="mt-1 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                <span className="line-clamp-1">{item.resume_filename || "Uploaded resume"}</span>
                              </p>
                            </button>
                            <div className="mt-2 flex items-center gap-1 sm:mt-3 sm:gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleStartEdit(item)}
                                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 sm:h-8 sm:w-8 sm:rounded-xl"
                                title="Edit history"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteHistory(item)}
                                disabled={deletingHistoryId === item.id}
                                className="h-7 w-7 rounded-lg bg-white/5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:h-8 sm:w-8 sm:rounded-xl"
                                title="Delete history"
                              >
                                {deletingHistoryId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-muted-foreground">
                  No history yet. Generate a prep session and it will show up here.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
