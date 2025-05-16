
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, User } from "lucide-react";

interface FamilyDetailsCardProps {
  familyProfile?: {
    id?: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
    phone_number?: string;
    address?: string;
  };
}

export function FamilyDetailsCard({ familyProfile }: FamilyDetailsCardProps) {
  if (!familyProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-gray-500">Family profile information not available</p>
        </CardContent>
      </Card>
    );
  }

  // Get initials for the avatar fallback
  const getInitials = (name: string = 'Family Profile'): string => {
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={familyProfile.avatar_url || ''} alt={familyProfile.full_name} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {getInitials(familyProfile.full_name || '')}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold mt-3">{familyProfile.full_name || 'Family Profile'}</h2>
        </div>

        <div className="space-y-4">
          {familyProfile.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{familyProfile.email}</span>
            </div>
          )}
          
          {familyProfile.phone_number && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{familyProfile.phone_number}</span>
            </div>
          )}
          
          {familyProfile.address && (
            <div className="flex items-center gap-3 align-top">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <span>{familyProfile.address}</span>
            </div>
          )}

          {!familyProfile.email && !familyProfile.phone_number && !familyProfile.address && (
            <div className="flex items-center gap-3 text-gray-500">
              <User className="h-4 w-4" />
              <span>No contact information available</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
