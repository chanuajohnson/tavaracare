import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Heart, Clock, MapPin, Star, Filter, Search, AlertTriangle, CheckCircle, Calendar, Award, Users } from 'lucide-react';
import { BulkMatchingInterface } from './BulkMatchingInterface';
import { PriorityScoring } from './PriorityScoring';
import { MatchQualityValidator } from './MatchQualityValidator';

interface EnhancedFamilyProfile {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  role: string;
  care_types?: string[];
  special_needs?: string[];
  care_schedule?: string;
  created_at: string;
  priority_score?: number;
  wait_time_days?: number;
}

interface EnhancedCareNeeds {
  id: string;
  care_recipient_name: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  preferred_time_start: string;
  preferred_time_end: string;
  care_types?: string[];
  special_needs?: string[];
  urgency_level?: 'low' | 'medium' | 'high' | 'critical';
}

interface EnhancedCaregiver {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  care_types?: string[];
  specialties?: string[];
  years_of_experience?: string;
  certifications?: string[];
  availability_schedule?: string[];
  available_for_matching: boolean;
  match_score: number;
  availability_score: number;
  compatibility_score: number;
  proximity_score: number;
  experience_score: number;
  overall_quality_score: number;
  last_assignment?: string;
  total_assignments?: number;
}

interface EnhancedAdminMatchingInterfaceProps {
  familyUserId?: string;
  onClose: () => void;
  onMatchAssigned: () => void;
  mode?: 'single' | 'bulk';
}

export const EnhancedAdminMatchingInterface: React.FC<EnhancedAdminMatchingInterfaceProps> = ({
  familyUserId,
  onClose,
  onMatchAssigned,
  mode = 'single'
}) => {
  const [familyProfile, setFamilyProfile] = useState<EnhancedFamilyProfile | null>(null);
  const [careNeeds, setCareNeeds] = useState<EnhancedCareNeeds | null>(null);
  const [availableCaregivers, setAvailableCaregivers] = useState<EnhancedCaregiver[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('');
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [interventionType, setInterventionType] = useState<string>('manual_match');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [adminMatchScore, setAdminMatchScore] = useState<number>(85);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('');
  const [filterAvailability, setFilterAvailability] = useState<string>('');
  const [minMatchScore, setMinMatchScore] = useState<number>(60);
  const [showBulkInterface, setShowBulkInterface] = useState(false);
  const [currentMode, setCurrentMode] = useState<'single' | 'bulk'>(mode);
  const [matchValidation, setMatchValidation] = useState<any>(null);
  const [allowOverride, setAllowOverride] = useState<boolean>(false);

  useEffect(() => {
    if (familyUserId) {
      fetchFamilyData();
    }
    fetchEnhancedCaregivers();
  }, [familyUserId]);

  const fetchFamilyData = async () => {
    if (!familyUserId) return;
    
    try {
      // Fetch family profile with enhanced data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, address, role, care_types, special_needs, care_schedule, created_at')
        .eq('id', familyUserId)
        .single();

      if (profileError) throw profileError;
      
      // Calculate priority score and wait time
      const waitTimeDays = Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const priorityScore = await calculatePriorityScore(familyUserId, waitTimeDays);
      
      setFamilyProfile({
        ...profile,
        priority_score: priorityScore,
        wait_time_days: waitTimeDays
      });

      // Fetch enhanced care needs
      const { data: needs, error: needsError } = await supabase
        .from('care_needs_family')
        .select('*')
        .eq('profile_id', familyUserId)
        .maybeSingle();

      if (needsError && needsError.code !== 'PGRST116') {
        console.error('Error fetching care needs:', needsError);
      } else if (needs) {
        setCareNeeds({
          ...needs,
          urgency_level: determineUrgencyLevel(needs)
        });
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
      toast.error('Failed to load family information');
    }
  };

  const fetchEnhancedCaregivers = async () => {
    try {
      const { data: caregivers, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, address, care_types, years_of_experience, available_for_matching, created_at')
        .eq('role', 'professional')
        .eq('available_for_matching', true) // Fix: Only show available caregivers
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get assignment history for each caregiver
      const enhancedCaregivers = await Promise.all(
        (caregivers || []).map(async (caregiver) => {
          const { data: assignments } = await supabase
            .from('manual_caregiver_assignments')
            .select('created_at, is_active')
            .eq('caregiver_id', caregiver.id)
            .order('created_at', { ascending: false });

          const totalAssignments = assignments?.length || 0;
          const lastAssignment = assignments?.[0]?.created_at || null;
          
          // Calculate enhanced match scores
          const matchScores = await calculateEnhancedMatchScores(caregiver, familyProfile, careNeeds);
          
          return {
            ...caregiver,
            ...matchScores,
            total_assignments: totalAssignments,
            last_assignment: lastAssignment
          };
        })
      );

      // Sort by overall quality score
      enhancedCaregivers.sort((a, b) => b.overall_quality_score - a.overall_quality_score);
      
      setAvailableCaregivers(enhancedCaregivers);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
      toast.error('Failed to load available caregivers');
    }
  };

  const calculatePriorityScore = async (familyId: string, waitTimeDays: number): Promise<number> => {
    let score = 50; // Base score
    
    // Wait time factor (0-30 points)
    score += Math.min(30, waitTimeDays * 2);
    
    // Check for special needs urgency
    const { data: careNeeds } = await supabase
      .from('care_needs_family')
      .select('diagnosed_conditions, emergency_plan, chronic_illness_type')
      .eq('profile_id', familyId)
      .maybeSingle();
    
    if (careNeeds) {
      if (careNeeds.diagnosed_conditions || careNeeds.chronic_illness_type) {
        score += 20; // Medical urgency
      }
      if (careNeeds.emergency_plan) {
        score += 10; // Emergency planning indicates higher need
      }
    }
    
    // Check for failed matches
    const { data: failedMatches } = await supabase
      .from('manual_caregiver_assignments')
      .select('id')
      .eq('family_user_id', familyId)
      .eq('is_active', false);
    
    if (failedMatches && failedMatches.length > 0) {
      score += failedMatches.length * 10; // Previous failed matches increase priority
    }
    
    return Math.min(100, score);
  };

  const determineUrgencyLevel = (needs: any): 'low' | 'medium' | 'high' | 'critical' => {
    if (needs.diagnosed_conditions?.includes('critical') || needs.emergency_plan) {
      return 'critical';
    }
    if (needs.chronic_illness_type || needs.diagnosed_conditions) {
      return 'high';
    }
    if (needs.assistance_medication || needs.assistance_mobility) {
      return 'medium';
    }
    return 'low';
  };

  const calculateEnhancedMatchScores = async (caregiver: any, family: any, needs: any) => {
    let availabilityScore = 70;
    let compatibilityScore = 70;
    let proximityScore = 70;
    let experienceScore = 70;
    
    // Availability scoring
    if (caregiver.availability_schedule && family?.care_schedule) {
      const caregiverSchedule = Array.isArray(caregiver.availability_schedule) 
        ? caregiver.availability_schedule 
        : caregiver.availability_schedule.split(',');
      const familySchedule = family.care_schedule.split(',');
      
      const matches = caregiverSchedule.filter(shift => familySchedule.includes(shift));
      availabilityScore = Math.min(100, (matches.length / familySchedule.length) * 100);
    }
    
    // Compatibility scoring
    if (caregiver.care_types && family?.care_types) {
      const caregiverTypes = Array.isArray(caregiver.care_types) ? caregiver.care_types : [caregiver.care_types];
      const familyTypes = Array.isArray(family.care_types) ? family.care_types : [family.care_types];
      
      const matches = caregiverTypes.filter(type => familyTypes.includes(type));
      compatibilityScore = Math.min(100, (matches.length / familyTypes.length) * 100);
    }
    
    // Proximity scoring (placeholder - would need actual geolocation)
    if (caregiver.address && family?.address) {
      proximityScore = 80; // Placeholder
    }
    
    // Experience scoring
    if (caregiver.years_of_experience) {
      const years = parseInt(caregiver.years_of_experience);
      experienceScore = Math.min(100, 50 + (years * 10));
    }
    
    const overallScore = Math.round(
      (availabilityScore * 0.3) + 
      (compatibilityScore * 0.3) + 
      (proximityScore * 0.2) + 
      (experienceScore * 0.2)
    );
    
    return {
      match_score: overallScore,
      availability_score: availabilityScore,
      compatibility_score: compatibilityScore,
      proximity_score: proximityScore,
      experience_score: experienceScore,
      overall_quality_score: overallScore
    };
  };

  const handleValidateMatch = async (caregiverId: string, override: boolean = false) => {
    if (!familyUserId) return;
    
    const validation = await MatchQualityValidator.validateMatch(
      familyUserId,
      caregiverId,
      minMatchScore,
      override
    );
    
    setMatchValidation(validation);
    
    if (!validation.isValid && !override) {
      toast.error(`Match validation failed: ${validation.issues.join(', ')}`);
      return false;
    }
    
    if (override && validation.issues.length > 0) {
      toast.warning(`Match validation overridden with ${validation.issues.length} issues`);
    }
    
    return true;
  };

  const handleAssignMatch = async () => {
    if (!selectedCaregiver || !familyUserId) {
      toast.error('Please select a caregiver and family');
      return;
    }

    // Validate match quality with override capability
    const isValidMatch = await handleValidateMatch(selectedCaregiver, allowOverride);
    if (!isValidMatch) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create admin match intervention
      const { error: interventionError } = await supabase
        .from('admin_match_interventions')
        .insert({
          admin_id: user.id,
          family_user_id: familyUserId,
          caregiver_id: selectedCaregiver,
          intervention_type: interventionType,
          reason: reason,
          notes: notes,
          admin_match_score: adminMatchScore,
          status: 'active'
        });

      if (interventionError) throw interventionError;

      // Create manual caregiver assignment
      const { error: assignmentError } = await supabase
        .from('manual_caregiver_assignments')
        .insert({
          family_user_id: familyUserId,
          caregiver_id: selectedCaregiver,
          assigned_by_admin_id: user.id,
          assignment_reason: reason,
          match_score: adminMatchScore,
          is_active: true
        });

      if (assignmentError) throw assignmentError;

      toast.success('Caregiver successfully assigned to family');
      onMatchAssigned();
      onClose();
    } catch (error: any) {
      console.error('Error assigning match:', error);
      toast.error(error.message || 'Failed to assign caregiver');
    } finally {
      setLoading(false);
    }
  };

  const filteredCaregivers = availableCaregivers.filter(caregiver => {
    const matchesSearch = caregiver.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !filterSpecialty || filterSpecialty === 'all' || caregiver.care_types?.includes(filterSpecialty);
    const matchesMinScore = caregiver.overall_quality_score >= minMatchScore;
    
    return matchesSearch && matchesSpecialty && matchesMinScore;
  });

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (showBulkInterface) {
    return (
      <BulkMatchingInterface
        onClose={() => setShowBulkInterface(false)}
        onBulkAssigned={onMatchAssigned}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={currentMode === 'single' ? 'default' : 'outline'}
            onClick={() => setCurrentMode('single')}
            size="sm"
          >
            <User className="h-4 w-4 mr-2" />
            Single Match
          </Button>
          <Button
            variant={currentMode === 'bulk' ? 'default' : 'outline'}
            onClick={() => setShowBulkInterface(true)}
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk Matching
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Label>Min Match Score:</Label>
          <Input
            type="number"
            value={minMatchScore}
            onChange={(e) => setMinMatchScore(Number(e.target.value))}
            min="0"
            max="100"
            className="w-20"
          />
        </div>
      </div>

      {/* Family Information with Priority */}
      {familyProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Family Profile
              <PriorityScoring score={familyProfile.priority_score || 0} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium">{familyProfile.full_name}</p>
                <p className="text-sm text-gray-600">{familyProfile.phone_number}</p>
              </div>
              <div>
                {familyProfile.address && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {familyProfile.address}
                  </div>
                )}
                <Badge variant="outline" className="mt-2">
                  {familyProfile.role}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Wait Time: {familyProfile.wait_time_days} days</p>
                {careNeeds && (
                  <Badge className={`mt-2 ${getUrgencyBadgeColor(careNeeds.urgency_level || 'low')}`}>
                    {careNeeds.urgency_level?.toUpperCase()} URGENCY
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Caregivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search caregivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Filter by Specialty</Label>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  <SelectItem value="personal_care">Personal Care</SelectItem>
                  <SelectItem value="medication_management">Medication Management</SelectItem>
                  <SelectItem value="mobility_assistance">Mobility Assistance</SelectItem>
                  <SelectItem value="companionship">Companionship</SelectItem>
                  <SelectItem value="specialized_care">Specialized Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filter by Availability</Label>
              <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="All availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All availability</SelectItem>
                  <SelectItem value="weekday">Weekday</SelectItem>
                  <SelectItem value="weekend">Weekend</SelectItem>
                  <SelectItem value="overnight">Overnight</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Available Caregivers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Caregivers ({filteredCaregivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredCaregivers.map((caregiver) => (
              <div
                key={caregiver.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCaregiver === caregiver.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedCaregiver(caregiver.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{caregiver.full_name}</p>
                      {caregiver.certifications && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Certified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{caregiver.phone_number}</p>
                    
                    {/* Care Types */}
                    {caregiver.care_types && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {caregiver.care_types.slice(0, 3).map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {caregiver.care_types.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{caregiver.care_types.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Experience and Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Exp: {caregiver.years_of_experience || 'N/A'}</span>
                      <span>Assignments: {caregiver.total_assignments || 0}</span>
                      {caregiver.last_assignment && (
                        <span>Last: {new Date(caregiver.last_assignment).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {/* Overall Score */}
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className={`text-sm font-medium ${getMatchScoreColor(caregiver.overall_quality_score)}`}>
                        {caregiver.overall_quality_score}%
                      </span>
                    </div>
                    
                    {/* Detailed Scores */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Availability:</span>
                        <span>{caregiver.availability_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compatibility:</span>
                        <span>{caregiver.compatibility_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span>{caregiver.experience_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Match Validation Results */}
      {matchValidation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {matchValidation.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              Match Quality Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${matchValidation.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="font-medium mb-2">
                {matchValidation.isValid ? 'Match Quality: APPROVED' : 'Match Quality: NEEDS ATTENTION'}
              </p>
              {matchValidation.issues.length > 0 && (
                <ul className="text-sm space-y-1">
                  {matchValidation.issues.map((issue: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Intervention Type</Label>
            <Select value={interventionType} onValueChange={setInterventionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual_match">Manual Match</SelectItem>
                <SelectItem value="override_algorithm">Override Algorithm</SelectItem>
                <SelectItem value="reassignment">Reassignment</SelectItem>
                <SelectItem value="quality_override">Quality Override</SelectItem>
                <SelectItem value="priority_assignment">Priority Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Admin Match Score</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={adminMatchScore}
              onChange={(e) => setAdminMatchScore(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Reason for Assignment</Label>
            <Textarea
              placeholder="Reason for manual intervention..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Additional Notes</Label>
            <Textarea
              placeholder="Additional notes about this assignment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowOverride"
              checked={allowOverride}
              onCheckedChange={(checked) => setAllowOverride(checked === true)}
            />
            <Label htmlFor="allowOverride" className="text-sm">
              Override validation warnings and proceed with assignment
            </Label>
          </div>
          
          {allowOverride && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Override Mode Enabled</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                This will bypass validation checks and allow the assignment despite compatibility issues.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleValidateMatch(selectedCaregiver)}
            disabled={!selectedCaregiver}
          >
            Validate Match
          </Button>
          <Button 
            onClick={handleAssignMatch} 
            disabled={loading || !selectedCaregiver || !reason.trim()}
          >
            {loading ? 'Assigning...' : 'Assign Caregiver'}
          </Button>
        </div>
      </div>
    </div>
  );
};