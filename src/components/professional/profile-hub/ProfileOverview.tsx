
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, UserCircle } from "lucide-react";

interface ProfileOverviewProps {
  profileData: any;
  getInitials: (name?: string) => string;
}

export function ProfileOverview({ profileData, getInitials }: ProfileOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary" />
          Profile Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center mb-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profileData?.avatar_url} alt={profileData?.full_name || 'User'} />
            <AvatarFallback className="text-2xl bg-primary text-white">
              {getInitials(profileData?.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold">{profileData?.full_name || 'Professional User'}</h3>
          <p className="text-muted-foreground">{profileData?.professional_type || 'Caregiver'}</p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {profileData?.years_of_experience && (
              <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                {profileData.years_of_experience} Experience
              </Badge>
            )}
            
            {profileData?.work_type && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {profileData.work_type}
              </Badge>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          {profileData?.phone_number && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{profileData.phone_number}</span>
            </div>
          )}
          
          {profileData?.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{profileData.email}</span>
            </div>
          )}
          
          {profileData?.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{profileData.address}</span>
            </div>
          )}
        </div>
        
        <div className="pt-3">
          <Link to="/registration/professional">
            <Button className="w-full">
              Edit Profile Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
