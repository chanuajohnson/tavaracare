
import { ChatFlowState, ChatFlowAction } from './chatFlowTypes';

// Reducer function to handle state updates
export function chatFlowReducer(state: ChatFlowState, action: ChatFlowAction): ChatFlowState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          conversationData: [...state.conversation.conversationData, action.payload],
        },
      };
    case 'SET_CONVERSATION':
      const conversation = action.payload;
      if (!conversation.conversationData) {
        conversation.conversationData = [];
      }
      
      return {
        ...state,
        conversation,
        sessionId: conversation.sessionId,
      };
    case 'UPDATE_CONTACT_INFO':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          contactInfo: {
            ...state.conversation.contactInfo || {},
            ...action.payload,
          },
        },
      };
    case 'UPDATE_CARE_NEEDS':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          careNeeds: {
            ...state.conversation.careNeeds || {},
            ...action.payload,
          },
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_MINIMIZED':
      return {
        ...state,
        isMinimized: action.payload,
      };
    case 'SET_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      };
    case 'RESET':
      return {
        ...state,
        isMinimized: false,
        isOpen: false,
      };
    default:
      return state;
  }
}
