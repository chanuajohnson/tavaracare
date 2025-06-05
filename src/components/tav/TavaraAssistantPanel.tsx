
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Sparkles, Check, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTavaraState } from './hooks/useTavaraState';
import { useFormDetection } from './hooks/useFormDetection';
import { RoleBasedContent } from './RoleBasedContent';
import { assistantSupabase } from './assistantSupabase';
import { ManualNudgeService } from './ManualNudgeService';
import { useAuth } from '@/components/providers/AuthProvider';
import { AssistantNudge } from './types';
import { useProfessionalProgress } from './hooks/useProfessionalProgress';
import { useFamilyJourneyProgress } from '@/hooks/useFamilyJourneyProgress';
import { useLocation } from 'react-router-dom';

const AUTO_GREET_MESSAGES = {
  guest: "👋 Welcome to Tavara! I'm TAV, your personal care coordinator. Let me help you find the perfect care solution.",
  family: "💙 Hello! I'm here to guide you through your caregiving journey. How can I help you today?",
  professional: "🤝 Hi there! Ready to connect with families who need your expertise? Let's get started!",
  community: "🌟 Welcome back! Thank you for being part of our caring community.",
  admin: "⚡ Admin panel ready. How can I assist with platform management today?"
};

const JOURNEY_STAGE_MESSAGES = {
  foundation: "💙 I see you're building your care foundation! Let's make sure we have everything needed to find your perfect caregiver match.",
  scheduling: "📅 Great progress! You're ready to meet with our care coordinator. This is where your care plan really comes to life.",
  trial: "🌟 Exciting! You're about to experience our trial day. This is the perfect way to ensure compatibility before committing.",
  conversion: "🎉 Congratulations on completing your trial! Now it's time to choose the care path that works best for your family."
};

export const TavaraAssistantPanel: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { state, openPanel, closePanel, minimizePanel, markNudgesAsRead } = useTavaraState();
  const { currentForm, isFormPage, isJourneyTouchpoint } = useFormDetection();
  const [nudges, setNudges] = useState<AssistantNudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialGreeted, setHasInitialGreeted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetedPages, setGreetedPages] = useState<Set<string>>(new Set());

  // Get comprehensive journey progress
  const professionalProgress = useProfessionalProgress();
  const familyJourneyProgress = useFamilyJourneyProgress();

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

  // MAGIC AUTO-GREETING with journey stage awareness
  useEffect(() => {
    const sessionKey = `tavara_session_greeted`;
    const hasGreetedThisSession = sessionStorage.getItem(sessionKey);
    
    console.log('TAV: Auto-greeting check:', {
      hasGreetedThisSession,
      hasInitialGreeted,
      isOpen: state.isOpen,
      currentRole: state.currentRole,
      pathname: location.pathname,
      journeyStage: state.currentRole === 'family' ? familyJourneyProgress.journeyStage : null
    });
    
    // Show magic greeting if haven't greeted this session AND not already open
    if (!hasGreetedThisSession && !hasInitialGreeted && !state.isOpen) {
      console.log('TAV: Triggering magic auto-greeting!');
      
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
        }, 2500); // Show greeting for 2.5 seconds then auto-open
      }, 1200); // Initial delay for page load
    }
  }, [hasInitialGreeted, state.isOpen, openPanel, location.pathname, familyJourneyProgress.journeyStage]);

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
      
      // Show contextual greeting with auto-open
      setTimeout(() => {
        setShowGreeting(true);
        // Auto-open after brief display - NO USER INTERACTION
        setTimeout(() => {
          setShowGreeting(false);
          openPanel();
        }, 2000);
      }, 600);
    }
  }, [location.pathname, isJourneyTouchpoint, state.isOpen, greetedPages, openPanel, state.currentRole, hasInitialGreeted]);

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

  // Create comprehensive progress context based on user role
  const getProgressContext = () => {
    if (state.currentRole === 'professional') {
      const { completionPercentage, nextStep } = professionalProgress;
      return {
        completionPercentage: completionPercentage || 0,
        currentStep: nextStep?.title || 'Complete your professional profile',
        nextAction: nextStep?.description || 'Add your experience and certifications',
        journeyStage: 'foundation'
      };
    } else if (state.currentRole === 'family') {
      const { completionPercentage, nextStep, journeyStage, careModel, trialCompleted } = familyJourneyProgress;
      return {
        completionPercentage: completionPercentage || 0,
        currentStep: nextStep?.title || 'Complete your profile',
        nextAction: nextStep?.description || 'Add your care needs information',
        journeyStage,
        careModel,
        trialCompleted
      };
    }
    
    // Default fallback
    return {
      completionPercentage: 0,
      currentStep: 'Get Started',
      nextAction: 'Complete your registration',
      journeyStage: 'foundation'
    };
  };

  const progressContext = getProgressContext();

  // Enhanced greeting message with journey stage context
  const getContextualGreeting = () => {
    // For form-specific pages, use form context
    if (currentForm?.autoGreetingMessage) {
      return currentForm.autoGreetingMessage;
    }
    
    // For family users, add journey stage context
    if (state.currentRole === 'family' && progressContext.journeyStage) {
      const stageMessage = JOURNEY_STAGE_MESSAGES[progressContext.journeyStage];
      if (stageMessage) {
        return stageMessage;
      }
    }
    
    // For initial greeting or pages without forms, use role-based or default
    if (state.currentRole && AUTO_GREET_MESSAGES[state.currentRole]) {
      return AUTO_GREET_MESSAGES[state.currentRole];
    }
    
    return AUTO_GREET_MESSAGES.guest;
  };

  // Floating button with enhanced magic effects
  if (!state.isOpen && !state.isMinimized) {
    return (
      <div className={`fixed z-50 ${isMobile 
        ? 'bottom-20 left-4' 
        : 'bottom-6 left-6'
      }`}>
        {/* Enhanced journey-aware greeting bubble */}
        <AnimatePresence>
          {showGreeting && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8, x: -10 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                x: 0
              }}
              exit={{ opacity: 0, y: -20, scale: 0.85 }}
              transition={{ 
                type: "spring", 
                damping: 20, 
                stiffness: 350,
                duration: 0.5
              }}
              className={`absolute bottom-16 left-0 bg-white rounded-xl shadow-2xl border-2 border-primary/40 ${
                isMobile 
                  ? 'w-64 max-w-[85vw] text-sm p-3' 
                  : 'w-72 p-5'
              }`}
            >
              {/* Enhanced vertical sparkle effects */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="absolute top-1 right-6">
                <Sparkles className="h-3 w-3 text-primary/70 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              <div className="absolute bottom-1 left-1">
                <Sparkles className="h-2 w-2 text-primary/50 animate-pulse" style={{ animationDelay: '0.8s' }} />
              </div>
              <div className="absolute top-8 left-2">
                <Sparkles className="h-2 w-2 text-primary/40 animate-pulse" style={{ animationDelay: '1.2s' }} />
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💙</span>
                  <div className="flex-1">
                    <p className="font-semibold text-primary text-sm">Hi! I'm TAV</p>
                    <p className="text-xs text-gray-600">Your Care Coordinator</p>
                  </div>
                </div>
                <p className="text-xs text-gray-800 leading-relaxed">
                  {getContextualGreeting()}
                </p>
                
                {/* Journey progress indicator for family users */}
                {state.currentRole === 'family' && progressContext.completionPercentage > 0 && (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Journey Progress</span>
                      <span className="text-xs font-bold text-primary">{progressContext.completionPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300" 
                        style={{ width: `${progressContext.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Magic floating button */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 300,
            delay: 0.3
          }}
          onClick={openPanel}
          className={`relative bg-gradient-to-r from-primary to-primary/80 text-white rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 ${
            isMobile ? 'w-14 h-14' : 'w-16 h-16'
          }`}
        >
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          <div className="relative flex items-center justify-center h-full">
            <MessageCircle className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'}`} />
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

  // Main panel with enhanced journey context
  return (
    <motion.div
      initial={{ opacity: 0, x: -400 }}
      animate={{ 
        opacity: 1, 
        x: state.isMinimized ? -300 : 0,
        scale: state.isMinimized ? 0.9 : 1
      }}
      exit={{ opacity: 0, x: -400 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`fixed left-0 top-0 h-full bg-white shadow-2xl border-r border-gray-200 z-50 flex flex-col ${
        isMobile ? 'w-full' : 'w-96'
      }`}
    >
      <RoleBasedContent 
        role={state.currentRole}
        nudges={nudges}
        onNudgeClick={handleNudgeClick}
        isLoading={isLoading}
        progressContext={progressContext}
        onClose={closePanel}
        onMinimize={minimizePanel}
      />
    </motion.div>
  );
};
