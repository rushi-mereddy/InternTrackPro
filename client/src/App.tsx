import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Pages
import Home from "./pages/Home";
import Internships from "./pages/Internships";
import InternshipDetail from "./pages/InternshipDetail";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Training from "./pages/Training";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/not-found";

function AppContent() {
  console.log("App component rendering");
  const auth = useAuth();
  console.log("Auth context in App:", auth);
  
  // Show loading state while checking authentication
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
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
            
            {/* Protected Routes */}
            <Route path="/dashboard">
              {auth?.user ? <Dashboard /> : <Redirect to="/login" />}
            </Route>
            <Route path="/profile">
              {auth?.user ? <Profile /> : <Redirect to="/login" />}
            </Route>
            <Route path="/applications">
              {auth?.user ? <Applications /> : <Redirect to="/login" />}
            </Route>
            <Route path="/settings">
              {auth?.user ? <Settings /> : <Redirect to="/login" />}
            </Route>
            <Route path="/notifications">
              {auth?.user ? <Notifications /> : <Redirect to="/login" />}
            </Route>
            <Route path="/training">
              {auth?.user ? <Training /> : <Redirect to="/login" />}
            </Route>
            
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
