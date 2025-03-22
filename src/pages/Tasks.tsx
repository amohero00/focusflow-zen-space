
import { PageTransition } from "@/components/layout/PageTransition";
import { TaskList } from "@/components/tasks/TaskList";
import { Navbar } from "@/components/layout/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

const Tasks = () => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <Navbar />
      <main className={`container ${isMobile ? 'px-2 py-4' : 'py-8'}`}>
        <PageTransition>
          <div className="mb-6">
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-display font-semibold`}>Task Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, organize, and track your tasks
            </p>
          </div>
          <TaskList />
        </PageTransition>
      </main>
    </>
  );
};

export default Tasks;
