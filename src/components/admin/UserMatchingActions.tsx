
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Eye, Calendar, UserCheck, RotateCcw, AlertTriangle, Settings, Database } from 'lucide-react';
import { AdminMatchingInterface } from './AdminMatchingInterface';
import { EnhancedAdminMatchingInterface } from './enhanced/EnhancedAdminMatchingInterface';

interface UserMatchingActionsProps {
  user: any;
  onUserUpdate: () => void;
}

interface AssignmentData {
  id: string;
  type: 'automatic' | 'manual' | 'intervention' | 'team_member';
  caregiver_name: string;
  caregiver_email: string;
  match_score: number;
  status: string;
  created_at: string;
  admin_name?: string;
  visit_scheduled?: boolean;
  match_explanation?: string;
  intervention_type?: string;
  reason?: string;
  role?: string;
  regular_rate?: number;
  overtime_rate?: number;
}

interface StaleAssignment {
  assignment_type: string;
  assignment_id: string;
  family_user_id: string;
  caregiver_id: string;
  issue: string;
}

export const UserMatchingActions: React.FC<UserMatchingActionsProps> = ({
  user,
  onUserUpdate
}) => {
  const [manualAssignments, setManualAssignments] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [automaticAssignments, setAutomaticAssignments] = useState<any[]>([]);
  const [careTeamMembers, setCareTeamMembers] = useState<any[]>([]);
  const [staleAssignments, setStaleAssignments] = useState<StaleAssignment[]>([]);
  const [showMatchingInterface, setShowMatchingInterface] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showStaleDialog, setShowStaleDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'family') {
      fetchMatchingData();
    }
  }, [user]);

  const fetchMatchingData = async () => {
    try {
      // Fetch unified caregiver assignments (replaces multiple legacy queries)
      const { data: unifiedAssignments, error: unifiedError } = await supabase
        .from('caregiver_assignments')
        .select('*')
        .eq('family_user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (unifiedError) throw unifiedError;

      // Fetch caregiver and admin profiles separately for the assignments
      let caregiverProfiles: any[] = [];
      let adminProfiles: any[] = [];
      
      if (unifiedAssignments && unifiedAssignments.length > 0) {
        const caregiverIds = [...new Set(unifiedAssignments.map(a => a.caregiver_id))];
        const adminIds = [...new Set(unifiedAssignments.map(a => a.assigned_by_admin_id).filter(Boolean))];
        
        const [caregiverResult, adminResult] = await Promise.all([
          supabase.from('profiles').select('id, full_name').in('id', caregiverIds),
          adminIds.length > 0 ? supabase.from('profiles').select('id, full_name').in('id', adminIds) : { data: [], error: null }
        ]);
        
        caregiverProfiles = caregiverResult.data || [];
        adminProfiles = adminResult.data || [];
      }

      // Add profile data to assignments
      const enrichedAssignments = unifiedAssignments?.map(assignment => ({
        ...assignment,
        caregiver: caregiverProfiles.find(p => p.id === assignment.caregiver_id),
        admin: adminProfiles.find(p => p.id === assignment.assigned_by_admin_id)
      })) || [];

      // Separate assignments by type for display
      const automaticData = enrichedAssignments.filter(a => a.assignment_type === 'automatic');
      const manualData = enrichedAssignments.filter(a => a.assignment_type === 'manual');
      const teamData = enrichedAssignments.filter(a => a.assignment_type === 'care_team');

      setAutomaticAssignments(automaticData);
      setManualAssignments(manualData);
      setCareTeamMembers(teamData);

      // Legacy interventions table (kept for compatibility)
      const { data: interventionData, error: interventionError } = await supabase
        .from('admin_match_interventions')
        .select(`
          *,
          caregiver:profiles!caregiver_id(full_name),
          admin:profiles!admin_id(full_name)
        `)
        .eq('family_user_id', user.id)
        .order('created_at', { ascending: false });

      if (interventionError) {
        console.warn('Error fetching legacy interventions:', interventionError);
        setInterventions([]);
      } else {
        setInterventions(interventionData || []);
      }

      // Fetch stale assignments
      const { data: staleData, error: staleError } = await supabase
        .rpc('detect_stale_assignments');

      if (staleError) {
        console.warn('Error fetching stale assignments:', staleError);
      } else {
        const userStaleAssignments = staleData?.filter(
          (stale: StaleAssignment) => stale.family_user_id === user.id
        ) || [];
        setStaleAssignments(userStaleAssignments);
      }

      console.log('Admin panel: Fetched assignments from unified table:', {
        total: enrichedAssignments.length,
        automatic: automaticData.length,
        manual: manualData.length,
        team: teamData.length
      });
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

  const handleResetAssignments = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .rpc('reset_user_assignments', { 
          target_family_user_id: user.id 
        });

      if (error) throw error;
      
      toast.success('All assignments have been reset');
      fetchMatchingData();
      onUserUpdate();
      setShowResetDialog(false);
    } catch (error) {
      console.error('Error resetting assignments:', error);
      toast.error('Failed to reset assignments: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupStaleAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('cleanup_stale_assignments');

      if (error) throw error;
      
      toast.success('Stale assignments cleaned up: ' + data);
      fetchMatchingData();
      onUserUpdate();
      setShowStaleDialog(false);
    } catch (error) {
      console.error('Error cleaning up stale assignments:', error);
      toast.error('Failed to cleanup stale assignments: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAssignment = async (assignmentId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('caregiver_assignments')
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

  // Combine all assignments for comprehensive view
  const getAllAssignments = (): AssignmentData[] => {
    const allAssignments: AssignmentData[] = [];

    // Add automatic assignments
    automaticAssignments.forEach(assignment => {
      allAssignments.push({
        id: assignment.id,
        type: 'automatic',
        caregiver_name: assignment.caregiver?.full_name || 'Unknown',
        caregiver_email: '',
        match_score: assignment.match_score,
        status: assignment.is_active ? 'Active' : 'Inactive',
        created_at: assignment.created_at,
        match_explanation: assignment.match_explanation
      });
    });

    // Add manual assignments
    manualAssignments.forEach(assignment => {
      allAssignments.push({
        id: assignment.id,
        type: 'manual',
        caregiver_name: assignment.caregiver?.full_name || 'Unknown',
        caregiver_email: '',
        match_score: assignment.match_score,
        status: assignment.is_active ? 'Active' : 'Inactive',
        created_at: assignment.created_at,
        admin_name: assignment.admin?.full_name,
        visit_scheduled: assignment.visit_scheduled
      });
    });

    // Add interventions
    interventions.forEach(intervention => {
      allAssignments.push({
        id: intervention.id,
        type: 'intervention',
        caregiver_name: intervention.caregiver?.full_name || 'Unknown',
        caregiver_email: '',
        match_score: intervention.admin_match_score || 0,
        status: intervention.status,
        created_at: intervention.created_at,
        admin_name: intervention.admin?.full_name,
        intervention_type: intervention.intervention_type,
        reason: intervention.reason
      });
    });

    // Add care team members
    careTeamMembers.forEach(member => {
      allAssignments.push({
        id: member.id,
        type: 'team_member',
        caregiver_name: member.caregiver?.full_name || 'Unknown',
        caregiver_email: '',
        match_score: 100, // Team members are considered perfect matches
        status: member.status || 'active',
        created_at: member.created_at,
        role: member.role,
        regular_rate: member.regular_rate,
        overtime_rate: member.overtime_rate
      });
    });

    // Sort by creation date (newest first)
    return allAssignments.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  if (user?.role !== 'family') {
    return null;
  }

  const allAssignments = getAllAssignments();
  const hasAnyAssignments = allAssignments.length > 0;
  const hasStaleAssignments = staleAssignments.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Caregiver Matching</h3>
        <div className="text-sm text-muted-foreground">
          User ID: {user.id} | Email: {user.email}
        </div>
        <div className="flex gap-2">
          {hasStaleAssignments && (
            <Button 
              onClick={() => setShowStaleDialog(true)}
              size="sm"
              variant="outline"
            >
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
              Stale Data ({staleAssignments.length})
            </Button>
          )}
          {hasAnyAssignments && (
            <Button 
              onClick={() => setShowResetDialog(true)}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          )}
          <Button 
            onClick={() => setShowMatchingInterface(true)}
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Manual Match
          </Button>
        </div>
      </div>

      {/* Comprehensive Assignment View */}
      {hasAnyAssignments ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Assignments ({allAssignments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allAssignments.map((assignment) => (
              <div key={`${assignment.type}-${assignment.id}`} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{assignment.caregiver_name}</p>
                    <Badge variant={
                      assignment.type === 'automatic' ? 'secondary' : 
                      assignment.type === 'manual' ? 'default' : 
                      assignment.type === 'team_member' ? 'default' : 'outline'
                    }>
                      {assignment.type === 'automatic' ? 'Algorithm' : 
                       assignment.type === 'manual' ? 'Manual' : 
                       assignment.type === 'team_member' ? 'Team Member' : 'Override'}
                    </Badge>
                  </div>
                  {assignment.caregiver_email && (
                    <p className="text-sm text-gray-600">{assignment.caregiver_email}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      Score: {assignment.match_score}%
                    </Badge>
                    <Badge variant={assignment.status === 'Active' || assignment.status === 'active' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                    {assignment.visit_scheduled && (
                      <Badge variant="default">Visit Scheduled</Badge>
                    )}
                  </div>
                  {assignment.match_explanation && (
                    <p className="text-xs text-gray-500 mt-1">{assignment.match_explanation}</p>
                  )}
                  {assignment.admin_name && (
                    <p className="text-xs text-gray-500 mt-1">By: {assignment.admin_name}</p>
                  )}
                  {assignment.reason && (
                    <p className="text-xs text-gray-500 mt-1">{assignment.reason}</p>
                  )}
                  {assignment.role && (
                    <p className="text-xs text-gray-500 mt-1">Role: {assignment.role}</p>
                  )}
                  {assignment.regular_rate && (
                    <p className="text-xs text-gray-500 mt-1">Rate: ${assignment.regular_rate}/hr</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <p className="text-xs text-gray-500">
                    {new Date(assignment.created_at).toLocaleDateString()}
                  </p>
                  {assignment.type === 'manual' && !assignment.visit_scheduled && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleScheduleVisit(assignment.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  )}
                  {assignment.type === 'manual' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeactivateAssignment(assignment.id)}
                      disabled={loading}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
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

      {/* Reset Assignments Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Assignments</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate all assignments for this family user:
              <br />• {automaticAssignments.length} automatic assignments
              <br />• {manualAssignments.length} manual assignments  
              <br />• {interventions.filter(i => i.status === 'active').length} active interventions
              <br />• {careTeamMembers.length} care team members
              <br /><br />
              This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAssignments}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Resetting...' : 'Reset All Assignments'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stale Data Cleanup Dialog */}
      <AlertDialog open={showStaleDialog} onOpenChange={setShowStaleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cleanup Stale Assignments</AlertDialogTitle>
            <AlertDialogDescription>
              Found {staleAssignments.length} stale assignments with issues:
              <br /><br />
              {staleAssignments.map((stale, index) => (
                <div key={index} className="text-sm">
                  • {stale.assignment_type}: {stale.issue}
                </div>
              ))}
              <br />
              This will deactivate all assignments with missing users. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCleanupStaleAssignments}
              disabled={loading}
            >
              {loading ? 'Cleaning...' : 'Cleanup Stale Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
