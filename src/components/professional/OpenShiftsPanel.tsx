
import React, { useState, useEffect } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchOpenShiftsForCaregiver, claimCareShift, CareShift } from "@/services/care-plan-service";
import { CalendarDays, Clock, MapPin, Calendar, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OpenShiftsPanel() {
  const { user } = useAuth();
  const [openShifts, setOpenShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'available' | 'assigned'>('available');
  const [assignedShifts, setAssignedShifts] = useState<CareShift[]>([]);
  const [families, setFamilies] = useState<Record<string, {name: string, avatarUrl?: string}>>({});
  
  useEffect(() => {
    if (user) {
      loadShifts();
    }
  }, [user, currentTab]);
  
  const loadShifts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (currentTab === 'available') {
        const shifts = await fetchOpenShiftsForCaregiver(user.id);
        setOpenShifts(shifts);
        
        // Get family details for the shifts
        await loadFamilyDetails(shifts.map(s => s.family_id));
      } else {
        // Load shifts assigned to this caregiver
        const { data, error } = await supabase
          .from('care_shifts')
          .select('*')
          .eq('caregiver_id', user.id)
          .order('start_time', { ascending: true });
        
        if (error) throw error;
        setAssignedShifts(data || []);
        
        // Get family details for the shifts
        await loadFamilyDetails(data?.map(s => s.family_id) || []);
      }
    } catch (error) {
      console.error("Error loading shifts:", error);
      toast.error("Failed to load care shifts");
    } finally {
      setLoading(false);
    }
  };
  
  const loadFamilyDetails = async (familyIds: string[]) => {
    if (!familyIds.length) return;
    
    try {
      const uniqueFamilyIds = [...new Set(familyIds)];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', uniqueFamilyIds);
      
      if (error) throw error;
      
      const familyMap: Record<string, {name: string, avatarUrl?: string}> = {};
      data?.forEach(family => {
        familyMap[family.id] = {
          name: family.full_name || "Unknown Family",
          avatarUrl: family.avatar_url
        };
      });
      
      setFamilies(familyMap);
    } catch (error) {
      console.error("Error loading family details:", error);
    }
  };
  
  const handleClaimShift = async (shiftId: string) => {
    if (!user) return;
    
    try {
      await claimCareShift(shiftId, user.id);
      toast.success("Shift claimed successfully!");
      loadShifts();
    } catch (error: any) {
      console.error("Error claiming shift:", error);
      toast.error(error.message || "Failed to claim shift");
    }
  };
  
  const getTimeUntilShift = (startTime: string) => {
    const now = new Date();
    const shiftDate = parseISO(startTime);
    const days = differenceInDays(shiftDate, now);
    
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days <= 7) return `In ${days} days`;
    return format(shiftDate, "MMM d");
  };
  
  const renderShiftCard = (shift: CareShift, isAssigned: boolean = false) => {
    const familyInfo = families[shift.family_id] || { name: "Unknown Family" };
    const timeUntil = getTimeUntilShift(shift.start_time);
    const isUrgent = differenceInDays(parseISO(shift.start_time), new Date()) <= 2;
    
    return (
      <Card key={shift.id} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{shift.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={isUrgent && !isAssigned ? "bg-red-50 text-red-600 border-red-200" : "bg-blue-50 text-blue-600 border-blue-200"}
                >
                  {isUrgent && !isAssigned ? "Urgent" : timeUntil}
                </Badge>
                
                <Badge 
                  variant="outline" 
                  className={isAssigned ? "bg-green-50 text-green-600 border-green-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}
                >
                  {isAssigned ? "Assigned" : "Open"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{format(parseISO(shift.start_time), "MMM d, yyyy")}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {format(parseISO(shift.start_time), "h:mm a")} - {format(parseISO(shift.end_time), "h:mm a")}
              </span>
            </div>
            
            {shift.location && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{shift.location}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{familyInfo.name}</span>
            </div>
            
            {shift.description && (
              <div className="text-sm mt-2 text-muted-foreground">
                {shift.description}
              </div>
            )}
            
            {!isAssigned && (
              <Button 
                className="w-full mt-3" 
                onClick={() => handleClaimShift(shift.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Claim This Shift
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div>
      <Tabs defaultValue="available" value={currentTab} onValueChange={(value) => setCurrentTab(value as 'available' | 'assigned')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Shifts</TabsTrigger>
          <TabsTrigger value="assigned">My Shifts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8">Loading available shifts...</div>
          ) : openShifts.length === 0 ? (
            <Card>
              <CardContent className="py-6">
                <div className="text-center text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-1">No available shifts</p>
                  <p className="text-sm">There are currently no open shifts available for you to claim.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {openShifts.map(shift => renderShiftCard(shift))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="assigned" className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8">Loading your shifts...</div>
          ) : assignedShifts.length === 0 ? (
            <Card>
              <CardContent className="py-6">
                <div className="text-center text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-1">No shifts assigned</p>
                  <p className="text-sm">You don't have any shifts assigned to you yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignedShifts.map(shift => renderShiftCard(shift, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
