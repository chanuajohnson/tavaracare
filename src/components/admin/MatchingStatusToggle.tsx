import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserCheck, UserX, Clock, AlertCircle } from 'lucide-react';

interface MatchingStatusToggleProps {
  userId: string;
  currentStatus: boolean;
  userFullName: string;
  onStatusChange: () => void;
  compact?: boolean;
}

export function MatchingStatusToggle({ 
  userId, 
  currentStatus, 
  userFullName, 
  onStatusChange,
  compact = false 
}: MatchingStatusToggleProps) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [notes, setNotes] = useState('');

  const handleToggle = async (newStatus: boolean, adminNotes?: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          available_for_matching: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Log the admin action (could be enhanced with a separate admin_actions table)
      console.log(`Admin updated matching status for ${userFullName}: ${newStatus ? 'Available' : 'Unavailable'}`, {
        userId,
        newStatus,
        notes: adminNotes,
        timestamp: new Date().toISOString()
      });

      toast.success(
        `${userFullName} is now ${newStatus ? 'available' : 'unavailable'} for matching`
      );
      
      onStatusChange();
      setShowDialog(false);
      setNotes('');
    } catch (error: any) {
      console.error('Error updating matching status:', error);
      toast.error('Failed to update matching status');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    if (!checked) {
      // When marking unavailable, show confirmation dialog
      setShowDialog(true);
    } else {
      // When marking available, update directly
      handleToggle(true);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {currentStatus ? (
            <UserCheck className="h-4 w-4 text-green-600" />
          ) : (
            <UserX className="h-4 w-4 text-red-600" />
          )}
          <Badge 
            variant={currentStatus ? "default" : "secondary"}
            className={currentStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
          >
            {currentStatus ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
        <Switch
          checked={currentStatus}
          onCheckedChange={handleSwitchChange}
          disabled={loading}
          className="scale-75"
        />
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Mark {userFullName} as Unavailable?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This will remove {userFullName} from matching results. They won't be available for matching.
              </p>
              <div className="space-y-2">
                <Label htmlFor="notes">Reason (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., Already placed with family, test account, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleToggle(false, notes)}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Mark Unavailable'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {currentStatus ? (
            <UserCheck className="h-5 w-5 text-green-600" />
          ) : (
            <UserX className="h-5 w-5 text-red-600" />
          )}
          Matching Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">
              Status: <Badge 
                variant={currentStatus ? "default" : "secondary"}
                className={currentStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {currentStatus ? 'Available for Matching' : 'Unavailable for Matching'}
              </Badge>
            </p>
            <p className="text-sm text-gray-600">
              {currentStatus 
                ? 'This user will appear in matching results'
                : 'This user is hidden from matching results'
              }
            </p>
          </div>
          <Switch
            checked={currentStatus}
            onCheckedChange={handleSwitchChange}
            disabled={loading}
          />
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Admin Control</p>
              <p className="text-blue-700">
                Use this toggle to manage which users appear in matching results. 
                Unavailable users won't be shown in matching searches.
              </p>
            </div>
          </div>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Mark {userFullName} as Unavailable for Matching?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This will remove {userFullName} from matching results. They won't be available for matching.
              </p>
              <div className="space-y-2">
                <Label htmlFor="notes">Reason (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., Already placed with family, taking a break, test account, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleToggle(false, notes)}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Mark Unavailable'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}