
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Heart, Clock, MapPin, Star } from 'lucide-react';

interface FamilyProfile {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  role: string;
}

interface CareNeeds {
  id: string;
  care_recipient_name: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  preferred_time_start: string;
  preferred_time_end: string;
}

interface Caregiver {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
}

interface AdminMatchingInterfaceProps {
  familyUserId: string;
  onClose: () => void;
  onMatchAssigned: () => void;
}

export const AdminMatchingInterface: React.FC<AdminMatchingInterfaceProps> = ({
  familyUserId,
  onClose,
  onMatchAssigned
}) => {
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [careNeeds, setCareNeeds] = useState<CareNeeds | null>(null);
  const [availableCaregivers, setAvailableCaregivers] = useState<Caregiver[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('');
  const [interventionType, setInterventionType] = useState<string>('manual_match');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [adminMatchScore, setAdminMatchScore] = useState<number>(85);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFamilyData();
    fetchAvailableCaregivers();
  }, [familyUserId]);

  const fetchFamilyData = async () => {
    try {
      // Fetch family profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, address, role')
        .eq('id', familyUserId)
        .single();

      if (profileError) throw profileError;
      setFamilyProfile(profile);

      // Fetch care needs
      const { data: needs, error: needsError } = await supabase
        .from('care_needs_family')
        .select('id, care_recipient_name, primary_contact_name, primary_contact_phone, preferred_time_start, preferred_time_end')
        .eq('profile_id', familyUserId)
        .maybeSingle();

      if (needsError && needsError.code !== 'PGRST116') {
        console.error('Error fetching care needs:', needsError);
      } else {
        setCareNeeds(needs);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
      toast.error('Failed to load family information');
    }
  };

  const fetchAvailableCaregivers = async () => {
    try {
      const { data: caregivers, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, address')
        .eq('role', 'professional')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableCaregivers(caregivers || []);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
      toast.error('Failed to load available caregivers');
    }
  };

  const handleAssignMatch = async () => {
    if (!selectedCaregiver) {
      toast.error('Please select a caregiver');
      return;
    }

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

  const getCaregiverMatchScore = (caregiver: Caregiver) => {
    // Simple matching algorithm based on available data
    let score = 50; // Base score
    
    if (careNeeds && familyProfile) {
      // Location proximity (placeholder logic)
      if (caregiver.address && familyProfile.address) {
        score += 20;
      }
      
      // Basic availability score
      score += 30;
    }
    
    return Math.min(100, score);
  };

  return (
    <div className="space-y-6">
      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Family Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {familyProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Care Needs Summary */}
      {careNeeds && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Care Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Care Recipient</p>
                <p className="text-sm text-gray-600">{careNeeds.care_recipient_name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Primary Contact</p>
                <p className="text-sm text-gray-600">{careNeeds.primary_contact_name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Preferred Time</p>
                <p className="text-sm text-gray-600">
                  {careNeeds.preferred_time_start && careNeeds.preferred_time_end 
                    ? `${careNeeds.preferred_time_start} - ${careNeeds.preferred_time_end}`
                    : 'Flexible'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Caregivers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Caregivers ({availableCaregivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {availableCaregivers.map((caregiver) => {
              const matchScore = getCaregiverMatchScore(caregiver);
              return (
                <div
                  key={caregiver.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCaregiver === caregiver.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCaregiver(caregiver.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{caregiver.full_name}</p>
                      <p className="text-sm text-gray-600">{caregiver.phone_number}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{matchScore}%</span>
                      </div>
                      <Badge variant={matchScore >= 75 ? 'default' : matchScore >= 50 ? 'secondary' : 'outline'}>
                        {matchScore >= 75 ? 'High Match' : matchScore >= 50 ? 'Good Match' : 'Fair Match'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
                <SelectItem value="bulk_match">Bulk Match</SelectItem>
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
            <Label>Reason</Label>
            <Textarea
              placeholder="Reason for manual intervention..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional notes about this assignment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleAssignMatch} 
          disabled={loading || !selectedCaregiver}
        >
          {loading ? 'Assigning...' : 'Assign Caregiver'}
        </Button>
      </div>
    </div>
  );
};
