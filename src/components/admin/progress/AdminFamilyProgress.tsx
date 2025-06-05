
import React from 'react';
import { useFamilyProgress } from '@/components/tav/hooks/useFamilyProgress';
import { AdminUserContextProvider } from '../AdminUserContextProvider';

interface AdminFamilyProgressProps {
  userId: string;
  children: (data: ReturnType<typeof useFamilyProgress>) => React.ReactNode;
}

// Create a wrapper component that will use the TAV hook with mocked auth context
const FamilyProgressWrapper: React.FC<{ 
  children: (data: ReturnType<typeof useFamilyProgress>) => React.ReactNode 
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
    const progressData = useFamilyProgress();
    
    // Restore original
    originalAuthModule.useAuth = originalUseAuth;
    
    return <>{children(progressData)}</>;
  } catch (error) {
    // Restore original on error
    originalAuthModule.useAuth = originalUseAuth;
    throw error;
  }
};

export const AdminFamilyProgress: React.FC<AdminFamilyProgressProps> = ({ userId, children }) => {
  return (
    <AdminUserContextProvider targetUserId={userId}>
      <FamilyProgressWrapper>
        {children}
      </FamilyProgressWrapper>
    </AdminUserContextProvider>
  );
};
