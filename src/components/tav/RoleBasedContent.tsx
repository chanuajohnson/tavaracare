
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Minimize2, Sparkles, ArrowRight, CheckCircle, Clock, Target, Star, Zap, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { AssistantNudge, ProgressContext } from './types';
import { ExpandableChatSection } from './components/ExpandableChatSection';
import { FamilyJourneyPreview } from './components/FamilyJourneyPreview';
import { ProfessionalJourneyPreview } from './components/ProfessionalJourneyPreview';
import { ProfessionalJourneyWelcomeCard } from './components/ProfessionalJourneyWelcomeCard';
import { CommunityJourneyPreview } from './components/CommunityJourneyPreview';
import { CaregiverMatchingModal } from '@/components/family/CaregiverMatchingModal';
import { ProfessionalFamilyMatchModal } from '@/components/professional/ProfessionalFamilyMatchModal';
import { cn } from '@/lib/utils';

interface RoleBasedContentProps {
  role: 'family' | 'professional' | 'community' | 'admin' | 'guest' | null;
  nudges: AssistantNudge[];
  onNudgeClick: (nudge: AssistantNudge) => void;
  isLoading: boolean;
  progressContext: ProgressContext;
  professionalProgress?: any;
  familyJourneyProgress?: any;
  onClose: () => void;
  onMinimize: () => void;
  isLoudMode?: boolean;
  dashboardRole?: 'family' | 'professional' | null;
  isDemoRoute?: boolean;
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  role,
  nudges,
  onNudgeClick,
  isLoading,
  progressContext,
  professionalProgress,
  familyJourneyProgress,
  onClose,
  onMinimize,
  isLoudMode = false,
  dashboardRole = null,
  isDemoRoute = false
}) => {
  const { user } = useAuth();
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);
  const [showProfessionalMatchModal, setShowProfessionalMatchModal] = useState(false);

  const handleJourneyAction = () => {
    // Navigate to appropriate next step based on role and progress
    if (role === 'professional') {
      if (progressContext.completionPercentage < 50) {
        window.location.href = '/registration/professional';
      } else if (progressContext.completionPercentage < 100) {
        window.location.href = '/professional/profile';
      } else {
        window.location.href = '/professional/profile?tab=assignments';
      }
    } else if (role === 'family') {
      // Use direct family progress data for navigation decisions
      const completionPercentage = familyJourneyProgress?.completionPercentage || 0;
      if (completionPercentage < 50) {
        window.location.href = '/registration/family';
      } else {
        window.location.href = '/family/profile';
      }
    }
  };

  const handleBack = () => {
    // Simple back navigation - could be enhanced
    window.history.back();
  };

  // Handle Find My Caregiver Now click - open modal for anonymous users
  const handleFindCaregiverClick = () => {
    setShowCaregiverMatchingModal(true);
  };

  // Handle Professional Match click - open modal for anonymous users
  const handleProfessionalMatchClick = () => {
    setShowProfessionalMatchModal(true);
  };

  // Handle Quick Family Registration click - redirect to /auth with sign-up preference
  const handleQuickRegistrationClick = () => {
    window.location.href = '/auth?tab=signup';
  };

  // Handle Professional Registration click - redirect to /auth with sign-up preference
  const handleProfessionalRegistrationClick = () => {
    window.location.href = '/auth?tab=signup';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with sparkles and controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={cn("p-1.5 bg-primary-100 rounded-lg", isLoudMode && "bg-primary-200")}>
              <Sparkles className={cn("h-4 w-4 text-primary", isLoudMode && "h-5 w-5")} />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className={cn("h-2 w-2 text-primary/60 animate-pulse", isLoudMode && "h-3 w-3")} />
            </div>
            {isLoudMode && (
              <div className="absolute -bottom-1 -left-1">
                <Star className="h-2 w-2 text-amber-400 animate-pulse" />
              </div>
            )}
          </div>
          <div>
            <h2 className={cn("font-semibold text-primary", isLoudMode && "text-lg font-bold")}>
              {isLoudMode ? "🎯 TAV MAGIC!" : "TAV Assistant"}
            </h2>
            <p className={cn("text-xs text-gray-600", isLoudMode && "text-sm font-medium")}>
              {isLoudMode ? "Your Magical Care Coordinator" : "Your Care Coordinator"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-7 w-7 p-0"
            title="Minimize panel"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
            title="Close panel"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          )}

          {/* Nudges section */}
          {nudges.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                Updates for You
              </h3>
              {nudges.map((nudge) => (
                <motion.div
                  key={nudge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-primary/5 border border-primary/20 rounded-lg p-3 cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => onNudgeClick(nudge)}
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-primary/20 rounded-full flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-primary">{nudge.title || 'Update Available'}</h4>
                      <p className="text-xs text-gray-700 mt-1">{nudge.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Role-based content */}
          {user && (
            <>
              {/* Professional-specific enhanced content */}
              {role === 'professional' && professionalProgress && (
                <div className="space-y-4">
                  <ProfessionalJourneyWelcomeCard 
                    progressContext={progressContext}
                    onActionClick={handleJourneyAction}
                  />
                  <ProfessionalJourneyPreview onBack={handleBack} />
                </div>
              )}

              {/* Family-specific content - now using direct hook data */}
              {role === 'family' && familyJourneyProgress && (
                <div className="space-y-4">
                  {/* Family journey progress card using direct hook data */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Your Family Journey</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Overall Progress</span>
                        <span className="text-sm font-bold text-blue-600">{familyJourneyProgress.completionPercentage}%</span>
                      </div>
                      
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${familyJourneyProgress.completionPercentage}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-blue-600">
                        {familyJourneyProgress.steps.filter(s => s.completed).length} of {familyJourneyProgress.steps.length} steps complete
                      </div>
                      
                      {familyJourneyProgress.nextStep && (
                        <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                          <div className="text-xs font-medium text-blue-700 mb-1">Next Step:</div>
                          <div className="text-xs text-blue-600">{familyJourneyProgress.nextStep.title}</div>
                        </div>
                      )}
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleJourneyAction}
                      >
                        Continue Journey
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <FamilyJourneyPreview onBack={handleBack} />
                </div>
              )}

              {/* Community-specific content */}
              {role === 'community' && (
                <CommunityJourneyPreview onBack={handleBack} />
              )}
            </>
          )}

          {/* SUPER MAGICAL GUEST WELCOME for DASHBOARD PAGES */}
          {(!user || role === 'guest') && (
            <div className="space-y-4">
              {/* DEMO MODE: Special demo content for /tav-demo and demo routes */}
              {isDemoRoute && !user ? (
                <div className="space-y-4">
                  {/* DEMO WELCOME HEADER */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-primary/30 relative overflow-hidden"
                  >
                    <div className="absolute inset-0">
                      <Sparkles className="absolute top-2 right-2 h-4 w-4 text-primary/40 animate-pulse" />
                      <Star className="absolute top-6 right-8 h-3 w-3 text-amber-400/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <Sparkles className="absolute bottom-4 left-4 h-3 w-3 text-blue-400/40 animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="h-8 w-8 text-primary" />
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold text-primary">Welcome TAV Demo Experience</h3>
                          <p className="text-lg font-semibold text-gray-700">I'm here to help you Demo various features</p>
                        </div>
                      </div>
                      
                      <p className="text-base font-medium text-gray-800 mb-4">
                        🌟 Explore how families and professionals use Tavara to connect and coordinate care. Click any demo below to experience our AI-guided workflows!
                      </p>
                    </div>
                  </motion.div>

                  {/* Chat with TAV section */}
                  <div className="mb-6">
                    <ExpandableChatSection role={role as 'family' | 'professional' | 'community' | null} />
                  </div>

                  {/* DEMO OPTIONS GRID */}
                  <div className="grid grid-cols-1 gap-3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => window.location.href = '/demo/registration/family'}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Heart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">Family Registration</h4>
                          <p className="text-sm text-blue-600">Experience how families find and connect with perfect caregivers</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-400 ml-auto" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer"
                      onClick={() => window.location.href = '/demo/family/care-assessment'}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-800">Care Needs Assessment</h4>
                          <p className="text-sm text-purple-600">Walk through our intelligent care planning process</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-purple-400 ml-auto" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white rounded-xl p-4 border-2 border-pink-200 hover:border-pink-400 transition-colors cursor-pointer"
                      onClick={() => window.location.href = '/demo/family/story'}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Star className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-pink-800">Legacy Stories</h4>
                          <p className="text-sm text-pink-600">Experience our family story capture and sharing platform</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-pink-400 ml-auto" />
                      </div>
                    </motion.div>
                  </div>

                </div>
              ) : 
              /* LOUD MODE: Enhanced dashboard-specific magical messaging */
              isLoudMode && dashboardRole ? (
                <div className="space-y-4">
                  {/* MAGICAL ATTENTION-GRABBING HEADER */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-primary/10 via-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 border-4 border-primary/30 relative overflow-hidden"
                  >
                    {/* Animated background sparkles */}
                    <div className="absolute inset-0">
                      <Sparkles className="absolute top-2 right-2 h-4 w-4 text-primary/40 animate-pulse" />
                      <Star className="absolute top-6 right-8 h-3 w-3 text-amber-400/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <Sparkles className="absolute bottom-4 left-4 h-3 w-3 text-blue-400/40 animate-pulse" style={{ animationDelay: '1s' }} />
                      <Star className="absolute bottom-8 right-12 h-2 w-2 text-pink-400/50 animate-pulse" style={{ animationDelay: '1.5s' }} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {dashboardRole === 'family' ? <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /> : <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />}
                        </motion.div>
                        <div>
                          <h3 className="text-lg sm:text-2xl font-bold text-primary">
                            {dashboardRole === 'family' ? "🎯 FAMILY MAGIC AWAITS!" : "⚡ PROFESSIONAL MAGIC AWAITS!"}
                          </h3>
                          <p className="text-sm sm:text-lg font-semibold text-gray-700">
                            {dashboardRole === 'family' 
                              ? "Your Perfect Caregiver Is Just ONE CLICK Away!" 
                              : "Families Need YOU Right Now!"
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-sm sm:text-base font-medium text-gray-800">
                          {dashboardRole === 'family' 
                            ? "🌟 Stop browsing! Start MATCHING! Get connected with verified, loving caregivers in your area who are ready to care for your family TODAY!"
                            : "🌟 Stop waiting! Start EARNING! Get matched with families in your area who need your caregiving expertise RIGHT NOW!"
                          }
                        </p>
                        
                        {/* ENHANCED BENEFITS LIST */}
                        <div className="grid grid-cols-1 gap-2">
                          {dashboardRole === 'family' ? [
                            "✨ Instant caregiver matching in your area",
                            "💙 Verified, background-checked professionals",
                            "⚡ Connect via chat or video calls",
                            "🛡️ 100% secure and family-safe platform"
                          ] : [
                            "✨ Get matched with families instantly",
                            "💰 Start earning with flexible schedules",
                            "📱 Connect via secure chat and video",
                            "🌟 Build your professional reputation"
                          ].map((benefit, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700"
                            >
                              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                              <span>{benefit}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* MASSIVE PULSING REGISTRATION CTA - Enhanced for Mobile with Responsive Text */}
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(59, 130, 246, 0.3)",
                        "0 0 30px rgba(59, 130, 246, 0.5)",
                        "0 0 20px rgba(59, 130, 246, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gradient-to-r from-primary via-blue-600 to-primary rounded-2xl p-4 sm:p-6 border-2 border-primary/20"
                  >
                    <div className="text-center space-y-4">
                      <h4 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center justify-center gap-2 flex-wrap">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" />
                        <span className="text-center leading-tight">
                          {dashboardRole === 'family' ? "GET YOUR PERFECT MATCH NOW!" : "GET MATCHED WITH FAMILIES!"}
                        </span>
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" />
                      </h4>
                      
                      <p className="text-xs sm:text-sm md:text-base text-blue-100 font-medium px-2">
                        {dashboardRole === 'family' 
                          ? "Join thousands of families who found their perfect caregiver through Tavara!"
                          : "Join hundreds of professionals earning with flexible caregiving jobs!"
                        }
                      </p>
                      
                      {/* SUPER PROMINENT REGISTRATION BUTTON - Mobile Optimized with Responsive Text */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Button 
                          size="lg" 
                          className="w-full bg-white text-primary hover:bg-gray-50 text-xs sm:text-sm md:text-lg font-bold py-3 sm:py-4 px-2 sm:px-4 md:px-8 rounded-xl shadow-lg border-2 border-white min-h-[48px]"
                          onClick={dashboardRole === 'family' ? handleFindCaregiverClick : handleProfessionalMatchClick}
                        >
                          <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                          <span className="text-center leading-tight">
                            {dashboardRole === 'family' ? (
                              <>
                                <span className="sm:hidden">🎯 FIND CAREGIVER!</span>
                                <span className="hidden sm:inline">🎯 FIND MY CAREGIVER NOW!</span>
                              </>
                            ) : (
                              <>
                                <span className="sm:hidden">⚡ GET MATCHED!</span>
                                <span className="hidden sm:inline">⚡ GET MATCHED WITH FAMILIES!</span>
                              </>
                            )}
                          </span>
                          <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                        </Button>
                      </motion.div>
                      
                      {/* SECONDARY PATHWAY BUTTONS - Mobile Optimized with Responsive Text */}
                      <div className="grid grid-cols-1 gap-2 pt-2 w-full">
                        <Button 
                          variant="outline" 
                          className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold text-xs sm:text-sm md:text-base py-2 sm:py-3 min-h-[44px]"
                          onClick={dashboardRole === 'family' ? handleQuickRegistrationClick : handleProfessionalRegistrationClick}
                        >
                          <span className="text-center leading-tight">
                            {dashboardRole === 'family' ? (
                              <>
                                <span className="sm:hidden">🏠 Quick Sign Up</span>
                                <span className="hidden sm:inline">🏠 Quick Family Registration</span>
                              </>
                            ) : (
                              <>
                                <span className="sm:hidden">👩‍⚕️ Professional Sign Up</span>
                                <span className="hidden sm:inline">👩‍⚕️ Care Professionals Sign Up</span>
                              </>
                            )}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* URGENCY MESSAGING */}
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
                      <h5 className="font-bold text-amber-800 text-sm sm:text-base">
                        {dashboardRole === 'family' ? "Don't Wait - Families Like Yours Are Getting Matched RIGHT NOW!" : "Don't Miss Out - New Opportunities Posted Every Hour!"}
                      </h5>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-700 font-medium">
                      {dashboardRole === 'family' 
                        ? "Every minute you wait, another family finds their perfect caregiver. Join the magic now!"
                        : "Every minute you wait, another professional gets the best family assignments. Start earning today!"
                      }
                    </p>
                  </div>
                </div>
              ) : (
                /* NORMAL MODE: Standard welcome message for non-dashboard pages */
                <div className="bg-gradient-to-br from-primary/5 to-blue/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-primary">Welcome to Tavara!</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    I'm here to help you navigate your caregiving journey. Whether you're a family seeking care, 
                    a professional caregiver, or a community member wanting to help, I'll guide you every step of the way.
                  </p>
                  
                  {/* Sign In Button */}
                  <div className="mb-3">
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary-600 text-white w-full"
                      onClick={() => window.location.href = '/auth'}
                    >
                      Sign In
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Pathway Buttons for First-Time Visitors */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 text-center mb-2">Or explore as a guest:</p>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8 border-primary/20 hover:bg-primary/5"
                        onClick={() => window.location.href = '/dashboard/family'}
                      >
                        Find Care Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8 border-primary/20 hover:bg-primary/5"
                        onClick={() => window.location.href = '/dashboard/professional'}
                      >
                        Get Hired
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8 border-primary/20 hover:bg-primary/5"
                        onClick={() => window.location.href = '/dashboard/community'}
                      >
                        Join The Village
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin role content */}
          {role === 'admin' && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Admin Dashboard</h3>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                Access administrative tools, user management, and platform analytics.
              </p>
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => window.location.href = '/admin'}
              >
                Access Admin Tools
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Caregiver Matching Modal for Anonymous Family Dashboard Users */}
      {showCaregiverMatchingModal && (
        <CaregiverMatchingModal
          open={showCaregiverMatchingModal}
          onOpenChange={setShowCaregiverMatchingModal}
        />
      )}

      {/* Professional Family Match Modal for Anonymous Professional Dashboard Users */}
      {showProfessionalMatchModal && (
        <ProfessionalFamilyMatchModal
          open={showProfessionalMatchModal}
          onOpenChange={setShowProfessionalMatchModal}
        />
      )}
    </div>
  );
};
