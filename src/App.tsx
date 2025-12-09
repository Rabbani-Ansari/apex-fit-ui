import { memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeSyncProvider } from "@/components/ThemeSyncProvider";
import { Loader2 } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import Diet from "./pages/Diet";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import ThemeSettings from "./pages/ThemeSettings";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Configure QueryClient with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

// Protected Route Wrapper
const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  // While loading auth, show a brief loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = "ProtectedRoute";

const AppRoutes = memo(() => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect logged-in users away from login page
  if (!isLoading && user && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
      <Route path="/diet" element={<ProtectedRoute><Diet /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/theme-settings" element={<ProtectedRoute><ThemeSettings /></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
});

AppRoutes.displayName = "AppRoutes";

const AppContent = memo(() => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isThemeSettings = location.pathname === '/theme-settings';
  const isShopPage = location.pathname === '/shop';

  return (
    <div className="app-container min-h-screen bg-background transition-colors duration-300 pb-24">
      <AppRoutes />
      {/* Show bottom nav on all pages except login, theme settings, and shop */}
      {!isLoginPage && !isThemeSettings && !isShopPage && <BottomNav />}
    </div>
  );
});

AppContent.displayName = "AppContent";

const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ThemeSyncProvider>
          <TooltipProvider delayDuration={0}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeSyncProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
));

App.displayName = "App";

export default App;
