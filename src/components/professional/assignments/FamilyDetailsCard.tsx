
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FamilyProfile {
  full_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  avatar_url?: string | null;
}

interface FamilyDetailsCardProps {
  familyProfile?: FamilyProfile;
}

export function FamilyDetailsCard({ familyProfile }: FamilyDetailsCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Family Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-6">
          <div className="font-medium text-lg">{familyProfile?.full_name || 'Family Member'}</div>
          <div className="text-muted-foreground text-sm">Family Member</div>
        </div>

        <div className="space-y-3">
          {familyProfile?.phone_number && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{familyProfile.phone_number}</span>
            </div>
          )}

          {familyProfile?.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{familyProfile.email}</span>
            </div>
          )}

          {familyProfile?.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{familyProfile.address}</span>
            </div>
          )}
        </div>

        <div className="pt-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/professional/schedule")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
