
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MessageSquare, AlertTriangle, Clock, Users, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";

interface CarePlan {
  id: string;
  title: string;
  family_id: string;
}

interface TeamMember {
  id: string;
  caregiverId: string;
  role: string;
  professionalDetails?: {
    full_name: string;
    phone_number: string;
  };
}

interface CareShift {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  caregiverId: string;
  location?: string;
}

export function CareTeamCommunicationManager() {
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [selectedCarePlan, setSelectedCarePlan] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [careShifts, setCareShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(false);

  // Schedule sharing state
  const [scheduleType, setScheduleType] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');

  // Emergency coverage state
  const [emergencyShift, setEmergencyShift] = useState({
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    reason: ''
  });

  useEffect(() => {
    fetchCarePlans();
  }, []);

  useEffect(() => {
    if (selectedCarePlan) {
      fetchTeamMembers();
      fetchCareShifts();
    }
  }, [selectedCarePlan]);

  const fetchCarePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('care_plans')
        .select('id, title, family_id')
        .eq('status', 'active');

      if (error) throw error;
      setCarePlans(data || []);
    } catch (error) {
      console.error('Error fetching care plans:', error);
      toast.error('Failed to load care plans');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('care_team_members')
        .select(`
          id,
          caregiver_id,
          role,
          profiles:caregiver_id (
            full_name,
            phone_number
          )
        `)
        .eq('care_plan_id', selectedCarePlan)
        .eq('status', 'active');

      if (error) throw error;
      
      const formattedMembers = (data || []).map(member => ({
        id: member.id,
        caregiverId: member.caregiver_id,
        role: member.role,
        professionalDetails: {
          full_name: (member.profiles as any)?.full_name || 'Unknown',
          phone_number: (member.profiles as any)?.phone_number || ''
        }
      }));

      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    }
  };

  const fetchCareShifts = async () => {
    try {
      const startDate = new Date();
      const endDate = addDays(startDate, 30); // Next 30 days

      const { data, error } = await supabase
        .from('care_shifts')
        .select('id, title, start_time, end_time, caregiver_id, location')
        .eq('care_plan_id', selectedCarePlan)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (error) throw error;
      
      const formattedShifts = (data || []).map(shift => ({
        id: shift.id,
        title: shift.title,
        startTime: shift.start_time,
        endTime: shift.end_time,
        caregiverId: shift.caregiver_id,
        location: shift.location
      }));

      setCareShifts(formattedShifts);
    } catch (error) {
      console.error('Error fetching care shifts:', error);
      toast.error('Failed to load care shifts');
    }
  };

  const sendScheduleUpdate = async () => {
    if (!selectedCarePlan || selectedMembers.length === 0) {
      toast.error('Please select a care plan and team members');
      return;
    }

    setLoading(true);
    try {
      const selectedCarePlanData = carePlans.find(cp => cp.id === selectedCarePlan);
      
      const response = await supabase.functions.invoke('send-nudge-whatsapp', {
        body: {
          userIds: selectedMembers,
          templateId: `${scheduleType}_schedule_update`,
          care_plan_id: selectedCarePlan,
          schedule_period: scheduleType,
          custom_message: customMessage,
          shift_details: careShifts
        }
      });

      if (response.error) throw response.error;

      toast.success(`Schedule update sent to ${selectedMembers.length} team members`);
      setSelectedMembers([]);
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending schedule update:', error);
      toast.error('Failed to send schedule update');
    } finally {
      setLoading(false);
    }
  };

  const sendEmergencyAlert = async () => {
    if (!selectedCarePlan || !emergencyShift.date || !emergencyShift.startTime) {
      toast.error('Please fill in all emergency shift details');
      return;
    }

    setLoading(true);
    try {
      const shiftDateTime = new Date(`${emergencyShift.date}T${emergencyShift.startTime}`);
      const endDateTime = emergencyShift.endTime 
        ? new Date(`${emergencyShift.date}T${emergencyShift.endTime}`)
        : addDays(shiftDateTime, 0);

      const response = await supabase.functions.invoke('send-nudge-whatsapp', {
        body: {
          templateId: 'emergency_shift_coverage',
          care_plan_id: selectedCarePlan,
          shift_details: {
            start_time: shiftDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            location: emergencyShift.location,
            reason: emergencyShift.reason
          }
        }
      });

      if (response.error) throw response.error;

      toast.success('Emergency shift alert sent to all team members');
      setEmergencyShift({ date: '', startTime: '', endTime: '', location: '', reason: '' });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast.error('Failed to send emergency alert');
    } finally {
      setLoading(false);
    }
  };

  const formatSchedulePreview = () => {
    const now = new Date();
    let startDate, endDate, periodLabel;

    switch (scheduleType) {
      case 'weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        periodLabel = `Week of ${format(startDate, 'MMMM d, yyyy')}`;
        break;
      case 'biweekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = addDays(endOfWeek(now, { weekStartsOn: 1 }), 7);
        periodLabel = `Two Weeks: ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        periodLabel = `Month of ${format(startDate, 'MMMM yyyy')}`;
        break;
    }

    return `📅 ${scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)} Schedule Update\n\n${periodLabel}:\n\n[Schedule details will be automatically generated]`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Care Team Communication Manager</h2>
          <p className="text-muted-foreground">Manage schedule updates and emergency coverage alerts</p>
        </div>
      </div>

      {/* Care Plan Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Care Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCarePlan} onValueChange={setSelectedCarePlan}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a care plan to manage" />
            </SelectTrigger>
            <SelectContent>
              {carePlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCarePlan && (
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Updates
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergency Coverage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Schedule Update</CardTitle>
                <CardDescription>
                  Share schedule updates with selected team members via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Schedule Period</Label>
                    <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly Schedule</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly Schedule</SelectItem>
                        <SelectItem value="monthly">Monthly Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Team Members</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded p-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={member.id}
                          checked={selectedMembers.includes(member.caregiverId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, member.caregiverId]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.caregiverId));
                            }
                          }}
                        />
                        <Label htmlFor={member.id} className="font-normal">
                          {member.professionalDetails?.full_name} ({member.role})
                          {!member.professionalDetails?.phone_number && (
                            <Badge variant="outline" className="ml-2 text-orange-600">No phone</Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Message (Optional)</Label>
                  <Textarea
                    placeholder="Add any additional notes..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message Preview</Label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-green-900">
                      {formatSchedulePreview()}
                    </pre>
                  </div>
                </div>

                <Button 
                  onClick={sendScheduleUpdate}
                  disabled={loading || selectedMembers.length === 0}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Schedule Update ({selectedMembers.length} recipients)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Emergency Shift Coverage
                </CardTitle>
                <CardDescription>
                  Send urgent coverage requests to all available team members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={emergencyShift.date}
                      onChange={(e) => setEmergencyShift({...emergencyShift, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Input
                      type="time"
                      value={emergencyShift.startTime}
                      onChange={(e) => setEmergencyShift({...emergencyShift, startTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={emergencyShift.endTime}
                      onChange={(e) => setEmergencyShift({...emergencyShift, endTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Patient's home"
                      value={emergencyShift.location}
                      onChange={(e) => setEmergencyShift({...emergencyShift, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Emergency Coverage *</Label>
                  <Textarea
                    placeholder="e.g., Scheduled caregiver called in sick"
                    value={emergencyShift.reason}
                    onChange={(e) => setEmergencyShift({...emergencyShift, reason: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-800 mb-2">Emergency Alert Preview:</p>
                  <p className="text-sm text-red-700">
                    🚨 URGENT: EMERGENCY SHIFT COVERAGE NEEDED<br/>
                    Date: {emergencyShift.date ? format(new Date(emergencyShift.date), 'EEEE, MMMM d, yyyy') : '[Date]'}<br/>
                    Time: {emergencyShift.startTime || '[Start Time]'} - {emergencyShift.endTime || '[End Time]'}<br/>
                    Reason: {emergencyShift.reason || '[Reason]'}
                  </p>
                </div>

                <Button 
                  onClick={sendEmergencyAlert}
                  disabled={loading || !emergencyShift.date || !emergencyShift.startTime || !emergencyShift.reason}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Send Emergency Alert to All Team Members
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
