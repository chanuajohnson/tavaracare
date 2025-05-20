
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from './ChatbotWidget';
import { useChat } from './ChatProvider';
import { ChatSettings } from './ChatSettings';

interface FullScreenChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FullScreenChatDialog: React.FC<FullScreenChatDialogProps> = ({
  open,
  onClose
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-full w-full h-[100dvh] max-h-[100dvh] sm:max-w-full sm:rounded-none p-0 gap-0 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="text-xl font-semibold">Tavara Chat</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} title="Chat Settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatbotWidget 
            className="h-full border-0 shadow-none rounded-none flex-1" 
            width="100%" 
            hideHeader
          />
        </div>
        
        <ChatSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
