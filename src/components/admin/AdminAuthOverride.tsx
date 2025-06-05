
import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthOverrideContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  requireAuth: (action: string, redirectPath?: string) => boolean;
  clearLastAction: () => void;
  checkPendingUpvote: () => Promise<void>;
  isProfileComplete: boolean;
}

const AuthOverrideContext = createContext<AuthOverrideContextType | null>(null);

interface AdminAuthOverrideProps {
  targetUserId: string;
  children: ReactNode;
}

export const AdminAuthOverride: React.FC<AdminAuthOverrideProps> = ({ targetUserId, children }) => {
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

  const mockAuthContext: AuthOverrideContextType = {
    user: mockUser,
    session: mockSession,
    loading: false,
    signOut: async () => {},
    requireAuth: () => false,
    clearLastAction: () => {},
    checkPendingUpvote: async () => {},
    isProfileComplete: false
  };

  return (
    <AuthOverrideContext.Provider value={mockAuthContext}>
      {children}
    </AuthOverrideContext.Provider>
  );
};

export const useAuthOverride = () => {
  const context = useContext(AuthOverrideContext);
  return context;
};
