
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TaskProvider } from "@/context/TaskContext";
import { PomodoroContextProvider } from "@/context/PomodoroContext";
import { AnimatePresence } from "framer-motion";

import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import Pomodoro from "./pages/Pomodoro";
import CalendarPage from "./pages/CalendarPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TaskProvider>
          <PomodoroContextProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/pomodoro" element={<Pomodoro />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </PomodoroContextProvider>
        </TaskProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
