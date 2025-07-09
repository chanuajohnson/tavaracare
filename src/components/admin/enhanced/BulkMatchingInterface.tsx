import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Clock, CheckCircle, AlertTriangle, User, Star } from 'lucide-react';
import { PriorityScoring } from './PriorityScoring';

interface BulkFamily {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  care_types?: string[];
  priority_score: number;
  wait_time_days: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  recommended_caregiver?: string;
  match_score?: number;
}

interface BulkCaregiver {
  id: string;
  full_name: string;
  care_types?: string[];
  availability_score: number;
  current_assignments: number;
  max_assignments: number;
}

interface BulkMatchingInterfaceProps {
  onClose: () => void;
  onBulkAssigned: () => void;
}

export const BulkMatchingInterface: React.FC<BulkMatchingInterfaceProps> = ({
  onClose,
  onBulkAssigned
}) => {
  const [families, setFamilies] = useState<BulkFamily[]>([]);
  const [caregivers, setCaregivers] = useState<BulkCaregiver[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [bulkReason, setBulkReason] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [assignmentMethod, setAssignmentMethod] = useState<'automatic' | 'manual'>('automatic');
  const [manualAssignments, setManualAssignments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFamiliesForBulkMatching();
    fetchAvailableCaregivers();
  }, []);

  const fetchFamiliesForBulkMatching = async () => {
    try {
      setLoading(true);
      
      // Get families without active assignments
      const { data: families, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, address, care_types, created_at')
        .eq('role', 'family')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter out families with active assignments
      const { data: activeAssignments } = await supabase
        .from('manual_caregiver_assignments')
        .select('family_user_id')
        .eq('is_active', true);

      const activeFamilyIds = new Set(activeAssignments?.map(a => a.family_user_id) || []);
      const availableFamilies = families?.filter(f => !activeFamilyIds.has(f.id)) || [];

      // Process families with priority scoring
      const processedFamilies: BulkFamily[] = await Promise.all(
        availableFamilies.map(async (family) => {
          const waitTimeDays = Math.floor(
            (new Date().getTime() - new Date(family.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          const priorityScore = await calculatePriorityScore(family.id, waitTimeDays);
          const urgency_level = await determineUrgencyLevel(family.id);
          
          return {
            ...family,
            priority_score: priorityScore,
            wait_time_days: waitTimeDays,
            urgency_level
          };
        })
      );

      // Sort by priority score (highest first)
      processedFamilies.sort((a, b) => b.priority_score - a.priority_score);
      
      setFamilies(processedFamilies);
    } catch (error) {
      console.error('Error fetching families:', error);
      toast.error('Failed to load families for bulk matching');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCaregivers = async () => {
    try {
      const { data: caregivers, error } = await supabase
        .from('profiles')
        .select('id, full_name, care_types')
        .eq('role', 'professional')
        .eq('available_for_matching', true);

      if (error) throw error;

      // Get current assignment counts
      const processedCaregivers: BulkCaregiver[] = await Promise.all(
        (caregivers || []).map(async (caregiver) => {
          const { data: assignments } = await supabase
            .from('manual_caregiver_assignments')
            .select('id')
            .eq('caregiver_id', caregiver.id)
            .eq('is_active', true);

          return {
            ...caregiver,
            availability_score: 85, // Placeholder
            current_assignments: assignments?.length || 0,
            max_assignments: 5 // Configurable limit
          };
        })
      );

      setCaregivers(processedCaregivers);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
      toast.error('Failed to load available caregivers');
    }
  };

  const calculatePriorityScore = async (familyId: string, waitTimeDays: number): Promise<number> => {
    let score = 50; // Base score
    
    // Wait time factor
    score += Math.min(30, waitTimeDays * 2);
    
    // Check for medical urgency
    const { data: careNeeds } = await supabase
      .from('care_needs_family')
      .select('diagnosed_conditions, chronic_illness_type, emergency_plan')
      .eq('profile_id', familyId)
      .maybeSingle();
    
    if (careNeeds) {
      if (careNeeds.diagnosed_conditions || careNeeds.chronic_illness_type) {
        score += 20;
      }
      if (careNeeds.emergency_plan) {
        score += 10;
      }
    }
    
    // Check for previous failed matches
    const { data: failedMatches } = await supabase
      .from('manual_caregiver_assignments')
      .select('id')
      .eq('family_user_id', familyId)
      .eq('is_active', false);
    
    if (failedMatches && failedMatches.length > 0) {
      score += failedMatches.length * 15;
    }
    
    return Math.min(100, score);
  };

  const determineUrgencyLevel = async (familyId: string): Promise<'low' | 'medium' | 'high' | 'critical'> => {
    const { data: careNeeds } = await supabase
      .from('care_needs_family')
      .select('diagnosed_conditions, chronic_illness_type, emergency_plan, assistance_medication')
      .eq('profile_id', familyId)
      .maybeSingle();
    
    if (!careNeeds) return 'low';
    
    if (careNeeds.emergency_plan || careNeeds.diagnosed_conditions?.includes('critical')) {
      return 'critical';
    }
    if (careNeeds.chronic_illness_type || careNeeds.diagnosed_conditions) {
      return 'high';
    }
    if (careNeeds.assistance_medication) {
      return 'medium';
    }
    return 'low';
  };

  const generateAutomaticMatches = async () => {
    const newManualAssignments: Record<string, string> = {};
    
    // Simple matching algorithm
    const availableCaregivers = caregivers.filter(c => c.current_assignments < c.max_assignments);
    
    selectedFamilies.forEach((familyId, index) => {
      const caregiverIndex = index % availableCaregivers.length;
      if (availableCaregivers[caregiverIndex]) {
        newManualAssignments[familyId] = availableCaregivers[caregiverIndex].id;
      }
    });
    
    setManualAssignments(newManualAssignments);
  };

  const handleFamilySelect = (familyId: string, checked: boolean) => {
    if (checked) {
      setSelectedFamilies(prev => [...prev, familyId]);
    } else {
      setSelectedFamilies(prev => prev.filter(id => id !== familyId));
      // Remove from manual assignments if unselected
      setManualAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[familyId];
        return newAssignments;
      });
    }
  };

  const handleBulkAssignment = async () => {
    if (selectedFamilies.length === 0) {
      toast.error('Please select at least one family');
      return;
    }

    if (!bulkReason.trim()) {
      toast.error('Please provide a reason for bulk assignment');
      return;
    }

    setIsProcessing(true);
    setProcessProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const totalAssignments = selectedFamilies.length;
      let completed = 0;

      for (const familyId of selectedFamilies) {
        const caregiverId = manualAssignments[familyId];
        
        if (!caregiverId) {
          console.warn(`No caregiver assigned for family ${familyId}`);
          completed++;
          setProcessProgress((completed / totalAssignments) * 100);
          continue;
        }

        // Create admin intervention
        await supabase
          .from('admin_match_interventions')
          .insert({
            admin_id: user.id,
            family_user_id: familyId,
            caregiver_id: caregiverId,
            intervention_type: 'bulk_match',
            reason: bulkReason,
            notes: bulkNotes,
            admin_match_score: 80, // Default score for bulk assignments
            status: 'active'
          });

        // Create manual assignment
        await supabase
          .from('manual_caregiver_assignments')
          .insert({
            family_user_id: familyId,
            caregiver_id: caregiverId,
            assigned_by_admin_id: user.id,
            assignment_reason: bulkReason,
            match_score: 80,
            is_active: true
          });

        completed++;
        setProcessProgress((completed / totalAssignments) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`Successfully assigned ${completed} caregivers to families`);
      onBulkAssigned();
      onClose();
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      toast.error('Failed to complete bulk assignment');
    } finally {
      setIsProcessing(false);
      setProcessProgress(0);
    }
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Caregiver Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Selected: {selectedFamilies.length} families
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedFamilies.length === families.length) {
                      setSelectedFamilies([]);
                      setManualAssignments({});
                    } else {
                      setSelectedFamilies(families.map(f => f.id));
                    }
                  }}
                >
                  {selectedFamilies.length === families.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label>Method:</Label>
                <Select value={assignmentMethod} onValueChange={(value: 'automatic' | 'manual') => setAssignmentMethod(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                {assignmentMethod === 'automatic' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAutomaticMatches}
                    disabled={selectedFamilies.length === 0}
                  >
                    Generate Matches
                  </Button>
                )}
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing bulk assignments...</span>
                </div>
                <Progress value={processProgress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Families List */}
      <Card>
        <CardHeader>
          <CardTitle>Families Awaiting Assignment ({families.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {families.map((family) => (
              <div
                key={family.id}
                className={`p-3 border rounded-lg ${
                  selectedFamilies.includes(family.id) ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedFamilies.includes(family.id)}
                      onCheckedChange={(checked) => handleFamilySelect(family.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{family.full_name}</p>
                        <PriorityScoring score={family.priority_score} />
                        <Badge className={`${getUrgencyBadgeColor(family.urgency_level)} text-white`}>
                          {family.urgency_level.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{family.phone_number}</p>
                      <p className="text-sm text-gray-500">Wait time: {family.wait_time_days} days</p>
                      
                      {/* Care Types */}
                      {family.care_types && family.care_types.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {family.care_types.slice(0, 3).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {family.care_types.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{family.care_types.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Caregiver Assignment */}
                  {selectedFamilies.includes(family.id) && assignmentMethod === 'manual' && (
                    <div className="min-w-48">
                      <Label className="text-xs">Assign Caregiver:</Label>
                      <Select
                        value={manualAssignments[family.id] || ''}
                        onValueChange={(value) => setManualAssignments(prev => ({ ...prev, [family.id]: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select caregiver" />
                        </SelectTrigger>
                        <SelectContent>
                          {caregivers
                            .filter(c => c.current_assignments < c.max_assignments)
                            .map((caregiver) => (
                              <SelectItem key={caregiver.id} value={caregiver.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{caregiver.full_name}</span>
                                  <span className="text-xs text-gray-500">
                                    {caregiver.current_assignments}/{caregiver.max_assignments}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Automatic Assignment Display */}
                  {selectedFamilies.includes(family.id) && assignmentMethod === 'automatic' && manualAssignments[family.id] && (
                    <div className="min-w-48">
                      <Label className="text-xs">Assigned Caregiver:</Label>
                      <div className="mt-1 p-2 bg-green-50 rounded border">
                        <p className="text-sm font-medium">
                          {caregivers.find(c => c.id === manualAssignments[family.id])?.full_name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Assignment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Reason for Bulk Assignment *</Label>
            <Textarea
              placeholder="Reason for bulk caregiver assignment..."
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label>Additional Notes</Label>
            <Textarea
              placeholder="Additional notes about this bulk assignment..."
              value={bulkNotes}
              onChange={(e) => setBulkNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleBulkAssignment}
          disabled={
            isProcessing || 
            selectedFamilies.length === 0 || 
            !bulkReason.trim() ||
            (assignmentMethod === 'manual' && selectedFamilies.some(id => !manualAssignments[id]))
          }
        >
          {isProcessing ? 'Processing...' : `Assign ${selectedFamilies.length} Caregivers`}
        </Button>
      </div>
    </div>
  );
};