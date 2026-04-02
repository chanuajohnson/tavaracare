
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { Mic, MicOff, ChevronRight, ChevronLeft, CheckCircle2, Play, Pause, RotateCcw, Send, Info } from 'lucide-react';

const QUESTION_HINTS: { pattern: RegExp; hint: string }[] = [
  {
    pattern: /medication|stock|supply|administer/i,
    hint: "ℹ️ Tavara provides a built-in medication log where you record each administration in real time. This is a required part of the care workflow.",
  },
  {
    pattern: /report|e-report|digital|update.*family|keep.*contact.*updated/i,
    hint: "ℹ️ Tavara has a digital care reporting system that all caregivers are required to use for logging activities, notes, and handovers.",
  },
  {
    pattern: /handwritten|documentation|log.*book|paper/i,
    hint: "ℹ️ All documentation at Tavara is done through our digital platform — no handwritten logs required.",
  },
];

const getQuestionHint = (questionText: string): string | null => {
  for (const rule of QUESTION_HINTS) {
    if (rule.pattern.test(questionText)) {
      return rule.hint;
    }
  }
  return null;
};
import { toast } from 'sonner';

interface ScreeningQuestion {
  question: string;
  category: string;
}

interface QuestionResponse {
  question_index: number;
  question: string;
  voice_url: string | null;
  transcript: string | null;
  text_response: string;
  rating: string | null;
}

export default function MobileScreeningPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    error: recorderError,
  } = useVoiceRecorder();

  useEffect(() => {
    if (token) fetchSession();
  }, [token]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('screening_sessions')
        .select('*, screening_question_templates(questions)')
        .eq('access_token', token)
        .single();

      if (error || !data) {
        toast.error('Invalid or expired screening link');
        setLoading(false);
        return;
      }

      setSession(data);

      const tmplQuestions = data.screening_question_templates?.questions;
      const qs: ScreeningQuestion[] = Array.isArray(tmplQuestions)
        ? (tmplQuestions as any[]).map((q: any) => ({ question: String(q.question || ''), category: String(q.category || 'General') }))
        : [];
      setQuestions(qs);

      // Initialize responses
      const existingResponses: QuestionResponse[] = Array.isArray(data.responses)
        ? (data.responses as any[]).map((r: any) => ({
            question_index: r.question_index ?? 0,
            question: r.question ?? '',
            voice_url: r.voice_url ?? null,
            transcript: r.transcript ?? null,
            text_response: r.text_response ?? '',
            rating: r.rating ?? null,
          }))
        : [];
      const initResponses: QuestionResponse[] = qs.map((q, i) => {
        const existing = existingResponses.find((r: any) => r.question_index === i);
        return existing || {
          question_index: i,
          question: q.question,
          voice_url: null,
          transcript: null,
          text_response: '',
          rating: null,
        };
      });
      setResponses(initResponses);

      if (data.status === 'completed' || data.status === 'reviewed') {
        // Redirect authenticated users to the progress page
        // so they can see remaining sessions and continue
        const { data: authData } = await supabase.auth.getSession();
        if (authData?.session) {
          navigate('/professional/screening');
          return;
        }
        setSubmitted(true);
      }

      // Mark as in_progress if pending
      if (data.status === 'pending') {
        await supabase
          .from('screening_sessions')
          .update({ status: 'in_progress', updated_at: new Date().toISOString() })
          .eq('id', data.id);
      }
    } catch (err) {
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleUploadVoice = async (): Promise<string | null> => {
    if (!audioBlob || !session) return null;
    setUploadingVoice(true);
    try {
      const fileName = `${session.id}/${currentIndex}_${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from('screening-recordings')
        .upload(fileName, audioBlob, { contentType: 'audio/webm' });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('screening-recordings')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err: any) {
      toast.error('Failed to upload recording');
      return null;
    } finally {
      setUploadingVoice(false);
    }
  };

  const handleSaveCurrentAndNext = async (direction: 'next' | 'prev') => {
    // Save current response
    let voiceUrl = responses[currentIndex]?.voice_url || null;

    if (audioBlob && !voiceUrl) {
      voiceUrl = await handleUploadVoice();
    }

    const updated = [...responses];
    updated[currentIndex] = {
      ...updated[currentIndex],
      question: questions[currentIndex].question,
      text_response: textInput,
      voice_url: voiceUrl,
      rating: responses[currentIndex]?.rating || null,
    };
    setResponses(updated);

    // Save progress to DB
    await supabase
      .from('screening_sessions')
      .update({ responses: updated as any, updated_at: new Date().toISOString() })
      .eq('id', session.id);

    // Navigate
    if (direction === 'next' && currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTextInput(updated[nextIdx]?.text_response || '');
      resetRecording();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setTextInput(updated[prevIdx]?.text_response || '');
      resetRecording();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Save current question first
      let voiceUrl = responses[currentIndex]?.voice_url || null;
      if (audioBlob && !voiceUrl) {
        voiceUrl = await handleUploadVoice();
      }

      const updated = [...responses];
      updated[currentIndex] = {
        ...updated[currentIndex],
        question: questions[currentIndex].question,
        text_response: textInput,
        voice_url: voiceUrl,
        rating: responses[currentIndex]?.rating || null,
      };

      const { error } = await supabase
        .from('screening_sessions')
        .update({
          responses: updated as any,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.success('Screening submitted successfully! 💙');

      // Auto-redirect authenticated users to progress page after brief delay
      const { data: authData } = await supabase.auth.getSession();
      if (authData?.session) {
        setTimeout(() => {
          navigate('/professional/screening');
        }, 3000);
      }

      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  // Load saved response when changing question index
  useEffect(() => {
    if (responses[currentIndex]) {
      setTextInput(responses[currentIndex].text_response || '');
    }
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold">Screening Not Found</h1>
          <p className="text-muted-foreground text-sm">
            This link may be invalid or expired. Please contact the Tavara team for assistance.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Thank You! 💙</h1>
          <p className="text-muted-foreground">
            Your screening responses for <strong>{session.candidate_name}</strong> have been submitted.
            The Tavara team will review them shortly.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 space-y-2">
        <h1 className="text-lg font-bold">Screening: {session.candidate_name}</h1>
        <div className="flex items-center justify-between text-sm opacity-90">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <Badge variant="secondary" className="text-xs">
            {currentQuestion.category}
          </Badge>
        </div>
        <div className="w-full bg-primary-foreground/20 rounded-full h-1.5">
          <div
            className="bg-primary-foreground h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 p-4 space-y-6">
        <div className="bg-muted/50 p-4 rounded-xl">
          <p className="text-base font-medium leading-relaxed">{currentQuestion.question}</p>
        </div>

        {getQuestionHint(currentQuestion.question) && (
          <div className="flex gap-2 items-start bg-accent/50 border border-border rounded-lg p-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/80">{getQuestionHint(currentQuestion.question)}</p>
          </div>
        )}

        {/* Voice Recorder */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">🎙️ Voice Response</p>

          {recorderError && (
            <p className="text-sm text-destructive">{recorderError}</p>
          )}

          <div className="flex items-center justify-center gap-4">
            {!audioUrl ? (
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'destructive' : 'default'}
                size="lg"
                className="rounded-full h-16 w-16"
              >
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (audioRef.current) {
                      if (isPlaying) {
                        audioRef.current.pause();
                      } else {
                        audioRef.current.play();
                      }
                      setIsPlaying(!isPlaying);
                    }
                  }}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={resetRecording}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>

          {isRecording && (
            <p className="text-center text-sm text-destructive animate-pulse">
              Recording... {formatDuration(duration)}
            </p>
          )}

          {audioUrl && (
            <p className="text-center text-xs text-muted-foreground">
              ✅ Voice recorded ({formatDuration(duration)})
            </p>
          )}
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">✏️ Or type your response</p>
          <Textarea
            placeholder="Type your observation here..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            rows={3}
            className="text-base"
          />
        </div>

      </div>

      {/* Navigation */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSaveCurrentAndNext('prev')}
            disabled={currentIndex === 0 || uploadingVoice}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || uploadingVoice}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-1" />
              {submitting ? 'Submitting...' : 'Submit All'}
            </Button>
          ) : (
            <Button
              onClick={() => handleSaveCurrentAndNext('next')}
              disabled={uploadingVoice}
              className="flex-1"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
