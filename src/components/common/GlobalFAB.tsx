
import { useLocation } from "react-router-dom";
import { Fab } from "@/components/ui/fab";

export const GlobalFAB = () => {
  const location = useLocation();
  
  // Show FAB on all pages except auth pages
  const hideFAB = location.pathname.startsWith('/auth');
  
  if (hideFAB) {
    return null;
  }

  return <Fab />;
};
