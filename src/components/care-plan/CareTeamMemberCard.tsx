
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, MoreHorizontal, UserMinus, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { CareTeamMemberWithProfile } from "@/types/careTypes";
import { updateEmployeeNISDetails } from "@/services/care-plans/team/nisService";

interface CareTeamMemberCardProps {
  member: CareTeamMemberWithProfile;
  onRemoveRequest: (member: CareTeamMemberWithProfile) => void;
  onMemberUpdated?: () => void;
}

export const CareTeamMemberCard: React.FC<CareTeamMemberCardProps> = ({ member, onRemoveRequest, onMemberUpdated }) => {
  const [nisOpen, setNisOpen] = useState(false);
  const [nisNumber, setNisNumber] = useState(member.nisNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(member.dateOfBirth || '');
  const [dateEmployed, setDateEmployed] = useState(member.dateEmployed || '');
  const [isNisRegistered, setIsNisRegistered] = useState(member.isNisRegistered || false);
  const [saving, setSaving] = useState(false);

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

  const handleSaveNIS = async () => {
    setSaving(true);
    const success = await updateEmployeeNISDetails(member.id, {
      nis_number: nisNumber || null,
      date_of_birth: dateOfBirth || null,
      date_employed: dateEmployed || null,
      is_nis_registered: isNisRegistered,
    });
    setSaving(false);
    if (success && onMemberUpdated) {
      onMemberUpdated();
    }
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
            {isNisRegistered && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                NIS
              </Badge>
            )}
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
        <CardContent className="pt-0 pb-2">
          <p className="text-sm text-muted-foreground">{member.notes}</p>
        </CardContent>
      )}

      {/* NIS Details Section */}
      <CardContent className="pt-2 pb-2">
        <Collapsible open={nisOpen} onOpenChange={setNisOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                NIS / Employee Details
              </span>
              {nisOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`nis-toggle-${member.id}`} className="text-sm">NIS Registered</Label>
              <Switch
                id={`nis-toggle-${member.id}`}
                checked={isNisRegistered}
                onCheckedChange={setIsNisRegistered}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`nis-number-${member.id}`} className="text-xs">NIS Number</Label>
              <Input
                id={`nis-number-${member.id}`}
                placeholder="e.g. 123456789"
                value={nisNumber}
                onChange={(e) => setNisNumber(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor={`dob-${member.id}`} className="text-xs">Date of Birth</Label>
                <Input
                  id={`dob-${member.id}`}
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`doe-${member.id}`} className="text-xs">Date Employed</Label>
                <Input
                  id={`doe-${member.id}`}
                  type="date"
                  value={dateEmployed}
                  onChange={(e) => setDateEmployed(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSaveNIS}
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save NIS Details'}
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Added {new Date(member.createdAt).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
};
