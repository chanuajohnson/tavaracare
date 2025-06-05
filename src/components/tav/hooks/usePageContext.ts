
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export interface PageContext {
  pageName: string;
  pageType: 'form' | 'dashboard' | 'landing' | 'auth' | 'other';
  availableActions: string[];
  formInfo?: {
    formId: string;
    formTitle: string;
    totalFields: number;
    completedFields: number;
  };
}

export const usePageContext = () => {
  const location = useLocation();
  const [context, setContext] = useState<PageContext>({
    pageName: 'Unknown',
    pageType: 'other',
    availableActions: []
  });

  useEffect(() => {
    const detectPageContext = (): PageContext => {
      const path = location.pathname;
      
      // Landing page
      if (path === '/') {
        return {
          pageName: 'Home',
          pageType: 'landing',
          availableActions: ['Sign up', 'Log in', 'Learn more']
        };
      }
      
      // Auth pages
      if (path.startsWith('/auth')) {
        return {
          pageName: 'Authentication',
          pageType: 'auth',
          availableActions: ['Log in', 'Sign up', 'Reset password']
        };
      }
      
      // Registration forms
      if (path.startsWith('/registration/')) {
        const role = path.split('/')[2];
        return {
          pageName: `${role} Registration`,
          pageType: 'form',
          availableActions: ['Fill form', 'Save progress', 'Get help'],
          formInfo: {
            formId: `${role}-registration`,
            formTitle: `${role} Registration Form`,
            totalFields: 5, // This would be dynamic in real implementation
            completedFields: 0
          }
        };
      }
      
      // Dashboard pages
      if (path.startsWith('/dashboard/')) {
        const role = path.split('/')[2];
        return {
          pageName: `${role} Dashboard`,
          pageType: 'dashboard',
          availableActions: ['View profile', 'Update settings', 'Get support']
        };
      }
      
      // Family specific pages
      if (path.startsWith('/family/')) {
        const subPage = path.split('/')[2];
        return {
          pageName: `Family ${subPage}`,
          pageType: subPage === 'care-assessment' || subPage === 'story' ? 'form' : 'other',
          availableActions: ['Continue journey', 'Get help', 'Save progress']
        };
      }
      
      // Default
      return {
        pageName: 'Tavara',
        pageType: 'other',
        availableActions: ['Navigate', 'Get help']
      };
    };

    setContext(detectPageContext());
  }, [location.pathname]);

  return context;
};
