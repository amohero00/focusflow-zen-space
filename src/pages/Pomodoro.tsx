
import { PageTransition } from "@/components/layout/PageTransition";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { Navbar } from "@/components/layout/Navbar";

const Pomodoro = () => {
  return (
    <>
      <Navbar />
      <main className="container py-8">
        <PageTransition>
          <div className="mb-6">
            <h1 className="text-3xl font-display font-semibold">Pomodoro Timer</h1>
            <p className="text-muted-foreground mt-1">
              Stay focused with timed work and break sessions
            </p>
          </div>
          <PomodoroTimer />
        </PageTransition>
      </main>
    </>
  );
};

export default Pomodoro;
