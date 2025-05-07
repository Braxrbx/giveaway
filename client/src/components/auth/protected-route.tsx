import React from 'react';
import { Redirect } from 'wouter';
import { useUser } from '@/contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="max-w-md text-center p-6 bg-[#2D3136] rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">Authentication Error</h2>
          <p className="text-[#DCDDDE]">{error.message}</p>
          <button 
            className="mt-4 px-4 py-2 bg-[#5865F2] text-white rounded hover:bg-[#4752C4]"
            onClick={() => window.location.href = '/login'}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // If route requires admin and user is not admin
  if (adminOnly && !user.isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="max-w-md text-center p-6 bg-[#2D3136] rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-[#DCDDDE]">You need administrator privileges to access this page.</p>
          <button 
            className="mt-4 px-4 py-2 bg-[#5865F2] text-white rounded hover:bg-[#4752C4]"
            onClick={() => window.location.href = '/dashboard'}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}