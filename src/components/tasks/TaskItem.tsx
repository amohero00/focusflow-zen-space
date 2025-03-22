
import React, { useState } from "react";
import { Task, useTasks } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { CalendarIcon, Clock, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTask, deleteTask } = useTasks();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleToggleComplete = () => {
    updateTask(task.id, { completed: !task.completed });
  };

  const handleDeleteTask = () => {
    deleteTask(task.id);
    setIsDeleteDialogOpen(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "personal":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "study":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "health":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-4 rounded-lg border bg-card transition-colors",
        task.completed
          ? "bg-muted/50 border-muted"
          : "hover:border-border/80"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleComplete}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3
              className={cn(
                "text-base font-medium leading-tight",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium capitalize border",
                  getCategoryColor(task.category)
                )}
              >
                {task.category}
              </Badge>
            </div>
          </div>
          
          {task.description && (
            <p
              className={cn(
                "text-sm text-muted-foreground mt-1 line-clamp-2",
                task.completed && "line-through"
              )}
            >
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            {task.dueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon size={12} className="mr-1" />
                <span
                  className={cn(
                    isOverdue && "text-destructive font-medium"
                  )}
                >
                  {isOverdue ? "Overdue: " : "Due: "}
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock size={12} className="mr-1" />
              <span>Created {format(new Date(task.createdAt), "MMM d")}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 self-start">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 size={16} />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
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
              onClick={handleDeleteTask}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
