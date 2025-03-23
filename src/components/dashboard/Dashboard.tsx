
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from '@/context/TaskContext';
import { usePomodoroContext } from '@/context/PomodoroContext';
import { useAuth } from '@/context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckSquare, Clock, ListChecks, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '../ui/progress';

// Helper function to get task completion data
const getCompletionData = (tasks: any[], days = 7) => {
  const data = [];
  const today = startOfDay(new Date());
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const completed = tasks.filter(task => 
      task.completed && 
      new Date(task.created_at).toISOString().split('T')[0] === dateStr
    ).length;
    
    data.push({
      date: format(date, 'MMM dd'),
      completed,
    });
  }
  
  return data;
};

// Helper function to get task categories
const getCategoryData = (tasks: any[]) => {
  const categories: Record<string, number> = {};
  
  tasks.forEach(task => {
    if (task.category) {
      if (categories[task.category]) {
        categories[task.category]++;
      } else {
        categories[task.category] = 1;
      }
    }
  });
  
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
};

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#FF5733'];

// Task status component
const TaskStatus = ({ tasks }: { tasks: any[] }) => {
  const completed = tasks.filter(task => task.completed).length;
  const incomplete = tasks.length - completed;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          Task Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold">{completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{incomplete}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Recent activity component
const RecentActivity = ({ tasks }: { tasks: any[] }) => {
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTasks.length > 0 ? (
          <ul className="space-y-2">
            {recentTasks.map(task => (
              <li key={task.id} className="flex items-start gap-2 pb-2 border-b last:border-0">
                <div className={`mt-0.5 h-2 w-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-amber-500'}`} />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(task.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No recent tasks</p>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { sessions, isLoading: sessionsLoading } = usePomodoroContext();
  const [completionData, setCompletionData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  
  useEffect(() => {
    if (!tasksLoading && tasks.length > 0) {
      setCompletionData(getCompletionData(tasks));
      setCategoryData(getCategoryData(tasks));
    }
  }, [tasks, tasksLoading]);

  if (tasksLoading || sessionsLoading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {user ? `Welcome, ${user.user_metadata?.name || 'User'}` : 'Welcome'}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your productivity
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Task status card */}
        <div className="lg:col-span-1">
          <TaskStatus tasks={tasks} />
        </div>
        
        {/* Tasks completion card */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Task Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {completionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">No task data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent activity */}
        <div className="lg:col-span-1">
          <RecentActivity tasks={tasks} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Category distribution */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Task Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No category data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Pomodoro Stats */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-primary" />
              Pomodoro Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-3xl font-bold">{sessions.length}</p>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">
                    {sessions.length > 0 
                      ? Math.round(sessions.reduce((acc, session) => acc + session.work_duration, 0) / sessions.length)
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Work Duration (min)</p>
                </div>
              </div>
              
              <Link to="/pomodoro">
                <Button className="w-full" variant="outline">
                  Go to Pomodoro Timer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
