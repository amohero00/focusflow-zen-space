import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTasks, TaskCategory } from "@/context/TaskContext";
import { TaskList } from "@/components/tasks/TaskList";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { CalendarView } from "@/components/calendar/Calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, CheckSquare, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// Task category configuration
const taskCategories: { id: TaskCategory; label: string; color: string }[] = [
  { id: "work", label: "Work", color: "bg-blue-500" },
  { id: "personal", label: "Personal", color: "bg-purple-500" },
  { id: "study", label: "Study", color: "bg-amber-500" },
  { id: "health", label: "Health", color: "bg-green-500" },
  { id: "other", label: "Other", color: "bg-gray-500" },
];

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { tasks, addTask } = useTasks();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "work" as TaskCategory,
    dueDate: undefined as Date | undefined,
  });

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  // Task distribution by category
  const tasksByCategory = taskCategories.map(category => ({
    ...category,
    count: tasks.filter(task => task.category === category.id).length,
    percentage: totalTasks > 0 
      ? Math.round((tasks.filter(task => task.category === category.id).length / totalTasks) * 100)
      : 0
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleCreateTask = () => {
    addTask({
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      completed: false,
      dueDate: newTask.dueDate,
    });
    
    setNewTask({
      title: "",
      description: "",
      category: "work",
      dueDate: undefined,
    });
    
    setIsCreateDialogOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-display font-bold tracking-tight sm:text-5xl mb-6">
              Welcome to FocusFlow
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your all-in-one productivity suite for managing tasks, time, and focus.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                    <CheckSquare size={24} />
                  </div>
                  <CardTitle>Task Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Organize your tasks with categories, due dates, and descriptions.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-2">
                    <Clock size={24} />
                  </div>
                  <CardTitle>Pomodoro Timer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Boost productivity with customizable work and break sessions.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                    <CalendarDays size={24} />
                  </div>
                  <CardTitle>Calendar View</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Plan your schedule and visualize deadlines on a calendar.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth?mode=login">Log In</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-semibold">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your productivity journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tasks</CardDescription>
              <CardTitle className="text-3xl">{totalTasks}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-sm text-muted-foreground">
                {totalTasks === 0 ? "No tasks yet" : `${completedTasks} completed`}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completion Rate</CardDescription>
              <CardTitle className="text-3xl">{completionRate}%</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Task Distribution</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {tasksByCategory.map((category) => (
                  <div key={category.id} className="text-center">
                    <div className="flex justify-center mb-1">
                      <div 
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white",
                          category.color
                        )}
                      >
                        {category.count}
                      </div>
                    </div>
                    <div className="text-xs font-medium">{category.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="tasks">
              <CheckSquare size={16} className="mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="pomodoro">
              <Clock size={16} className="mr-2" />
              Pomodoro
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarDays size={16} className="mr-2" />
              Calendar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Tasks</CardTitle>
                  <div className="flex items-center gap-2">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus size={16} className="mr-2" />
                          <span className="hidden sm:inline">New Task</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create New Task</DialogTitle>
                          <DialogDescription>
                            Add a new task to your list. Fill out the details below.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="task-title">Task Title</Label>
                            <Input
                              id="task-title"
                              placeholder="Enter task title"
                              value={newTask.title}
                              onChange={(e) =>
                                setNewTask({ ...newTask, title: e.target.value })
                              }
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="task-description">Description (Optional)</Label>
                            <Textarea
                              id="task-description"
                              placeholder="Add details about this task"
                              value={newTask.description}
                              onChange={(e) =>
                                setNewTask({ ...newTask, description: e.target.value })
                              }
                              className="resize-none"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="task-category">Category</Label>
                              <Select
                                value={newTask.category}
                                onValueChange={(value: TaskCategory) =>
                                  setNewTask({ ...newTask, category: value })
                                }
                              >
                                <SelectTrigger id="task-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="work">Work</SelectItem>
                                  <SelectItem value="personal">Personal</SelectItem>
                                  <SelectItem value="study">Study</SelectItem>
                                  <SelectItem value="health">Health</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Due Date (Optional)</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newTask.dueDate ? (
                                      format(newTask.dueDate, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={newTask.dueDate}
                                    onSelect={(date) =>
                                      setNewTask({ ...newTask, dueDate: date })
                                    }
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={handleCreateTask} 
                            disabled={!newTask.title}
                          >
                            Create Task
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button asChild size="sm">
                      <Link to="/tasks">
                        <span className="sm:hidden">All</span>
                        <span className="hidden sm:inline">Tasks Accomplished</span>
                      </Link>
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Your latest tasks across all categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList showHeader={false} limit={5} hideCompletedTasks />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pomodoro" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pomodoro Timer</CardTitle>
                  <Button asChild size="sm">
                    <Link to="/pomodoro">
                      <span className="sm:hidden">Full</span>
                      <span className="hidden sm:inline">View Full Timer</span>
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  Keep focused with timed work sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PomodoroTimer minimal />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Calendar Overview</CardTitle>
                  <Button asChild size="sm">
                    <Link to="/calendar">
                      <span className="sm:hidden">Full</span>
                      <span className="hidden sm:inline">View Full Calendar</span>
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  Your scheduled tasks for the month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarView showHeader={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your list. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea
                id="task-description"
                placeholder="Add details about this task"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-category">Category</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value: TaskCategory) =>
                    setNewTask({ ...newTask, category: value })
                  }
                >
                  <SelectTrigger id="task-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.dueDate ? (
                        format(newTask.dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate}
                      onSelect={(date) =>
                        setNewTask({ ...newTask, dueDate: date })
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleCreateTask} 
              disabled={!newTask.title}
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
