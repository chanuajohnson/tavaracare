
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
import { Shield, Users, CheckCircle2, Calendar, Star, MessageCircle } from 'lucide-react';
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
  sessions_status?: 'all_reviewed' | 'some_pending' | 'none';
}

export const ProfessionalScreeningPanel = () => {
  const [professionals, setProfessionals] = useState<ProfessionalForScreening[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalForScreening | null>(null);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [markingPassed, setMarkingPassed] = useState<string | null>(null);
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
      
      const { data: allProfiles, error: profileError } = await supabase
        .rpc('admin_get_all_profiles_secure');

      if (profileError) throw profileError;

      const profiles = (allProfiles || [])
        .filter((p: any) => p.role === 'professional');

      const enrichedProfessionals: ProfessionalForScreening[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [refsResult, screeningResult, sessionsResult] = await Promise.all([
            supabase
              .from('professional_references')
              .select('*', { count: 'exact', head: true })
              .eq('professional_id', profile.id),
            supabase
              .from('professional_screening')
              .select('id, status')
              .eq('professional_id', profile.id)
              .eq('screening_type', 'head_nurse_interview')
              .order('created_at', { ascending: false })
              .limit(1),
            supabase
              .from('screening_sessions')
              .select('id, status')
              .eq('professional_id', profile.id)
          ]);

          // Determine sessions status
          const sessions = sessionsResult.data || [];
          let sessionsStatus: 'all_reviewed' | 'some_pending' | 'none' = 'none';
          if (sessions.length > 0) {
            const allReviewed = sessions.every(
              (s: any) => s.status === 'reviewed' || s.status === 'completed'
            );
            sessionsStatus = allReviewed ? 'all_reviewed' : 'some_pending';
          }

          const formalStatus = screeningResult.data?.[0]?.status || 'not_started';

          return {
            id: profile.id,
            full_name: profile.full_name || 'Unknown',
            professional_type: profile.professional_type || 'Not specified',
            phone_number: profile.phone_number || '',
            references_count: refsResult.count || 0,
            screening_status: formalStatus,
            screening_id: screeningResult.data?.[0]?.id,
            sessions_status: sessionsStatus
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

  const handleMarkAsPassed = async (professional: ProfessionalForScreening) => {
    setMarkingPassed(professional.id);
    try {
      if (professional.screening_id) {
        const { error } = await supabase
          .from('professional_screening')
          .update({
            status: 'passed',
            notes: 'Approved via quick action — all screening sessions reviewed.',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', professional.screening_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('professional_screening')
          .insert({
            professional_id: professional.id,
            screening_type: 'head_nurse_interview',
            status: 'passed',
            notes: 'Approved via quick action — all screening sessions reviewed.',
            completed_at: new Date().toISOString()
          });
        if (error) throw error;
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({
          screening_cleared: true,
          onboarding_stage: 'cleared',
          updated_at: new Date().toISOString()
        })
        .eq('id', professional.id);

      // Recalculate journey progress
      await supabase.rpc('calculate_and_update_journey_progress', {
        target_user_id: professional.id
      });

      toast.success(`${professional.full_name} marked as passed ✓`);
      fetchProfessionals();
    } catch (error: any) {
      console.error('Error marking as passed:', error);
      toast.error(error.message || 'Failed to mark as passed');
    } finally {
      setMarkingPassed(null);
    }
  };

  const handleSaveScreening = async () => {
    if (!selectedProfessional) return;

    try {
      if (selectedProfessional.screening_id) {
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

  const getStatusBadge = (prof: ProfessionalForScreening) => {
    const status = prof.screening_status;
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-700">✓ Passed</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-700">✗ Failed</Badge>;
      case 'scheduled': return <Badge className="bg-blue-100 text-blue-700">📅 Scheduled</Badge>;
      case 'needs_followup': return <Badge className="bg-amber-100 text-amber-700">⚠ Follow-up</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      default:
        // If formal screening is not_started but sessions are all reviewed
        if (prof.sessions_status === 'all_reviewed') {
          return <Badge className="bg-amber-100 text-amber-700">📋 Sessions Reviewed</Badge>;
        }
        if (prof.sessions_status === 'some_pending') {
          return <Badge className="bg-blue-100 text-blue-700">🔄 Sessions In Progress</Badge>;
        }
        return <Badge variant="outline">Not Started</Badge>;
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
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {getStatusBadge(prof)}
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleMarkAsPassed(prof)}
                      disabled={markingPassed === prof.id}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {markingPassed === prof.id ? 'Saving...' : 'Mark as Passed'}
                    </Button>
                    {prof.phone_number && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={getWhatsAppLink(prof)} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Invite
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleScheduleInterview(prof)}>
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
                  {getStatusBadge(prof)}
                  {prof.screening_status !== 'passed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-700 border-green-300 hover:bg-green-50"
                      onClick={() => handleMarkAsPassed(prof)}
                      disabled={markingPassed === prof.id}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Pass
                    </Button>
                  )}
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
