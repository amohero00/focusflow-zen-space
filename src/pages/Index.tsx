import React from 'react';
import PageTransition from '@/components/layout/PageTransition';
import Dashboard from '@/components/dashboard/Dashboard';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <PageTransition>
      <Navbar />
      <Dashboard />
    </PageTransition>
  );
};

export default Index;
