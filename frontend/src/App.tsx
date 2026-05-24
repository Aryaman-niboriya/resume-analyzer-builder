import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import AnalysisReport from "@/pages/AnalysisReport";
import Profile from "@/pages/Profile";
import { isAuthenticated } from "@/lib/auth";

const queryClient = new QueryClient();

const ProtectedRoute = ({ component: Component, path }: { component: any, path: string }) => {
  return (
    <Route path={path}>
      {() => isAuthenticated() ? <Component /> : <Redirect to="/login" replace />}
    </Route>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <ProtectedRoute path="/upload" component={Upload} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/skill-gap" component={SkillGap} />
      <ProtectedRoute path="/interview" component={Interview} />
      <ProtectedRoute path="/resume-builder" component={ResumeBuilder} />
      <ProtectedRoute path="/hr-mode" component={HrMode} />
      <ProtectedRoute path="/analysis-report" component={AnalysisReport} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
