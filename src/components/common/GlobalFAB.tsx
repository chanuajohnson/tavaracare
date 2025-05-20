
import { useLocation } from 'react-router-dom';
import { Fab } from "@/components/ui/fab";
import { HelpCircleIcon } from "@/utils/lazyIcons";

export function GlobalFAB() {
  const location = useLocation();
  const pathname = location.pathname;
  
  if (pathname === "/" || pathname === "/faq") {
    return null;
  }
  
  return (
    <Fab 
      className="bg-primary-500 hover:bg-primary-600 text-white"
      icon={<HelpCircleIcon className="h-5 w-5" />}
      label="Support options"
    />
  );
}
