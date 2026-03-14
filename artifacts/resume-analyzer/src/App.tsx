import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Upload from "@/pages/Upload";
import Dashboard from "@/pages/Dashboard";
import SkillGap from "@/pages/SkillGap";
import Interview from "@/pages/Interview";
import ResumeBuilder from "@/pages/ResumeBuilder";
import HrMode from "@/pages/HrMode";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/upload" component={Upload} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/skill-gap" component={SkillGap} />
      <Route path="/interview" component={Interview} />
      <Route path="/resume-builder" component={ResumeBuilder} />
      <Route path="/hr-mode" component={HrMode} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
