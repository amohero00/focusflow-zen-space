
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export type TimerStatus = 'work' | 'break' | 'idle';

export type PomodoroSession = {
  id: string;
  user_id: string;
  name: string;
  work_duration: number;
  break_duration: number;
  created_at: string;
};

export type PomodoroContextType = {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  isLoading: boolean;
  timerStatus: TimerStatus;
  timeRemaining: number;
  progress: number;
  isActive: boolean;
  workSound: HTMLAudioElement | null;
  breakSound: HTMLAudioElement | null;
  fetchSessions: () => Promise<void>;
  createSession: (name: string, workDuration: number, breakDuration: number) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  setCurrentSession: (session: PomodoroSession | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
};

const PomodoroContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [workSound, setWorkSound] = useState<HTMLAudioElement | null>(null);
  const [breakSound, setBreakSound] = useState<HTMLAudioElement | null>(null);
  
  // Initialize audio elements
  useEffect(() => {
    const workAudio = new Audio('/sounds/work-complete.mp3');
    const breakAudio = new Audio('/sounds/break-complete.mp3');
    setWorkSound(workAudio);
    setBreakSound(breakAudio);
    
    return () => {
      workAudio.pause();
      breakAudio.pause();
    };
  }, []);

  // Calculate progress as a percentage
  const progress = currentSession 
    ? Math.round(
        ((timerStatus === 'work' 
          ? currentSession.work_duration * 60 - timeRemaining 
          : currentSession.break_duration * 60 - timeRemaining) /
         (timerStatus === 'work' 
          ? currentSession.work_duration * 60 
          : currentSession.break_duration * 60)) * 100
      )
    : 0;

  // Fetch sessions from Supabase
  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSessions(data || []);
      
      // Set default session if none is currently selected
      if (data && data.length > 0 && !currentSession) {
        setCurrentSession(data[0]);
        setTimeRemaining(data[0].work_duration * 60);
      }
    } catch (error) {
      console.error('Error fetching pomodoro sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pomodoro sessions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new session
  const createSession = async (name: string, workDuration: number, breakDuration: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert([
          {
            user_id: user.id,
            name,
            work_duration: workDuration,
            break_duration: breakDuration,
          }
        ])
        .select('*')
        .single();
        
      if (error) throw error;
      
      setSessions(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Pomodoro session created',
      });
      
      // Automatically set as current session
      setCurrentSession(data);
      setTimeRemaining(data.work_duration * 60);
      setTimerStatus('idle');
    } catch (error) {
      console.error('Error creating pomodoro session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create pomodoro session',
        variant: 'destructive',
      });
    }
  };

  // Delete a session
  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setSessions(prev => prev.filter(session => session.id !== id));
      
      // If deleted session was the current one, set to null or first available
      if (currentSession && currentSession.id === id) {
        const nextSession = sessions.find(session => session.id !== id);
        setCurrentSession(nextSession || null);
        
        if (nextSession) {
          setTimeRemaining(nextSession.work_duration * 60);
        } else {
          setTimeRemaining(0);
          setTimerStatus('idle');
          setIsActive(false);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Pomodoro session deleted',
      });
    } catch (error) {
      console.error('Error deleting pomodoro session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete pomodoro session',
        variant: 'destructive',
      });
    }
  };

  // Timer logic
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      // Timer completed
      if (timerStatus === 'work') {
        // Work timer completed, switch to break
        if (workSound) workSound.play();
        
        // Send browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Work session completed!', {
              body: 'Time for a break.',
              icon: '/favicon.svg'
            });
          } catch (error) {
            console.error('Error showing notification:', error);
          }
        }
        
        setTimerStatus('break');
        if (currentSession) {
          setTimeRemaining(currentSession.break_duration * 60);
        }
      } else {
        // Break timer completed, switch to work
        if (breakSound) breakSound.play();
        
        // Send browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Break completed!', {
              body: 'Back to work.',
              icon: '/favicon.svg'
            });
          } catch (error) {
            console.error('Error showing notification:', error);
          }
        }
        
        setTimerStatus('work');
        if (currentSession) {
          setTimeRemaining(currentSession.work_duration * 60);
        }
      }
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeRemaining, timerStatus, currentSession, workSound, breakSound]);

  // Load sessions when user is authenticated
  useEffect(() => {
    if (user) {
      fetchSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, [user]);

  // Timer controls
  const startTimer = () => {
    if (!currentSession) return;
    
    if (timerStatus === 'idle') {
      setTimerStatus('work');
      setTimeRemaining(currentSession.work_duration * 60);
    }
    
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    
    if (currentSession) {
      if (timerStatus === 'work' || timerStatus === 'idle') {
        setTimeRemaining(currentSession.work_duration * 60);
      } else {
        setTimeRemaining(currentSession.break_duration * 60);
      }
    }
  };

  const skipTimer = () => {
    if (!currentSession) return;
    
    if (timerStatus === 'work') {
      setTimerStatus('break');
      setTimeRemaining(currentSession.break_duration * 60);
    } else {
      setTimerStatus('work');
      setTimeRemaining(currentSession.work_duration * 60);
    }
  };

  const pomodoroContextValue: PomodoroContextType = {
    sessions,
    currentSession,
    isLoading,
    timerStatus,
    timeRemaining,
    progress,
    isActive,
    workSound,
    breakSound,
    fetchSessions,
    createSession,
    deleteSession,
    setCurrentSession,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
  };

  return (
    <PomodoroContext.Provider value={pomodoroContextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};

// Create the context
const PomodoroContext = createContext<PomodoroContextType | null>(null);

// Hook for easy context use
export const usePomodoroContext = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoroContext must be used within a PomodoroContextProvider');
  }
  return context;
};

export { PomodoroContext, PomodoroContextProvider };
