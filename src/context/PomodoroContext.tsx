
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Types
export type PomodoroSession = {
  id: string;
  name: string;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  createdAt: Date;
  userId: string;
};

export type TimerStatus = "idle" | "working" | "break" | "completed";

type PomodoroContextType = {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  isLoading: boolean;
  timerStatus: TimerStatus;
  timeRemaining: number; // in seconds
  activeSessionId: string | null;
  
  addSession: (session: Omit<PomodoroSession, "id" | "createdAt" | "userId">) => Promise<void>;
  updateSession: (id: string, updates: Partial<Omit<PomodoroSession, "id" | "userId">>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  setCurrentSession: (sessionId: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipToBreak: () => void;
  skipToWork: () => void;
};

// Create context
const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

// Default Pomodoro sessions
const defaultSessions: Omit<PomodoroSession, "id" | "createdAt" | "userId">[] = [
  {
    name: "Classic Pomodoro",
    workDuration: 25,
    breakDuration: 5
  },
  {
    name: "Deep Work",
    workDuration: 50,
    breakDuration: 10
  },
  {
    name: "Quick Focus",
    workDuration: 15,
    breakDuration: 3
  }
];

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);

  // Load sessions from Supabase on mount and when user changes
  useEffect(() => {
    const loadSessions = async () => {
      if (!user) {
        setSessions([]);
        setCurrentSession(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user's sessions from Supabase
        const { data, error } = await supabase
          .from('pomodoro_sessions')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          throw error;
        }
        
        if (data.length > 0) {
          // Transform data to match PomodoroSession type
          const transformedSessions: PomodoroSession[] = data.map(session => ({
            id: session.id,
            name: session.name,
            workDuration: session.work_duration,
            breakDuration: session.break_duration,
            createdAt: new Date(session.created_at),
            userId: session.user_id
          }));
          
          setSessions(transformedSessions);
          
          // Set the current session to the first one
          setCurrentSession(transformedSessions[0]);
          setTimeRemaining(transformedSessions[0].workDuration * 60);
        } else {
          // Create default sessions for new users
          await createDefaultSessions(user.id);
        }
      } catch (error) {
        console.error("Error loading pomodoro sessions:", error);
        toast.error("Failed to load pomodoro sessions");
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
    
    // Cleanup timer when unmounting
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user]);

  // Create default sessions for new users
  const createDefaultSessions = async (userId: string) => {
    try {
      const sessionsToCreate = defaultSessions.map(session => ({
        name: session.name,
        work_duration: session.workDuration,
        break_duration: session.breakDuration,
        user_id: userId,
        created_at: new Date().toISOString()
      }));
      
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert(sessionsToCreate)
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform data to match PomodoroSession type
        const transformedSessions: PomodoroSession[] = data.map(session => ({
          id: session.id,
          name: session.name,
          workDuration: session.work_duration,
          breakDuration: session.break_duration,
          createdAt: new Date(session.created_at),
          userId: session.user_id
        }));
        
        setSessions(transformedSessions);
        setCurrentSession(transformedSessions[0]);
        setTimeRemaining(transformedSessions[0].workDuration * 60);
      }
    } catch (error) {
      console.error("Error creating default pomodoro sessions:", error);
    }
  };

  // Timer logic
  useEffect(() => {
    if (timerStatus === "working" || timerStatus === "break") {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Handle timer completion
            if (timerStatus === "working") {
              // Switch to break
              setTimerStatus("break");
              if (currentSession) {
                return currentSession.breakDuration * 60;
              }
            } else {
              // Complete cycle
              setTimerStatus("completed");
              clearInterval(timerRef.current!);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerStatus, currentSession]);

  // Session operations
  const addSession = async (session: Omit<PomodoroSession, "id" | "createdAt" | "userId">) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const newSession = {
        name: session.name,
        work_duration: session.workDuration,
        break_duration: session.breakDuration,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert(newSession)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Add to local state
      const createdSession: PomodoroSession = {
        id: data.id,
        name: data.name,
        workDuration: data.work_duration,
        breakDuration: data.break_duration,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
      
      setSessions(prev => [...prev, createdSession]);
      toast.success("Pomodoro session created successfully");
    } catch (error) {
      console.error("Error adding pomodoro session:", error);
      toast.error("Failed to create pomodoro session");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSession = async (id: string, updates: Partial<Omit<PomodoroSession, "id" | "userId">>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Transform updates to match database schema
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.workDuration !== undefined) dbUpdates.work_duration = updates.workDuration;
      if (updates.breakDuration !== undefined) dbUpdates.break_duration = updates.breakDuration;
      if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt.toISOString();
      
      const { error } = await supabase
        .from('pomodoro_sessions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedSessions = sessions.map(session => 
        session.id === id ? { ...session, ...updates } : session
      );
      
      setSessions(updatedSessions);
      
      // If the current session is being updated, update it
      if (currentSession && currentSession.id === id) {
        const updatedSession = { ...currentSession, ...updates };
        setCurrentSession(updatedSession);
        
        // If timer is idle, update time remaining based on new work duration
        if (timerStatus === "idle" || timerStatus === "completed") {
          setTimeRemaining(updatedSession.workDuration * 60);
        }
      }
      
      toast.success("Pomodoro session updated successfully");
    } catch (error) {
      console.error("Error updating pomodoro session:", error);
      toast.error("Failed to update pomodoro session");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    if (!user || sessions.length <= 1) return; // Prevent deleting the last session
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('pomodoro_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedSessions = sessions.filter(session => session.id !== id);
      setSessions(updatedSessions);
      
      // If the current session is being deleted, set the first available session as current
      if (currentSession && currentSession.id === id) {
        const newCurrentSession = updatedSessions[0];
        setCurrentSession(newCurrentSession);
        setTimeRemaining(newCurrentSession.workDuration * 60);
        setTimerStatus("idle");
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      
      toast.success("Pomodoro session deleted successfully");
    } catch (error) {
      console.error("Error deleting pomodoro session:", error);
      toast.error("Failed to delete pomodoro session");
    } finally {
      setIsLoading(false);
    }
  };

  // Timer controls
  const startTimer = () => {
    if (!currentSession) return;
    
    if (timerStatus === "idle" || timerStatus === "completed") {
      setTimerStatus("working");
      setTimeRemaining(currentSession.workDuration * 60);
      setActiveSessionId(currentSession.id);
    } else if (timerStatus === "working" || timerStatus === "break") {
      setTimerStatus(timerStatus); // Resume from paused state
    }
  };
  
  const pauseTimer = () => {
    if (timerStatus === "working" || timerStatus === "break") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const resetTimer = () => {
    if (!currentSession) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setTimerStatus("idle");
    setTimeRemaining(currentSession.workDuration * 60);
    setActiveSessionId(null);
  };
  
  const skipToBreak = () => {
    if (!currentSession) return;
    
    setTimerStatus("break");
    setTimeRemaining(currentSession.breakDuration * 60);
  };
  
  const skipToWork = () => {
    if (!currentSession) return;
    
    setTimerStatus("working");
    setTimeRemaining(currentSession.workDuration * 60);
  };
  
  const selectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setTimeRemaining(session.workDuration * 60);
      setTimerStatus("idle");
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  return (
    <PomodoroContext.Provider
      value={{
        sessions,
        currentSession,
        isLoading,
        timerStatus,
        timeRemaining,
        activeSessionId,
        
        addSession,
        updateSession,
        deleteSession,
        setCurrentSession: selectSession,
        startTimer,
        pauseTimer,
        resetTimer,
        skipToBreak,
        skipToWork
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
};
