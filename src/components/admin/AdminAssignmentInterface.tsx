import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useAdminAssignments } from '@/hooks/useAdminAssignments';
import { Users, UserPlus, Bot, Settings, Eye, Clock, Award } from 'lucide-react';

interface FamilyUser {
  id: string;
  full_name: string;
  care_recipient_name: string;
  relationship: string;
  created_at: string;
}

interface ProfessionalCaregiver {
  id: string;
  full_name: string;
  location: string;
  care_types: string[] | null;
  years_of_experience: string;
  hourly_rate: string;
  created_at: string;
}

interface Assignment {
  id: string;
  match_score: number;
  created_at: string;
  caregiver: {
    id: string;
    full_name: string;
    location: string;
  };
}

export const AdminAssignmentInterface: React.FC = () => {
  const {
    createAdminAssignment,
    triggerAutomaticAssignment,
    getFamilyUsers,
    getProfessionalCaregivers,
    getExistingAssignments,
    isLoading,
    error
  } = useAdminAssignments();

  const [familyUsers, setFamilyUsers] = useState<FamilyUser[]>([]);
  const [caregivers, setCaregivers] = useState<ProfessionalCaregiver[]>([]);
  const [selectedFamilyUser, setSelectedFamilyUser] = useState<string>('');
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('');
  const [matchScore, setMatchScore] = useState<number>(80);
  const [adminOverrideScore, setAdminOverrideScore] = useState<number | undefined>();
  const [assignmentReason, setAssignmentReason] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [existingAssignments, setExistingAssignments] = useState<{
    automatic: Assignment[];
    admin: Assignment[];
  }>({ automatic: [], admin: [] });
  const [activeTab, setActiveTab] = useState<'create' | 'trigger' | 'view'>('create');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [familyData, caregiverData] = await Promise.all([
        getFamilyUsers(),
        getProfessionalCaregivers()
      ]);
      setFamilyUsers(familyData);
      setCaregivers(caregiverData);
    };

    loadData();
  }, [getFamilyUsers, getProfessionalCaregivers]);

  // Load existing assignments when family user is selected
  useEffect(() => {
    const loadExistingAssignments = async () => {
      if (selectedFamilyUser) {
        const assignments = await getExistingAssignments(selectedFamilyUser);
        setExistingAssignments({
          automatic: assignments.automatic,
          admin: assignments.admin.map(a => ({
            id: a.id,
            match_score: a.admin_match_score || a.original_match_score,
            created_at: a.created_at,
            caregiver: a.caregiver
          }))
        });
      }
    };

    loadExistingAssignments();
  }, [selectedFamilyUser, getExistingAssignments]);

  const handleCreateAssignment = async () => {
    if (!selectedFamilyUser || !selectedCaregiver) {
      toast.error('Please select both a family user and caregiver');
      return;
    }

    const assignmentData = {
      family_user_id: selectedFamilyUser,
      caregiver_id: selectedCaregiver,
      match_score: matchScore,
      admin_override_score: adminOverrideScore,
      assignment_reason: assignmentReason || 'Manual admin assignment',
      assignment_notes: assignmentNotes
    };

    const result = await createAdminAssignment(assignmentData);
    
    if (result) {
      // Reset form
      setSelectedCaregiver('');
      setAdminOverrideScore(undefined);
      setAssignmentReason('');
      setAssignmentNotes('');
      
      // Reload existing assignments
      const assignments = await getExistingAssignments(selectedFamilyUser);
      setExistingAssignments({
        automatic: assignments.automatic,
        admin: assignments.admin.map(a => ({
          id: a.id,
          match_score: a.admin_match_score || a.original_match_score,
          created_at: a.created_at,
          caregiver: a.caregiver
        }))
      });
    }
  };

  const handleTriggerAutomaticAssignment = async (familyUserId?: string) => {
    await triggerAutomaticAssignment({ family_user_id: familyUserId });
    
    // Reload existing assignments if we have a selected family user
    if (selectedFamilyUser) {
      const assignments = await getExistingAssignments(selectedFamilyUser);
      setExistingAssignments({
        automatic: assignments.automatic,
        admin: assignments.admin.map(a => ({
          id: a.id,
          match_score: a.admin_match_score || a.original_match_score,
          created_at: a.created_at,
          caregiver: a.caregiver
        }))
      });
    }
  };

  const selectedFamilyUserData = familyUsers.find(u => u.id === selectedFamilyUser);
  const selectedCaregiverData = caregivers.find(c => c.id === selectedCaregiver);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Assignment Management</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create')}
            size="sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
          <Button
            variant={activeTab === 'trigger' ? 'default' : 'outline'}
            onClick={() => setActiveTab('trigger')}
            size="sm"
          >
            <Bot className="h-4 w-4 mr-2" />
            Trigger Automatic
          </Button>
          <Button
            variant={activeTab === 'view' ? 'default' : 'outline'}
            onClick={() => setActiveTab('view')}
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Assignments
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Create Manual Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="family-user">Family User</Label>
                <Select value={selectedFamilyUser} onValueChange={setSelectedFamilyUser}>
                  <SelectTrigger id="family-user">
                    <SelectValue placeholder="Select a family user" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.care_recipient_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caregiver">Caregiver</Label>
                <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                  <SelectTrigger id="caregiver">
                    <SelectValue placeholder="Select a caregiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {caregivers.map((caregiver) => (
                      <SelectItem key={caregiver.id} value={caregiver.id}>
                        {caregiver.full_name} - {caregiver.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="match-score">Match Score</Label>
                  <Input
                    id="match-score"
                    type="number"
                    min="0"
                    max="100"
                    value={matchScore}
                    onChange={(e) => setMatchScore(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-override-score">Admin Override Score (Optional)</Label>
                  <Input
                    id="admin-override-score"
                    type="number"
                    min="0"
                    max="100"
                    value={adminOverrideScore || ''}
                    onChange={(e) => setAdminOverrideScore(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-reason">Assignment Reason</Label>
                <Input
                  id="assignment-reason"
                  value={assignmentReason}
                  onChange={(e) => setAssignmentReason(e.target.value)}
                  placeholder="e.g., Emergency assignment, Special request"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-notes">Assignment Notes</Label>
                <Textarea
                  id="assignment-notes"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Additional notes about this assignment"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleCreateAssignment}
                disabled={isLoading || !selectedFamilyUser || !selectedCaregiver}
                className="w-full"
              >
                {isLoading ? 'Creating Assignment...' : 'Create Assignment'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assignment Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFamilyUserData && selectedCaregiverData ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Family User</h4>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="font-medium">{selectedFamilyUserData.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Care recipient: {selectedFamilyUserData.care_recipient_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Relationship: {selectedFamilyUserData.relationship}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Caregiver</h4>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="font-medium">{selectedCaregiverData.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Location: {selectedCaregiverData.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Experience: {selectedCaregiverData.years_of_experience}
                      </p>
                      {selectedCaregiverData.care_types && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {selectedCaregiverData.care_types.map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Assignment Details</h4>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">Match Score: <span className="font-medium">{matchScore}%</span></p>
                      {adminOverrideScore && (
                        <p className="text-sm">Admin Override: <span className="font-medium">{adminOverrideScore}%</span></p>
                      )}
                      {assignmentReason && (
                        <p className="text-sm">Reason: <span className="font-medium">{assignmentReason}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Select a family user and caregiver to see assignment preview</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'trigger' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Trigger Automatic Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trigger-family-user">Family User (Optional)</Label>
              <Select value={selectedFamilyUser} onValueChange={setSelectedFamilyUser}>
                <SelectTrigger id="trigger-family-user">
                  <SelectValue placeholder="Select a family user (leave empty for batch process)" />
                </SelectTrigger>
                <SelectContent>
                  {familyUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.care_recipient_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleTriggerAutomaticAssignment(selectedFamilyUser)}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : selectedFamilyUser ? 'Trigger for Selected User' : 'Trigger Batch Process'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedFamilyUser('')}
                disabled={isLoading}
              >
                Clear Selection
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Single User:</strong> Select a family user to trigger automatic assignment for just that user.
              </p>
              <p>
                <strong>Batch Process:</strong> Leave selection empty to process all family users who need assignment updates.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'view' && selectedFamilyUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Existing Assignments - {selectedFamilyUserData?.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingAssignments.automatic.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Automatic Assignments
                  </h4>
                  <ScrollArea className="h-48">
                    {existingAssignments.automatic.map((assignment) => (
                      <div key={assignment.id} className="bg-muted p-3 rounded-md mb-2">
                        <p className="font-medium">{assignment.caregiver.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Location: {assignment.caregiver.location}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            <Award className="h-3 w-3 mr-1" />
                            {assignment.match_score}% match
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(assignment.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              {existingAssignments.admin.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Admin Assignments
                  </h4>
                  <ScrollArea className="h-48">
                    {existingAssignments.admin.map((assignment) => (
                      <div key={assignment.id} className="bg-muted p-3 rounded-md mb-2">
                        <p className="font-medium">{assignment.caregiver.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Location: {assignment.caregiver.location}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            <Award className="h-3 w-3 mr-1" />
                            {assignment.match_score}% match
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(assignment.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              {existingAssignments.automatic.length === 0 && existingAssignments.admin.length === 0 && (
                <p className="text-muted-foreground">No existing assignments found for this family user.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};