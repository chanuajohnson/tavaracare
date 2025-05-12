
import { cn } from "@/lib/utils";

interface CareAssignmentStatusProps {
  status?: string;
}

export function CareAssignmentStatus({ status }: CareAssignmentStatusProps) {
  const getAssignmentStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'border-l-green-500';
      case 'invited':
        return 'border-l-amber-500';
      case 'declined':
        return 'border-l-red-500';
      case 'removed':
        return 'border-l-gray-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className={cn('border-l-4', getAssignmentStatusColor(status))} />
  );
}
