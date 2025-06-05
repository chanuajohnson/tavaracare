
import React, { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAdminUserContext } from './AdminUserContextProvider';

// Create a context that mimics the AuthProvider structure
const MockAuthContext = React.createContext<{
  user: User | null;
  session: Session | null;
  loading: boolean;
}>({
  user: null,
  session: null,
  loading: false
});

interface MockAuthProviderProps {
  children: ReactNode;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const { user, session } = useAdminUserContext();

  return (
    <MockAuthContext.Provider value={{ user, session, loading: false }}>
      {children}
    </MockAuthContext.Provider>
  );
};

// Hook that overrides useAuth for admin contexts
export const useMockAuth = () => {
  const context = React.useContext(MockAuthContext);
  return {
    user: context.user,
    session: context.session,
    loading: context.loading
  };
};
