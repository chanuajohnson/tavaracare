
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Eye, Calendar, UserCheck } from 'lucide-react';
import { AdminMatchingInterface } from './AdminMatchingInterface';
import { EnhancedAdminMatchingInterface } from './enhanced/EnhancedAdminMatchingInterface';

interface UserMatchingActionsProps {
  user: any;
  onUserUpdate: () => void;
}

export const UserMatchingActions: React.FC<UserMatchingActionsProps> = ({
  user,
  onUserUpdate
}) => {
  const [manualAssignments, setManualAssignments] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [showMatchingInterface, setShowMatchingInterface] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'family') {
      fetchMatchingData();
    }
  }, [user]);

  const fetchMatchingData = async () => {
    try {
      // Fetch manual assignments
      const { data: assignments, error: assignError } = await supabase
        .from('manual_caregiver_assignments')
        .select(`
          *,
          caregiver:profiles!caregiver_id(full_name, email),
          admin:profiles!assigned_by_admin_id(full_name)
        `)
        .eq('family_user_id', user.id)
        .eq('is_active', true);

      if (assignError) throw assignError;
      setManualAssignments(assignments || []);

      // Fetch interventions
      const { data: interventionData, error: interventionError } = await supabase
        .from('admin_match_interventions')
        .select(`
          *,
          caregiver:profiles!caregiver_id(full_name, email),
          admin:profiles!admin_id(full_name)
        `)
        .eq('family_user_id', user.id)
        .order('created_at', { ascending: false });

      if (interventionError) throw interventionError;
      setInterventions(interventionData || []);
    } catch (error) {
      console.error('Error fetching matching data:', error);
    }
  };

  const handleScheduleVisit = async (assignmentId: string) => {
    try {
      // This would integrate with the visit scheduling system
      toast.info('Redirecting to visit scheduling...');
      // TODO: Navigate to visit scheduling with this assignment pre-selected
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast.error('Failed to schedule visit');
    }
  };

  const handleDeactivateAssignment = async (assignmentId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('manual_caregiver_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;
      
      toast.success('Assignment deactivated');
      fetchMatchingData();
      onUserUpdate();
    } catch (error) {
      console.error('Error deactivating assignment:', error);
      toast.error('Failed to deactivate assignment');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'family') {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Caregiver Matching</h3>
        <Button 
          onClick={() => setShowMatchingInterface(true)}
          size="sm"
        >
          <Users className="h-4 w-4 mr-2" />
          Manual Match
        </Button>
      </div>

      {/* Current Assignments */}
      {manualAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {manualAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{assignment.caregiver?.full_name}</p>
                  <p className="text-sm text-gray-600">{assignment.caregiver?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      Score: {assignment.match_score}%
                    </Badge>
                    <Badge variant={assignment.visit_scheduled ? 'default' : 'secondary'}>
                      {assignment.visit_scheduled ? 'Visit Scheduled' : 'No Visit Yet'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!assignment.visit_scheduled && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleScheduleVisit(assignment.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeactivateAssignment(assignment.id)}
                    disabled={loading}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Intervention History */}
      {interventions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Intervention History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {interventions.map((intervention) => (
                <div key={intervention.id} className="text-sm border-l-2 border-blue-200 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {intervention.intervention_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <Badge variant="outline">
                      {intervention.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600">
                    {intervention.caregiver?.full_name} • {intervention.admin?.full_name}
                  </p>
                  <p className="text-gray-500">
                    {new Date(intervention.created_at).toLocaleDateString()}
                  </p>
                  {intervention.reason && (
                    <p className="text-sm text-gray-600 mt-1">{intervention.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {manualAssignments.length === 0 && interventions.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center">
            <UserCheck className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">No caregiver assignments yet</p>
            <p className="text-sm text-gray-500">Use manual matching to assign a caregiver</p>
          </CardContent>
        </Card>
      )}

      {/* Matching Interface Dialog */}
      <Dialog open={showMatchingInterface} onOpenChange={setShowMatchingInterface}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manual Caregiver Matching</DialogTitle>
          </DialogHeader>
          <EnhancedAdminMatchingInterface
            familyUserId={user.id}
            onClose={() => setShowMatchingInterface(false)}
            onMatchAssigned={() => {
              setShowMatchingInterface(false);
              fetchMatchingData();
              onUserUpdate();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
