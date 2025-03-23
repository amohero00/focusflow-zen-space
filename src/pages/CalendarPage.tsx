
import React from 'react';
import { PageTransition } from '@/components/layout/PageTransition';
import { CalendarView } from '@/components/calendar/Calendar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const CalendarPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="page-container">
        <CalendarView />
      </div>
    </PageTransition>
  );
};

export default CalendarPage;
