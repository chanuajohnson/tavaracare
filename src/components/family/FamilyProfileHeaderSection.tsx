
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Phone, Mail, MapPin, User, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { profileService } from "@/services/profileService";
import type { Profile } from "@/types/profile";

export const FamilyProfileHeaderSection = () => {
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

  const displayName = profile?.fullName || user.email || "Family Member";
  const initials = getInitials(displayName);

  return (
    <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-blue-900">Family Profile</CardTitle>
          <Link to="/registration/family">
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
              <AvatarFallback className="bg-blue-100 text-blue-800 text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{displayName}</h3>
              <Badge variant="secondary" className="mt-1">
                Family Member
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
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

            {/* Care Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Care Information</h4>
              {profile?.careRecipientName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Care Recipient: {profile.careRecipientName}</span>
                </div>
              )}
              {profile?.relationship && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Heart className="h-4 w-4" />
                  <span>Relationship: {profile.relationship}</span>
                </div>
              )}
              {profile?.careTypes && profile.careTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.careTypes.slice(0, 3).map((type, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                  {profile.careTypes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.careTypes.length - 3} more
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
