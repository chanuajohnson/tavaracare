import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const LOADING_MESSAGES = [
  { text: "Finding your perfect match! ✨", subtext: "Analyzing your care needs and preferences..." },
  { text: "Reviewing caregiver profiles 🔍", subtext: "Checking availability and experience..." },
  { text: "Almost there! 🎯", subtext: "Ensuring the perfect fit for your family..." }
];

interface MatchLoadingStateProps {
  title?: string;
  duration?: number;
  onComplete?: () => void;
}

export const MatchLoadingState = ({ 
  title = "Finding Your Perfect Match",
  duration = 2000,
  onComplete
}: MatchLoadingStateProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, duration / LOADING_MESSAGES.length);

    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (isComplete) return null;

  const currentMessage = LOADING_MESSAGES[currentMessageIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6 py-12"
    >
      <h1 className="text-3xl font-bold">{title}</h1>
      
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary"></div>
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
          <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-purple-500 animate-pulse delay-150" />
          <Sparkles className="absolute top-1/2 -left-4 h-4 w-4 text-pink-500 animate-pulse delay-300" />
          <Sparkles className="absolute top-1/4 -right-3 h-3 w-3 text-green-500 animate-pulse delay-450" />
          <Sparkles className="absolute bottom-1/4 -left-3 h-3 w-3 text-yellow-500 animate-pulse delay-600" />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-2"
          >
            <p className="text-2xl font-semibold text-primary">
              {currentMessage.text}
            </p>
            <p className="text-lg text-muted-foreground">
              {currentMessage.subtext}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};