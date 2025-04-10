
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from './ChatbotWidget';
import { useChat } from './ChatProvider';

interface FullScreenChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FullScreenChatDialog: React.FC<FullScreenChatDialogProps> = ({
  open,
  onClose
}) => {
  // Added console log for debugging
  console.log('FullScreenChatDialog rendering', { open });
  
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      console.log('Dialog onOpenChange', { isOpen });
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-full w-full h-full max-h-full sm:max-w-full sm:rounded-none p-0 gap-0">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Tavara Chat</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ChatbotWidget 
              className="h-full border-0 shadow-none rounded-none" 
              width="100%" 
              hideHeader
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
