
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FamilyInfoProps {
  familyName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export function FamilyInfo({ familyName, avatarUrl, createdAt }: FamilyInfoProps) {
  const getInitials = (name?: string) => {
    if (!name) return "F";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end">
        <Badge variant="outline" className="mb-1">
          {familyName || 'Family'}
        </Badge>
        {createdAt && (
          <span className="text-xs text-gray-500">
            Assigned: {new Date(createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl || ''} />
        <AvatarFallback className="bg-primary text-white text-xs">
          {getInitials(familyName)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
