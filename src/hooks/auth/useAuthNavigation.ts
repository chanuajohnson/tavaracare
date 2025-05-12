
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthNavigation = () => {
  const navigationInProgressRef = useRef(false);
  const lastPathRef = useRef<string | null>(null);
  const initialRedirectionDoneRef = useRef(false);
  const navigate = useNavigate();

  const safeNavigate = (path: string, options: { 
    replace?: boolean, 
    skipCheck?: boolean,
    state?: Record<string, any>
  } = {}) => {
    if (navigationInProgressRef.current && !options.skipCheck) {
      console.log(`[AuthProvider] Navigation already in progress, skipping to: ${path}`);
      return;
    }
    
    if (lastPathRef.current === path && !options.skipCheck) {
      console.log(`[AuthProvider] Already at path: ${path}, skipping navigation`);
      return;
    }
    
    lastPathRef.current = path;
    navigationInProgressRef.current = true;
    console.log(`[AuthProvider] Navigating to: ${path}`);
    
    if (options.replace) {
      navigate(path, { replace: true, state: options.state });
    } else {
      navigate(path, { state: options.state });
    }
    
    setTimeout(() => {
      navigationInProgressRef.current = false;
    }, 500);
  };

  return {
    safeNavigate,
    initialRedirectionDoneRef,
    navigationInProgressRef,
    lastPathRef
  };
};
