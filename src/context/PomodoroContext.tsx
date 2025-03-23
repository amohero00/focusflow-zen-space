
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

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
  
  addSession: (session: Omit<PomodoroSession, "id" | "createdAt" | "userId">) => void;
  updateSession: (id: string, updates: Partial<Omit<PomodoroSession, "id" | "userId">>) => void;
  deleteSession: (id: string) => void;
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

  // Load sessions from local storage on mount and when user changes
  useEffect(() => {
    const loadSessions = () => {
      if (!user) {
        setSessions([]);
        setCurrentSession(null);
        setIsLoading(false);
        return;
      }

      const storedSessions = localStorage.getItem(`focusflow_pomodoro_${user.id}`);
      
      if (storedSessions) {
        // Parse dates properly
        const parsedSessions = JSON.parse(storedSessions, (key, value) => {
          if (key === 'createdAt') {
            return new Date(value);
          }
          return value;
        });
        
        setSessions(parsedSessions);
        
        // Set the current session to the first one
        if (parsedSessions.length > 0 && !currentSession) {
          setCurrentSession(parsedSessions[0]);
          setTimeRemaining(parsedSessions[0].workDuration * 60);
        }
      } else {
        // Create default sessions for new users
        const initialSessions = defaultSessions.map((session, index) => ({
          ...session,
          id: `default-${index + 1}`,
          createdAt: new Date(),
          userId: user.id
        }));
        
        setSessions(initialSessions);
        setCurrentSession(initialSessions[0]);
        setTimeRemaining(initialSessions[0].workDuration * 60);
        saveSessions(initialSessions, user.id);
      }
      
      setIsLoading(false);
    };

    loadSessions();
    
    // Cleanup timer when unmounting
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user]);

  // Save sessions to local storage
  const saveSessions = (updatedSessions: PomodoroSession[], userId: string) => {
    localStorage.setItem(`focusflow_pomodoro_${userId}`, JSON.stringify(updatedSessions));
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
  const addSession = (session: Omit<PomodoroSession, "id" | "createdAt" | "userId">) => {
    if (!user) return;
    
    const newSession: PomodoroSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date(),
      userId: user.id
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    saveSessions(updatedSessions, user.id);
  };

  const updateSession = (id: string, updates: Partial<Omit<PomodoroSession, "id" | "userId">>) => {
    if (!user) return;
    
    const updatedSessions = sessions.map(session => 
      session.id === id ? { ...session, ...updates } : session
    );
    
    setSessions(updatedSessions);
    saveSessions(updatedSessions, user.id);
    
    // If the current session is being updated, update it
    if (currentSession && currentSession.id === id) {
      const updatedSession = { ...currentSession, ...updates };
      setCurrentSession(updatedSession);
      
      // If timer is idle, update time remaining based on new work duration
      if (timerStatus === "idle" || timerStatus === "completed") {
        setTimeRemaining(updatedSession.workDuration * 60);
      }
    }
  };

  const deleteSession = (id: string) => {
    if (!user || sessions.length <= 1) return; // Prevent deleting the last session
    
    const updatedSessions = sessions.filter(session => session.id !== id);
    setSessions(updatedSessions);
    saveSessions(updatedSessions, user.id);
    
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
