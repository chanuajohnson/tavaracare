
import { Badge } from "@/components/ui/badge";

interface CareAssignmentBadgesProps {
  role?: string;
  assignmentStatus?: string;
  carePlanStatus?: string;
}

export function CareAssignmentBadges({ 
  role, 
  assignmentStatus, 
  carePlanStatus 
}: CareAssignmentBadgesProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'invited':
      case 'pending': 
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAssignmentStatusLabel = (status?: string) => {
    if (status === 'active') return 'Active';
    if (status === 'invited') return 'Invitation Pending';
    return status || 'Pending';
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {role && (
        <Badge variant="outline" className="bg-gray-50">
          {role}
        </Badge>
      )}
      
      {assignmentStatus && (
        <Badge 
          variant="outline" 
          className={assignmentStatus === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
            assignmentStatus === 'invited' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
            'bg-gray-50 text-gray-700 border-gray-200'}
        >
          {getAssignmentStatusLabel(assignmentStatus)}
        </Badge>
      )}
      
      {carePlanStatus && (
        <Badge variant="outline" className={getStatusColor(carePlanStatus)}>
          Plan: {carePlanStatus}
        </Badge>
      )}
    </div>
  );
}
