
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Handle general redirects from query params
    const params = new URLSearchParams(location.search);
    const routeParam = params.get('route');
    
    // Handle regular route redirects
    if (routeParam) {
      const newUrl = '/' + routeParam;
      navigate(newUrl, { replace: true });
    }
  }, [location, navigate]);
  
  return null;
}
