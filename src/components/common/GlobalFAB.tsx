
import { useLocation } from 'react-router-dom';
import { Fab } from "@/components/ui/fab";

export function GlobalFAB() {
  const location = useLocation();
  const pathname = location.pathname;
  
  if (pathname === "/" || pathname === "/faq") {
    return null;
  }
  
  return (
    <Fab 
      className="bg-primary-500 hover:bg-primary-600 text-white"
      label="Support options"
    />
  );
}
