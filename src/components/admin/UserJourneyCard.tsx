
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mail, 
  MailCheck, 
  Edit, 
  Trash2, 
  Send, 
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { NudgeSystem } from "./NudgeSystem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserWithProgress {
  id: string;
  email: string;
  full_name: string;
  role: 'family' | 'professional' | 'community';
  email_verified: boolean;
  last_login_at: string;
  created_at: string;
  journey_progress?: {
    current_step: number;
    total_steps: number;
    completion_percentage: number;
    last_activity_at: string;
  };
  onboarding_progress?: any;
}

interface UserJourneyCardProps {
  user: UserWithProgress;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onResendVerification: () => void;
  onRefresh: () => void;
}

export function UserJourneyCard({ 
  user, 
  selected, 
  onSelect, 
  onResendVerification, 
  onRefresh 
}: UserJourneyCardProps) {
  const [showNudge, setShowNudge] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const getStepDescription = (role: string, step: number) => {
    const descriptions = {
      family: [
        'Basic Information',
        'Care Recipient Story',
        'Care Needs Assessment',
        'Caregiver Preferences',
        'Budget & Schedule',
        'Background Check Preferences',
        'Profile Complete'
      ],
      professional: [
        'Basic Information',
        'Professional Details',
        'Certifications',
        'Background Check',
        'Profile Complete'
      ],
      community: [
        'Basic Information',
        'Community Interests',
        'Profile Complete'
      ]
    };
    
    return descriptions[role as keyof typeof descriptions]?.[step - 1] || `Step ${step}`;
  };

  const getProgressStatus = () => {
    if (!user.journey_progress) return { status: 'not_started', color: 'gray' };
    
    const { completion_percentage, last_activity_at } = user.journey_progress;
    const lastActivity = new Date(last_activity_at);
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    
    if (completion_percentage === 100) {
      return { status: 'completed', color: 'green' };
    } else if (daysSinceActivity > 7) {
      return { status: 'stalled', color: 'orange' };
    } else if (completion_percentage > 0) {
      return { status: 'in_progress', color: 'blue' };
    } else {
      return { status: 'not_started', color: 'gray' };
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: user.id
      });
      
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleting(false);
    }
  };

  const progressStatus = getProgressStatus();
  const currentStep = user.journey_progress?.current_step || 1;
  const totalSteps = user.journey_progress?.total_steps || 
    (user.role === 'family' ? 7 : user.role === 'professional' ? 5 : 3);
  const completionPercentage = user.journey_progress?.completion_percentage || 0;

  return (
    <>
      <Card className={`transition-all duration-200 ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          {/* Header with selection and user info */}
          <div className="flex items-start gap-3 mb-3">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">
                  {user.full_name || 'Unnamed User'}
                </h4>
                <Badge variant="outline" className="text-xs capitalize">
                  {user.role}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {user.email_verified ? (
                  <MailCheck className="h-3 w-3 text-green-600" />
                ) : (
                  <Mail className="h-3 w-3 text-orange-600" />
                )}
                <span className="truncate">{user.email || user.id}</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Joined {formatDistanceToNow(new Date(user.created_at))} ago
              </div>
            </div>
          </div>

          {/* Progress section */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {getStepDescription(user.role, currentStep)}
              </span>
              <div className="flex items-center gap-1">
                {progressStatus.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {progressStatus.status === 'stalled' && (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
                {progressStatus.status === 'in_progress' && (
                  <Clock className="h-4 w-4 text-blue-600" />
                )}
                <span className="font-medium">
                  {currentStep}/{totalSteps}
                </span>
              </div>
            </div>
            
            <Progress value={completionPercentage} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completionPercentage}% complete</span>
              {user.journey_progress?.last_activity_at && (
                <span>
                  Last activity {formatDistanceToNow(new Date(user.journey_progress.last_activity_at))} ago
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {!user.email_verified && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onResendVerification}
                  className="h-7 px-2 text-xs"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Resend
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNudge(true)}
                className="h-7 px-2 text-xs"
              >
                <Send className="h-3 w-3 mr-1" />
                Nudge
              </Button>
            </div>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {user.full_name || 'this user'}? 
                      This action cannot be undone and will remove all their data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? 'Deleting...' : 'Delete User'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual nudge system */}
      {showNudge && (
        <NudgeSystem
          open={showNudge}
          onOpenChange={setShowNudge}
          selectedUsers={[user.id]}
          users={[user]}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
