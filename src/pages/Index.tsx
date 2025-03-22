
import { PageTransition } from "@/components/layout/PageTransition";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Navbar } from "@/components/layout/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <Navbar />
      <main className={`container ${isMobile ? 'px-2 py-4' : 'py-8'}`}>
        <PageTransition>
          <Dashboard />
        </PageTransition>
      </main>
    </>
  );
};

export default Index;
