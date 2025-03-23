
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

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
  addTask: (task: Omit<Task, "id" | "createdAt" | "userId">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "userId">>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByCategory: (category: TaskCategory) => Task[];
  getTasksByDate: (date: Date) => Task[];
};

// Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks when user changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get tasks from Supabase
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Convert Supabase data format to our Task type
        const formattedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          category: task.category as TaskCategory,
          completed: task.completed,
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          createdAt: new Date(task.created_at),
          userId: task.user_id
        }));

        setTasks(formattedTasks);
      } catch (error: any) {
        console.error("Error loading tasks:", error.message);
        toast({
          title: "Error loading tasks",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Task operations
  const addTask = async (task: Omit<Task, "id" | "createdAt" | "userId">) => {
    if (!user) return;
    
    try {
      const newTask = {
        title: task.title,
        description: task.description || null,
        category: task.category,
        completed: task.completed,
        due_date: task.dueDate ? task.dueDate.toISOString() : null,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the new task to state
      const formattedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        category: data.category as TaskCategory,
        completed: data.completed,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
      
      setTasks(prev => [formattedTask, ...prev]);
      
    } catch (error: any) {
      console.error("Error adding task:", error.message);
      toast({
        title: "Error adding task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, "id" | "userId">>) => {
    if (!user) return;
    
    try {
      // Format updates for Supabase
      const supabaseUpdates: any = {};
      
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description || null;
      if (updates.category !== undefined) supabaseUpdates.category = updates.category;
      if (updates.completed !== undefined) supabaseUpdates.completed = updates.completed;
      if (updates.dueDate !== undefined) supabaseUpdates.due_date = updates.dueDate ? updates.dueDate.toISOString() : null;
      
      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update the task in state
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
      
    } catch (error: any) {
      console.error("Error updating task:", error.message);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Remove the task from state
      setTasks(prev => prev.filter(task => task.id !== id));
      
    } catch (error: any) {
      console.error("Error deleting task:", error.message);
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    }
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
