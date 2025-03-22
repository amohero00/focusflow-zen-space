
import { PageTransition } from "@/components/layout/PageTransition";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Navbar } from "@/components/layout/Navbar";

const Index = () => {
  return (
    <>
      <Navbar />
      <main className="container py-8">
        <PageTransition>
          <Dashboard />
        </PageTransition>
      </main>
    </>
  );
};

export default Index;
