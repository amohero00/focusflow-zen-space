
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from Supabase when user changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          throw error;
        }
        
        // Transform data to match Task type
        const transformedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          category: task.category as TaskCategory,
          completed: task.completed,
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          createdAt: new Date(task.created_at),
          userId: task.user_id
        }));
        
        setTasks(transformedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  // Task operations
  const addTask = async (task: Omit<Task, "id" | "createdAt" | "userId">) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const newTask = {
        title: task.title,
        description: task.description,
        category: task.category,
        completed: task.completed,
        due_date: task.dueDate ? task.dueDate.toISOString() : null,
        created_at: new Date().toISOString(),
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Add to local state
      const createdTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        category: data.category as TaskCategory,
        completed: data.completed,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
      
      setTasks(prev => [...prev, createdTask]);
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, "id" | "userId">>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Transform updates to match database schema
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate.toISOString();
      if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt.toISOString();
      
      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks (these don't need to change as they operate on local state)
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
