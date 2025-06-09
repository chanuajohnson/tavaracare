
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
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user.full_name ? getInitials(user.full_name) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {user.full_name || 'Unnamed User'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === 'family' ? 'default' : user.role === 'professional' ? 'secondary' : 'outline'} className="text-xs">
                  {user.role}
                </Badge>
                {!user.email_verified && (
                  <Badge variant="destructive" className="text-xs">Unverified</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* User Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone_number && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>📞</span>
              <span>{user.phone_number}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Joined {daysSinceCreated} days ago</span>
          </div>
        </div>

        {/* Journey Progress */}
        <div className="pt-2 border-t">
          <MiniJourneyProgress userId={user.id} userRole={user.role} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!user.email_verified && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onResendVerification();
              }}
              className="text-xs flex-1"
            >
              Resend Verification
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
