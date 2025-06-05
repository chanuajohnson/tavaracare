
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
  const [hasInitialGreeted, setHasInitialGreeted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetedPages, setGreetedPages] = useState<Set<string>>(new Set());

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

  // MAGIC AUTO-GREETING - Automatically shows and opens without user interaction
  useEffect(() => {
    const sessionKey = `tavara_session_greeted`;
    const hasGreetedThisSession = sessionStorage.getItem(sessionKey);
    
    console.log('TAV: Auto-greeting check:', {
      hasGreetedThisSession,
      hasInitialGreeted,
      isOpen: state.isOpen,
      currentRole: state.currentRole,
      pathname: location.pathname
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
  }, [hasInitialGreeted, state.isOpen, openPanel, location.pathname]);

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

  // Enhanced greeting message with form context or initial welcome
  const getContextualGreeting = () => {
    // For form-specific pages, use form context
    if (currentForm?.autoGreetingMessage) {
      return currentForm.autoGreetingMessage;
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
        {/* VERTICAL magic greeting bubble - AUTO-LOADING without user interaction */}
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
                    <p className="font-semibold text-primary text-base leading-tight">
                      TAV Assistant
                    </p>
                    {currentForm && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full inline-block mt-1">
                        Helping with {currentForm.formTitle}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className={`text-muted-foreground leading-relaxed ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  {getContextualGreeting()}
                </p>
                
                {/* Form-specific context (for form navigation) */}
                {currentForm && (
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <p className={`text-primary font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      ✨ I can help you fill this out conversationally!
                    </p>
                  </div>
                )}

                <p className="text-xs text-primary/70 text-center animate-pulse">
                  Opening assistant panel...
                </p>
              </div>
              
              {/* Enhanced speech bubble tail - positioned for vertical layout */}
              <div className="absolute bottom-[-8px] left-6 w-4 h-4 bg-white border-r-2 border-b-2 border-primary/40 transform rotate-45"></div>
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
          
          {/* Vertical panel optimized for vertical layout */}
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
                ? 'bottom-4 left-4 right-4 rounded-2xl max-h-[65vh] border'
                : 'bottom-6 left-6 rounded-2xl border max-h-[65vh] w-[min(26rem,38vw)]'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b bg-gradient-to-r from-primary/5 to-transparent ${
              isMobile ? 'p-3' : 'p-4'
            }`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-md flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-base leading-tight">TAV Assistant</h2>
                  <p className="text-sm text-muted-foreground leading-tight truncate">
                    {currentForm ? `Helping with ${currentForm.formTitle}` : 'Your care coordinator'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={closePanel}
                className="h-8 w-8 hover:bg-primary/10 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content with optimized scrolling for vertical layout */}
            <div className={`overflow-y-auto ${
              isMobile 
                ? 'p-3 max-h-[calc(65vh-80px)]' 
                : 'p-4 max-h-[calc(65vh-90px)]'
            }`}>
              {/* Form context banner */}
              {currentForm && (
                <div className="mb-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    <h3 className="text-sm font-medium text-primary">
                      {currentForm.formTitle} Assistance
                    </h3>
                  </div>
                  <p className="text-sm text-primary/80 leading-relaxed">
                    {currentForm.autoGreetingMessage || "I can help you fill this out conversationally or guide you step by step. What would be most helpful?"}
                  </p>
                </div>
              )}

              {/* Nudges */}
              {nudges.length > 0 && (
                <div className="mb-4 space-y-3">
                  <h3 className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 flex-shrink-0" />
                    Messages for you:
                  </h3>
                  {nudges.map((nudge) => (
                    <motion.div
                      key={nudge.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-200 rounded-lg p-3 cursor-pointer hover:from-amber-100 hover:to-amber-100/50 transition-all duration-200"
                      onClick={() => handleNudgeClick(nudge)}
                    >
                      <p className="text-sm text-amber-800 leading-relaxed">{nudge.message}</p>
                      <p className="text-xs text-amber-600 mt-2 leading-tight">
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

            {/* Mobile handle */}
            {isMobile && (
              <div className="flex justify-center py-2 bg-gray-50/50">
                <div className="w-8 h-1 bg-gray-300 rounded-full" />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
