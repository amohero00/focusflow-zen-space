import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { usePomodoroContext } from '@/context/PomodoroContext';
import { Play, Pause, SkipForward, Settings } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

type TimerMode = 'work' | 'break';

const PomodoroTimer = () => {
  const { addSession } = usePomodoroContext();
  const { user } = useAuth();
  const [timer, setTimer] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [workMinutes, setWorkMinutes] = useState<number>(25);
  const [breakMinutes, setBreakMinutes] = useState<number>(5);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setTimer(workMinutes * 60);
  }, [workMinutes]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimer((timer) => timer - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (timer === 0) {
      clearInterval(timerRef.current!);
      setIsActive(false);
      // Play sound effect
      if (audioRef.current) {
        audioRef.current.play();
      }

      // Switch modes
      if (mode === 'work') {
        handleComplete(true);
        setMode('break');
        setTimer(breakMinutes * 60);
        toast({
          title: "Break time!",
          description: "Time to take a break.",
        });
      } else {
        handleComplete(false);
        setMode('work');
        setTimer(workMinutes * 60);
        toast({
          title: "Work time!",
          description: "Time to get back to work.",
        });
      }
    }
  }, [timer, mode, workMinutes, breakMinutes, addSession, user]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const skipToNext = () => {
    setIsActive(false);
    clearInterval(timerRef.current!);

    if (mode === 'work') {
      setMode('break');
      setTimer(breakMinutes * 60);
    } else {
      setMode('work');
      setTimer(workMinutes * 60);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsOpen(false);
    setTimer(workMinutes * 60);
  };

  const handleComplete = (isWorkMode: boolean) => {
    if (user) {
      addSession({
        work_duration: workMinutes,
        break_duration: breakMinutes,
        completed: true
      });
    }

    if (isWorkMode) {
      // Play work complete sound
      const workCompleteAudio = new Audio('/sounds/work-complete.mp3');
      workCompleteAudio.play();
    } else {
      // Play break complete sound
      const breakCompleteAudio = new Audio('/sounds/break-complete.mp3');
      breakCompleteAudio.play();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold">{mode === 'work' ? 'Work' : 'Break'}</h2>
          <p className="text-5xl font-bold">{formatTime(timer)}</p>
        </div>
        <div className="flex justify-center gap-4 mb-4">
          <Button onClick={toggleTimer}>
            {isActive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
          <Button variant="outline" onClick={skipToNext}>
            <SkipForward className="mr-2 h-4 w-4" />
            Skip
          </Button>
        </div>
        <div className="text-center">
          <Button variant="secondary" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Pomodoro Settings</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSettingsSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workMinutes" className="text-right">
                  Work Time
                </Label>
                <Input
                  type="number"
                  id="workMinutes"
                  min="1"
                  max="60"
                  defaultValue={workMinutes}
                  onChange={(e) => setWorkMinutes(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="breakMinutes" className="text-right">
                  Break Time
                </Label>
                <Input
                  type="number"
                  id="breakMinutes"
                  min="1"
                  max="30"
                  defaultValue={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </form>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <audio ref={audioRef} src="/sounds/work-complete.mp3" preload="auto" />
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;
