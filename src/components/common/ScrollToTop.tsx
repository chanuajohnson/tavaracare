
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // On browser back/forward (POP), let the browser restore the prior scroll
    // position naturally — important for blog → CTA → back flows so readers
    // return to where they left off in the article.
    if (navigationType === 'POP') {
      return;
    }

    // Forward navigation (PUSH/REPLACE): scroll to top immediately.
    window.scrollTo({ top: 0, behavior: 'instant' });

    const timeouts = [
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 10),
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 50),
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 100)
    ];

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [pathname, navigationType]);

  return null;
};
