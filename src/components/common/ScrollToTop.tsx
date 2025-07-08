
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Additional scroll attempts to ensure it works consistently
    const timeouts = [
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 10),
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 50),
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 100)
    ];

    // Cleanup timeouts
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [pathname]);

  return null; // This component doesn't render anything
};
