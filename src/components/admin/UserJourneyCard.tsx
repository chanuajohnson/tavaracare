
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Mail, MapPin, User, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface UserWithProgress {
  id: string;
  email: string;
  full_name: string;
  role: 'family' | 'professional' | 'community';
  email_verified: boolean;
  last_login_at: string;
  created_at: string;
  avatar_url?: string;
  journey_progress?: {
    current_step: number;
    total_steps: number;
    completion_percentage: number;
    last_activity_at: string;
  };
  onboarding_progress?: any;
  location?: string;
}

interface UserJourneyCardProps {
  user: UserWithProgress;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onResendVerification: () => void;
  onRefresh: () => void;
}

export function UserJourneyCard({
  user,
  selected,
  onSelect,
  onResendVerification,
  onRefresh
}: UserJourneyCardProps) {
  const progress = user.journey_progress?.completion_percentage || 0;
  const currentStep = user.journey_progress?.current_step || 1;
  const totalSteps = user.journey_progress?.total_steps || 1;
  
  const getStatusColor = () => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (progress >= 100) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (progress >= 50) return <Clock className="h-4 w-4 text-blue-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const daysSinceActivity = user.journey_progress?.last_activity_at 
    ? Math.floor((Date.now() - new Date(user.journey_progress.last_activity_at).getTime()) / (1000 * 60 * 60 * 24))
    : Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={`hover:shadow-md transition-shadow ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
            />
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {user.full_name ? getInitials(user.full_name) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {user.full_name || 'Unnamed User'}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {user.role}
                </Badge>
                {user.email_verified ? (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {getStatusIcon()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <Mail className="h-3 w-3" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          {user.location && (
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
        </div>

        {/* Journey Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={getStatusColor()}>
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs text-muted-foreground">
              {progress}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {daysSinceActivity > 0 && (
            <div className="text-xs text-muted-foreground">
              {daysSinceActivity === 1 ? 'Last activity 1 day ago' : `Last activity ${daysSinceActivity} days ago`}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {!user.email_verified && (
            <Button
              onClick={onResendVerification}
              size="sm"
              variant="outline"
              className="text-xs flex-1"
            >
              Resend Verification
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
