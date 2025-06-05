
import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AdminUserContextType {
  user: User | null;
  session: Session | null;
}

const AdminUserContext = createContext<AdminUserContextType>({ user: null, session: null });

interface AdminUserContextProviderProps {
  targetUserId: string;
  children: ReactNode;
}

export const AdminUserContextProvider: React.FC<AdminUserContextProviderProps> = ({ 
  targetUserId, 
  children 
}) => {
  // Create a mock user object for the target user
  const mockUser: User = {
    id: targetUserId,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: `admin-mock-${targetUserId}@tavara.care`,
    role: 'authenticated'
  };

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser
  };

  return (
    <AdminUserContext.Provider value={{ user: mockUser, session: mockSession }}>
      {children}
    </AdminUserContext.Provider>
  );
};

export const useAdminUserContext = () => useContext(AdminUserContext);
