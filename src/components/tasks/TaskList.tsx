import React, { useState } from "react";
import { TaskItem } from "./TaskItem";
import { useTasks, Task, TaskCategory } from "@/context/TaskContext";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, ListFilter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskListProps {
  showHeader?: boolean;
  limit?: number;
  showCreate?: boolean;
  hideCompletedTasks?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  showHeader = true,
  limit,
  showCreate = true,
  hideCompletedTasks = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { tasks, addTask, isLoading } = useTasks();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "work" as TaskCategory,
    dueDate: undefined as Date | undefined,
  });
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");

  const filteredTasks = tasks
    .filter((task) => {
      // Filter by completion status if needed
      if (hideCompletedTasks && task.completed) return false;
      
      // Filter by category
      if (activeTab !== "all" && task.category !== activeTab) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "createdAt") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "category") {
        return a.category.localeCompare(b.category);
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  const limitedTasks = limit ? filteredTasks.slice(0, limit) : filteredTasks;

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

  const categoriesToShow = [
    { value: "all", label: "All Tasks" },
    { value: "work", label: "Work" },
    { value: "personal", label: "Personal" },
    { value: "study", label: "Study" },
    { value: "health", label: "Health" },
    { value: "other", label: "Other" },
  ];

  const sortOptions = [
    { value: "dueDate", label: "Due Date" },
    { value: "createdAt", label: "Date Created" },
    { value: "category", label: "Category" },
    { value: "title", label: "Title" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Please sign in to see your tasks</h3>
        <p className="text-muted-foreground mt-2">
          You need to be logged in to create and manage tasks.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse flex flex-col w-full max-w-md gap-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-12 bg-muted rounded w-full"></div>
          <div className="h-12 bg-muted rounded w-full"></div>
          <div className="h-12 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
              {categoriesToShow.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <ListFilter size={16} className="mr-2" />
                  <span>Sort</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-2">
                <div className="space-y-1">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSortBy(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {showCreate && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9">
                    <Plus size={16} className="mr-2" />
                    <span>New Task</span>
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
            )}
          </div>
        </div>
      )}

      {limitedTasks.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-muted-foreground mt-2">
            {activeTab !== "all"
              ? `You don't have any ${activeTab} tasks yet.`
              : "Your task list is empty. Start by creating a new task."}
          </p>
          {showCreate && (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Task
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
          )}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            layout 
            className="space-y-2"
          >
            {limitedTasks.map((task: Task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <TaskItem task={task} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

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
              <Label htmlFor="task-title-dialog">Task Title</Label>
              <Input
                id="task-title-dialog"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description-dialog">Description (Optional)</Label>
              <Textarea
                id="task-description-dialog"
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
                <Label htmlFor="task-category-dialog">Category</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value: TaskCategory) =>
                    setNewTask({ ...newTask, category: value })
                  }
                >
                  <SelectTrigger id="task-category-dialog">
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
    </div>
  );
};
