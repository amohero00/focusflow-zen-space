
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

// Types
export type TaskCategory = "work" | "personal" | "study" | "health" | "other";

export type Task = {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  userId: string;
};

type TaskContextType = {
  tasks: Task[];
  isLoading: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt" | "userId">) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "userId">>) => void;
  deleteTask: (id: string) => void;
  getTasksByCategory: (category: TaskCategory) => Task[];
  getTasksByDate: (date: Date) => Task[];
};

// Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from local storage on mount and when user changes
  useEffect(() => {
    const loadTasks = () => {
      if (!user) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      const storedTasks = localStorage.getItem(`focusflow_tasks_${user.id}`);
      
      if (storedTasks) {
        // Parse dates properly
        const parsedTasks = JSON.parse(storedTasks, (key, value) => {
          if (key === 'dueDate' || key === 'createdAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        
        setTasks(parsedTasks);
      } else {
        // Initialize with empty tasks array for new users
        setTasks([]);
        saveTasks([], user.id);
      }
      
      setIsLoading(false);
    };

    loadTasks();
  }, [user]);

  // Save tasks to local storage
  const saveTasks = (updatedTasks: Task[], userId: string) => {
    localStorage.setItem(`focusflow_tasks_${userId}`, JSON.stringify(updatedTasks));
  };

  // Task operations
  const addTask = (task: Omit<Task, "id" | "createdAt" | "userId">) => {
    if (!user) return;
    
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      userId: user.id
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks, user.id);
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, "id" | "userId">>) => {
    if (!user) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    );
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks, user.id);
  };

  const deleteTask = (id: string) => {
    if (!user) return;
    
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks, user.id);
  };

  // Filter tasks
  const getTasksByCategory = (category: TaskCategory) => {
    return tasks.filter(task => task.category === category);
  };

  const getTasksByDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        addTask,
        updateTask,
        deleteTask,
        getTasksByCategory,
        getTasksByDate
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
