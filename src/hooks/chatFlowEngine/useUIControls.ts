
import { useCallback } from 'react';
import { ChatStepType } from './chatFlowTypes';

interface UseUIControlsProps {
  state: {
    conversation: {
      id?: string;
      careNeeds?: {
        role?: string;
      };
    };
    isOpen: boolean;
    isMinimized: boolean;
  };
  dispatch: React.Dispatch<any>;
  updateConversionStatus: (converted: boolean) => Promise<boolean>;
}

export function useUIControls({ state, dispatch, updateConversionStatus }: UseUIControlsProps) {
  // Set the current step in the chat flow
  const setStep = useCallback((step: ChatStepType) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, [dispatch]);

  // Toggle the open state of the chat window
  const toggleOpen = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: !state.isOpen });
    
    if (!state.isOpen) {
      dispatch({ type: 'SET_MINIMIZED', payload: false });
    }
  }, [state.isOpen, dispatch]);

  // Toggle the minimized state of the chat window
  const toggleMinimized = useCallback(() => {
    dispatch({ type: 'SET_MINIMIZED', payload: !state.isMinimized });
  }, [state.isMinimized, dispatch]);

  // Navigate to registration page based on user role
  const navigateToRegistration = useCallback(() => {
    if (!state.conversation.id || !state.conversation.careNeeds?.role) {
      console.error('Cannot navigate: missing conversation ID or role');
      return;
    }
    
    const role = state.conversation.careNeeds.role;
    window.location.href = `/registration/${role}?prefill=${state.conversation.id}`;
    
    updateConversionStatus(true);
  }, [state.conversation.id, state.conversation.careNeeds?.role, updateConversionStatus]);

  return {
    setStep,
    toggleOpen,
    toggleMinimized,
    navigateToRegistration,
  };
}
