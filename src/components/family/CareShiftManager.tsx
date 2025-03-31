
import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  User,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ShiftFilterControls } from "./ShiftFilterControls";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchCareShiftsFiltered, fetchCaregiverShifts, CareShift, updateCareShift, deleteCareShift } from "@/services/care-plan-service";
import { useAuth } from "@/components/providers/AuthProvider";
import { ShiftCreationForm } from "./ShiftCreationForm";

interface CareShiftManagerProps {
  carePlanId: string;
  onShiftUpdated?: () => void;
}

export function CareShiftManager({ carePlanId, onShiftUpdated }: CareShiftManagerProps) {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'assigned' | 'unassigned' | 'completed'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<CareShift | null>(null);

  useEffect(() => {
    loadShifts();
  }, [carePlanId, currentFilter]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const shifts = await fetchCareShiftsFiltered(carePlanId, currentFilter);
      setShifts(shifts);
    } catch (error) {
      console.error("Error loading care shifts:", error);
      toast.error("Failed to load care shifts");
    } finally {
      setLoading(false);
    }
  };

  const handleShiftCreated = () => {
    setCreateDialogOpen(false);
    loadShifts();
    if (onShiftUpdated) onShiftUpdated();
  };

  const handleEditShift = (shift: CareShift) => {
    setEditingShift(shift);
    setCreateDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (confirm("Are you sure you want to delete this shift?")) {
      try {
        await deleteCareShift(shiftId);
        toast.success("Shift deleted successfully");
        loadShifts();
        if (onShiftUpdated) onShiftUpdated();
      } catch (error) {
        console.error("Error deleting shift:", error);
        toast.error("Failed to delete shift");
      }
    }
  };

  const handleMarkShiftComplete = async (shiftId: string) => {
    try {
      await updateCareShift(shiftId, { status: 'completed' });
      toast.success("Shift marked as completed");
      loadShifts();
      if (onShiftUpdated) onShiftUpdated();
    } catch (error) {
      console.error("Error completing shift:", error);
      toast.error("Failed to mark shift as completed");
    }
  };

  const getShiftStatusDisplay = (shift: CareShift) => {
    switch (shift.status) {
      case 'open':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Open</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Assigned</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Care Shifts</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Add Shift</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingShift ? "Edit Care Shift" : "Create New Care Shift"}</DialogTitle>
              <DialogDescription>
                {editingShift 
                  ? "Update the details for this care shift." 
                  : "Add a new care shift to the schedule. You can leave it unassigned for caregivers to claim."}
              </DialogDescription>
            </DialogHeader>
            {user && (
              <ShiftCreationForm 
                familyId={user.id}
                carePlanId={carePlanId}
                existingShift={editingShift}
                onSuccess={() => {
                  handleShiftCreated();
                  setEditingShift(null);
                }}
                onCancel={() => {
                  setCreateDialogOpen(false);
                  setEditingShift(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <ShiftFilterControls 
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onRefresh={loadShifts}
      />

      {loading ? (
        <div className="text-center py-8">Loading care shifts...</div>
      ) : shifts.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-muted-foreground">
              <p className="mb-2">No {currentFilter !== 'all' ? currentFilter : ''} shifts found.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add your first shift
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {shifts.map((shift) => (
            <Card key={shift.id} className={`overflow-hidden ${
              shift.status === 'completed' ? 'bg-muted' : ''
            }`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <div>
                      <CardTitle className="text-base">{shift.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getShiftStatusDisplay(shift)}
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {format(parseISO(shift.start_time), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditShift(shift)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Shift
                      </DropdownMenuItem>
                      
                      {shift.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => handleMarkShiftComplete(shift.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteShift(shift.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Delete Shift
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
                    <span>
                      {shift.caregiver_id ? (
                        <div className="flex items-center">
                          <CaregiverDisplay caregiverId={shift.caregiver_id} />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Unassigned</span>
                          </Badge>
                        </div>
                      )}
                    </span>
                  </div>
                  
                  {shift.description && (
                    <div className="text-sm mt-2 text-muted-foreground">
                      {shift.description}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper component to display caregiver information
function CaregiverDisplay({ caregiverId }: { caregiverId: string }) {
  const [caregiverName, setCaregiverName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCaregiverDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', caregiverId)
          .single();
        
        if (error) throw error;
        
        setCaregiverName(data.full_name || "Unknown Caregiver");
        setAvatarUrl(data.avatar_url);
      } catch (error) {
        console.error("Error fetching caregiver details:", error);
        setCaregiverName("Unknown Caregiver");
      }
    };
    
    fetchCaregiverDetails();
  }, [caregiverId]);
  
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={avatarUrl || ""} alt={caregiverName} />
        <AvatarFallback>{caregiverName.charAt(0)}</AvatarFallback>
      </Avatar>
      <span>{caregiverName}</span>
    </div>
  );
}
