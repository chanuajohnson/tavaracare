
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Clock, AlertCircle, UserCheck } from 'lucide-react';
import { AdminMatchingInterface } from './AdminMatchingInterface';

interface MatchingQueueUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
  journey_step: number;
  needs_admin_intervention: boolean;
  care_needs?: any;
  manual_assignments?: any[];
}

export const AdminMatchingQueue: React.FC = () => {
  const [queueUsers, setQueueUsers] = useState<MatchingQueueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showMatchingInterface, setShowMatchingInterface] = useState(false);

  useEffect(() => {
    fetchMatchingQueue();
  }, []);

  const fetchMatchingQueue = async () => {
    try {
      setLoading(true);
      
      // Fetch family users who have completed Step 4 (Caregiver Matches) but need intervention
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone_number,
          created_at,
          journey_step,
          needs_admin_intervention,
          care_needs_family(*),
          manual_caregiver_assignments(*)
        `)
        .eq('role', 'family')
        .gte('journey_step', 4)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter users who either need admin intervention or have no manual assignments yet
      const filteredUsers = (users || []).filter(user => 
        user.needs_admin_intervention || 
        !user.manual_caregiver_assignments?.length ||
        user.journey_step >= 4
      );

      setQueueUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching matching queue:', error);
      toast.error('Failed to load matching queue');
    } finally {
      setLoading(false);
    }
  };

  const handleManualMatch = (userId: string) => {
    setSelectedUser(userId);
    setShowMatchingInterface(true);
  };

  const handleMatchAssigned = () => {
    fetchMatchingQueue(); // Refresh the queue
    setShowMatchingInterface(false);
    setSelectedUser(null);
  };

  const getPriorityLevel = (user: any) => {
    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (user.needs_admin_intervention) return { level: 'high', label: 'High Priority' };
    if (daysSinceSignup > 7) return { level: 'medium', label: 'Medium Priority' };
    return { level: 'low', label: 'Standard' };
  };

  const getStatusBadge = (user: any) => {
    if (user.manual_caregiver_assignments?.length > 0) {
      return <Badge variant="default">Assigned</Badge>;
    }
    if (user.needs_admin_intervention) {
      return <Badge variant="destructive">Needs Intervention</Badge>;
    }
    return <Badge variant="secondary">Pending Match</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading matching queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Matching Queue</h2>
          <p className="text-gray-600">
            Families waiting for caregiver matches ({queueUsers.length} users)
          </p>
        </div>
        <Button onClick={fetchMatchingQueue} variant="outline">
          Refresh Queue
        </Button>
      </div>

      {queueUsers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-gray-600">No families currently need matching assistance.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {queueUsers.map((user) => {
            const priority = getPriorityLevel(user);
            return (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{user.full_name}</h3>
                        {getStatusBadge(user)}
                        <Badge 
                          variant={priority.level === 'high' ? 'destructive' : 
                                  priority.level === 'medium' ? 'secondary' : 'outline'}
                        >
                          {priority.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Contact</p>
                          <p>{user.email}</p>
                          <p>{user.phone_number}</p>
                        </div>
                        <div>
                          <p className="font-medium">Journey Progress</p>
                          <p>Step {user.journey_step}/7</p>
                          <p className="text-xs">
                            Registered {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Care Needs</p>
                          <p>
                            {user.care_needs_family?.[0]?.care_recipient_name || 'Not specified'}
                          </p>
                          {user.needs_admin_intervention && (
                            <div className="flex items-center gap-1 text-red-600 mt-1">
                              <AlertCircle className="h-3 w-3" />
                              <span className="text-xs">Intervention Required</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => handleManualMatch(user.id)}
                        size="sm"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manual Match
                      </Button>
                      {user.manual_caregiver_assignments?.length > 0 && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Navigate to visit scheduling with this user pre-selected
                            toast.info('Redirecting to visit scheduling...');
                          }}
                        >
                          Schedule Visit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Matching Interface Dialog */}
      <Dialog open={showMatchingInterface} onOpenChange={setShowMatchingInterface}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manual Caregiver Matching</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <AdminMatchingInterface
              familyUserId={selectedUser}
              onClose={() => setShowMatchingInterface(false)}
              onMatchAssigned={handleMatchAssigned}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
