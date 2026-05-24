import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getUser, setUser, getToken, User } from "@/lib/auth";
import { apiUrl } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) {
        setLocation('/login');
        return;
      }
      try {
        const res = await fetch(apiUrl("/api/auth/profile"), {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);
        setUser(data); // update cache
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setLocation, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const token = getToken();
    try {
      const res = await fetch(apiUrl("/api/auth/profile"), {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: profile.name,
          job_title: profile.job_title,
          bio: profile.bio
        })
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setProfile(data.user);
      setUser(data.user); // update cache
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">My Profile</h1>
        <div className="glass-card rounded-3xl p-5 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled className="bg-black/20" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="bg-black/20" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input id="job_title" value={profile.job_title || ''} onChange={(e) => setProfile({...profile, job_title: e.target.value})} className="bg-black/20" placeholder="e.g. Senior Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea 
                id="bio" 
                value={profile.bio || ''} 
                onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <Button type="submit" disabled={saving} className="h-12 px-8 rounded-xl font-semibold shadow-lg shadow-primary/25">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
