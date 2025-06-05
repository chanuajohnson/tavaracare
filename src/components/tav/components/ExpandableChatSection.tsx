
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationalFormChat } from './ConversationalFormChat';

interface ExpandableChatSectionProps {
  role: 'family' | 'professional' | 'community' | null;
}

export const ExpandableChatSection: React.FC<ExpandableChatSectionProps> = ({ role }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t border-gray-200 mt-4">
      {/* Expandable Header */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between h-auto py-3 px-4 hover:bg-primary/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Chat with TAV</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      {/* Expandable Chat Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Welcome Message */}
              <div className="bg-primary/5 rounded-lg p-3">
                <p className="text-sm text-primary font-medium mb-1">💙 Hi there!</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  I can help you navigate forms, fill them out conversationally, or guide you through your {role} journey.
                </p>
              </div>

              {/* Conversational Form Chat Component */}
              <ConversationalFormChat role={role} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
