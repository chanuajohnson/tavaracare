
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChatbotWidget } from './ChatbotWidget';
import { useChat } from './ChatProvider';

export const FullScreenChatDialog: React.FC = () => {
  const { isFullScreen, closeChat } = useChat();

  return (
    <Dialog open={isFullScreen} onOpenChange={(open) => {
      if (!open) closeChat();
    }}>
      <DialogContent className="sm:max-w-[800px] p-0 h-[90vh] max-h-[90vh] flex flex-col">
        <ChatbotWidget 
          width="100%" 
          className="h-full border-none shadow-none rounded-none" 
          onClose={closeChat} 
          fullScreen={true}
        />
      </DialogContent>
    </Dialog>
  );
};
