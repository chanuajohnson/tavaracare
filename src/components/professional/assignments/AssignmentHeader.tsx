
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AssignmentHeaderProps {
  title?: string;
  status?: string;
}

export function AssignmentHeader({ title, status }: AssignmentHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-2" 
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
      
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {title || 'Care Plan Details'}
        </h1>
        
        {status && (
          <Badge
            className={
              status === 'active' ? 'bg-green-100 text-green-800' :
              status === 'completed' ? 'bg-blue-100 text-blue-800' :
              status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )}
      </div>
    </div>
  );
}
