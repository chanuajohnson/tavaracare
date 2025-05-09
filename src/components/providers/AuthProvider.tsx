
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Extended User type to match what components expect
type ExtendedUser = {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  };
  email_confirmed_at?: string;
  confirmed_at?: string;
};

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  userRole: string | null;
  isProfileComplete: boolean;
  isLoggedIn: boolean;
  clearLastAction: () => void;
  requireAuth: (action?: string, returnPath?: string) => boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  userRole: null,
  isProfileComplete: false,
  isLoggedIn: false,
  clearLastAction: () => {},
  requireAuth: () => false,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for current session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (data?.session?.user) {
          const extendedUser = {
            ...data.session.user,
            role: data.session.user.user_metadata?.role || 'family',
          } as ExtendedUser;
          
          setUser(extendedUser);
          setIsLoggedIn(true);
          setUserRole(extendedUser.role || null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const extendedUser = {
            ...session.user,
            role: session.user.user_metadata?.role || 'family',
          } as ExtendedUser;
          
          setUser(extendedUser);
          setIsLoggedIn(true);
          setUserRole(extendedUser.role || null);
        } else {
          setUser(null);
          setIsLoggedIn(false);
          setUserRole(null);
        }
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setIsProfileComplete(false);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Add the missing methods
  const clearLastAction = () => {
    localStorage.removeItem('lastAction');
    localStorage.removeItem('lastPath');
    localStorage.removeItem('pendingFeatureId');
    localStorage.removeItem('pendingFeatureUpvote');
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('pendingMessage');
    localStorage.removeItem('pendingProfileUpdate');
  };
  
  const requireAuth = (action?: string, returnPath?: string) => {
    if (!user && !isLoading) {
      if (action) {
        localStorage.setItem('lastAction', action);
      }
      if (returnPath) {
        localStorage.setItem('lastPath', returnPath);
      }
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        userRole,
        isProfileComplete,
        isLoggedIn,
        clearLastAction,
        requireAuth,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
