
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Clock, AlertTriangle } from "lucide-react";
import { STANDARDIZED_SHIFT_OPTIONS } from "@/data/chatRegistrationFlows";
import { getShiftMappingById } from "@/components/care-plan/utils/shiftTimeMapping";
import { ShiftOptionEditor } from "./ShiftOptionEditor";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const ShiftManagementDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Categorize shifts
  const categorizeShifts = () => {
    const categories = {
      weekday: STANDARDIZED_SHIFT_OPTIONS.filter(s => s.value.startsWith('mon_fri')),
      weekend: STANDARDIZED_SHIFT_OPTIONS.filter(s => s.value.startsWith('sat_sun')),
      evening: STANDARDIZED_SHIFT_OPTIONS.filter(s => s.value.includes('evening')),
      special: STANDARDIZED_SHIFT_OPTIONS.filter(s => 
        ['flexible', 'live_in_care', '24_7_care', 'around_clock_shifts', 'other'].includes(s.value)
      )
    };
    return categories;
  };

  const filteredShifts = STANDARDIZED_SHIFT_OPTIONS.filter(shift =>
    shift.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddShift = () => {
    setSelectedShift(null);
    setIsEditing(false);
    setEditorOpen(true);
  };

  const handleEditShift = (shift: any) => {
    setSelectedShift(shift);
    setIsEditing(true);
    setEditorOpen(true);
  };

  const handleDeleteShift = (shift: any) => {
    setSelectedShift(shift);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // In a real implementation, this would update the actual data
    toast.error("Delete functionality not yet implemented - would remove shift from system");
    setDeleteDialogOpen(false);
    setSelectedShift(null);
  };

  const getShiftTypeCategory = (value: string) => {
    if (value.startsWith('mon_fri')) return 'Weekday';
    if (value.startsWith('sat_sun')) return 'Weekend';
    if (value.includes('evening')) return 'Evening';
    return 'Special';
  };

  const getShiftDetails = (shift: any) => {
    const mapping = getShiftMappingById(shift.value);
    return {
      timeRange: mapping?.timeRange || { start: "00:00", end: "00:00" },
      description: mapping?.description || "No description available",
      isSpecial: mapping?.isSpecialType || false
    };
  };

  const categories = categorizeShifts();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search shifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {STANDARDIZED_SHIFT_OPTIONS.length} Total Shifts
          </Badge>
        </div>
        <Button onClick={handleAddShift} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Shift
        </Button>
      </div>

      {/* Impact Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800 mb-1">System-Wide Impact</h4>
              <p className="text-sm text-orange-700">
                Changes to shift options will automatically update across Family Registration, Professional Registration, Care Plan Creation, and Caregiver Matching algorithms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{categories.weekday.length}</div>
            <div className="text-sm text-muted-foreground">Weekday Shifts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{categories.weekend.length}</div>
            <div className="text-sm text-muted-foreground">Weekend Shifts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{categories.evening.length}</div>
            <div className="text-sm text-muted-foreground">Evening Shifts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{categories.special.length}</div>
            <div className="text-sm text-muted-foreground">Special Types</div>
          </CardContent>
        </Card>
      </div>

      {/* Shifts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Shift Options</CardTitle>
          <CardDescription>
            Manage all standardized shift options used throughout the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredShifts.map((shift) => {
              const details = getShiftDetails(shift);
              return (
                <div
                  key={shift.value}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{shift.label}</h4>
                      <Badge variant="outline">
                        {getShiftTypeCategory(shift.value)}
                      </Badge>
                      {details.isSpecial && (
                        <Badge variant="secondary">Special</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div><strong>Value:</strong> {shift.value}</div>
                      <div><strong>Time:</strong> {details.timeRange.start} - {details.timeRange.end}</div>
                      <div><strong>Description:</strong> {details.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditShift(shift)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteShift(shift)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Shift Option' : 'Add New Shift Option'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Modify the shift option details. Changes will be reflected across the platform.'
                : 'Create a new shift option that will be available in registration and scheduling.'
              }
            </DialogDescription>
          </DialogHeader>
          <ShiftOptionEditor
            shift={selectedShift}
            isEditing={isEditing}
            onSave={() => {
              toast.success(isEditing ? 'Shift updated successfully!' : 'New shift created successfully!');
              setEditorOpen(false);
            }}
            onCancel={() => setEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift Option</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedShift?.label}"? This will remove it from:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Family registration forms</li>
                <li>Professional registration forms</li>
                <li>Care plan shift creation</li>
                <li>Caregiver matching algorithms</li>
              </ul>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Shift
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
