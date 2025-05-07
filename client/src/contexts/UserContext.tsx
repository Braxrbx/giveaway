import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: number;
  username: string;
  discordId: string;
  isStaff: boolean;
  isAdmin: boolean;
  avatarUrl: string | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, redirect to login
            setUser(null);
            setLocation('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setUser(userData);
        
        // If not staff, logout
        if (!userData.isStaff && !userData.isAdmin) {
          alert('Only staff members can access this dashboard.');
          logout();
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [setLocation]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setLocation('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}