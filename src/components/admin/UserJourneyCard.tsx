
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Mail, MapPin, User } from "lucide-react";
import { MiniJourneyProgress } from "./MiniJourneyProgress";
import { UserWithProgress } from "@/types/adminTypes";

interface UserJourneyCardProps {
  user: UserWithProgress;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onResendVerification: () => void;
  onRefresh: () => void;
  onClick?: () => void;
}

export function UserJourneyCard({
  user,
  selected,
  onSelect,
  onResendVerification,
  onRefresh,
  onClick
}: UserJourneyCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const daysSinceCreated = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card 
      className={`hover:shadow-md transition-shadow cursor-pointer ${selected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
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

        {/* Journey Progress - Using the reusable component */}
        <div className="space-y-2">
          <MiniJourneyProgress userId={user.id} userRole={user.role} />
          
          {daysSinceCreated > 0 && (
            <div className="text-xs text-muted-foreground">
              {daysSinceCreated === 1 ? 'Joined 1 day ago' : `Joined ${daysSinceCreated} days ago`}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {!user.email_verified && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onResendVerification();
              }}
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
