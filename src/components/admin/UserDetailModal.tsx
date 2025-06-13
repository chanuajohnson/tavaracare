
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
import { useUserSpecificProgress } from "@/hooks/useUserSpecificProgress";
import { UserWithProgress } from "@/types/adminTypes";
import { PhoneNumberEditor } from "./PhoneNumberEditor";
import { TemplateSelector } from "./TemplateSelector";

interface UserDetailModalProps {
  user: UserWithProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function UserDetailModal({ user, open, onOpenChange, onRefresh }: UserDetailModalProps) {
  const [sending, setSending] = React.useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = React.useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = React.useState(false);
  
  // Stabilize the parameters to prevent hooks violations
  const userId = React.useMemo(() => user?.id || '', [user?.id]);
  const userRole = React.useMemo(() => user?.role || 'family', [user?.role]);
  
  // Use the fixed hook that properly handles professional users
  const { steps, completionPercentage, nextStep, loading } = useUserSpecificProgress(userId, userRole);

  // Initialize phone number state when user changes
  React.useEffect(() => {
    setUserPhoneNumber(user?.phone_number || null);
  }, [user?.phone_number]);

  // Early return after all hooks are called
  if (!user) return null;

  const sendNudgeEmail = async (stepType: string) => {
    setSending(true);
    try {
      console.log('Sending nudge email to user:', user.id, 'Type:', stepType);
      
      const { error } = await supabase.functions.invoke('send-nudge-email', {
        body: { 
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name || 'User',
          userRole: user.role,
          currentStep: nextStep?.step_number || steps.length,
          stepType
        }
      });

      if (error) throw error;
      
      toast.success(`Email nudge sent to ${user.full_name || user.email}`);
      onRefresh();
    } catch (error: any) {
      console.error('Error sending email nudge:', error);
      toast.error(`Failed to send email nudge: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleWhatsAppMessage = (message: string) => {
    if (!userPhoneNumber) {
      toast.error('No phone number available');
      return;
    }

    // Clean phone number for WhatsApp (remove + and any spaces)
    const cleanPhone = userPhoneNumber.replace(/[\s+]/g, '');
    
    // Create WhatsApp URL and open it
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Log the WhatsApp interaction
    supabase.from('cta_engagement_tracking').insert({
      user_id: user.id,
      action_type: 'admin_whatsapp_template_sent',
      session_id: `admin-${Date.now()}`,
      additional_data: {
        message_preview: message.substring(0, 100),
        phone_number: userPhoneNumber,
        admin_user_id: null, // Will be filled by RLS
        timestamp: new Date().toISOString()
      }
    }).then(() => {
      toast.success(`WhatsApp message sent to ${user.full_name || user.email}`);
    });
  };

  const advanceUserStep = async () => {
    try {
      const currentStepNumber = nextStep?.step_number || steps.length;
      const totalSteps = steps.length;
      const newStep = Math.min(currentStepNumber + 1, totalSteps);
      
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

  const handlePhoneNumberUpdate = (newPhoneNumber: string | null) => {
    setUserPhoneNumber(newPhoneNumber);
    // Trigger a refresh to update the user data
    onRefresh();
  };

  // Check if user is at schedule visit stage or beyond for financial proposals
  const isAtScheduleVisitStage = completionPercentage >= 70; // Adjust threshold as needed

  // Role-specific information
  let roleSpecificInfo = null;
  if (user.role === 'family') {
    roleSpecificInfo = (
      <Card>
        <CardHeader>
          <CardTitle>Family-Specific Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Details specific to family users go here.</p>
        </CardContent>
      </Card>
    );
  } else if (user.role === 'professional') {
    roleSpecificInfo = (
      <Card>
        <CardHeader>
          <CardTitle>Professional-Specific Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Details specific to professional users go here.</p>
        </CardContent>
      </Card>
    );
  } else if (user.role === 'community') {
    roleSpecificInfo = (
      <Card>
        <CardHeader>
          <CardTitle>Community-Specific Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Details specific to community users go here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
                <CardTitle>{user.full_name || 'User Details'}</CardTitle>
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
                    {/* Enhanced Phone Number Editor */}
                    <PhoneNumberEditor
                      userId={user.id}
                      currentPhoneNumber={userPhoneNumber}
                      userName={user.full_name || user.email}
                      onPhoneNumberUpdate={handlePhoneNumberUpdate}
                    />
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

            {/* Journey Progress */}
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
                      const isCurrent = nextStep?.step_number === step.step_number;
                      
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
                            {step.step_number}. {step.title}
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

            {roleSpecificInfo}

            <Separator />

            {/* Enhanced Admin Actions with Template System */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Primary Communication Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button 
                      onClick={() => sendNudgeEmail('current_step')}
                      disabled={sending}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email Current Step
                    </Button>
                    
                    <Button 
                      onClick={() => setShowTemplateSelector(true)}
                      disabled={!userPhoneNumber}
                      variant="outline"
                      className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      <Send className="h-4 w-4" />
                      WhatsApp with Template
                    </Button>
                    
                    <Button 
                      onClick={advanceUserStep}
                      disabled={completionPercentage >= 100}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Advance Step
                    </Button>
                  </div>
                  
                  {/* Welcome Messages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => sendNudgeEmail('welcome')}
                      disabled={sending}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Send Welcome Email
                    </Button>
                  </div>

                  {/* Financial Proposal Actions - Show only if at schedule visit stage */}
                  {isAtScheduleVisitStage && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Proposals & Payment Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          onClick={() => sendNudgeEmail('financial_proposal')}
                          disabled={sending}
                          variant="outline"
                          className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <Mail className="h-4 w-4" />
                          Email Financial Proposal
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Available because user is at "Schedule Visit" stage or beyond
                      </p>
                    </div>
                  )}

                  {/* Phone Number Status */}
                  {!userPhoneNumber && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                      <p className="text-sm text-amber-700">
                        📞 No phone number on file - WhatsApp options are disabled. Add a phone number above to enable WhatsApp communication.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selector Dialog */}
      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        userRole={user.role as 'family' | 'professional' | 'community'}
        userName={user.full_name || 'User'}
        userPhone={userPhoneNumber || ''}
        userProgress={{
          completion_percentage: completionPercentage,
          current_step: nextStep?.step_number,
          next_step: nextStep
        }}
        onSendMessage={handleWhatsAppMessage}
      />
    </>
  );
}
