
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Users, 
  Settings, 
  Clock,
  DollarSign,
  CheckCircle
} from "lucide-react";

interface ProfileHeaderSectionProps {
  profile: any;
  user: any;
  carePlanAssignments: any[];
}

export const ProfileHeaderSection = ({ profile, user, carePlanAssignments }: ProfileHeaderSectionProps) => {
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getProfessionalTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'cna': 'Certified Nursing Assistant',
      'lpn': 'Licensed Practical Nurse',
      'rn': 'Registered Nurse',
      'gapp': 'General Adult Patient Provider',
      'companion': 'Companion Caregiver',
      'home_health_aide': 'Home Health Aide',
      'other': 'Care Professional'
    };
    return typeMap[type] || 'Care Professional';
  };

  const handleEditProfile = () => {
    // Redirect to registration page for profile editing
    window.location.href = '/registration/professional';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Profile Overview Card */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-white text-lg">
                {getInitials(profile?.full_name || 'Professional')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile?.full_name || 'Professional'}</CardTitle>
              <CardDescription className="text-base mt-1">
                {getProfessionalTypeLabel(profile?.professional_type || 'other')}
              </CardDescription>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  {profile?.role === 'professional' ? 'Professional' : 'Caregiver'}
                </Badge>
                {profile?.years_of_experience && (
                  <Badge variant="outline" className="text-xs">
                    {profile.years_of_experience} Experience
                  </Badge>
                )}
                {profile?.legally_authorized && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Authorized
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.phone_number}</span>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
            )}
            {profile?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
            {profile?.hourly_rate && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.hourly_rate}/hour</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card className="lg:w-80">
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">Active Care Plans</span>
              </div>
              <Badge variant="secondary">
                {carePlanAssignments.filter(a => a.status === 'active').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">This Week</span>
              </div>
              <Badge variant="outline">0 hrs</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm">Rating</span>
              </div>
              <Badge variant="outline">New</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
