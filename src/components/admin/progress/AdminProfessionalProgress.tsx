
import React from 'react';
import { useProfessionalProgress } from '@/components/tav/hooks/useProfessionalProgress';
import { AdminUserContextProvider } from '../AdminUserContextProvider';

interface AdminProfessionalProgressProps {
  userId: string;
  children: (data: ReturnType<typeof useProfessionalProgress>) => React.ReactNode;
}

// Create a wrapper component that will use the TAV hook with mocked auth context
const ProfessionalProgressWrapper: React.FC<{ 
  children: (data: ReturnType<typeof useProfessionalProgress>) => React.ReactNode 
}> = ({ children }) => {
  // Temporarily override the useAuth hook by monkey-patching it
  const originalAuthModule = require('@/components/providers/AuthProvider');
  const mockAuth = () => {
    const { useAdminUserContext } = require('../AdminUserContextProvider');
    const { user, session } = useAdminUserContext();
    return { user, session, loading: false };
  };

  // Save original and replace
  const originalUseAuth = originalAuthModule.useAuth;
  originalAuthModule.useAuth = mockAuth;

  try {
    const progressData = useProfessionalProgress();
    
    // Restore original
    originalAuthModule.useAuth = originalUseAuth;
    
    return <>{children(progressData)}</>;
  } catch (error) {
    // Restore original on error
    originalAuthModule.useAuth = originalUseAuth;
    throw error;
  }
};

export const AdminProfessionalProgress: React.FC<AdminProfessionalProgressProps> = ({ userId, children }) => {
  return (
    <AdminUserContextProvider targetUserId={userId}>
      <ProfessionalProgressWrapper>
        {children}
      </ProfessionalProgressWrapper>
    </AdminUserContextProvider>
  );
};
