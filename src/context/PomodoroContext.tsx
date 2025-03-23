
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

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

// Create audio elements
const createAudio = (src: string) => {
  const audio = new Audio();
  audio.src = src;
  audio.preload = 'auto';
  return audio;
};

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const workCompleteSound = useRef<HTMLAudioElement | null>(null);
  const breakCompleteSound = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    // Create audio elements once when component mounts
    workCompleteSound.current = createAudio('/sounds/work-complete.mp3');
    breakCompleteSound.current = createAudio('/sounds/break-complete.mp3');

    return () => {
      // Clean up
      workCompleteSound.current = null;
      breakCompleteSound.current = null;
    };
  }, []);

  // Load sessions from Supabase when user changes
  useEffect(() => {
    const loadSessions = async () => {
      if (!user) {
        setSessions([]);
        setCurrentSession(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get sessions from Supabase
        const { data, error } = await supabase
          .from('pomodoro_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data.length === 0) {
          // Create default sessions for new users
          const defaultSessionPromises = defaultSessions.map(session => 
            supabase
              .from('pomodoro_sessions')
              .insert({
                name: session.name,
                work_duration: session.workDuration,
                break_duration: session.breakDuration,
                user_id: user.id
              })
              .select()
          );
          
          const results = await Promise.all(defaultSessionPromises);
          
          // Check for errors
          const errors = results.filter(result => result.error);
          if (errors.length > 0) {
            throw errors[0].error;
          }
          
          // Get all sessions again after creating default ones
          const { data: newData, error: newError } = await supabase
            .from('pomodoro_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
            
          if (newError) throw newError;
          
          // Format sessions
          const formattedSessions: PomodoroSession[] = newData.map(session => ({
            id: session.id,
            name: session.name,
            workDuration: session.work_duration,
            breakDuration: session.break_duration,
            createdAt: new Date(session.created_at),
            userId: session.user_id
          }));
          
          setSessions(formattedSessions);
          
          if (formattedSessions.length > 0) {
            setCurrentSession(formattedSessions[0]);
            setTimeRemaining(formattedSessions[0].workDuration * 60);
          }
        } else {
          // Format existing sessions
          const formattedSessions: PomodoroSession[] = data.map(session => ({
            id: session.id,
            name: session.name,
            workDuration: session.work_duration,
            breakDuration: session.break_duration,
            createdAt: new Date(session.created_at),
            userId: session.user_id
          }));
          
          setSessions(formattedSessions);
          
          if (formattedSessions.length > 0 && !currentSession) {
            setCurrentSession(formattedSessions[0]);
            setTimeRemaining(formattedSessions[0].workDuration * 60);
          }
        }
      } catch (error: any) {
        console.error("Error loading pomodoro sessions:", error.message);
        toast({
          title: "Error loading pomodoro sessions",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
      setIsLoading(false);
    }
    
    // Cleanup timer when unmounting
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, isAuthenticated]);

  // Timer logic
  useEffect(() => {
    if (timerStatus === "working" || timerStatus === "break") {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Handle timer completion
            if (timerStatus === "working") {
              // Play work complete sound
              if (workCompleteSound.current) {
                workCompleteSound.current.play().catch(e => console.error("Error playing sound:", e));
              }
              
              // Switch to break
              setTimerStatus("break");
              
              // Notify user
              new Notification("Work session complete!", {
                body: "Time for a break!",
                icon: "/favicon.svg"
              }).catch(e => console.error("Notification error:", e));
              
              if (currentSession) {
                return currentSession.breakDuration * 60;
              }
            } else {
              // Play break complete sound
              if (breakCompleteSound.current) {
                breakCompleteSound.current.play().catch(e => console.error("Error playing sound:", e));
              }
              
              // Complete cycle
              setTimerStatus("completed");
              clearInterval(timerRef.current!);
              
              // Notify user
              new Notification("Break complete!", {
                body: "Ready for next work session?",
                icon: "/favicon.svg"
              }).catch(e => console.error("Notification error:", e));
              
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
      const newSession = {
        name: session.name,
        work_duration: session.workDuration,
        break_duration: session.breakDuration,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert(newSession)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the new session to state
      const formattedSession: PomodoroSession = {
        id: data.id,
        name: data.name,
        workDuration: data.work_duration,
        breakDuration: data.break_duration,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
      
      setSessions(prev => [...prev, formattedSession]);
      
    } catch (error: any) {
      console.error("Error adding pomodoro session:", error.message);
      toast({
        title: "Error adding pomodoro session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateSession = async (id: string, updates: Partial<Omit<PomodoroSession, "id" | "userId">>) => {
    if (!user) return;
    
    try {
      // Format updates for Supabase
      const supabaseUpdates: any = {};
      
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.workDuration !== undefined) supabaseUpdates.work_duration = updates.workDuration;
      if (updates.breakDuration !== undefined) supabaseUpdates.break_duration = updates.breakDuration;
      
      const { error } = await supabase
        .from('pomodoro_sessions')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update sessions in state
      setSessions(prev => prev.map(session => 
        session.id === id ? { ...session, ...updates } : session
      ));
      
      // If the current session is being updated, update it
      if (currentSession && currentSession.id === id) {
        const updatedSession = { ...currentSession, ...updates };
        setCurrentSession(updatedSession);
        
        // If timer is idle, update time remaining based on new work duration
        if (timerStatus === "idle" || timerStatus === "completed") {
          setTimeRemaining(updatedSession.workDuration * 60);
        }
      }
      
    } catch (error: any) {
      console.error("Error updating pomodoro session:", error.message);
      toast({
        title: "Error updating pomodoro session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteSession = async (id: string) => {
    if (!user || sessions.length <= 1) return; // Prevent deleting the last session
    
    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Remove the session from state
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
      
    } catch (error: any) {
      console.error("Error deleting pomodoro session:", error.message);
      toast({
        title: "Error deleting pomodoro session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Timer controls
  const startTimer = () => {
    if (!currentSession) return;
    
    // Request notification permission if needed
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
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
    
    // Play work complete sound
    if (workCompleteSound.current) {
      workCompleteSound.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };
  
  const skipToWork = () => {
    if (!currentSession) return;
    
    setTimerStatus("working");
    setTimeRemaining(currentSession.workDuration * 60);
    
    // Play break complete sound
    if (breakCompleteSound.current) {
      breakCompleteSound.current.play().catch(e => console.error("Error playing sound:", e));
    }
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
