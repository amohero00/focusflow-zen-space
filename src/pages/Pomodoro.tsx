import React from 'react';
import PageTransition from '@/components/layout/PageTransition';
import PomodoroTimer from '@/components/pomodoro/PomodoroTimer';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const Pomodoro = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="page-container">
        <PomodoroTimer />
      </div>
    </PageTransition>
  );
};

export default Pomodoro;
