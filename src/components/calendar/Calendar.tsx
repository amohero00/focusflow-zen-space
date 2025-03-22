
import React, { useState } from "react";
import { useTasks, Task } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskList } from "@/components/tasks/TaskList";
import { format, isToday, isEqual, isSameDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CalendarProps {
  showHeader?: boolean;
}

export const CalendarView: React.FC<CalendarProps> = ({ showHeader = true }) => {
  const { isAuthenticated } = useAuth();
  const { tasks } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get tasks for the selected date
  const tasksForSelectedDate = tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isSameDay(new Date(task.dueDate), selectedDate);
  });

  // Create a map of dates to task counts for highlighting calendar days
  const dateToTaskCount = tasks.reduce((acc, task) => {
    if (!task.dueDate) return acc;
    
    const dateStr = format(new Date(task.dueDate), "yyyy-MM-dd");
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    
    return acc;
  }, {} as Record<string, number>);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Please sign in to view your calendar</h3>
        <p className="text-muted-foreground mt-2">
          You need to be logged in to see your task schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-semibold">Calendar</h2>
            <p className="text-muted-foreground">
              Plan your tasks and view upcoming deadlines
            </p>
          </div>
          <div>
            <div className="text-right">
              <div className="text-xl font-medium">{format(selectedDate, "MMMM yyyy")}</div>
              <div className="text-sm text-muted-foreground">
                {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE, MMM d")}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selected Date</CardTitle>
              <CardDescription>
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <CalendarUI
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="border rounded-md p-3 pointer-events-auto"
                modifiers={{
                  hasTasks: (date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    return !!dateToTaskCount[dateStr];
                  },
                }}
                modifiersStyles={{
                  hasTasks: {
                    fontWeight: "bold",
                  },
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const count = dateToTaskCount[dateStr] || 0;
                    const isSelected = isSameDay(date, selectedDate);
                    
                    return (
                      <div className="relative h-full w-full p-2 flex items-center justify-center">
                        <div>{date.getDate()}</div>
                        {count > 0 && (
                          <div 
                            className={cn(
                              "absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-1 rounded-full",
                              isSelected ? "bg-white" : "bg-primary"
                            )}
                          />
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon size={18} className="mr-2" />
                Tasks for {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
              <CardDescription>
                {tasksForSelectedDate.length === 0
                  ? "No tasks scheduled for this day"
                  : `${tasksForSelectedDate.length} task${tasksForSelectedDate.length === 1 ? "" : "s"} scheduled`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No tasks scheduled for this day. Add a task to get started.
                  </p>
                </div>
              ) : (
                <motion.div
                  key={selectedDate.toISOString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskList 
                    showHeader={false} 
                    limit={tasksForSelectedDate.length} 
                    hideCompletedTasks={false}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
