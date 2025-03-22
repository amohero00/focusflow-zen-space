
import { PageTransition } from "@/components/layout/PageTransition";
import { CalendarView } from "@/components/calendar/Calendar";
import { Navbar } from "@/components/layout/Navbar";

const CalendarPage = () => {
  return (
    <>
      <Navbar />
      <main className="container py-8">
        <PageTransition>
          <CalendarView />
        </PageTransition>
      </main>
    </>
  );
};

export default CalendarPage;
