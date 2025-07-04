
import { useState, useEffect } from 'react';
import { useChatPersistence } from './useChatPersistence';

interface ChatButtonState {
  buttonText: string;
  isDisabled: boolean;
  variant: 'default' | 'secondary' | 'outline';
  showSpinner: boolean;
  showSplitButton: boolean;
  splitButtons?: {
    continue: { text: string; variant: 'default' | 'secondary' | 'outline' };
    cancel: { text: string; variant: 'default' | 'secondary' | 'outline' };
  };
}

export const useChatButtonState = (caregiverId: string) => {
  const { chatState, isLoading: persistenceLoading, cancelChatRequest } = useChatPersistence(caregiverId);
  const [buttonState, setButtonState] = useState<ChatButtonState>({
    buttonText: 'Start Guided Chat',
    isDisabled: false,
    variant: 'default',
    showSpinner: false,
    showSplitButton: false
  });

  useEffect(() => {
    console.log(`[useChatButtonState] Button state update for caregiver: ${caregiverId}`);
    console.log(`[useChatButtonState] Chat state:`, chatState);
    console.log(`[useChatButtonState] Persistence loading:`, persistenceLoading);

    if (persistenceLoading) {
      setButtonState({
        buttonText: 'Loading...',
        isDisabled: true,
        variant: 'outline',
        showSpinner: true,
        showSplitButton: false
      });
      return;
    }

    if (!chatState || !chatState.hasStartedChat) {
      // No chat started yet
      setButtonState({
        buttonText: 'Start Guided Chat',
        isDisabled: false,
        variant: 'default',
        showSpinner: false,
        showSplitButton: false
      });
      return;
    }

    // Chat exists, show split button based on stage
    switch (chatState.currentStage) {
      case 'introduction':
      case 'interest_expression':
      case 'guided_qa':
        setButtonState({
          buttonText: 'Continue Chat',
          isDisabled: false,
          variant: 'default',
          showSpinner: false,
          showSplitButton: true,
          splitButtons: {
            continue: { text: 'Continue Chat', variant: 'default' },
            cancel: { text: 'Cancel Request', variant: 'outline' }
          }
        });
        break;
      
      case 'waiting_acceptance':
        setButtonState({
          buttonText: 'Request Sent',
          isDisabled: false,
          variant: 'secondary',
          showSpinner: false,
          showSplitButton: true,
          splitButtons: {
            continue: { text: 'Request Sent', variant: 'secondary' },
            cancel: { text: 'Cancel Request', variant: 'outline' }
          }
        });
        break;
      
      default:
        setButtonState({
          buttonText: 'Start Guided Chat',
          isDisabled: false,
          variant: 'default',
          showSpinner: false,
          showSplitButton: false
        });
    }

    console.log(`[useChatButtonState] Final button state:`, buttonState);
  }, [chatState, persistenceLoading, caregiverId]);

  return {
    buttonState,
    hasActiveChat: !!chatState?.hasStartedChat,
    chatStage: chatState?.currentStage,
    cancelChatRequest
  };
};
