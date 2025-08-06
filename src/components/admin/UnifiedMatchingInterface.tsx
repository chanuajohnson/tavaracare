import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useUnifiedMatches } from '@/hooks/useUnifiedMatches';
import { User, Heart, Clock, MapPin, Star, Search, CheckCircle, Users } from 'lucide-react';

interface FamilyProfile {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  care_types?: string[];
  special_needs?: string[];
  care_schedule?: string;
  created_at: string;
}

interface CaregiverProfile {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  care_types?: string[];
  years_of_experience?: string;
  certifications?: string[];
  available_for_matching: boolean;
  match_score?: number;
}

interface UnifiedMatchingInterfaceProps {
  familyUserId?: string;
  onClose: () => void;
  onMatchAssigned: () => void;
}

export const UnifiedMatchingInterface: React.FC<UnifiedMatchingInterfaceProps> = ({
  familyUserId,
  onClose,
  onMatchAssigned
}) => {
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [availableCaregivers, setAvailableCaregivers] = useState<CaregiverProfile[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<'manual' | 'care_team'>('manual');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [adminMatchScore, setAdminMatchScore] = useState<number>(85);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchScores, setMatchScores] = useState<Record<string, any>>({});
  
  const { calculateMatchScore, createAssignment } = useUnifiedMatches('family');

  useEffect(() => {
    if (familyUserId) {
      fetchFamilyData();
    }
    fetchAvailableCaregivers();
  }, [familyUserId]);

  const fetchFamilyData = async () => {
    if (!familyUserId) return;

    try {
      const { data: family, error: familyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', familyUserId)
        .eq('role', 'family')
        .single();

      if (familyError) throw familyError;
      setFamilyProfile(family);
    } catch (error) {
      console.error('Error fetching family data:', error);
      toast.error('Failed to load family profile');
    }
  };

  const fetchAvailableCaregivers = async () => {
    try {
      const { data: caregivers, error: caregiversError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional')
        .eq('available_for_matching', true)
        .not('full_name', 'is', null)
        .order('created_at', { ascending: false });

      if (caregiversError) throw caregiversError;
      setAvailableCaregivers(caregivers || []);

      // Calculate match scores for each caregiver if family is selected
      if (familyUserId && caregivers) {
        const scores: Record<string, any> = {};
        for (const caregiver of caregivers) {
          try {
            const score = await calculateMatchScore(familyUserId, caregiver.id);
            scores[caregiver.id] = score;
          } catch (error) {
            console.warn(`Failed to calculate match score for caregiver ${caregiver.id}`);
            scores[caregiver.id] = { overall_score: 70, match_explanation: 'Unable to calculate detailed score' };
          }
        }
        setMatchScores(scores);
      }
    } catch (error) {
      console.error('Error fetching caregivers:', error);
      toast.error('Failed to load available caregivers');
    }
  };

  const handleAssignMatch = async () => {
    if (!familyUserId || !selectedCaregiver) {
      toast.error('Please select a caregiver');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for this assignment');
      return;
    }

    setLoading(true);

    try {
      const assignmentId = await createAssignment(
        familyUserId,
        selectedCaregiver,
        assignmentType,
        adminMatchScore,
        reason,
        notes
      );

      if (assignmentId) {
        toast.success('Assignment created successfully');
        onMatchAssigned();
        onClose();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const filteredCaregivers = availableCaregivers.filter(caregiver =>
    caregiver.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caregiver.care_types?.some(type => 
      type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).sort((a, b) => {
    // Sort by match score if available
    const scoreA = matchScores[a.id]?.overall_score || 0;
    const scoreB = matchScores[b.id]?.overall_score || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-6">
      {/* Family Profile Section */}
      {familyProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Family Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{familyProfile.full_name}</p>
                <p className="text-sm text-gray-600">{familyProfile.phone_number}</p>
                <p className="text-sm text-gray-600">{familyProfile.address}</p>
              </div>
              <div>
                {familyProfile.care_types && (
                  <div className="mb-2">
                    <p className="text-sm font-medium mb-1">Care Types Needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {familyProfile.care_types.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Assignment Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find & Assign Caregiver
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Caregivers</Label>
              <Input
                id="search"
                placeholder="Search by name or care type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="assignmentType">Assignment Type</Label>
              <Select value={assignmentType} onValueChange={(value: 'manual' | 'care_team') => setAssignmentType(value)}>
                <SelectTrigger id="assignmentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Assignment</SelectItem>
                  <SelectItem value="care_team">Care Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reason">Assignment Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Why is this assignment being made?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="w-32">
            <Label htmlFor="adminScore">Override Match Score</Label>
            <Input
              id="adminScore"
              type="number"
              min="0"
              max="100"
              value={adminMatchScore}
              onChange={(e) => setAdminMatchScore(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Caregivers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Caregivers ({filteredCaregivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredCaregivers.map((caregiver) => {
              const matchScore = matchScores[caregiver.id];
              const isSelected = selectedCaregiver === caregiver.id;
              
              return (
                <div
                  key={caregiver.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCaregiver(caregiver.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{caregiver.full_name}</h4>
                        {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{caregiver.phone_number}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {caregiver.years_of_experience || 'Experience not specified'}
                        </span>
                        {matchScore && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {matchScore.overall_score}% match
                          </span>
                        )}
                      </div>

                      {caregiver.care_types && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {caregiver.care_types.slice(0, 3).map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {caregiver.care_types.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{caregiver.care_types.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {matchScore?.match_explanation && (
                        <p className="text-xs text-gray-600 italic">
                          {matchScore.match_explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredCaregivers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No caregivers found matching your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleAssignMatch} 
          disabled={loading || !selectedCaregiver || !reason.trim()}
        >
          {loading ? 'Creating Assignment...' : 'Create Assignment'}
        </Button>
      </div>
    </div>
  );
};