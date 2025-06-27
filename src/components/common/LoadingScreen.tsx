
import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Star, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
}

const MAGICAL_MESSAGES = [
  "Finding your perfect care match ✨",
  "Connecting families with trusted caregivers 🤝",
  "Building your care community 💙",
  "Creating meaningful care connections 🌟",
  "Bringing care and compassion together 💫",
  "Matching hearts with helping hands 💝",
  "Weaving your care network together 🕸️",
  "Discovering your ideal caregiver 🔍"
];

const LoadingScreen = ({ message }: LoadingScreenProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showSparkles, setShowSparkles] = useState(true);

  // Rotate through magical messages every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % MAGICAL_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Sparkle animation controller
  useEffect(() => {
    const sparkleInterval = setInterval(() => {
      setShowSparkles(prev => !prev);
    }, 1500);

    return () => clearInterval(sparkleInterval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-blue-50 z-50">
      <div className="text-center relative max-w-md mx-auto px-6">
        {/* Magical Sparkle Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: showSparkles ? 1.1 : 0.9 
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="relative w-full h-full"
          >
            <Sparkles className="absolute top-4 right-8 h-4 w-4 text-primary/60 animate-pulse" />
            <Star className="absolute top-12 left-4 h-3 w-3 text-blue-400/70 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute bottom-12 right-12 h-3 w-3 text-primary/50 animate-pulse" style={{ animationDelay: '1s' }} />
            <Star className="absolute bottom-8 left-8 h-2 w-2 text-pink-400/60 animate-pulse" style={{ animationDelay: '1.5s' }} />
            <Heart className="absolute top-8 left-12 h-3 w-3 text-red-400/50 animate-pulse" style={{ animationDelay: '2s' }} />
          </motion.div>
          
          {/* Counter-rotating sparkles */}
          <motion.div
            animate={{ 
              rotate: -360,
              scale: showSparkles ? 0.9 : 1.1 
            }}
            transition={{ 
              rotate: { duration: 6, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="absolute inset-0 w-full h-full"
          >
            <Sparkles className="absolute top-16 right-4 h-2 w-2 text-primary/40 animate-pulse" />
            <Star className="absolute bottom-16 left-12 h-3 w-3 text-amber-400/60 animate-pulse" style={{ animationDelay: '0.8s' }} />
            <Sparkles className="absolute top-20 left-16 h-2 w-2 text-blue-300/50 animate-pulse" style={{ animationDelay: '1.3s' }} />
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Enhanced Loading Spinner with Pulsing Ring */}
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative bg-gradient-to-r from-primary to-primary/80 rounded-full p-4 shadow-lg"
            >
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </motion.div>
          </div>

          {/* Magical Message Display */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
                <h3 className="text-lg font-bold text-primary">TAVARA Magic at Work</h3>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <Star className="h-4 w-4 text-amber-500" />
                </motion.div>
              </div>
              
              {/* Rotating Messages */}
              <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentMessageIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-base font-semibold text-gray-700 text-center"
                  >
                    {MAGICAL_MESSAGES[currentMessageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              ))}
            </div>

            {/* Custom Message Override */}
            {message && message !== 'Loading...' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 rounded-xl p-4 border border-primary/10 mt-4"
              >
                <p className="text-sm font-medium text-primary">{message}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
