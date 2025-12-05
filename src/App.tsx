import { memo, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import Diet from "./pages/Diet";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
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

const AppRoutes = memo(() => {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/workout" element={<Workout />} />
      <Route path="/diet" element={<Diet />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
});

AppRoutes.displayName = "AppRoutes";

const AppContent = memo(() => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="app-container min-h-screen bg-background">
      <AppRoutes />
      <BottomNav />
    </div>
  );
});

AppContent.displayName = "AppContent";

const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={0}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
));

App.displayName = "App";

export default App;
