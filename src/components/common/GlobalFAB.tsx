
import { useLocation } from 'react-router-dom';
import { Fab } from "@/components/ui/fab";
import { HelpCircle } from 'lucide-react';

export function GlobalFAB() {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Only hide on the home page
  if (pathname === "/") {
    return null;
  }
  
  return (
    <Fab 
      className="bg-primary-500 hover:bg-primary-600 text-white"
      icon={<HelpCircle className="h-5 w-5" />}
      label="Support options"
    />
  );
}
