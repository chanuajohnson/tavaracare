
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shield, Users, CheckCircle2, Circle, Calendar, Star, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProfessionalForScreening {
  id: string;
  full_name: string;
  professional_type: string;
  phone_number: string;
  email?: string;
  references_count: number;
  screening_status: string;
  screening_id?: string;
}

export const ProfessionalScreeningPanel = () => {
  const [professionals, setProfessionals] = useState<ProfessionalForScreening[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalForScreening | null>(null);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    status: 'pending' as string,
    notes: '',
    rating: 0,
    recommendation: '' as string,
    interviewer_name: ''
  });

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      
      // Use admin RPC to bypass RLS and get ALL professionals
      const { data: allProfiles, error: profileError } = await supabase
        .rpc('admin_get_all_profiles_secure');

      if (profileError) throw profileError;

      // Filter to professionals client-side
      const profiles = (allProfiles || [])
        .filter((p: any) => p.role === 'professional');

      // Get references counts and screening statuses
      const enrichedProfessionals: ProfessionalForScreening[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count: refsCount } = await supabase
            .from('professional_references')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', profile.id);

          const { data: screening } = await supabase
            .from('professional_screening')
            .select('id, status')
            .eq('professional_id', profile.id)
            .eq('screening_type', 'head_nurse_interview')
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            id: profile.id,
            full_name: profile.full_name || 'Unknown',
            professional_type: profile.professional_type || 'Not specified',
            phone_number: profile.phone_number || '',
            references_count: refsCount || 0,
            screening_status: screening?.[0]?.status || 'not_started',
            screening_id: screening?.[0]?.id
          };
        })
      );

      setProfessionals(enrichedProfessionals);
    } catch (error) {
      console.error('Error fetching professionals for screening:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (professional: ProfessionalForScreening) => {
    setSelectedProfessional(professional);
    setShowInterviewDialog(true);
  };

  const handleSaveScreening = async () => {
    if (!selectedProfessional) return;

    try {
      if (selectedProfessional.screening_id) {
        // Update existing
        const { error } = await supabase
          .from('professional_screening')
          .update({
            status: interviewForm.status,
            notes: interviewForm.notes,
            rating: interviewForm.rating || null,
            recommendation: interviewForm.recommendation || null,
            interviewer_name: interviewForm.interviewer_name || null,
            completed_at: interviewForm.status === 'passed' || interviewForm.status === 'failed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedProfessional.screening_id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('professional_screening')
          .insert({
            professional_id: selectedProfessional.id,
            screening_type: 'head_nurse_interview',
            status: interviewForm.status,
            notes: interviewForm.notes,
            rating: interviewForm.rating || null,
            recommendation: interviewForm.recommendation || null,
            interviewer_name: interviewForm.interviewer_name || null,
            scheduled_at: interviewForm.status === 'scheduled' ? new Date().toISOString() : null,
            completed_at: interviewForm.status === 'passed' || interviewForm.status === 'failed' ? new Date().toISOString() : null
          });

        if (error) throw error;
      }

      // If passed, update screening_cleared on profile
      if (interviewForm.status === 'passed') {
        await supabase
          .from('profiles')
          .update({ 
            screening_cleared: true, 
            onboarding_stage: 'cleared',
            updated_at: new Date().toISOString() 
          })
          .eq('id', selectedProfessional.id);
      }

      toast.success('Screening record saved');
      setShowInterviewDialog(false);
      setInterviewForm({ status: 'pending', notes: '', rating: 0, recommendation: '', interviewer_name: '' });
      fetchProfessionals();
    } catch (error: any) {
      console.error('Error saving screening:', error);
      toast.error(error.message || 'Failed to save screening');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-700">✓ Passed</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-700">✗ Failed</Badge>;
      case 'scheduled': return <Badge className="bg-blue-100 text-blue-700">📅 Scheduled</Badge>;
      case 'needs_followup': return <Badge className="bg-amber-100 text-amber-700">⚠ Follow-up</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      default: return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getWhatsAppLink = (professional: ProfessionalForScreening) => {
    const phone = professional.phone_number?.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hi ${professional.full_name}! It's the Tavara Team 💙 Your application is progressing well! Next step: a brief 15-min video call with our Head Nurse for a quick screening. Please reply with your preferred day and time this week. Looking forward to connecting!`
    );
    return `https://api.whatsapp.com/send/?phone=${phone}&text=${message}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingScreenings = professionals.filter(p => p.screening_status !== 'passed' && p.references_count >= 2);
  const allProfessionals = professionals;

  return (
    <div className="space-y-6">
      {/* Pending Screenings */}
      {pendingScreenings.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Pending Screenings ({pendingScreenings.length})
            </CardTitle>
            <CardDescription>
              Professionals with 2+ references who need screening interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingScreenings.map(prof => (
                <div key={prof.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div>
                    <p className="font-medium">{prof.full_name}</p>
                    <p className="text-sm text-muted-foreground">{prof.professional_type} • {prof.references_count} references</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(prof.screening_status)}
                    {prof.phone_number && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={getWhatsAppLink(prof)} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Invite
                        </a>
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleScheduleInterview(prof)}>
                      <Calendar className="h-4 w-4 mr-1" />
                      {prof.screening_status === 'not_started' ? 'Schedule' : 'Update'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Professionals Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Professionals ({allProfessionals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allProfessionals.map(prof => (
              <div key={prof.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-sm">{prof.full_name}</p>
                    <p className="text-xs text-muted-foreground">{prof.professional_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {prof.references_count} refs
                  </Badge>
                  {getStatusBadge(prof.screening_status)}
                  <Button variant="ghost" size="sm" onClick={() => handleScheduleInterview(prof)}>
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Screening Interview - {selectedProfessional?.full_name}</DialogTitle>
            <DialogDescription>
              Record the outcome of the head nurse screening interview
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Interviewer Name</Label>
              <Input
                placeholder="Head Nurse name"
                value={interviewForm.interviewer_name}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewer_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={interviewForm.status} onValueChange={(v) => setInterviewForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="passed">Passed ✓</SelectItem>
                  <SelectItem value="failed">Failed ✗</SelectItem>
                  <SelectItem value="needs_followup">Needs Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <Button
                    key={n}
                    variant={interviewForm.rating >= n ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInterviewForm(prev => ({ ...prev, rating: n }))}
                  >
                    <Star className={`h-4 w-4 ${interviewForm.rating >= n ? 'fill-current' : ''}`} />
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Recommendation</Label>
              <Select value={interviewForm.recommendation} onValueChange={(v) => setInterviewForm(prev => ({ ...prev, recommendation: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Interview observations, concerns, strengths..."
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveScreening} className="flex-1">Save Screening</Button>
              <Button variant="outline" onClick={() => setShowInterviewDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
