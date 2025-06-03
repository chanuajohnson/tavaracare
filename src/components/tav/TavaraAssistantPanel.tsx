
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  MessageCircle, 
  X, 
  ChevronRight,
  Heart,
  CheckCircle,
  Clock
} from 'lucide-react';

export function TavaraAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const { user } = useAuth();

  const togglePanel = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const minimizePanel = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const getWelcomeMessage = () => {
    if (!user) {
      return {
        title: "Welcome to Tavara 💙",
        message: "I'm here to help you navigate your caregiving journey. Ready to get started?",
        action: "Sign Up Today"
      };
    }

    return {
      title: "Hello there! 🤝",
      message: "I understand how challenging caregiving can be. Let me help you with your next steps.",
      action: "Continue Journey"
    };
  };

  const currentMessage = getWelcomeMessage();

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
      >
        <Button
          onClick={togglePanel}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-200"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        {/* Notification dot for new users */}
        {!user && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse" />
        )}
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 md:w-96"
        >
          <Card className="h-full rounded-none border-l border-t-0 border-r-0 border-b-0">
            <CardHeader className="bg-primary text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg">Tavara Assistant</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={minimizePanel}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="h-2 w-2 bg-green-400 rounded-full" />
                <span className="text-sm opacity-90">Online</span>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Welcome Message */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{currentMessage.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {currentMessage.message}
                </p>
              </div>

              {/* Progress Section for Authenticated Users */}
              {user && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Your Progress</span>
                    <Badge variant="secondary">Getting Started</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Account created</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Complete your profile</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-medium">How can I help you today?</h4>
                
                <div className="space-y-2">
                  {!user ? (
                    <>
                      <Button variant="outline" className="w-full justify-between">
                        Learn about our services
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button className="w-full justify-between">
                        Get started today
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full justify-between">
                        Continue profile setup
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="w-full justify-between">
                        Browse caregivers
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="w-full justify-between">
                        Contact support
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="text-xs text-muted-foreground border-t pt-4">
                💙 We're here to support you through your caregiving journey. 
                Taking care of yourself is just as important as caring for others.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
