
import React from 'react';
import { useFamilyProgress } from '@/components/tav/hooks/useFamilyProgress';
import { AdminAuthOverride, useAuthOverride } from '../AdminAuthOverride';
import { useAuth } from '@/components/providers/AuthProvider';

interface AdminFamilyProgressProps {
  userId: string;
  children: (data: ReturnType<typeof useFamilyProgress>) => React.ReactNode;
}

// Component that uses the mocked auth context
const FamilyProgressWithMockedAuth: React.FC<{ 
  children: (data: ReturnType<typeof useFamilyProgress>) => React.ReactNode 
}> = ({ children }) => {
  const authOverride = useAuthOverride();
  
  // Temporarily replace useAuth hook
  const originalUseAuth = React.useRef(useAuth);
  
  // Override useAuth to return our mocked context
  React.useLayoutEffect(() => {
    if (authOverride) {
      // Store original and replace with mock
      const originalHook = originalUseAuth.current;
      (global as any).useAuthOverride = () => authOverride;
      
      return () => {
        // Restore original
        delete (global as any).useAuthOverride;
      };
    }
  }, [authOverride]);

  // Use a custom hook that respects the override
  const useAuthWithOverride = () => {
    const override = (global as any).useAuthOverride;
    if (override) {
      return override();
    }
    return useAuth();
  };

  // Monkey patch the useAuth import temporarily
  const ModulePatcher: React.FC = () => {
    React.useLayoutEffect(() => {
      // This is a hacky but working approach to override the hook
      const authModule = require('@/components/providers/AuthProvider');
      const originalUseAuth = authModule.useAuth;
      
      authModule.useAuth = useAuthWithOverride;
      
      return () => {
        authModule.useAuth = originalUseAuth;
      };
    }, []);
    
    return null;
  };

  return (
    <>
      <ModulePatcher />
      <FamilyProgressContent>{children}</FamilyProgressContent>
    </>
  );
};

const FamilyProgressContent: React.FC<{ 
  children: (data: ReturnType<typeof useFamilyProgress>) => React.ReactNode 
}> = ({ children }) => {
  const progressData = useFamilyProgress();
  return <>{children(progressData)}</>;
};

export const AdminFamilyProgress: React.FC<AdminFamilyProgressProps> = ({ userId, children }) => {
  return (
    <AdminAuthOverride targetUserId={userId}>
      <FamilyProgressWithMockedAuth>
        {children}
      </FamilyProgressWithMockedAuth>
    </AdminAuthOverride>
  );
};
