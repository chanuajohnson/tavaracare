
import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ChatbotWidget } from './ChatbotWidget';
import { cn } from '@/lib/utils';

interface FullScreenChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FullScreenChatDialog: React.FC<FullScreenChatDialogProps> = ({ 
  open, 
  onClose 
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (open) {
      setIsTransitioning(true);
    }
  }, [open]);

  // Handle animation completion
  const handleAnimationEnd = () => {
    if (!open) {
      setIsTransitioning(false);
    }
  };

  return (
    <Dialog open={open || isTransitioning} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <div 
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-all duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onAnimationEnd={handleAnimationEnd}
      >
        <div 
          className={cn(
            "flex h-full w-full max-w-md flex-col rounded-lg bg-background shadow-lg transition-all duration-300",
            open ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
        >
          <ChatbotWidget
            width="100%"
            onClose={onClose}
            hideHeader={false}
            className="h-full rounded-lg"
          />
        </div>
      </div>
    </Dialog>
  );
};
