
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Phone, Mail, MapPin, User, Heart, Briefcase, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { profileService } from "@/services/profileService";
import type { Profile } from "@/types/profile";
import type { UserRole } from "@/types/userRoles";

interface ProfileHeaderSectionProps {
  role: UserRole;
  gradientColors?: string;
  badgeVariant?: "default" | "secondary" | "outline";
}

export const ProfileHeaderSection = ({ 
  role, 
  gradientColors = "from-blue-50 to-indigo-50 border-blue-100",
  badgeVariant = "secondary" 
}: ProfileHeaderSectionProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const profileData = await profileService.getProfile(user.id);
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (!user || isLoading) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleConfig = (userRole: UserRole) => {
    switch (userRole) {
      case 'family':
        return {
          title: 'Family Profile',
          roleLabel: 'Family Member',
          icon: User,
          editPath: '/registration/family',
          primaryInfo: profile?.careRecipientName ? `Care Recipient: ${profile.careRecipientName}` : null,
          secondaryInfo: profile?.relationship ? `Relationship: ${profile.relationship}` : null,
          additionalTags: profile?.careTypes?.slice(0, 3) || []
        };
      case 'professional':
        return {
          title: 'Professional Profile',
          roleLabel: 'Care Professional',
          icon: Briefcase,
          editPath: '/registration/professional',
          primaryInfo: profile?.professionalType ? `Specialization: ${profile.professionalType}` : null,
          secondaryInfo: profile?.yearsOfExperience ? `Experience: ${profile.yearsOfExperience} years` : null,
          additionalTags: profile?.specializations?.slice(0, 3) || []
        };
      case 'community':
        return {
          title: 'Community Profile',
          roleLabel: 'Community Member',
          icon: Heart,
          editPath: '/registration/community',
          primaryInfo: profile?.communityRoles?.[0] ? `Role: ${profile.communityRoles[0]}` : null,
          secondaryInfo: profile?.contributionInterests?.[0] ? `Interest: ${profile.contributionInterests[0]}` : null,
          additionalTags: profile?.contributionInterests?.slice(0, 3) || []
        };
      case 'admin':
        return {
          title: 'Admin Profile',
          roleLabel: 'Administrator',
          icon: Users,
          editPath: '/admin/profile',
          primaryInfo: 'System Administrator',
          secondaryInfo: profile?.lastLoginAt ? `Last Login: ${new Date(profile.lastLoginAt).toLocaleDateString()}` : null,
          additionalTags: ['Admin Access', 'User Management']
        };
      default:
        return {
          title: 'Profile',
          roleLabel: 'User',
          icon: User,
          editPath: '/profile',
          primaryInfo: null,
          secondaryInfo: null,
          additionalTags: []
        };
    }
  };

  const displayName = profile?.fullName || user.email || `${role} Member`;
  const initials = getInitials(displayName);
  const config = getRoleConfig(role);
  const IconComponent = config.icon;

  return (
    <Card className={`w-full bg-gradient-to-r ${gradientColors} border`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{config.title}</CardTitle>
          <Link to={config.editPath}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatarUrl} alt={displayName} />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{displayName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <IconComponent className="h-4 w-4" />
                <Badge variant={badgeVariant}>
                  {config.roleLabel}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact and Role Information */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Contact Information</h4>
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              )}
              {profile?.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
              {profile?.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>

            {/* Role-Specific Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Role Information</h4>
              {config.primaryInfo && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconComponent className="h-4 w-4" />
                  <span>{config.primaryInfo}</span>
                </div>
              )}
              {config.secondaryInfo && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{config.secondaryInfo}</span>
                </div>
              )}
              {config.additionalTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {config.additionalTags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {config.additionalTags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{config.additionalTags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
