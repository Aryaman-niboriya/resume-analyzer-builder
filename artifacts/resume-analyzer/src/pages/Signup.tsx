import { Link } from "wouter";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 bg-grid-pattern relative">
      <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="w-full max-w-md glass-card p-8 rounded-3xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-2xl">Resume<span className="text-primary">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start analyzing your resume today</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href='/dashboard'; }}>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Alex Developer" className="bg-black/20 border-white/10 h-12 rounded-xl" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" className="bg-black/20 border-white/10 h-12 rounded-xl" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" className="bg-black/20 border-white/10 h-12 rounded-xl" required />
          </div>
          
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 mt-6">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
