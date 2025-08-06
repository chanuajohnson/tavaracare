import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserCheck, UserX, Clock, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Verify admin permissions
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        const adminStatus = profile?.role === 'admin';
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          console.warn('Non-admin user attempting to access MatchingStatusToggle:', user.id);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user?.id]);

  const handleToggle = async (newStatus: boolean, adminNotes?: string) => {
    if (!isAdmin) {
      console.error('Non-admin user attempting to update matching status:', user?.id);
      toast.error('Access denied: Admin privileges required');
      return;
    }

    if (!userId) {
      console.error('Missing userId in handleToggle');
      toast.error('Error: Missing user ID');
      return;
    }

    setLoading(true);
    setErrorDetails(null);
    
    console.log(`🔄 Admin ${user?.id} attempting to update matching status for user ${userId} (${userFullName}):`, {
      from: currentStatus,
      to: newStatus,
      notes: adminNotes,
      timestamp: new Date().toISOString()
    });
    
    try {
      // First, verify the user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('id, available_for_matching, full_name')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user before update:', fetchError);
        throw new Error(`Failed to find user: ${fetchError.message}`);
      }

      if (!existingUser) {
        throw new Error('User not found in database');
      }

      console.log('📋 Current user state before update:', existingUser);

      // Perform the update
      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          available_for_matching: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, available_for_matching, full_name')
        .single();

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      console.log('✅ Update successful! New state:', updatedData);

      // Verify the update was applied
      if (updatedData.available_for_matching !== newStatus) {
        console.warn('⚠️ Update didn\'t apply correctly:', {
          expected: newStatus,
          actual: updatedData.available_for_matching
        });
        throw new Error('Update verification failed - status didn\'t change as expected');
      }

      // Log the successful admin action
      console.log(`✅ Admin ${user?.id} successfully updated matching status for ${userFullName}:`, {
        userId,
        previousStatus: currentStatus,
        newStatus,
        notes: adminNotes,
        timestamp: new Date().toISOString(),
        updatedData
      });

      toast.success(
        `✅ ${userFullName} is now ${newStatus ? 'available' : 'unavailable'} for matching`
      );
      
      // Refresh the parent component
      onStatusChange();
      setShowDialog(false);
      setNotes('');
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('❌ Failed to update matching status:', {
        error,
        userId,
        userFullName,
        newStatus,
        adminNotes,
        isAdmin,
        currentUser: user?.id
      });
      
      setErrorDetails(errorMessage);
      toast.error(`Failed to update matching status: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    if (!isAdmin) {
      toast.error('Access denied: Admin privileges required');
      return;
    }

    console.log(`🎛️ Switch changed for ${userFullName}:`, {
      from: currentStatus,
      to: checked,
      isAdmin,
      userId
    });

    if (!checked) {
      // When marking unavailable, show confirmation dialog
      setShowDialog(true);
    } else {
      // When marking available, update directly
      handleToggle(true);
    }
  };

  // Don't render if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
        <ShieldAlert className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-700">Admin access required</span>
      </div>
    );
  }

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
        
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
        )}
        
        {errorDetails && (
          <div className="text-xs text-red-600 max-w-40 truncate" title={errorDetails}>
            Error: {errorDetails}
          </div>
        )}
        
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
          <div className="flex items-center gap-2">
            <Switch
              checked={currentStatus}
              onCheckedChange={handleSwitchChange}
              disabled={loading}
            />
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            )}
          </div>
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

        {errorDetails && (
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-900">Update Error</p>
                <p className="text-red-700">{errorDetails}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setErrorDetails(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

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