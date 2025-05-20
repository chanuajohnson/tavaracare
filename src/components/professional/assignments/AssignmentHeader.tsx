
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssignmentHeaderProps {
  title?: string;
  status?: string;
}

export function AssignmentHeader({ title, status }: AssignmentHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="mb-4"
        onClick={() => navigate("/professional/profile")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title || 'Care Plan'}</h1>
          <p className="text-muted-foreground">Care plan assignment details</p>
        </div>

        {status && (
          <Badge
            className={`
              ${status === 'active' ? 'bg-green-100 text-green-800' :
                status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}
              px-3 py-1
            `}
          >
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </Badge>
        )}
      </div>
    </>
  );
}
