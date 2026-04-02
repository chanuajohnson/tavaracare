
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clipboard, ExternalLink, Eye, Send, Mic, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScreeningSession {
  id: string;
  template_id: string | null;
  professional_id: string;
  assigned_to: string | null;
  candidate_name: string;
  status: string;
  responses: any[];
  ai_summary: string | null;
  ai_recommendation: string | null;
  access_token: string;
  created_at: string;
  template_title?: string;
}

interface ScreeningTemplate {
  id: string;
  title: string;
  questions: { question: string; category: string }[];
}

interface CandidateOption {
  id: string;
  full_name: string;
  phone_number: string | null;
}

interface Props {
  onSendScreening?: (candidateId: string, candidateName: string, link: string, phone: string) => void;
  onResendScreening?: (candidateId: string, candidateName: string, link: string, phone: string) => void;
}

export const ScreeningSessionManager = ({ onSendScreening, onResendScreening }: Props) => {
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [templates, setTemplates] = useState<ScreeningTemplate[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ScreeningSession | null>(null);
  const [createForm, setCreateForm] = useState({ templateId: '', candidateId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, templatesRes, candidatesRes] = await Promise.all([
        supabase
          .from('screening_sessions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('screening_question_templates')
          .select('*')
          .eq('is_active', true),
        supabase
          .rpc('admin_get_all_profiles_secure'),
      ]);

      if (sessionsRes.error) throw sessionsRes.error;

      const allProfiles = candidatesRes.data || [];
      const professionalCandidates = allProfiles
        .filter((p: any) => p.role === 'professional')
        .map((p: any) => ({ id: p.id, full_name: p.full_name, phone_number: p.phone_number }));

      const templatesData = (templatesRes.data || []).map((t: any) => ({
        ...t,
        questions: Array.isArray(t.questions) ? t.questions : [],
      }));

      // Enrich sessions with template titles
      const enrichedSessions = (sessionsRes.data || []).map((s: any) => {
        const tmpl = templatesData.find((t: any) => t.id === s.template_id);
        return {
          ...s,
          responses: Array.isArray(s.responses) ? s.responses : [],
          template_title: tmpl?.title || 'Unknown',
        };
      });

      setSessions(enrichedSessions);
      setTemplates(templatesData);
      setCandidates(professionalCandidates);
    } catch (err) {
      console.error('Error fetching screening data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!createForm.templateId || !createForm.candidateId) {
      toast.error('Please select a template and candidate');
      return;
    }

    const candidate = candidates.find(c => c.id === createForm.candidateId);
    if (!candidate) return;

    try {
      // Check for existing session with same professional + template
      const { data: existing } = await supabase
        .from('screening_sessions')
        .select('id')
        .eq('professional_id', createForm.candidateId)
        .eq('template_id', createForm.templateId);

      if (existing && existing.length > 0) {
        toast.error('A screening session already exists for this candidate with this template. Use the resend button instead.');
        return;
      }

      const { data, error } = await supabase
        .from('screening_sessions')
        .insert({
          template_id: createForm.templateId,
          professional_id: createForm.candidateId,
          candidate_name: candidate.full_name || 'Unknown',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/screening/${data.access_token}`;

      toast.success('Screening session created!');
      setShowCreateDialog(false);
      setCreateForm({ templateId: '', candidateId: '' });
      fetchData();

      // Offer to send via WhatsApp
      if (onSendScreening && candidate.phone_number) {
        onSendScreening(candidate.id, candidate.full_name || 'Candidate', link, candidate.phone_number);
      } else {
        // Copy link to clipboard
        await navigator.clipboard.writeText(link);
        toast.info('Screening link copied to clipboard!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create session');
    }
  };

  const getScreeningLink = (session: ScreeningSession) => {
    return `${window.location.origin}/screening/${session.access_token}`;
  };

  const handleCopyLink = async (session: ScreeningSession) => {
    await navigator.clipboard.writeText(getScreeningLink(session));
    toast.success('Link copied!');
  };

  const handleResendScreening = (session: ScreeningSession) => {
    const candidate = candidates.find(c => c.id === session.professional_id);
    const link = getScreeningLink(session);
    if (onSendScreening && candidate?.phone_number) {
      onSendScreening(candidate.id, candidate.full_name || session.candidate_name, link, candidate.phone_number);
    } else {
      navigator.clipboard.writeText(link);
      toast.success('Screening link copied to clipboard!');
    }
  };

  const handleDeleteSession = async (session: ScreeningSession) => {
    if (!window.confirm(`Are you sure you want to delete this screening session for ${session.candidate_name}?`)) return;
    try {
      const { error } = await supabase.from('screening_sessions').delete().eq('id', session.id);
      if (error) throw error;
      toast.success('Screening session deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete session');
    }
  };

  const handleViewDetails = (session: ScreeningSession) => {
    setSelectedSession(session);
    setShowDetailDialog(true);
  };

  const handleMarkReviewed = async (session: ScreeningSession) => {
    try {
      const { error } = await supabase
        .from('screening_sessions')
        .update({ status: 'reviewed', updated_at: new Date().toISOString() })
        .eq('id', session.id);
      if (error) throw error;
      toast.success('Marked as reviewed');
      fetchData();
      setShowDetailDialog(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleTriggerAI = async (session: ScreeningSession) => {
    try {
      const { error } = await supabase.functions.invoke('transcribe-screening', {
        body: { session_id: session.id },
      });
      if (error) throw error;
      toast.success('AI processing started. Refreshing shortly…');
      setTimeout(async () => {
        await fetchData();
        // Update selectedSession with refreshed data
        const { data } = await supabase
          .from('screening_sessions')
          .select('*')
          .eq('id', session.id)
          .single();
        if (data) {
          const tmpl = templates.find(t => t.id === data.template_id);
          setSelectedSession({
            ...data,
            responses: Array.isArray(data.responses) ? data.responses : [],
            template_title: tmpl?.title || 'Unknown',
          });
        }
      }, 5000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger AI processing');
    }
  };

  const handleNudgeResubmit = async (session: ScreeningSession) => {
    if (!window.confirm(
      `This will reset ${session.candidate_name}'s screening and send a fresh link. Continue?`
    )) return;

    try {
      // Reset the session: clear responses/AI fields, generate new token, set pending
      const { data, error } = await supabase
        .from('screening_sessions')
        .update({
          status: 'pending',
          responses: [],
          ai_summary: null,
          ai_recommendation: null,
          access_token: crypto.randomUUID(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/screening/${data.access_token}`;
      const candidate = candidates.find(c => c.id === session.professional_id);

      if (onSendScreening && candidate?.phone_number) {
        onSendScreening(
          candidate.id,
          candidate.full_name || session.candidate_name,
          link,
          candidate.phone_number
        );
      } else {
        await navigator.clipboard.writeText(link);
        toast.info('New screening link copied to clipboard!');
      }

      toast.success('Resubmission nudge sent!');
      setShowDetailDialog(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset screening session');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'reviewed': return <Badge className="bg-blue-100 text-blue-700">Reviewed</Badge>;
      case 'in_progress': return <Badge className="bg-amber-100 text-amber-700">In Progress</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Screening Sessions
              </CardTitle>
              <CardDescription>
                Send voice questionnaires to select professional caregivers for candidate evaluation
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} size="sm">
              <Send className="h-4 w-4 mr-1" />
              New Session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No screening sessions yet. Create a template first, then send a voice screening to your head nurse.
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{s.candidate_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.template_title} • {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(s.status)}
                    <Button variant="ghost" size="sm" onClick={() => handleCopyLink(s)} title="Copy link">
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleResendScreening(s)} title="Resend via WhatsApp">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSession(s)} title="Delete session" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(s)} title="View details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Voice Screening</DialogTitle>
            <DialogDescription>
              Select a question template and the candidate to screen. A unique link will be generated for the head nurse.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Template</Label>
              <Select value={createForm.templateId} onValueChange={v => setCreateForm(p => ({ ...p, templateId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title} ({t.questions.length} questions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Candidate</Label>
              <Select value={createForm.candidateId} onValueChange={v => setCreateForm(p => ({ ...p, candidateId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                <SelectContent>
                  {candidates.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateSession} className="flex-1">
                Create & Copy Link
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Screening: {selectedSession?.candidate_name}</DialogTitle>
            <DialogDescription>
              {selectedSession?.template_title} • {selectedSession && getStatusBadge(selectedSession.status)}
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              {/* Link */}
              <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                <span className="truncate flex-1">{getScreeningLink(selectedSession)}</span>
                <Button variant="ghost" size="sm" onClick={() => handleCopyLink(selectedSession)}>
                  <Clipboard className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={getScreeningLink(selectedSession)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>

              {/* Responses */}
              {selectedSession.responses.length > 0 ? (
                <div className="space-y-3">
                  <Label>Responses</Label>
                  {selectedSession.responses.map((r: any, i: number) => (
                    <div key={i} className="p-3 border rounded-lg space-y-1">
                      <p className="text-sm font-medium">Q{i + 1}: {r.question || `Question ${i + 1}`}</p>
                      {r.text_response && (
                        <p className="text-sm text-muted-foreground">{r.text_response}</p>
                      )}
                      {r.transcript && (
                        <p className="text-sm text-muted-foreground italic">🎙️ {r.transcript}</p>
                      )}
                      {r.voice_url && !r.transcript && (
                        <audio controls src={r.voice_url} className="w-full h-8" />
                      )}
                      {r.rating && (
                        <Badge className={`text-xs ${
                          r.rating === 'pass' ? 'bg-green-100 text-green-700' :
                          r.rating === 'concern' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{r.rating}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No responses yet.</p>
              )}

              {/* AI Summary */}
              {selectedSession.ai_summary && (
                <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                  <Label>AI Summary</Label>
                  <p className="text-sm">{selectedSession.ai_summary}</p>
                  {selectedSession.ai_recommendation && (
                    <Badge className={
                      selectedSession.ai_recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                      selectedSession.ai_recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      Recommendation: {selectedSession.ai_recommendation}
                    </Badge>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {selectedSession.status === 'completed' && !selectedSession.ai_summary && (
                  <Button size="sm" onClick={() => handleTriggerAI(selectedSession)}>
                    🤖 Generate AI Summary
                  </Button>
                )}
                {(selectedSession.status === 'completed' || selectedSession.status === 'in_progress') && (
                  <Button size="sm" variant="outline" onClick={() => handleMarkReviewed(selectedSession)}>
                    ✅ Mark Reviewed
                  </Button>
                )}
                {(selectedSession.status === 'completed' || selectedSession.status === 'reviewed' ||
                  selectedSession.ai_recommendation === 'reject' || selectedSession.ai_recommendation === 'review') && (
                  <Button size="sm" variant="outline" onClick={() => handleNudgeResubmit(selectedSession)}>
                    🔄 Send Resubmission Nudge
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
