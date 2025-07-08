import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Sparkles, Check, XIcon, ChevronLeft, ChevronRight, Maximize2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTavaraState } from './hooks/useTavaraState';
import { useFormDetection } from './hooks/useFormDetection';
import { RoleBasedContent } from './RoleBasedContent';
import { assistantSupabase } from './assistantSupabase';
import { ManualNudgeService } from './ManualNudgeService';
import { useAuth } from '@/components/providers/AuthProvider';
import { AssistantNudge, ProgressContext } from './types';
import { useEnhancedProfessionalProgress } from '@/hooks/useEnhancedProfessionalProgress';
import { useEnhancedJourneyProgress } from '@/hooks/useEnhancedJourneyProgress';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AUTO_GREET_MESSAGES = {
  guest: "👋 Welcome to Tavara! I'm TAV, your personal care coordinator. Let me help you find the perfect care solution.",
  family: "💙 Hello! I'm here to guide you through your caregiving journey. How can I help you today?",
  professional: "🤝 Hi there! Ready to advance your caregiving career? Let's build your professional journey together!",
  community: "🌟 Welcome back! Thank you for being part of our caring community.",
  admin: "⚡ Admin panel ready. How can I assist with platform management today?"
};

// LOUD MODE MESSAGES for anonymous users on dashboards
const LOUD_DASHBOARD_MESSAGES = {
  family: "🎯 STOP! You're missing the MAGIC! ✨ Get matched with perfect caregivers in minutes! Your family's care journey starts with one click! 💙",
  professional: "⚡ ATTENTION! Families are looking for YOU right now! 🔥 Join our network and see your perfect family matches instantly! Don't let opportunities slip away! 🌟"
};

const JOURNEY_STAGE_MESSAGES = {
  foundation: "💙 I see you're building your professional foundation! Let's make sure your profile showcases your expertise perfectly.",
  qualification: "📋 Great progress on your qualifications! Your credentials are what families look for in a trusted caregiver.",
  matching: "🎯 Excellent! You're almost ready to connect with families. Let's finalize your availability settings.",
  active: "🌟 Congratulations! You're an active professional. Let's help you grow your caregiving career!"
};

export const TavaraAssistantPanel: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { state, openPanel, closePanel, minimizePanel, maximizePanel, markNudgesAsRead } = useTavaraState();
  const { currentForm, isFormPage, isJourneyTouchpoint } = useFormDetection();
  const [nudges, setNudges] = useState<AssistantNudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialGreeted, setHasInitialGreeted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetedPages, setGreetedPages] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  // LOUD MODE DETECTION for anonymous users on dashboard pages
  const isLoudMode = !user && (location.pathname === '/dashboard/family' || location.pathname === '/dashboard/professional');
  const dashboardRole = location.pathname === '/dashboard/family' ? 'family' : 
                       location.pathname === '/dashboard/professional' ? 'professional' : null;

  // Get comprehensive journey progress - use direct hooks like professional implementation
  const professionalProgress = useEnhancedProfessionalProgress();
  const familyJourneyProgress = useEnhancedJourneyProgress();

  // Initialize session tracking
  useEffect(() => {
    // Mark session as started
    sessionStorage.setItem('tavara_session_started', 'true');
    if (!sessionStorage.getItem('tavara_session_start_time')) {
      sessionStorage.setItem('tavara_session_start_time', Date.now().toString());
    }
  }, []);

  // Initialize nudge service and fetch nudges
  useEffect(() => {
    if (user) {
      const nudgeService = ManualNudgeService.getInstance();
      nudgeService.updateUserActivity(user.id);
      fetchNudges();
    }
  }, [user]);

  // Create progress context only for guest/default roles (removed family processing)
  const getProgressContext = (): ProgressContext => {
    if (state.currentRole === 'professional') {
      const { overallProgress, nextStep, currentStage, completedSteps, totalSteps } = professionalProgress;
      return {
        role: 'professional',
        completionPercentage: overallProgress || 0,
        currentStep: nextStep?.title || 'Complete your professional profile',
        nextAction: nextStep?.description || 'Add your experience and certifications',
        journeyStage: currentStage || 'foundation',
        completedSteps: completedSteps || 0,
        totalSteps: totalSteps || 6
      };
    }
    
    // Default fallback for guest or other roles (removed family processing)
    return {
      role: state.currentRole || 'guest',
      completionPercentage: 0,
      currentStep: 'Get Started',
      nextAction: 'Complete your registration',
      journeyStage: 'foundation',
      completedSteps: 0,
      totalSteps: 1
    };
  };

  // ENHANCED MAGIC AUTO-GREETING with LOUD MODE for dashboards
  useEffect(() => {
    const sessionKey = `tavara_session_greeted`;
    const hasGreetedThisSession = sessionStorage.getItem(sessionKey);
    
    console.log('TAV: Auto-greeting check:', {
      hasGreetedThisSession,
      hasInitialGreeted,
      isOpen: state.isOpen,
      currentRole: state.currentRole,
      pathname: location.pathname,
      isLoudMode,
      dashboardRole,
      journeyStage: state.currentRole === 'family' ? familyJourneyProgress.currentStage : 
                   state.currentRole === 'professional' ? professionalProgress.currentStage : null,
      currentForm: currentForm?.formId
    });
    
    // Show magic greeting if haven't greeted this session AND not already open
    if (!hasGreetedThisSession && !hasInitialGreeted && !state.isOpen) {
      console.log('TAV: Triggering magic auto-greeting!', { isLoudMode, dashboardRole });
      
      // LOUD MODE: More aggressive timing for dashboard anonymous users
      const initialDelay = isLoudMode ? 800 : 1200; // Faster for loud mode
      const displayDuration = isLoudMode ? 3500 : 2500; // Longer display for loud mode
      
      // Show magic entrance after a brief delay
      setTimeout(() => {
        setShowGreeting(true);
        setHasInitialGreeted(true);
        // Mark as greeted for this session
        sessionStorage.setItem(sessionKey, 'true');
        
        // Auto-open the panel after showing the magic - NO USER INTERACTION NEEDED
        setTimeout(() => {
          setShowGreeting(false);
          openPanel();
        }, displayDuration);
      }, initialDelay);
    }
  }, [hasInitialGreeted, state.isOpen, openPanel, location.pathname, familyJourneyProgress.currentStage, professionalProgress.currentStage, isLoudMode, dashboardRole]);

  // NAVIGATION AUTO-GREETING (contextual magic on journey touchpoints)
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Skip if panel is already open or we haven't done initial greeting
    if (state.isOpen || !hasInitialGreeted) {
      return;
    }

    // Check if this is a journey touchpoint and we haven't greeted for this specific page
    if (isJourneyTouchpoint(currentPath) && !greetedPages.has(currentPath)) {
      console.log('TAV: Detected NEW journey touchpoint navigation:', currentPath, 'for role:', state.currentRole);
      
      // Add page to greeted pages to prevent spam
      setGreetedPages(prev => new Set([...prev, currentPath]));
      
      // LOUD MODE: More aggressive timing for dashboard pages
      const greetingDelay = isLoudMode ? 400 : 600; // Faster for loud mode
      const autoOpenDelay = isLoudMode ? 1500 : 2000; // Shorter for loud mode
      
      // Show contextual greeting with auto-open
      setTimeout(() => {
        setShowGreeting(true);
        // Auto-open after brief display - NO USER INTERACTION
        setTimeout(() => {
          setShowGreeting(false);
          openPanel();
        }, autoOpenDelay);
      }, greetingDelay);
    }
  }, [location.pathname, isJourneyTouchpoint, state.isOpen, greetedPages, openPanel, state.currentRole, hasInitialGreeted, isLoudMode]);

  // Auto-open for nudges
  useEffect(() => {
    if (nudges.length > 0 && !state.isOpen && hasInitialGreeted) {
      setTimeout(() => openPanel(), 500);
    }
  }, [nudges.length, state.isOpen, hasInitialGreeted, openPanel]);

  const fetchNudges = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userNudges = await assistantSupabase.getNudgesForUser(user.id);
      setNudges(userNudges);
    } catch (error) {
      console.error('Error fetching nudges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNudgeClick = async (nudge: AssistantNudge) => {
    await assistantSupabase.markNudgeAsSeen(nudge.id);
    setNudges(prev => prev.filter(n => n.id !== nudge.id));
    markNudgesAsRead();
  };

  const progressContext = getProgressContext();

  // Enhanced greeting message with LOUD MODE support and form detection context and professional intelligence
  const getContextualGreeting = () => {
    // PRIORITY 1: LOUD MODE for anonymous dashboard users
    if (isLoudMode && dashboardRole && LOUD_DASHBOARD_MESSAGES[dashboardRole]) {
      console.log('TAV: Using LOUD MODE greeting for', dashboardRole, 'dashboard');
      return LOUD_DASHBOARD_MESSAGES[dashboardRole];
    }
    
    // PRIORITY 2: For form-specific pages, use form's auto-greeting message
    if (currentForm?.autoGreetingMessage) {
      console.log('TAV: Using form-specific greeting for', currentForm.formId);
      return currentForm.autoGreetingMessage;
    }
    
    // PRIORITY 3: For professional users, add journey stage context
    if (state.currentRole === 'professional' && progressContext.journeyStage) {
      const stageMessage = JOURNEY_STAGE_MESSAGES[progressContext.journeyStage];
      if (stageMessage) {
        console.log('TAV: Using professional journey stage greeting for', progressContext.journeyStage);
        return stageMessage;
      }
    }
    
    // PRIORITY 4: For family users, add journey stage context using direct hook data
    if (state.currentRole === 'family' && familyJourneyProgress.currentStage) {
      const stageMessage = JOURNEY_STAGE_MESSAGES[familyJourneyProgress.currentStage];
      if (stageMessage) {
        console.log('TAV: Using family journey stage greeting for', familyJourneyProgress.currentStage);
        return stageMessage;
      }
    }
    
    // PRIORITY 5: For initial greeting or pages without forms, use role-based or default
    if (state.currentRole && AUTO_GREET_MESSAGES[state.currentRole]) {
      console.log('TAV: Using role-based greeting for', state.currentRole);
      return AUTO_GREET_MESSAGES[state.currentRole];
    }
    
    console.log('TAV: Using default guest greeting');
    return AUTO_GREET_MESSAGES.guest;
  };

  // Handle expand/collapse toggle with proper state management
  const handleExpandToggle = () => {
    console.log('TAV: Expand toggle clicked, current isExpanded:', isExpanded);
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  // Fixed maximize functionality from minimized state
  const handleMaximizeFromMinimized = () => {
    console.log('TAV: Maximizing from minimized state');
    setIsExpanded(true); // Set to expanded state for larger size
    maximizePanel();
  };

  // Enhanced close panel function with debugging
  const handleClosePanel = () => {
    console.log('TAV: Close panel clicked, current state:', { isOpen: state.isOpen, isMinimized: state.isMinimized });
    setIsExpanded(false); // Reset expanded state
    closePanel();
  };

  // Show minimized panel if minimized
  if (state.isMinimized) {
    console.log('TAV: Rendering minimized panel');
    return (
      <div className={`fixed z-50 ${isMobile 
        ? 'bottom-4 left-4' 
        : 'bottom-6 left-6'
      }`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-gray-700">TAV</span>
            {nudges.length > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {nudges.length}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMaximizeFromMinimized}
              className="h-7 w-7 p-0"
              title="Expand panel"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClosePanel}
              className="h-7 w-7 p-0"
              title="Close panel"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Floating button with ENHANCED MAGIC EFFECTS for LOUD MODE and rounded corners
  if (!state.isOpen && !state.isMinimized) {
    return (
      <div className={`fixed z-50 ${isMobile 
        ? 'bottom-4 left-4' 
        : 'bottom-6 left-6'
      }`}>
        {/* Enhanced form-aware greeting bubble with LOUD MODE support and rounded corners */}
        <AnimatePresence>
          {showGreeting && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8, x: -10 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: isLoudMode ? 1.1 : 1, // Bigger for loud mode
                x: 0
              }}
              exit={{ opacity: 0, y: -20, scale: 0.85 }}
              transition={{ 
                type: "spring", 
                damping: isLoudMode ? 15 : 20, // More bouncy for loud mode
                stiffness: isLoudMode ? 400 : 350, // More energetic for loud mode
                duration: 0.5
              }}
              className={cn(
                "absolute bottom-16 left-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border-2 border-primary/40",
                isLoudMode && "border-4 border-primary/60 shadow-primary/20", // Enhanced border for loud mode
                isMobile 
                  ? 'w-64 max-w-[85vw] text-sm p-3' 
                  : isLoudMode ? 'w-80 p-6' : 'w-72 p-5' // Bigger for loud mode
              )}
            >
              {/* ENHANCED SPARKLE EFFECTS for LOUD MODE */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className={cn("h-5 w-5 text-primary animate-pulse", isLoudMode && "h-6 w-6")} />
              </div>
              <div className="absolute top-1 right-6">
                <Sparkles className={cn("h-3 w-3 text-primary/70 animate-pulse", isLoudMode && "h-4 w-4")} style={{ animationDelay: '0.3s' }} />
              </div>
              <div className="absolute bottom-1 left-1">
                <Sparkles className={cn("h-2 w-2 text-primary/50 animate-pulse", isLoudMode && "h-3 w-3")} style={{ animationDelay: '0.8s' }} />
              </div>
              <div className="absolute top-8 left-2">
                <Sparkles className={cn("h-2 w-2 text-primary/40 animate-pulse", isLoudMode && "h-3 w-3")} style={{ animationDelay: '1.2s' }} />
              </div>
              
              {/* EXTRA SPARKLES for LOUD MODE */}
              {isLoudMode && (
                <>
                  <div className="absolute top-3 right-12">
                    <Star className="h-3 w-3 text-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Star className="h-2 w-2 text-pink-400 animate-pulse" style={{ animationDelay: '1.0s' }} />
                  </div>
                  <div className="absolute top-12 left-8">
                    <Sparkles className="h-2 w-2 text-blue-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
                  </div>
                </>
              )}
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("text-xl", isLoudMode && "text-2xl")}>💙</span>
                  <div className="flex-1">
                    <p className={cn("font-semibold text-primary text-sm", isLoudMode && "text-base font-bold")}>
                      {isLoudMode ? "🎯 TAV MAGIC ALERT!" : "Hi! I'm TAV"}
                    </p>
                    <p className={cn("text-xs text-gray-600", isLoudMode && "text-sm font-medium")}>
                      {isLoudMode ? "Your Magical Care Coordinator" : "Your Care Coordinator"}
                    </p>
                  </div>
                </div>
                <p className={cn("text-xs text-gray-800 leading-relaxed", isLoudMode && "text-sm font-medium leading-relaxed")}>
                  {getContextualGreeting()}
                </p>
                
                {/* Form context indicator */}
                {currentForm && (
                  <div className="bg-primary/5 rounded-lg p-2 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-primary">Form Assistant Ready</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">I can help you fill out "{currentForm.formTitle}"</p>
                  </div>
                )}
                
                {/* Enhanced professional journey progress indicator */}
                {state.currentRole === 'professional' && progressContext.completionPercentage > 0 && !currentForm && (
                  <div className="bg-gradient-to-r from-primary/5 to-blue/5 rounded-lg p-2 border border-primary/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-primary">Professional Journey</span>
                      <span className="text-xs font-bold text-primary">{progressContext.completionPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300" 
                        style={{ width: `${progressContext.completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {progressContext.completedSteps} of {progressContext.totalSteps} steps complete
                    </p>
                  </div>
                )}
                
                {/* Journey progress indicator for family users - now using direct hook data */}
                {state.currentRole === 'family' && familyJourneyProgress.completionPercentage > 0 && !currentForm && (
                  <div className="bg-gradient-to-r from-primary/5 to-blue/5 rounded-lg p-2 border border-primary/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-primary">Family Journey</span>
                      <span className="text-xs font-bold text-primary">{familyJourneyProgress.completionPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300" 
                        style={{ width: `${familyJourneyProgress.completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {familyJourneyProgress.steps.filter(s => s.completed).length} of {familyJourneyProgress.steps.length} steps complete
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Magic floating button with LOUD MODE multiple sparkle layers and rounded corners */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: isLoudMode ? 1.1 : 1, rotate: 0 }} // Bigger for loud mode
          whileHover={{ scale: isLoudMode ? 1.15 : 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ 
            type: "spring", 
            damping: isLoudMode ? 12 : 15, // More bouncy for loud mode
            stiffness: isLoudMode ? 350 : 300, // More energetic for loud mode
            delay: 0.3
          }}
          onClick={openPanel}
          className={cn(
            "relative bg-gradient-to-r from-primary to-primary/80 text-white rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300",
            isLoudMode && "shadow-primary/30 hover:shadow-primary/40", // Enhanced shadow for loud mode
            isMobile ? 'w-14 h-14' : isLoudMode ? 'w-18 h-18' : 'w-16 h-16' // Bigger for loud mode
          )}
        >
          {/* Enhanced pulsing ring effects for LOUD MODE */}
          <div className={cn("absolute inset-0 rounded-full bg-primary/30 animate-ping", isLoudMode && "bg-primary/40")} />
          <div className={cn("absolute inset-0 rounded-full bg-primary/20 animate-pulse", isLoudMode && "bg-primary/30")} style={{ animationDelay: '0.5s' }} />
          <div className={cn("absolute inset-0 rounded-full bg-primary/10 animate-pulse", isLoudMode && "bg-primary/20")} style={{ animationDelay: '1s' }} />
          
          {/* ENHANCED Rotating sparkle effects around the button for LOUD MODE */}
          <div className={cn("absolute -inset-2", isLoudMode && "-inset-3")}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: isLoudMode ? 6 : 8, repeat: Infinity, ease: "linear" }} // Faster for loud mode
              className="relative w-full h-full"
            >
              <Sparkles className={cn("absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 h-3 w-3 text-primary/60", isLoudMode && "h-4 w-4")} />
              <Star className={cn("absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 h-2 w-2 text-blue-400/70", isLoudMode && "h-3 w-3")} />
              <Sparkles className={cn("absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 h-2 w-2 text-primary/50", isLoudMode && "h-3 w-3")} />
              <Star className={cn("absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 h-2 w-2 text-blue-300/60", isLoudMode && "h-3 w-3")} />
            </motion.div>
          </div>
          
          {/* Counter-rotating inner sparkles for LOUD MODE */}
          <div className={cn("absolute -inset-1", isLoudMode && "-inset-2")}>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: isLoudMode ? 4 : 6, repeat: Infinity, ease: "linear" }} // Faster for loud mode
              className="relative w-full h-full"
            >
              <Sparkles className={cn("absolute top-1 right-1 h-2 w-2 text-primary/40", isLoudMode && "h-3 w-3")} />
              <Star className={cn("absolute bottom-1 left-1 h-2 w-2 text-blue-200/50", isLoudMode && "h-3 w-3")} />
              {isLoudMode && (
                <>
                  <Sparkles className="absolute top-2 left-2 h-2 w-2 text-amber-300/60" />
                  <Star className="absolute bottom-2 right-2 h-2 w-2 text-pink-300/50" />
                </>
              )}
            </motion.div>
          </div>
          
          <div className="relative flex items-center justify-center h-full">
            <MessageCircle className={cn(isMobile ? 'h-6 w-6' : isLoudMode ? 'h-8 w-8' : 'h-7 w-7')} />
          </div>
          
          {/* Notification badge for nudges */}
          {nudges.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
            >
              {nudges.length}
            </motion.div>
          )}
        </motion.button>
      </div>
    );
  }

  // Main panel with improved mobile experience, responsive sizing, proper scroll handling, and rounded corners
  return (
    <motion.div
      initial={{ opacity: 0, y: 400 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      exit={{ opacity: 0, y: 400 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "fixed bottom-0 left-0 bg-gradient-to-br from-white to-gray-50/50 shadow-2xl border-r border-t border-gray-200 z-50 flex flex-col rounded-tr-2xl",
        isMobile 
          ? isExpanded 
            ? 'w-full h-[70vh] max-h-[70vh] rounded-tr-xl' 
            : 'w-3/5 max-w-sm h-[40vh] max-h-[40vh] rounded-tr-xl'
          : 'w-96 h-[40vh] max-h-[40vh] rounded-tr-2xl'
      )}
      style={{
        // Ensure consistent positioning and prevent overflow issues
        minHeight: isMobile ? (isExpanded ? '70vh' : '40vh') : '40vh',
        maxHeight: isMobile ? (isExpanded ? '70vh' : '40vh') : '40vh'
      }}
    >
      {/* Mobile expand/collapse button - improved positioning and functionality */}
      {isMobile && (
        <button
          onClick={handleExpandToggle}
          className="absolute -right-8 top-4 bg-primary text-white rounded-r-xl p-2 shadow-lg hover:bg-primary/90 transition-colors z-10"
          aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      )}

      {/* Scrollable content container */}
      <div className="flex flex-col h-full overflow-hidden">
        <RoleBasedContent 
          role={state.currentRole}
          nudges={nudges}
          onNudgeClick={handleNudgeClick}
          isLoading={isLoading}
          progressContext={progressContext}
          professionalProgress={professionalProgress}
          familyJourneyProgress={familyJourneyProgress}
          onClose={handleClosePanel}
          onMinimize={minimizePanel}
          isLoudMode={isLoudMode}
          dashboardRole={dashboardRole}
        />
      </div>
    </motion.div>
  );
};
