
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { User, Mail, MapPin, Calendar, CheckCircle2, Clock, Send, ArrowRight, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useUserJourneyProgress } from "@/hooks/useUserJourneyProgress";

interface UserWithProgress {
  id: string;
  email: string;
  full_name: string;
  role: 'family' | 'professional' | 'community' | 'admin';
  email_verified: boolean;
  last_login_at: string;
  created_at: string;
  avatar_url?: string;
  journey_progress?: {
    current_step: number;
    total_steps: number;
    completion_percentage: number;
    last_activity_at: string;
  };
  onboarding_progress?: any;
  location?: string;
  phone_number?: string;
  professional_type?: string;
  years_of_experience?: string;
  care_types?: string[];
  specialized_care?: string[];
}

interface UserDetailModalProps {
  user: UserWithProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function UserDetailModal({ user, open, onOpenChange, onRefresh }: UserDetailModalProps) {
  const [sending, setSending] = React.useState(false);
  const { steps, completionPercentage, nextStep, loading } = useUserJourneyProgress(
    user?.id || '', 
    user?.role || ''
  );

  if (!user) return null;

  const sendNudgeEmail = async (stepType: string) => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-nudge-email', {
        body: { 
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name || 'User',
          userRole: user.role,
          currentStep: nextStep?.id || steps.length,
          stepType
        }
      });

      if (error) throw error;
      
      toast.success(`Nudge email sent to ${user.full_name || user.email}`);
      onRefresh();
    } catch (error: any) {
      console.error('Error sending nudge:', error);
      toast.error(`Failed to send nudge: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const advanceUserStep = async () => {
    try {
      const currentStepId = nextStep?.id || steps.length;
      const totalSteps = steps.length;
      const newStep = Math.min(currentStepId + 1, totalSteps);
      
      const { error } = await supabase
        .from('user_journey_progress')
        .upsert({
          user_id: user.id,
          role: user.role,
          current_step: newStep,
          total_steps: totalSteps,
          completion_percentage: Math.round((newStep / totalSteps) * 100),
          last_activity_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success(`Advanced ${user.full_name || user.email} to step ${newStep}`);
      onRefresh();
    } catch (error: any) {
      console.error('Error advancing step:', error);
      toast.error(`Failed to advance step: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user.full_name || 'Unnamed User'}
            <Badge variant={user.email_verified ? "default" : "secondary"}>
              {user.email_verified ? "Verified" : "Unverified"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Overview */}
          <Card>
            <CardHeader>
              <CardTitle>User Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{user.role}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  {user.last_login_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Last login {new Date(user.last_login_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journey Progress - Using the same UI as TAV dashboards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Journey Progress
                <Badge variant="outline">
                  {completionPercentage}% Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={completionPercentage} className="w-full" />
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading journey progress...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {steps.map((step) => {
                    const isCurrent = nextStep?.id === step.id;
                    
                    return (
                      <div key={step.id} className={`flex items-center gap-2 p-2 rounded ${
                        isCurrent ? 'bg-blue-50 border border-blue-200' : 
                        step.completed ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        {step.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : isCurrent ? (
                          <Clock className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-300" />
                        )}
                        <span className={`text-sm flex-1 ${isCurrent ? 'font-medium text-blue-700' : ''}`}>
                          {step.id}. {step.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {step.description}
                        </span>
                        {isCurrent && (
                          <Badge variant="secondary" className="ml-auto">
                            Current
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          {user.role === 'professional' && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.professional_type && (
                  <div><strong>Type:</strong> {user.professional_type}</div>
                )}
                {user.years_of_experience && (
                  <div><strong>Experience:</strong> {user.years_of_experience}</div>
                )}
                {user.specialized_care && user.specialized_care.length > 0 && (
                  <div>
                    <strong>Specializations:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.specialized_care.map((spec, index) => (
                        <Badge key={index} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {user.role === 'family' && user.care_types && (
            <Card>
              <CardHeader>
                <CardTitle>Care Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <strong>Care Types:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.care_types.map((type, index) => (
                      <Badge key={index} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => sendNudgeEmail('current_step')}
                  disabled={sending}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Current Step Nudge
                </Button>
                
                <Button 
                  onClick={() => sendNudgeEmail('welcome')}
                  disabled={sending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send Welcome Email
                </Button>
                
                <Button 
                  onClick={advanceUserStep}
                  disabled={completionPercentage >= 100}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Advance to Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
