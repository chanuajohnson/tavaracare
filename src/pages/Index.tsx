
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, Circle, FileText, User, ArrowRight, Unlock, Shield, Award, CreditCard } from 'lucide-react';
import { fetchProfileData, fetchDocuments } from '@/hooks/professional/dataFetchers';
import { isProfileComplete, getMissingDocumentTypes, hasAllRequiredDocuments, REQUIRED_DOCUMENT_TYPES } from '@/hooks/professional/completionCheckers';
import { getProfessionalRegistrationLink, getDocumentNavigationLink } from '@/hooks/professional/stepDefinitions';

interface ProfessionalReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReadinessAchieved: () => void;
}

const ProfessionalReadinessModal = ({ 
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
    hasCertification: false,
    hasPoliceCleanrace: false
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
      
      // Check individual document types
      const documentTypes = documents.map(doc => doc.document_type);
      const hasIdentification = documentTypes.includes('identification');
      const hasCertification = documentTypes.includes('certification');
      const hasPoliceCleanrace = documentTypes.includes('police_clearance');
      
      setReadinessChecks({
        profileComplete,
        hasIdentification,
        hasCertification,
        hasPoliceCleanrace
      });

      // If all are complete, notify parent and close modal
      if (profileComplete && hasIdentification && hasCertification && hasPoliceCleanrace) {
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
                   readinessChecks.hasCertification && 
                   readinessChecks.hasPoliceCleanrace;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Unlock className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-purple-500 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-blue-500 animate-pulse delay-150" />
          </div>
          
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Unlock Family Matches
          </DialogTitle>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            Complete these steps to start connecting with families who need your care expertise
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-8 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-blue-500 animate-pulse" />
                <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-purple-500 animate-pulse delay-150" />
                <Sparkles className="absolute top-1/2 -left-3 h-2 w-2 text-pink-500 animate-pulse delay-300" />
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
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-3">
                  {readinessChecks.profileComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">Complete Profile</p>
                    <p className="text-sm text-gray-600">Professional type & experience</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-3">
                  {readinessChecks.hasIdentification ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">Upload Identification</p>
                    <p className="text-sm text-gray-600">Valid ID document</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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

              {/* Upload Certification */}
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-3">
                  {readinessChecks.hasCertification ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">Upload Certification</p>
                    <p className="text-sm text-gray-600">Professional credentials</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {readinessChecks.hasCertification && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Uploaded
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.hasCertification ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleDocumentAction('certification')}
                    className="flex items-center space-x-1"
                  >
                    <Award className="h-4 w-4" />
                    <span>{readinessChecks.hasCertification ? 'Manage' : 'Upload'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Upload Police Character Certificate */}
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-white/50 shadow-sm">
                <div className="flex items-center space-x-3">
                  {readinessChecks.hasPoliceCleanrace ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">Upload Police Character Certificate</p>
                    <p className="text-sm text-gray-600">To ensure you're a Vetted Professional on Tavara</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {readinessChecks.hasPoliceCleanrace && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Uploaded
                    </Badge>
                  )}
                  <Button
                    variant={readinessChecks.hasPoliceCleanrace ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleDocumentAction('police_clearance')}
                    className="flex items-center space-x-1"
                  >
                    <Shield className="h-4 w-4" />
                    <span>{readinessChecks.hasPoliceCleanrace ? 'Manage' : 'Upload'}</span>
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

        <div className="pt-4 border-t border-white/30">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Complete these steps to access our family matching system
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Create a default Index component
const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to their appropriate dashboard
    if (user) {
      const userRole = user.user_metadata?.role || 'family';
      switch (userRole) {
        case 'professional':
          navigate('/dashboard/professional');
          break;
        case 'community':
          navigate('/dashboard/community');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/dashboard/family');
      }
    }
  }, [user, navigate]);

  // For non-authenticated users, show a landing page or redirect to auth
  if (!user) {
    navigate('/auth');
    return null;
  }

  return null; // This component handles redirects only
};

export { ProfessionalReadinessModal };
export default Index;
