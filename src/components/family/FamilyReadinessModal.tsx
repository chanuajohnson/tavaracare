
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, Circle, User, ClipboardList, Heart, ArrowRight, Unlock } from 'lucide-react';
import { fetchFamilyProfile, fetchCareAssessment, fetchCareRecipientProfile } from '@/hooks/family/dataFetchers';
import { getFamilyReadinessStatus } from '@/hooks/family/completionCheckers';

interface FamilyReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReadinessAchieved: () => void;
}

export const FamilyReadinessModal = ({ 
  open, 
  onOpenChange, 
  onReadinessAchieved 
}: FamilyReadinessModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [readinessChecks, setReadinessChecks] = useState({
    registrationComplete: false,
    careAssessmentComplete: false,
    storyComplete: false
  });

  const checkStatus = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      const [profile, assessment, story] = await Promise.all([
        fetchFamilyProfile(user.id),
        fetchCareAssessment(user.id),
        fetchCareRecipientProfile(user.id)
      ]);

      const status = getFamilyReadinessStatus(profile, assessment, story);
      
      setReadinessChecks({
        registrationComplete: status.registrationComplete,
        careAssessmentComplete: status.careAssessmentComplete,
        storyComplete: status.storyComplete
      });

      // If required steps are complete, notify parent and close modal
      if (status.allReady) {
        setTimeout(() => {
          onReadinessAchieved();
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking family readiness status:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };

  useEffect(() => {
    if (open && user) {
      checkStatus();
    }
  }, [open, user]);

  const handleRegistrationAction = () => {
    navigate('/registration/family');
  };

  const handleCareAssessmentAction = () => {
    navigate('/family/care-needs-assessment');
  };

  const handleStoryAction = () => {
    navigate('/family/story');
  };

  const requiredStepsComplete = readinessChecks.registrationComplete && 
                                 readinessChecks.careAssessmentComplete;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto relative">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Unlock className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-purple-500 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-pink-500 animate-pulse delay-150" />
          </div>
          
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Unlock Caregiver Matches
          </DialogTitle>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            Complete these steps to start finding the perfect caregiver for your loved one
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-8 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-pink-500 animate-pulse" />
                <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-purple-500 animate-pulse delay-150" />
                <Sparkles className="absolute top-1/2 -left-3 h-2 w-2 text-blue-500 animate-pulse delay-300" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-pink-600">
                  Checking your progress! ✨
                </p>
                <p className="text-sm text-gray-600">
                  Reviewing your family readiness...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Family Registration Check */}
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-3">
                  {readinessChecks.registrationComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">Complete Registration</p>
                    <p className="text-sm text-gray-600">Family profile & care preferences</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {readinessChecks.registrationComplete && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Complete
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.registrationComplete ? "outline" : "default"}
                    size="sm"
                    onClick={handleRegistrationAction}
                    className="flex items-center space-x-1"
                  >
                    <User className="h-4 w-4" />
                    <span>{readinessChecks.registrationComplete ? 'Edit' : 'Complete'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Care Assessment Check */}
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-3">
                  {readinessChecks.careAssessmentComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">Complete Care Assessment</p>
                    <p className="text-sm text-gray-600">Care needs & requirements</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {readinessChecks.careAssessmentComplete && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Complete
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.careAssessmentComplete ? "outline" : "default"}
                    size="sm"
                    onClick={handleCareAssessmentAction}
                    className="flex items-center space-x-1"
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span>{readinessChecks.careAssessmentComplete ? 'Edit' : 'Complete'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Tell Their Story Check - Optional but encouraged */}
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-3">
                  {readinessChecks.storyComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">Tell Their Story</p>
                    <p className="text-sm text-gray-600">Honor their legacy - Optional</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {readinessChecks.storyComplete && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Complete
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.storyComplete ? "outline" : "outline"}
                    size="sm"
                    onClick={handleStoryAction}
                    className="flex items-center space-x-1"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{readinessChecks.storyComplete ? 'View' : 'Add Story'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Success State */}
              {requiredStepsComplete && (
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-green-700">Ready to Match!</p>
                  </div>
                  <p className="text-sm text-green-600">
                    Finding your perfect caregiver matches now...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/30">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Complete the required steps to access our caregiver matching system
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
