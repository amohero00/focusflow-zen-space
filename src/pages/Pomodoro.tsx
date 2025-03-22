
import { PageTransition } from "@/components/layout/PageTransition";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { Navbar } from "@/components/layout/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

const Pomodoro = () => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <Navbar />
      <main className={`container ${isMobile ? 'px-2 py-4' : 'py-8'}`}>
        <PageTransition>
          <div className="mb-6">
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-display font-semibold`}>Pomodoro Timer</h1>
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
