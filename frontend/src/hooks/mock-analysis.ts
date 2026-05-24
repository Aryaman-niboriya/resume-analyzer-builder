// Mock data for the AI Resume Analysis Report

export const MOCK_ANALYSIS_REPORT = {
  // 1. Overall Match Score
  overallScore: 78,
  scoreBreakdown: {
    skillsMatch: 85,
    keywordMatch: 65,
    experienceRelevance: 72,
    atsCompatibility: 80
  },

  // 2. Extracted Resume Data
  extractedData: {
    name: "Alex Developer",
    email: "alex.dev@example.com",
    education: "B.S. Computer Science, University of Tech",
    experienceYears: 4.5,
    projects: ["E-commerce Dashboard", "AI Chat SaaS", "Portfolio Website"],
    allSkills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL", "Git", "Figma", "Next.js", "Express"]
  },

  // 3. Skills Match Analysis
  skillsAnalysis: {
    matching: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
    missing: ["AWS", "Docker", "GraphQL", "MongoDB"],
    extra: ["Figma", "PostgreSQL", "Next.js"]
  },

  // 4. Keyword Coverage
  keywordCoverage: {
    percentage: 65,
    found: ["Frontend", "State Management", "REST APIs", "Modern UI", "Agile"],
    missing: ["Microservices", "CI/CD", "Testing (Jest/Cypress)", "Cloud Infrastructure"]
  },

  // 5. Experience Relevance
  experienceAnalysis: {
    score: 72,
    relevantYears: 3,
    requiredYears: 4,
    relevantProjects: ["E-commerce Dashboard", "AI Chat SaaS"],
    summary: "Strong frontend experience, but lacks the required 4+ years of full-stack cloud architecture."
  },

  // 6. ATS Compatibility Score
  atsCompatibility: {
    score: 80,
    checks: [
      { name: "Proper Headings", passed: true },
      { name: "Clear Sections", passed: true },
      { name: "Standard Fonts", passed: true },
      { name: "Keyword Usage", passed: false },
      { name: "Appropriate Length (1-2 pages)", passed: true },
      { name: "No Complex Tables/Images", passed: false }
    ]
  },

  // 7. Improvement Suggestions
  suggestions: [
    "Add missing keywords from the job description like 'Microservices' and 'CI/CD'.",
    "Include measurable achievements in your experience section (e.g., 'Improved load time by 30%').",
    "Remove the complex multi-column layout table; ATS systems cannot parse it correctly.",
    "Expand on your backend experience to better match the full-stack requirements."
  ],

  // 8. Skill Gap Analyzer
  skillGap: {
    missingRequired: ["Docker", "AWS", "GraphQL"],
    recommendedToLearn: ["Kubernetes", "Redis", "Apollo Client"],
    fastestLearningPath: "Focus on Docker basics first to understand containerization, then map it to AWS ECS or EKS."
  },

  // 9. Interview Question Generator
  interviewQuestions: [
    {
      category: "Technical Architecture",
      question: "Explain your React project architecture for the 'E-commerce Dashboard'. How did you handle state management across complex checkout flows?",
      hint: "Focus on component uncoupling, Redux/Zustand usage, and performance optimization."
    },
    {
      category: "System Design",
      question: "How would you design the backend for the AI Chat SaaS you worked on to handle 10,000 concurrent websocket connections?",
      hint: "Mention Node.js event loop, Redis Pub/Sub, and load balancing."
    },
    {
      category: "Behavioral",
      question: "Describe a challenging bug you solved recently that took more than a day to figure out.",
      hint: "Use the STAR method and focus on your debugging process rather than just the code fix."
    }
  ],

  // 10. Final Verdict
  finalVerdict: "Your resume is a solid match for the frontend requirements of this role (React/TypeScript). However, to be a top candidate, you need to showcase more cloud infrastructure (AWS/Docker) and optimize your resume format for ATS parsers to get past the initial screen."
};
