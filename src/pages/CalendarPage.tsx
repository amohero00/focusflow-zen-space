
import { PageTransition } from "@/components/layout/PageTransition";
import { CalendarView } from "@/components/calendar/Calendar";
import { Navbar } from "@/components/layout/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

const CalendarPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <Navbar />
      <main className={`container ${isMobile ? 'px-2 py-4' : 'py-8'}`}>
        <PageTransition>
          <CalendarView />
        </PageTransition>
      </main>
    </>
  );
};

export default CalendarPage;
