
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTavaraState } from './hooks/useTavaraState';
import { RoleBasedContent } from './RoleBasedContent';
import { assistantSupabase } from './assistantSupabase';
import { ManualNudgeService } from './ManualNudgeService';
import { useAuth } from '@/components/providers/AuthProvider';
import { AssistantNudge } from './types';

const AUTO_GREET_MESSAGES = {
  guest: "👋 Welcome to Tavara! I'm TAV, your personal care coordinator. Let me help you find the perfect care solution.",
  family: "💙 Hello! I'm here to guide you through your caregiving journey. How can I help you today?",
  professional: "🤝 Hi there! Ready to connect with families who need your expertise? Let's get started!",
  community: "🌟 Welcome back! Thank you for being part of our caring community.",
  admin: "⚡ Admin panel ready. How can I assist with platform management today?"
};

export const TavaraAssistantPanel: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { state, openPanel, closePanel, minimizePanel, markNudgesAsRead } = useTavaraState();
  const [nudges, setNudges] = useState<AssistantNudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoGreeted, setHasAutoGreeted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

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

  // Enhanced auto-greeting logic - appears more frequently and reliably
  useEffect(() => {
    const sessionKey = `tavara_session_greeted_${state.currentRole}`;
    const hasGreetedThisSession = sessionStorage.getItem(sessionKey);
    
    // Show greeting if haven't greeted this session AND role is available
    if (!hasGreetedThisSession && state.currentRole && !hasAutoGreeted && !state.isOpen) {
      console.log('TAV: Triggering auto-greeting for role:', state.currentRole);
      
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
  }, [state.currentRole, hasAutoGreeted, state.isOpen, openPanel]);

  // Additional proactive greeting triggers
  useEffect(() => {
    if (state.currentRole && !hasAutoGreeted && !state.isOpen) {
      // Show greeting after user has been on page for a few seconds
      const idleTimer = setTimeout(() => {
        if (!hasAutoGreeted && !state.isOpen) {
          console.log('TAV: Triggering idle greeting');
          setShowGreeting(true);
          setHasAutoGreeted(true);
          
          setTimeout(() => {
            openPanel();
          }, 1500);
        }
      }, 3000);

      return () => clearTimeout(idleTimer);
    }
  }, [state.currentRole, hasAutoGreeted, state.isOpen, openPanel]);

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

  // Progress context - this would read from existing progress systems
  const progressContext = {
    completionPercentage: 65,
    currentStep: 'Upload Documents',
    nextAction: 'Upload your caregiver certificates to complete your profile'
  };

  // Floating button with enhanced magic effects
  if (!state.isOpen && !state.isMinimized) {
    return (
      <div className={`fixed z-50 ${isMobile 
        ? 'bottom-20 left-4' 
        : 'bottom-6 left-6'
      }`}>
        {/* Enhanced greeting bubble with compact mobile design */}
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
                  ? 'max-w-[240px] text-xs p-2' 
                  : 'max-w-64 p-3'
              }`}
              onAnimationComplete={() => {
                // Keep greeting visible longer for better visibility
                setTimeout(() => setShowGreeting(false), 4500);
              }}
            >
              {/* Enhanced sparkle effects */}
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              </div>
              <div className="absolute top-1 right-5">
                <Sparkles className="h-2 w-2 text-primary/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">💙</span>
                <p className="font-semibold text-primary text-xs leading-tight">
                  Welcome to
                </p>
                <img 
                  src="/TAVARACARElogo.JPG"
                  alt="Tavara" 
                  className="h-3 w-auto"
                />
              </div>
              <p className={`text-muted-foreground leading-relaxed ${isMobile ? 'text-xs' : 'text-xs'}`}>
                I'm TAV, your personal care coordinator. Let me help you find the perfect care solution.
              </p>
              
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
            
            {/* Compact notification badge */}
            {nudges.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg border-2 border-white"
              >
                <span className="text-xs text-white font-bold">
                  {nudges.length}
                </span>
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
            {/* Compact header */}
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
                    Your care coordinator
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

              {/* Role-based content with compact mobile support */}
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
