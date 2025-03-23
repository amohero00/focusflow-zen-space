
import React, { useState } from "react";
import { usePomodoro, PomodoroSession } from "@/context/PomodoroContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, Edit, Pause, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PomodoroTimerProps {
  minimal?: boolean;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ minimal = false }) => {
  const { isAuthenticated } = useAuth();
  const {
    sessions,
    currentSession,
    timerStatus,
    timeRemaining,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToBreak,
    skipToWork,
    setCurrentSession,
    addSession,
    updateSession,
    deleteSession,
  } = usePomodoro();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    name: "",
    workDuration: 25,
    breakDuration: 5,
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgressPercentage = (): number => {
    if (!currentSession) return 0;
    
    const totalSeconds = timerStatus === "working" 
      ? currentSession.workDuration * 60 
      : currentSession.breakDuration * 60;
      
    return 100 - (timeRemaining / totalSeconds) * 100;
  };

  const handleCreateSession = () => {
    addSession({
      name: newSession.name,
      workDuration: newSession.workDuration,
      breakDuration: newSession.breakDuration,
    });
    
    setNewSession({
      name: "",
      workDuration: 25,
      breakDuration: 5,
    });
    
    setIsCreateDialogOpen(false);
  };

  const handleEditSession = () => {
    if (!selectedSessionId) return;
    
    updateSession(selectedSessionId, {
      name: newSession.name,
      workDuration: newSession.workDuration,
      breakDuration: newSession.breakDuration,
    });
    
    setIsEditDialogOpen(false);
  };

  const handleDeleteSession = () => {
    if (!selectedSessionId) return;
    
    deleteSession(selectedSessionId);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (session: PomodoroSession) => {
    setSelectedSessionId(session.id);
    setNewSession({
      name: session.name,
      workDuration: session.workDuration,
      breakDuration: session.breakDuration,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsDeleteDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Please sign in to use the Pomodoro timer</h3>
        <p className="text-muted-foreground mt-2">
          You need to be logged in to create and manage Pomodoro sessions.
        </p>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse flex flex-col w-full max-w-md gap-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-48 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (minimal) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pomodoro Timer</CardTitle>
          <CardDescription>
            {currentSession.name} • {timerStatus === "working" ? "Work" : "Break"} Session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div 
              className={cn(
                "text-4xl font-display font-bold text-center px-6 py-3 rounded-lg w-40",
                timerStatus === "working" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
              )}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="flex justify-center space-x-2 mt-4">
            {timerStatus === "idle" || timerStatus === "completed" ? (
              <Button onClick={startTimer}>
                <Play size={18} className="mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer}>
                <Pause size={18} className="mr-2" />
                Pause
              </Button>
            )}
            <Button variant="outline" onClick={resetTimer}>
              <RotateCcw size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="overflow-hidden">
              <div 
                className="h-2 transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: timerStatus === "working" ? "rgb(59, 130, 246)" : "rgb(34, 197, 94)"
                }}
              />
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{currentSession.name}</CardTitle>
                    <CardDescription>
                      {timerStatus === "working" 
                        ? `Working: ${currentSession.workDuration} min / Break: ${currentSession.breakDuration} min`
                        : `Break: ${currentSession.breakDuration} min / Working: ${currentSession.workDuration} min`}
                    </CardDescription>
                  </div>
                  <div 
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full",
                      timerStatus === "working" 
                        ? "bg-blue-100 text-blue-800" 
                        : timerStatus === "break"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                    )}
                  >
                    {timerStatus === "working" 
                      ? "Work Session" 
                      : timerStatus === "break"
                        ? "Break Time"
                        : "Ready"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <motion.div
                    key={timerStatus}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "text-8xl font-display font-bold text-center my-8",
                      timerStatus === "working" ? "text-primary" : "text-green-500"
                    )}
                  >
                    {formatTime(timeRemaining)}
                  </motion.div>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    {timerStatus === "idle" || timerStatus === "completed" ? (
                      <Button size="lg" onClick={startTimer}>
                        <Play size={20} className="mr-2" />
                        Start Session
                      </Button>
                    ) : (
                      <Button size="lg" onClick={pauseTimer}>
                        <Pause size={20} className="mr-2" />
                        Pause
                      </Button>
                    )}
                    
                    <Button variant="outline" size="lg" onClick={resetTimer}>
                      <RotateCcw size={20} className="mr-2" />
                      Reset
                    </Button>
                    
                    {timerStatus === "working" && (
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={skipToBreak}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle size={20} className="mr-2" />
                        Skip to Break
                      </Button>
                    )}
                    
                    {timerStatus === "break" && (
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={skipToWork}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Clock size={20} className="mr-2" />
                        Skip to Work
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Pomodoro Sessions</CardTitle>
                <CardDescription>
                  Your saved timer configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  <AnimatePresence>
                    {sessions.map((session) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div 
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                            currentSession.id === session.id 
                              ? "bg-primary/5 border-primary/30" 
                              : "hover:bg-accent"
                          )}
                          onClick={() => setCurrentSession(session.id)}
                        >
                          <div>
                            <div className="font-medium">{session.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {session.workDuration}m work / {session.breakDuration}m break
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(session);
                              }}
                            >
                              <Edit size={16} />
                              <span className="sr-only">Edit</span>
                            </Button>
                            {sessions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(session.id);
                                }}
                              >
                                <Trash2 size={16} />
                                <span className="sr-only">Delete</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus size={16} className="mr-2" />
                      Create New Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Pomodoro Session</DialogTitle>
                      <DialogDescription>
                        Customize your Pomodoro timer settings to match your workflow.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="session-name">Session Name</Label>
                        <Input
                          id="session-name"
                          placeholder="E.g., Deep Work, Quick Focus"
                          value={newSession.name}
                          onChange={(e) =>
                            setNewSession({ ...newSession, name: e.target.value })
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Work Duration: {newSession.workDuration} minutes</Label>
                        <Slider 
                          value={[newSession.workDuration]} 
                          min={5}
                          max={60}
                          step={5}
                          onValueChange={(value) => 
                            setNewSession({ ...newSession, workDuration: value[0] })
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Break Duration: {newSession.breakDuration} minutes</Label>
                        <Slider 
                          value={[newSession.breakDuration]} 
                          min={1}
                          max={30}
                          step={1}
                          onValueChange={(value) => 
                            setNewSession({ ...newSession, breakDuration: value[0] })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleCreateSession} 
                        disabled={!newSession.name}
                      >
                        Create Session
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pomodoro Session</DialogTitle>
            <DialogDescription>
              Update your Pomodoro timer settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-session-name">Session Name</Label>
              <Input
                id="edit-session-name"
                placeholder="E.g., Deep Work, Quick Focus"
                value={newSession.name}
                onChange={(e) =>
                  setNewSession({ ...newSession, name: e.target.value })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label>Work Duration: {newSession.workDuration} minutes</Label>
              <Slider 
                value={[newSession.workDuration]} 
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => 
                  setNewSession({ ...newSession, workDuration: value[0] })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label>Break Duration: {newSession.breakDuration} minutes</Label>
              <Slider 
                value={[newSession.breakDuration]} 
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => 
                  setNewSession({ ...newSession, breakDuration: value[0] })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleEditSession} 
              disabled={!newSession.name}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Pomodoro session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSession}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
