import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Sparkles } from 'lucide-react';
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
import { useFamilyProgress } from './hooks/useFamilyProgress';
import { useLocation } from 'react-router-dom';

const AUTO_GREET_MESSAGES = {
  guest: "👋 Welcome to Tavara! I'm TAV, your personal care coordinator. Let me help you find the perfect care solution.",
  family: "💙 Hello! I'm here to guide you through your caregiving journey. How can I help you today?",
  professional: "🤝 Hi there! Ready to connect with families who need your expertise? Let's get started!",
  community: "🌟 Welcome back! Thank you for being part of our caring community.",
  admin: "⚡ Admin panel ready. How can I assist with platform management today?"
};

export const TavaraAssistantPanel: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { state, openPanel, closePanel, minimizePanel, markNudgesAsRead } = useTavaraState();
  const { currentForm, isFormPage, isJourneyTouchpoint } = useFormDetection();
  const [nudges, setNudges] = useState<AssistantNudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoGreeted, setHasAutoGreeted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [lastGreetedPath, setLastGreetedPath] = useState<string>('');

  // Get real progress data based on user role
  const professionalProgress = useProfessionalProgress();
  const familyProgress = useFamilyProgress();

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

  // Enhanced route change detection for form/journey auto-greeting
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Skip if already greeted for this path or if panel is already open
    if (lastGreetedPath === currentPath || state.isOpen) {
      return;
    }

    // Check if this is a journey touchpoint where TAV should appear
    if (isJourneyTouchpoint(currentPath) && state.currentRole) {
      console.log('TAV: Detected journey touchpoint:', currentPath, 'for role:', state.currentRole);
      
      // Set greeting message based on form context or use default
      const greetingMessage = currentForm?.autoGreetingMessage || AUTO_GREET_MESSAGES[state.currentRole];
      
      // Trigger the magic greeting experience
      setTimeout(() => {
        setShowGreeting(true);
        setLastGreetedPath(currentPath);
        
        // Auto open panel after greeting animation
        setTimeout(() => {
          openPanel();
        }, 2000); // Longer delay to let users read the contextual message
      }, 800); // Slight delay so page loads first
    }
  }, [location.pathname, isJourneyTouchpoint, currentForm, state.currentRole, state.isOpen, lastGreetedPath, openPanel]);

  // Original auto-greeting logic for initial site visits
  useEffect(() => {
    const sessionKey = `tavara_session_greeted_${state.currentRole}`;
    const hasGreetedThisSession = sessionStorage.getItem(sessionKey);
    
    // Show greeting if haven't greeted this session AND role is available AND not on a journey page
    if (!hasGreetedThisSession && state.currentRole && !hasAutoGreeted && !state.isOpen && !isJourneyTouchpoint(location.pathname)) {
      console.log('TAV: Triggering initial auto-greeting for role:', state.currentRole);
      
      // Show magic entrance after a brief delay
      setTimeout(() => {
        setShowGreeting(true);
        setHasAutoGreeted(true);
        // Mark as greeted for this session only
        sessionStorage.setItem(sessionKey, 'true');
        
        // Auto open panel after greeting animation
        setTimeout(() => {
          openPanel();
        }, 1000);
      }, 1000);
    }
  }, [state.currentRole, hasAutoGreeted, state.isOpen, location.pathname, isJourneyTouchpoint, openPanel]);

  // Auto-open for nudges
  useEffect(() => {
    if (nudges.length > 0 && !state.isOpen && !hasAutoGreeted) {
      setTimeout(() => openPanel(), 500);
    }
  }, [nudges.length, state.isOpen, hasAutoGreeted, openPanel]);

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

  // Create real progress context based on user role
  const getProgressContext = () => {
    if (state.currentRole === 'professional') {
      const { completionPercentage, nextStep } = professionalProgress;
      return {
        completionPercentage: completionPercentage || 0,
        currentStep: nextStep?.title || 'Complete your professional profile',
        nextAction: nextStep?.description || 'Add your experience and certifications'
      };
    } else if (state.currentRole === 'family') {
      const { completionPercentage, nextStep } = familyProgress;
      return {
        completionPercentage: completionPercentage || 0,
        currentStep: nextStep?.title || 'Complete your profile',
        nextAction: nextStep?.description || 'Add your care needs information'
      };
    }
    
    // Default fallback
    return {
      completionPercentage: 0,
      currentStep: 'Get Started',
      nextAction: 'Complete your registration'
    };
  };

  const progressContext = getProgressContext();

  // Enhanced greeting message with form context
  const getContextualGreeting = () => {
    if (currentForm?.autoGreetingMessage) {
      return currentForm.autoGreetingMessage;
    }
    
    if (state.currentRole && AUTO_GREET_MESSAGES[state.currentRole]) {
      return AUTO_GREET_MESSAGES[state.currentRole];
    }
    
    return "👋 Welcome to Tavara! I'm TAV, your personal care coordinator. Let me help you find the perfect care solution.";
  };

  // Floating button with enhanced magic effects
  if (!state.isOpen && !state.isMinimized) {
    return (
      <div className={`fixed z-50 ${isMobile 
        ? 'bottom-20 left-4' 
        : 'bottom-6 left-6'
      }`}>
        {/* Enhanced contextual greeting bubble */}
        <AnimatePresence>
          {showGreeting && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.7, x: -10 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, y: -15, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                damping: 18, 
                stiffness: 300,
                duration: 0.6
              }}
              className={`absolute bottom-16 left-0 bg-white rounded-xl shadow-xl border-2 border-primary/30 ${
                isMobile 
                  ? 'max-w-[280px] text-xs p-3' 
                  : 'max-w-80 p-4'
              }`}
              onAnimationComplete={() => {
                // Keep greeting visible longer for better visibility
                setTimeout(() => setShowGreeting(false), 6000);
              }}
            >
              {/* Enhanced sparkle effects */}
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              </div>
              <div className="absolute top-1 right-5">
                <Sparkles className="h-2 w-2 text-primary/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">💙</span>
                <p className="font-semibold text-primary text-sm leading-tight">
                  TAV Assistant
                </p>
                {currentForm && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {currentForm.formTitle}
                  </span>
                )}
              </div>
              
              <p className={`text-muted-foreground leading-relaxed ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {getContextualGreeting()}
              </p>
              
              {/* Form-specific context */}
              {currentForm && (
                <div className="mt-2 p-2 bg-primary/5 rounded-lg">
                  <p className={`text-primary font-medium ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    ✨ I can help you fill this out conversationally or guide you step by step!
                  </p>
                </div>
              )}
              
              {/* Enhanced speech bubble tail */}
              <div className="absolute bottom-[-8px] left-6 w-3 h-3 bg-white border-r-2 border-b-2 border-primary/30 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact TAV button */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.3 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <Button
            onClick={openPanel}
            size="icon"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
          >
            {/* Enhanced magic sparkle effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="h-3 w-3 absolute top-2 right-2 text-white/70 animate-pulse" />
              <Sparkles className="h-2 w-2 absolute bottom-2 left-2 text-white/50 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <Sparkles className="h-2 w-2 absolute top-3 left-3 text-white/60 animate-pulse" style={{ animationDelay: '0.7s' }} />
            </div>
            
            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            
            {/* Enhanced notification badge with form awareness */}
            {(nudges.length > 0 || isFormPage) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-primary/80 to-primary flex items-center justify-center shadow-lg border-2 border-white"
              >
                {nudges.length > 0 ? (
                  <span className="text-xs text-white font-bold">
                    {nudges.length}
                  </span>
                ) : (
                  <Sparkles className="h-3 w-3 text-white" />
                )}
              </motion.div>
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={closePanel}
            />
          )}
          
          {/* Compact panel with 40% height and width */}
          <motion.div
            initial={isMobile 
              ? { x: '-100%', opacity: 0 } 
              : { x: '-100%', opacity: 0, scale: 0.95 }
            }
            animate={isMobile 
              ? { x: 0, opacity: 1 } 
              : { x: 0, opacity: 1, scale: 1 }
            }
            exit={isMobile 
              ? { x: '-100%', opacity: 0 } 
              : { x: '-100%', opacity: 0, scale: 0.95 }
            }
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-50 bg-white border shadow-2xl ${
              isMobile
                ? 'bottom-4 right-4 left-auto rounded-2xl max-h-[40vh] w-[40vw] min-w-[280px] border'
                : 'bottom-6 left-6 rounded-2xl border max-h-[40vh] w-[min(20rem,40vw)]'
            }`}
          >
            {/* Compact header with form context */}
            <div className={`flex items-center justify-between border-b bg-gradient-to-r from-primary/5 to-transparent ${
              isMobile ? 'p-2 pb-1' : 'p-3'
            }`}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-md flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-sm leading-tight">TAV Assistant</h2>
                  <p className="text-xs text-muted-foreground leading-tight truncate">
                    {currentForm ? `Helping with ${currentForm.formTitle}` : 'Your care coordinator'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={closePanel}
                className="h-7 w-7 hover:bg-primary/10 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Compact content with optimized scrolling */}
            <div className={`overflow-y-auto ${
              isMobile 
                ? 'p-2 max-h-[calc(40vh-70px)]' 
                : 'p-3 max-h-[calc(40vh-80px)]'
            }`}>
              {/* Form context banner */}
              {currentForm && (
                <div className="mb-3 p-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                    <h3 className="text-xs font-medium text-primary">
                      {currentForm.formTitle} Assistance
                    </h3>
                  </div>
                  <p className="text-xs text-primary/80 leading-relaxed">
                    {currentForm.autoGreetingMessage || "I can help you fill this out conversationally or guide you step by step. What would be most helpful?"}
                  </p>
                </div>
              )}

              {/* Compact nudges */}
              {nudges.length > 0 && (
                <div className="mb-4 space-y-2">
                  <h3 className="text-xs font-medium text-amber-800 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 flex-shrink-0" />
                    Messages for you:
                  </h3>
                  {nudges.map((nudge) => (
                    <motion.div
                      key={nudge.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-200 rounded-lg p-2 cursor-pointer hover:from-amber-100 hover:to-amber-100/50 transition-all duration-200"
                      onClick={() => handleNudgeClick(nudge)}
                    >
                      <p className={`text-amber-800 leading-relaxed ${isMobile ? 'text-xs' : 'text-xs'}`}>{nudge.message}</p>
                      <p className={`text-amber-600 mt-1 leading-tight ${isMobile ? 'text-xs' : 'text-xs'}`}>
                        From {nudge.sender} • Click to dismiss
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Role-based content with real progress context */}
              <RoleBasedContent 
                role={state.currentRole} 
                progressContext={progressContext}
              />
            </div>

            {/* Compact mobile handle */}
            {isMobile && (
              <div className="flex justify-center py-1 bg-gray-50/50">
                <div className="w-6 h-1 bg-gray-300 rounded-full" />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
