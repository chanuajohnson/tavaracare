
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTavaraState } from './hooks/useTavaraState';
import { RoleBasedContent } from './RoleBasedContent';
import { assistantSupabase } from './assistantSupabase';
import { ManualNudgeService } from './ManualNudgeService';
import { useAuth } from '@/components/providers/AuthProvider';
import { AssistantNudge } from './types';

export const TavaraAssistantPanel: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { state, openPanel, closePanel, minimizePanel, markNudgesAsRead } = useTavaraState();
  const [nudges, setNudges] = useState<AssistantNudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize nudge service and fetch nudges
  useEffect(() => {
    if (user) {
      const nudgeService = ManualNudgeService.getInstance();
      nudgeService.updateUserActivity(user.id);
      
      // Fetch user nudges
      fetchNudges();
    }
  }, [user]);

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

  // Auto-open on first visit or when nudges are available
  useEffect(() => {
    const hasVisited = localStorage.getItem('tavara_visited');
    if (!hasVisited && state.currentRole === 'guest') {
      localStorage.setItem('tavara_visited', 'true');
      setTimeout(() => openPanel(), 2000); // Open after 2 seconds for guests
    } else if (nudges.length > 0 && !state.isOpen) {
      openPanel(); // Auto-open for nudges
    }
  }, [nudges.length, state.currentRole, state.isOpen]);

  // Mock progress context - this would read from existing progress systems
  const progressContext = {
    completionPercentage: 65,
    currentStep: 'Upload Documents',
    nextAction: 'Upload your caregiver certificates to complete your profile'
  };

  if (!state.isOpen && !state.isMinimized) {
    // Minimized state - small indicator
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed z-50 ${isMobile 
          ? 'bottom-20 right-4' 
          : 'bottom-6 left-6'
        }`}
      >
        <Button
          onClick={openPanel}
          size="icon"
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        {nudges.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center"
          >
            <span className="text-xs text-white font-semibold">
              {nudges.length}
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={closePanel}
            />
          )}
          
          {/* Main Panel */}
          <motion.div
            initial={isMobile 
              ? { y: '100%', opacity: 0 } 
              : { x: '-100%', opacity: 0 }
            }
            animate={isMobile 
              ? { y: 0, opacity: 1 } 
              : { x: 0, opacity: 1 }
            }
            exit={isMobile 
              ? { y: '100%', opacity: 0 } 
              : { x: '-100%', opacity: 0 }
            }
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-50 bg-white border shadow-xl ${
              isMobile
                ? 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[80vh]'
                : 'top-0 left-0 bottom-0 w-80 border-r'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isMobile ? 'pb-2' : ''
            }`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">TAV Assistant</h2>
                  <p className="text-xs text-muted-foreground">
                    Your care coordinator
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={minimizePanel}
                    className="h-8 w-8"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closePanel}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className={`p-4 overflow-y-auto ${
              isMobile ? 'max-h-[calc(80vh-80px)]' : 'flex-1'
            }`}>
              {/* Nudges */}
              {nudges.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Messages for you:
                  </h3>
                  {nudges.map((nudge) => (
                    <motion.div
                      key={nudge.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-3 cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => handleNudgeClick(nudge)}
                    >
                      <p className="text-sm text-amber-800">{nudge.message}</p>
                      <p className="text-xs text-amber-600 mt-1">
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
              <div className="flex justify-center py-2">
                <div className="w-8 h-1 bg-gray-300 rounded-full" />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
