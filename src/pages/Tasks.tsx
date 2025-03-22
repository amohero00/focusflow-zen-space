
import { PageTransition } from "@/components/layout/PageTransition";
import { TaskList } from "@/components/tasks/TaskList";
import { Navbar } from "@/components/layout/Navbar";

const Tasks = () => {
  return (
    <>
      <Navbar />
      <main className="container py-8">
        <PageTransition>
          <div className="mb-6">
            <h1 className="text-3xl font-display font-semibold">Task Management</h1>
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
