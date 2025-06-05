
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageSquare, Phone, Users } from "lucide-react";
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { InlinePhoneEditor } from './InlinePhoneEditor';

interface EmergencyShiftWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: CareShift;
  teamMembers: CareTeamMemberWithProfile[];
  emergencyReason: string;
}

export const EmergencyShiftWhatsAppModal: React.FC<EmergencyShiftWhatsAppModalProps> = ({
  open,
  onOpenChange,
  shift,
  teamMembers,
  emergencyReason
}) => {
  const [teamMembersState, setTeamMembersState] = useState(teamMembers);

  // Format the emergency message
  const shiftDate = new Date(shift.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const shiftTime = `${new Date(shift.startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })} - ${new Date(shift.endTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}`;

  const emergencyMessage = `🚨 URGENT: EMERGENCY SHIFT COVERAGE NEEDED

Hi! This is your Tavara Care Coordinator.

We have an urgent opening that needs to be filled:

📅 Date: ${shiftDate}
⏰ Time: ${shiftTime}
📍 Location: ${shift.location || 'Patient\'s home'}
❗ Reason: ${emergencyReason}

PLEASE RESPOND IMMEDIATELY if you can cover this shift by replying:
✅ "YES" - to confirm you can take this shift
❌ "NO" - if you cannot cover

This is TIME SENSITIVE - first to respond gets the shift.

Thank you for your quick response!
- Tavara Care Coordinator`;

  const handlePhoneNumberUpdate = (memberId: string, newPhoneNumber: string | null) => {
    setTeamMembersState(prevMembers => 
      prevMembers.map(member => 
        member.id === memberId 
          ? {
              ...member,
              professionalDetails: {
                ...member.professionalDetails,
                phone_number: newPhoneNumber
              }
            }
          : member
      )
    );
  };

  const sendWhatsAppToMember = (memberName: string, phoneNumber?: string | null) => {
    if (!phoneNumber) {
      alert(`Phone number not available for ${memberName}. Please add a phone number first.`);
      return;
    }
    
    // Clean phone number (remove any non-digits except +)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(emergencyMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendToAllMembers = () => {
    const membersWithValidPhones = teamMembersState.filter(member => 
      member.professionalDetails?.phone_number
    );

    if (membersWithValidPhones.length === 0) {
      alert('No team members have phone numbers available. Please add phone numbers first.');
      return;
    }

    // Open WhatsApp for each member with a slight delay to prevent browser blocking
    membersWithValidPhones.forEach((member, index) => {
      const memberName = member.professionalDetails?.full_name || 'Team Member';
      const phoneNumber = member.professionalDetails?.phone_number;
      
      setTimeout(() => {
        sendWhatsAppToMember(memberName, phoneNumber);
      }, index * 500); // 500ms delay between each
    });
  };

  const membersWithPhones = teamMembersState.filter(member => 
    member.professionalDetails?.full_name
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            Emergency Shift Coverage - Send WhatsApp Alerts
          </DialogTitle>
          <DialogDescription>
            Send urgent WhatsApp messages to your care team about this emergency shift opening.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Emergency Message Preview */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Message Preview</span>
              </div>
              <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap font-mono text-gray-700">
                {emergencyMessage}
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Care Team Members ({membersWithPhones.length})</span>
              </div>
              {membersWithPhones.length > 0 && (
                <Button 
                  onClick={sendToAllMembers}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send to All
                </Button>
              )}
            </div>

            {membersWithPhones.length === 0 ? (
              <Card>
                <CardContent className="pt-4 text-center text-gray-600">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No team members available.</p>
                  <p className="text-sm">Add team members to your care plan to send emergency notifications.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {membersWithPhones.map((member) => (
                  <Card key={member.id} className="border-gray-200">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {member.professionalDetails?.full_name?.charAt(0) || 'T'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.professionalDetails?.full_name || 'Unknown Professional'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                            <div className="mt-1">
                              <InlinePhoneEditor
                                userId={member.caregiverId}
                                currentPhoneNumber={member.professionalDetails?.phone_number}
                                userName={member.professionalDetails?.full_name || 'Team Member'}
                                onPhoneNumberUpdate={(newPhone) => handlePhoneNumberUpdate(member.id, newPhone)}
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => sendWhatsAppToMember(
                            member.professionalDetails?.full_name || 'Team Member',
                            member.professionalDetails?.phone_number
                          )}
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          disabled={!member.professionalDetails?.phone_number}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send WhatsApp
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">📱 How this works:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Add/edit phone numbers for team members using the edit buttons</li>
                  <li>• Click "Send WhatsApp" to open WhatsApp with the pre-written message</li>
                  <li>• Team members can reply directly with "YES" or "NO"</li>
                  <li>• First person to confirm gets the shift</li>
                  <li>• "Send to All" opens WhatsApp for all team members with phone numbers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
