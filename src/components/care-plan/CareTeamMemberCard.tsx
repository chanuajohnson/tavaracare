
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Clock, MoreHorizontal, UserMinus } from "lucide-react";
import { CareTeamMemberWithProfile } from "@/types/careTypes";

interface CareTeamMemberCardProps {
  member: CareTeamMemberWithProfile;
  onRemoveRequest: (member: CareTeamMemberWithProfile) => void;
}

export const CareTeamMemberCard: React.FC<CareTeamMemberCardProps> = ({ member, onRemoveRequest }) => {
  const getInitials = (name: string | null | undefined, id: string): string => {
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return id.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(member.professionalDetails?.full_name, member.caregiverId);
  const displayName = member.professionalDetails?.full_name || member.caregiverId;
  const profType = member.professionalDetails?.professional_type;
  
  return (
    <Card key={member.id}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={member.professionalDetails?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{displayName}</CardTitle>
              <CardDescription>
                {profType ? `${profType} (${member.role})` : 
                  member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${
              member.status === 'active' ? 'bg-green-100 text-green-800' :
              member.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
              member.status === 'declined' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onRemoveRequest(member)}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove from team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      {member.notes && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{member.notes}</p>
        </CardContent>
      )}
      <CardFooter className="border-t pt-4">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Added {new Date(member.createdAt).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
};
