
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, Users, Eye } from "lucide-react";
import { CareTeamMemberWithProfile, CareShift } from "@/types/careTypes";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface ShareScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carePlanId: string;
  carePlanTitle: string;
  careTeamMembers: CareTeamMemberWithProfile[];
  careShifts: CareShift[];
}

export const ShareScheduleModal: React.FC<ShareScheduleModalProps> = ({
  open,
  onOpenChange,
  carePlanId,
  carePlanTitle,
  careTeamMembers,
  careShifts
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');

  const periods = [
    { value: 'weekly', label: 'Weekly Schedule (7 days)', days: 7 },
    { value: 'biweekly', label: 'Bi-weekly Schedule (14 days)', days: 14 },
    { value: 'monthly', label: 'Monthly Schedule (full month)', days: 'month' as const }
  ];

  const formatScheduleMessage = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    switch (period) {
      case 'weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        periodLabel = `Week of ${format(startDate, 'MMMM d, yyyy')}`;
        break;
      case 'biweekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = addDays(endOfWeek(now, { weekStartsOn: 1 }), 7);
        periodLabel = `Two Weeks: ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
        break;
      case 'monthly':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        periodLabel = `Month of ${format(startDate, 'MMMM yyyy')}`;
        break;
      default:
        return '';
    }

    // Filter shifts within the date range
    const relevantShifts = careShifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate >= startDate && shiftDate <= endDate;
    });

    // Group shifts by date
    const shiftsByDate: Record<string, CareShift[]> = {};
    relevantShifts.forEach(shift => {
      const dateKey = format(new Date(shift.startTime), 'yyyy-MM-dd');
      if (!shiftsByDate[dateKey]) {
        shiftsByDate[dateKey] = [];
      }
      shiftsByDate[dateKey].push(shift);
    });

    // Build message
    let message = `📅 ${period === 'weekly' ? 'Weekly' : period === 'biweekly' ? 'Bi-Weekly' : 'Monthly'} Schedule Update - ${carePlanTitle}\n\n`;
    message += `${periodLabel}:\n\n`;

    // Generate days in range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayShifts = shiftsByDate[dateKey] || [];
      
      if (dayShifts.length > 0) {
        const dayLabel = format(currentDate, 'EEE d');
        
        // Group shifts by type (day vs night)
        const dayTimeShifts = dayShifts.filter(shift => {
          const startHour = new Date(shift.startTime).getHours();
          const endHour = new Date(shift.endTime).getHours();
          return !(endHour < startHour || startHour >= 17); // Not overnight or evening
        });
        
        const nightShifts = dayShifts.filter(shift => {
          const startHour = new Date(shift.startTime).getHours();
          const endHour = new Date(shift.endTime).getHours();
          return endHour < startHour || startHour >= 17; // Overnight or evening
        });

        // Format day shifts on same line
        if (dayTimeShifts.length > 0) {
          const dayShiftTexts = dayTimeShifts.map(shift => {
            const caregiverName = careTeamMembers.find(m => m.caregiverId === shift.caregiverId)?.professionalDetails?.full_name || 'Unassigned';
            return `${shift.title} (${caregiverName})`;
          });
          message += `${dayLabel}: ${dayShiftTexts.join(', ')}\n`;
        } else {
          message += `${dayLabel}: No day shifts\n`;
        }

        // Format night shifts on new lines with 🌙
        nightShifts.forEach(shift => {
          const caregiverName = careTeamMembers.find(m => m.caregiverId === shift.caregiverId)?.professionalDetails?.full_name || 'Unassigned';
          message += `🌙 ${shift.title} (${caregiverName})\n`;
        });
      }
      
      currentDate = addDays(currentDate, 1);
    }

    message += `\n🔗 Login to your dashboard's profile hub to request changes or see details: ${window.location.origin}/dashboard/family\n\n`;
    message += `Questions? Reply to this message!\n- Chan 💙`;

    if (customMessage.trim()) {
      message += `\n\nAdditional note: ${customMessage}`;
    }

    return message;
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handlePreview = () => {
    if (!selectedPeriod) {
      toast.error('Please select a time period first');
      return;
    }
    const message = formatScheduleMessage(selectedPeriod);
    setPreviewMessage(message);
  };

  const handleSendSchedule = async () => {
    if (!selectedPeriod) {
      toast.error('Please select a time period');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Please select at least one team member to notify');
      return;
    }

    try {
      setSending(true);
      
      const scheduleMessage = formatScheduleMessage(selectedPeriod);
      const messageType = `${selectedPeriod}_schedule_update`;

      const { data, error } = await supabase.functions.invoke('send-nudge-whatsapp', {
        body: {
          target_users: selectedMembers,
          message_type: messageType,
          custom_message: scheduleMessage,
          care_plan_id: carePlanId,
          schedule_period: selectedPeriod
        }
      });

      if (error) throw error;

      toast.success(`Schedule shared with ${selectedMembers.length} team member${selectedMembers.length === 1 ? '' : 's'}!`);
      onOpenChange(false);
      
      // Reset form
      setSelectedPeriod('');
      setSelectedMembers([]);
      setCustomMessage('');
      setPreviewMessage('');
    } catch (error) {
      console.error('Error sending schedule:', error);
      toast.error('Failed to send schedule. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Share Schedule via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Send a formatted schedule update to your care team members via WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Period Selection */}
          <div className="space-y-2">
            <Label htmlFor="period">Schedule Period</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {period.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Member Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Team Members to Notify
            </Label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded p-3">
              {careTeamMembers.length > 0 ? (
                careTeamMembers.map((member) => (
                  <div key={member.caregiverId} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.caregiverId}
                      checked={selectedMembers.includes(member.caregiverId)}
                      onCheckedChange={() => handleMemberToggle(member.caregiverId)}
                    />
                    <Label htmlFor={member.caregiverId} className="font-normal">
                      {member.professionalDetails?.full_name || 'Unknown Professional'}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({member.role || 'Team Member'})
                      </span>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No team members found</p>
              )}
            </div>
          </div>

          {/* Optional Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="customMessage">Additional Message (Optional)</Label>
            <Textarea
              id="customMessage"
              placeholder="Add any additional notes or context..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Preview Button */}
          <div className="flex gap-2">
            <Button 
              onClick={handlePreview} 
              variant="outline" 
              disabled={!selectedPeriod}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Message
            </Button>
          </div>

          {/* Message Preview */}
          {previewMessage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Message Preview</CardTitle>
                <CardDescription>
                  This is how the WhatsApp message will appear
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-green-900">
                    {previewMessage}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendSchedule}
            disabled={!selectedPeriod || selectedMembers.length === 0 || sending}
            className="bg-green-600 hover:bg-green-700"
          >
            {sending ? 'Sending...' : `Send to ${selectedMembers.length} Member${selectedMembers.length === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
