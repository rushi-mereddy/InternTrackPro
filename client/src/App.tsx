import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layout
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Pages
import Home from "@/pages/Home";
import Internships from "@/pages/Internships";
import InternshipDetail from "@/pages/InternshipDetail";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Applications from "@/pages/Applications";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <Header />
        
        <main className="flex-grow">
          <Switch>
            {/* Public Routes */}
            <Route path="/" component={Home} />
            <Route path="/internships" component={Internships} />
            <Route path="/internships/:id" component={InternshipDetail} />
            <Route path="/jobs" component={Jobs} />
            <Route path="/jobs/:id" component={JobDetail} />
            <Route path="/courses" component={Courses} />
            <Route path="/courses/:id" component={CourseDetail} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            
            {/* Protected Routes - Only accessible if user is logged in */}
            {user && (
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/profile" component={Profile} />
                <Route path="/applications" component={Applications} />
              </Switch>
            )}
            
            {/* Fallback */}
            <Route component={NotFound} />
          </Switch>
        </main>
        
        <Footer />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
