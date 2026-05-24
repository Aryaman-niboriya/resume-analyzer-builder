import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileCheck, Target, MessageSquare, Zap, Shield, Users } from "lucide-react";

const FEATURES = [
  { icon: FileCheck, title: "ATS Scoring", desc: "Instantly check if your resume passes automated tracking systems." },
  { icon: Target, title: "Skill Gap Analysis", desc: "Compare your skills against actual job descriptions." },
  { icon: MessageSquare, title: "Interview Prep", desc: "Generate custom interview questions based on your experience." },
  { icon: Zap, title: "AI Suggestions", desc: "Get smart rewrites for bullet points to maximize impact." },
  { icon: Shield, title: "Resume Builder", desc: "Create beautiful, ATS-friendly PDFs in minutes." },
  { icon: Users, title: "HR Mode", desc: "Rank multiple candidates instantly based on job requirements." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} 
          alt="Abstract Tech Background" 
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      <Navbar className="relative z-10" />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              GPT-4 Powered Analysis
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6 text-balance">
              Get Hired Faster with <br />
              <span className="text-gradient">AI Resume Analysis</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your resume and the target job description. Our AI will instantly score your match, identify missing skills, and prep you for the interview.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/upload">
                <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all group">
                  Analyze Resume Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-semibold border-white/10 hover:bg-white/5 glass">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold">Everything you need to stand out</h2>
            <p className="text-muted-foreground mt-4">Powerful tools designed for job seekers and recruiters.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-muted-foreground relative z-10">
        <p>© {new Date().getFullYear()} ResumeAI. Replit Agent Generated.</p>
      </footer>
    </div>
  );
}
