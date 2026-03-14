import { useState, useEffect } from 'react';

// Centralized mock data for the application

export const MOCK_USER = {
  name: "Alex Developer",
  email: "alex@example.com",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
};

export const MOCK_ANALYSIS = {
  overallScore: 82,
  atsScore: 94,
  industryMatch: 78,
  skills: [
    { name: "React", category: "Framework", level: 90, matched: true },
    { name: "TypeScript", category: "Language", level: 85, matched: true },
    { name: "Node.js", category: "Backend", level: 75, matched: true },
    { name: "AWS", category: "Cloud", level: 60, matched: true },
    { name: "GraphQL", category: "API", level: 0, matched: false },
    { name: "Docker", category: "DevOps", level: 40, matched: false },
    { name: "Kubernetes", category: "DevOps", level: 0, matched: false },
  ],
  suggestions: [
    "Quantify your achievements in the 'Experience' section (e.g., 'Improved performance by 20%').",
    "Add 'GraphQL' and 'Docker' to your skills to match the target job description.",
    "Your summary is slightly too long. Keep it under 3-4 sentences.",
  ]
};

export const MOCK_INTERVIEW_QUESTIONS = [
  {
    id: 1,
    type: "Technical",
    question: "How would you design a scalable React application architecture for a large team?",
    hint: "Focus on monorepos, state management separation, and component design systems."
  },
  {
    id: 2,
    type: "Behavioral",
    question: "Tell me about a time you had to learn a new technology (like AWS) quickly for a project.",
    hint: "Use the STAR method: Situation, Task, Action, Result."
  },
  {
    id: 3,
    type: "Situational",
    question: "If you noticed a significant performance drop after migrating to TypeScript, how would you debug it?",
    hint: "Discuss profiling tools, checking bundle sizes, and build configurations."
  }
];

export const MOCK_CANDIDATES = [
  { id: "c1", name: "Sarah Jenkins", role: "Frontend Engineer", matchScore: 95, status: "Shortlisted" },
  { id: "c2", name: "Michael Chen", role: "Full Stack Dev", matchScore: 88, status: "Pending" },
  { id: "c3", name: "Jessica Walsh", role: "React Developer", matchScore: 72, status: "Rejected" },
  { id: "c4", name: "David Kim", role: "UI Engineer", matchScore: 65, status: "Pending" },
];

export function useMockUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateUpload = (onComplete: () => void) => {
    setIsUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onComplete();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return { isUploading, progress, simulateUpload };
}
