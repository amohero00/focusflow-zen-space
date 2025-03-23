import React from 'react';
import PageTransition from '@/components/layout/PageTransition';
import TaskList from '@/components/tasks/TaskList';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const Tasks = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="page-container">
        <TaskList />
      </div>
    </PageTransition>
  );
};

export default Tasks;
