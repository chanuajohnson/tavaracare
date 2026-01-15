
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, Circle, FileText, User, ArrowRight, Unlock, Shield, Award, CreditCard, X } from 'lucide-react';
import { fetchProfileData, fetchDocuments } from '@/hooks/professional/dataFetchers';
import { isProfileComplete, getMissingDocumentTypes, hasAllRequiredDocuments, REQUIRED_DOCUMENT_TYPES } from '@/hooks/professional/completionCheckers';
import { getProfessionalRegistrationLink, getDocumentNavigationLink } from '@/hooks/professional/stepDefinitions';

interface ProfessionalReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReadinessAchieved: () => void;
}

export const ProfessionalReadinessModal = ({ 
  open, 
  onOpenChange, 
  onReadinessAchieved 
}: ProfessionalReadinessModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [readinessChecks, setReadinessChecks] = useState({
    profileComplete: false,
    hasIdentification: false,
    hasCertificate: false,
    hasBackgroundCheck: false
  });

  console.log('[ProfessionalReadinessModal] Render with props:', {
    open,
    hasUser: !!user,
    userId: user?.id,
    isLoading,
    readinessChecks
  });

  const checkStatus = async () => {
    if (!user?.id) {
      console.log('[ProfessionalReadinessModal] No user ID, skipping status check');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('[ProfessionalReadinessModal] Starting status check for user:', user.id);
      
      const [profile, documents] = await Promise.all([
        fetchProfileData(user.id),
        fetchDocuments(user.id)
      ]);

      console.log('[ProfessionalReadinessModal] Fetched data:', {
        profile: profile ? {
          professional_type: profile.professional_type,
          years_of_experience: profile.years_of_experience
        } : null,
        documentsCount: documents.length,
        documentTypes: documents.map(d => d.document_type)
      });

      const profileComplete = isProfileComplete(profile);
      
      // Check individual document types with correct names
      const documentTypes = documents.map(doc => doc.document_type);
      const hasIdentification = documentTypes.includes('identification');
      const hasCertificate = documentTypes.includes('certificate');
      const hasBackgroundCheck = documentTypes.includes('background_check');
      
      const newReadinessChecks = {
        profileComplete,
        hasIdentification,
        hasCertificate,
        hasBackgroundCheck
      };

      console.log('[ProfessionalReadinessModal] Readiness checks:', newReadinessChecks);
      
      setReadinessChecks(newReadinessChecks);

      // If all are complete, notify parent and close modal
      const allComplete = profileComplete && hasIdentification && hasCertificate && hasBackgroundCheck;
      if (allComplete) {
        console.log('[ProfessionalReadinessModal] All requirements complete, notifying parent');
        setTimeout(() => {
          onReadinessAchieved();
        }, 1000);
      }
    } catch (error) {
      console.error('[ProfessionalReadinessModal] Error checking readiness status:', error);
    } finally {
      // Remove artificial delay - show modal content immediately
      setIsLoading(false);
      console.log('[ProfessionalReadinessModal] Loading complete, modal should be visible');
    }
  };

  useEffect(() => {
    console.log('[ProfessionalReadinessModal] Effect triggered:', { open, hasUser: !!user });
    if (open && user) {
      checkStatus();
    }
  }, [open, user]);

  const handleProfileAction = () => {
    console.log('[ProfessionalReadinessModal] Profile action clicked');
    const link = getProfessionalRegistrationLink(readinessChecks.profileComplete);
    navigate(link);
  };

  const handleDocumentAction = (documentType: string) => {
    console.log('[ProfessionalReadinessModal] Document action clicked:', documentType);
    const link = getDocumentNavigationLink(true);
    navigate(`${link}&type=${documentType}`);
  };

  const allReady = readinessChecks.profileComplete && 
                   readinessChecks.hasIdentification && 
                   readinessChecks.hasCertificate && 
                   readinessChecks.hasBackgroundCheck;

  // Debug: Log when modal should be visible
  useEffect(() => {
    if (open) {
      console.log('[ProfessionalReadinessModal] Modal is now open with state:', {
        isLoading,
        readinessChecks,
        allReady
      });
      
      // Debug modal dimensions
      setTimeout(() => {
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const rect = modal.getBoundingClientRect();
          console.log('[ProfessionalReadinessModal] Modal dimensions:', {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            visible: rect.width > 0 && rect.height > 0
          });
        } else {
          console.log('[ProfessionalReadinessModal] Modal element not found in DOM');
        }
      }, 100);
    }
  }, [open, isLoading, readinessChecks, allReady]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Unlock className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-purple-500 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-blue-500 animate-pulse delay-150" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-blue-600">
            Unlock Family Matches
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 text-sm leading-relaxed">
            Complete these steps to start connecting with families who need your care expertise
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-8 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-blue-500 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-blue-600">
                  Checking your progress! ✨
                </p>
                <p className="text-sm text-gray-600">
                  Reviewing your professional readiness...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Completion Check */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {readinessChecks.profileComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-base">Complete Profile</p>
                    <p className="text-sm text-gray-600">Professional type & experience</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {readinessChecks.profileComplete && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Complete
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.profileComplete ? "outline" : "default"}
                    size="sm"
                    onClick={handleProfileAction}
                    className="flex items-center space-x-1"
                  >
                    <User className="h-4 w-4" />
                    <span>{readinessChecks.profileComplete ? 'Edit' : 'Complete'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Upload Identification */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {readinessChecks.hasIdentification ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-base">Upload Identification</p>
                    <p className="text-sm text-gray-600">Valid ID document</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {readinessChecks.hasIdentification && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Uploaded
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.hasIdentification ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleDocumentAction('identification')}
                    className="flex items-center space-x-1"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>{readinessChecks.hasIdentification ? 'Manage' : 'Upload'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Upload Certificate */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {readinessChecks.hasCertificate ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-base">Upload Certification</p>
                    <p className="text-sm text-gray-600">Professional credentials</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {readinessChecks.hasCertificate && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Uploaded
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.hasCertificate ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleDocumentAction('certificate')}
                    className="flex items-center space-x-1"
                  >
                    <Award className="h-4 w-4" />
                    <span>{readinessChecks.hasCertificate ? 'Manage' : 'Upload'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Upload Background Check */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {readinessChecks.hasBackgroundCheck ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-base">Upload Police Certificate</p>
                    <p className="text-sm text-gray-600">To ensure you're a Vetted Professional</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {readinessChecks.hasBackgroundCheck && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Uploaded
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.hasBackgroundCheck ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleDocumentAction('background_check')}
                    className="flex items-center space-x-1"
                  >
                    <Shield className="h-4 w-4" />
                    <span>{readinessChecks.hasBackgroundCheck ? 'Manage' : 'Upload'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Success State */}
              {allReady && (
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-green-700">All Set!</p>
                  </div>
                  <p className="text-sm text-green-600">
                    Unlocking your family matches now...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Complete these steps to access our family matching system
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('[ProfessionalReadinessModal] Close button clicked');
                onOpenChange(false);
              }}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
