import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import CreatorProfile from "./pages/CreatorProfile";
import Calculator from "./pages/Calculator";
import AdminHub from "./pages/AdminHub";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";
import { useXpr } from "./contexts/XprContext";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isMaintenanceMode, isAdmin } = useXpr();

  // If maintenance mode is on and user is NOT admin, block all routes
  if (isMaintenanceMode && !isAdmin) {
    return <Maintenance />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/admin" element={<AdminHub />} />
      <Route path="/tip/:handle" element={<CreatorProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;