
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CareTeamMemberCard } from "./CareTeamMemberCard";
import { Plus, Users } from "lucide-react";
import { CareTeamMember, CareTeamMemberInput, CareTeamMemberWithProfile } from "@/types/careTypes";
import { inviteCareTeamMember } from "@/services/care-plans";

interface Professional {
  id: string;
  full_name: string | null;
  professional_type: string | null;
  avatar_url: string | null;
}

interface CareTeamTabProps {
  carePlanId: string;
  familyId: string;
  careTeamMembers: CareTeamMemberWithProfile[];
  professionals: Professional[];
  onMemberAdded: () => void;
  onMemberRemoveRequest: (member: CareTeamMemberWithProfile) => void;
}

export const CareTeamTab: React.FC<CareTeamTabProps> = ({
  carePlanId,
  familyId,
  careTeamMembers,
  professionals,
  onMemberAdded,
  onMemberRemoveRequest
}) => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    caregiverId: "",
    role: "caregiver" as const,
    notes: ""
  });

  const handleInviteTeamMember = async () => {
    try {
      if (!newTeamMember.caregiverId) {
        return;
      }

      const teamMemberInput: CareTeamMemberInput = {
        carePlanId,
        familyId,
        caregiverId: newTeamMember.caregiverId,
        role: newTeamMember.role,
        status: 'active',
        notes: newTeamMember.notes
      };

      await inviteCareTeamMember(teamMemberInput);
      setInviteDialogOpen(false);
      
      setNewTeamMember({
        caregiverId: "",
        role: "caregiver",
        notes: ""
      });
      
      onMemberAdded();
    } catch (error) {
      console.error("Error assigning team member:", error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Care Team Members</h2>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Care Professional</DialogTitle>
              <DialogDescription>
                Add a care professional to this care plan. They will be assigned immediately.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="caregiver">Care Professional</Label>
                <Select 
                  value={newTeamMember.caregiverId} 
                  onValueChange={(value) => setNewTeamMember({...newTeamMember, caregiverId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a professional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.full_name || "Unknown Professional"} 
                        {prof.professional_type ? ` (${prof.professional_type})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={newTeamMember.role} 
                  onValueChange={(value: any) => setNewTeamMember({...newTeamMember, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Add any specific notes or instructions for this team member"
                  value={newTeamMember.notes}
                  onChange={(e) => setNewTeamMember({...newTeamMember, notes: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleInviteTeamMember}>Assign Professional</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {careTeamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {careTeamMembers.map((member) => (
            <CareTeamMemberCard 
              key={member.id} 
              member={member} 
              onRemoveRequest={onMemberRemoveRequest}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-muted/50">
          <div className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-semibold mb-2">No Team Members</h3>
            <p className="mb-4 text-muted-foreground">You haven't added any care professionals to this care plan yet.</p>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Team Member
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};
