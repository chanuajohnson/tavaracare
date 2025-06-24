
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    hasCertificate: false, // Updated from hasCertification
    hasBackgroundCheck: false // Updated from hasPoliceCleanrace
  });

  const checkStatus = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      const [profile, documents] = await Promise.all([
        fetchProfileData(user.id),
        fetchDocuments(user.id)
      ]);

      const profileComplete = isProfileComplete(profile);
      
      // Check individual document types with correct names
      const documentTypes = documents.map(doc => doc.document_type);
      const hasIdentification = documentTypes.includes('identification');
      const hasCertificate = documentTypes.includes('certificate'); // Updated
      const hasBackgroundCheck = documentTypes.includes('background_check'); // Updated
      
      setReadinessChecks({
        profileComplete,
        hasIdentification,
        hasCertificate, // Updated
        hasBackgroundCheck // Updated
      });

      // If all are complete, notify parent and close modal
      if (profileComplete && hasIdentification && hasCertificate && hasBackgroundCheck) {
        setTimeout(() => {
          onReadinessAchieved();
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking readiness status:', error);
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

  const handleProfileAction = () => {
    const link = getProfessionalRegistrationLink(readinessChecks.profileComplete);
    navigate(link);
  };

  const handleDocumentAction = (documentType: string) => {
    const link = getDocumentNavigationLink(true); // Navigate to documents page
    navigate(`${link}&type=${documentType}`);
  };

  const allReady = readinessChecks.profileComplete && 
                   readinessChecks.hasIdentification && 
                   readinessChecks.hasCertificate && // Updated
                   readinessChecks.hasBackgroundCheck; // Updated

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-2xl p-4 sm:p-6 relative">
        {/* Custom Close Button with better positioning and z-index */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-white/80 hover:bg-white/100 p-1.5 shadow-sm"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="text-center space-y-3 sm:space-y-4 pb-2">
          <div className="mx-auto relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Unlock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-purple-500 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-blue-500 animate-pulse delay-150" />
          </div>
          
          <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Unlock Family Matches
          </DialogTitle>
          
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-2">
            Complete these steps to start connecting with families who need your care expertise
          </p>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-6 sm:py-8 space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-pulse" />
                <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-purple-500 animate-pulse delay-150" />
                <Sparkles className="absolute top-1/2 -left-3 h-2 w-2 text-pink-500 animate-pulse delay-300" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-base sm:text-lg font-semibold text-blue-600">
                  Checking your progress! ✨
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Reviewing your professional readiness...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Profile Completion Check */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  {readinessChecks.profileComplete ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">Complete Profile</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Professional type & experience</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {readinessChecks.profileComplete && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs hidden sm:inline-flex">
                      Complete
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.profileComplete ? "outline" : "default"}
                    size="sm"
                    onClick={handleProfileAction}
                    className="flex items-center space-x-1 text-xs px-2 py-1 sm:px-3 sm:py-1 min-h-[36px] sm:min-h-[40px]"
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{readinessChecks.profileComplete ? 'Edit' : 'Complete'}</span>
                    <span className="sm:hidden">{readinessChecks.profileComplete ? 'Edit' : 'Add'}</span>
                    <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>

              {/* Upload Identification */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  {readinessChecks.hasIdentification ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">Upload Identification</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Valid ID document</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {readinessChecks.hasIdentification && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs hidden sm:inline-flex">
                      Uploaded
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.hasIdentification ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleDocumentAction('identification')}
                    className="flex items-center space-x-1 text-xs px-2 py-1 sm:px-3 sm:py-1 min-h-[36px] sm:min-h-[40px]"
                  >
                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{readinessChecks.hasIdentification ? 'Manage' : 'Upload'}</span>
                    <span className="sm:hidden">{readinessChecks.hasIdentification ? 'View' : 'Add'}</span>
                    <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>

              {/* Upload Certificate */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  {readinessChecks.hasCertificate ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">Upload Certification</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Professional credentials</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {readinessChecks.hasCertificate && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs hidden sm:inline-flex">
                      Uploaded
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.hasCertificate ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleDocumentAction('certificate')}
                    className="flex items-center space-x-1 text-xs px-2 py-1 sm:px-3 sm:py-1 min-h-[36px] sm:min-h-[40px]"
                  >
                    <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{readinessChecks.hasCertificate ? 'Manage' : 'Upload'}</span>
                    <span className="sm:hidden">{readinessChecks.hasCertificate ? 'View' : 'Add'}</span>
                    <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>

              {/* Upload Background Check */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  {readinessChecks.hasBackgroundCheck ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Upload Police Certificate</p>
                    <p className="text-xs sm:text-sm text-gray-600">To ensure you're a Vetted Professional</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {readinessChecks.hasBackgroundCheck && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs hidden sm:inline-flex">
                      Uploaded
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.hasBackgroundCheck ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleDocumentAction('background_check')}
                    className="flex items-center space-x-1 text-xs px-2 py-1 sm:px-3 sm:py-1 min-h-[36px] sm:min-h-[40px]"
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{readinessChecks.hasBackgroundCheck ? 'Manage' : 'Upload'}</span>
                    <span className="sm:hidden">{readinessChecks.hasBackgroundCheck ? 'View' : 'Add'}</span>
                    <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>

              {/* Success State */}
              {allReady && (
                <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <p className="font-semibold text-green-700 text-sm sm:text-base">All Set!</p>
                  </div>
                  <p className="text-xs sm:text-sm text-green-600">
                    Unlocking your family matches now...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 sm:pt-4 border-t border-white/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Complete these steps to access our family matching system
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs text-gray-600 hover:text-gray-800 sm:hidden"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
