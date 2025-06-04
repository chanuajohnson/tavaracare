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

  // Initialize nudge service and fetch nudges
  useEffect(() => {
    if (user) {
      const nudgeService = ManualNudgeService.getInstance();
      nudgeService.updateUserActivity(user.id);
      fetchNudges();
    }
  }, [user]);

  // Auto-greeting logic
  useEffect(() => {
    const hasVisitedKey = `tavara_visited_${state.currentRole}`;
    const hasVisited = localStorage.getItem(hasVisitedKey);
    
    if (!hasVisited && state.currentRole && !hasAutoGreeted) {
      // Show magic entrance after a brief delay
      setTimeout(() => {
        setShowGreeting(true);
        setHasAutoGreeted(true);
        localStorage.setItem(hasVisitedKey, 'true');
        
        // Auto open panel after greeting animation
        setTimeout(() => {
          openPanel();
        }, 1500);
      }, 2000);
    }
  }, [state.currentRole, hasAutoGreeted, openPanel]);

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

  // Floating button with magic effects
  if (!state.isOpen && !state.isMinimized) {
    return (
      <div className={`fixed z-50 ${isMobile 
        ? 'bottom-20 left-4' 
        : 'bottom-6 left-6'
      }`}>
        {/* Greeting bubble */}
        <AnimatePresence>
          {showGreeting && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`absolute bottom-16 left-0 bg-white rounded-lg shadow-lg p-3 border border-primary/20 ${
                isMobile ? 'max-w-72 text-sm' : 'max-w-64'
              }`}
              onAnimationComplete={() => {
                setTimeout(() => setShowGreeting(false), 3000);
              }}
            >
              <p className="font-medium text-primary mb-1 leading-tight">
                {AUTO_GREET_MESSAGES[state.currentRole || 'guest'].split('.')[0]}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {AUTO_GREET_MESSAGES[state.currentRole || 'guest'].split('.').slice(1).join('.')}
              </p>
              {/* Speech bubble tail */}
              <div className="absolute bottom-[-6px] left-6 w-3 h-3 bg-white border-r border-b border-primary/20 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main TAV button */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={openPanel}
            size="icon"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg relative overflow-hidden group"
          >
            {/* Magic sparkle effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="h-4 w-4 absolute top-1 right-1 text-white/60 animate-pulse" />
              <Sparkles className="h-3 w-3 absolute bottom-2 left-2 text-white/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            
            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            
            {/* Notification badge */}
            {nudges.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg"
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
          
          {/* Panel */}
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
                ? 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh] border-t'
                : 'bottom-6 left-6 rounded-2xl border max-h-[calc(100vh-3rem)] w-[min(24rem,calc(100vw-3rem))]'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b bg-gradient-to-r from-primary/5 to-transparent ${
              isMobile ? 'p-4 pb-3' : 'p-4'
            }`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-md flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-base leading-tight">TAV Assistant</h2>
                  <p className="text-xs text-muted-foreground leading-tight truncate">
                    Your personal care coordinator
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

            {/* Content */}
            <div className={`overflow-y-auto ${
              isMobile 
                ? 'p-4 max-h-[calc(85vh-140px)]' 
                : 'p-4 max-h-[calc(100vh-13rem)]'
            }`}>
              {/* Auto-greeting message */}
              {hasAutoGreeted && state.currentRole && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border border-primary/20"
                >
                  <p className="text-sm font-medium text-primary mb-1 leading-tight">
                    Welcome! 👋
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {AUTO_GREET_MESSAGES[state.currentRole]}
                  </p>
                </motion.div>
              )}

              {/* Nudges */}
              {nudges.length > 0 && (
                <div className="mb-6 space-y-3">
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
                      <p className="text-xs text-amber-600 mt-1 leading-tight">
                        From {nudge.sender} • Click to dismiss
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Role-based content */}
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
