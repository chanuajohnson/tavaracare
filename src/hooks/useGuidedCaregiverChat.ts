
import { useState, useEffect, useCallback } from 'react';
import { GuidedCaregiverChatService, ChatConversationFlow, ChatPromptTemplate } from '@/components/tav/services/guidedCaregiverChatService';
import { useChatPersistence } from './useChatPersistence';

interface UseGuidedCaregiverChatProps {
  caregiverId: string;
  caregiver: any;
}

export const useGuidedCaregiverChat = ({ caregiverId, caregiver }: UseGuidedCaregiverChatProps) => {
  const [chatService] = useState(() => new GuidedCaregiverChatService());
  const [conversationFlow, setConversationFlow] = useState<ChatConversationFlow | null>(null);
  const [promptTemplates, setPromptTemplates] = useState<ChatPromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ content: string; isUser: boolean; timestamp: number }>>([]);
  const [currentStage, setCurrentStage] = useState<string>('introduction');
  const [error, setError] = useState<string | null>(null);

  // Use persistence hook with enhanced integration
  const { chatState, saveChatState, isLoading: persistenceLoading, loadChatState } = useChatPersistence(caregiverId);

  // Initialize conversation with persistence integration
  const initializeConversation = useCallback(async () => {
    console.log(`[useGuidedCaregiverChat] *** ENHANCED INITIALIZATION ***`);
    console.log(`[useGuidedCaregiverChat] Caregiver ID: ${caregiverId}`);
    console.log(`[useGuidedCaregiverChat] Chat state:`, chatState);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate that caregiver ID is a real UUID from database
      if (!caregiverId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(caregiverId)) {
        console.error('[useGuidedCaregiverChat] Invalid caregiver ID:', caregiverId);
        setError('Invalid caregiver ID format');
        setMessages([{
          content: '💙 Sorry, there was an issue connecting to this caregiver. Please try selecting a different match.',
          isUser: false,
          timestamp: Date.now()
        }]);
        setIsLoading(false);
        return;
      }

      // Use existing session ID from persistence or generate new one
      const sessionId = chatState?.sessionId || crypto.randomUUID();
      console.log(`[useGuidedCaregiverChat] Using session ID: ${sessionId}`);
      
      // Initialize or get existing conversation flow
      let flow = await chatService.getConversationFlow(sessionId);
      
      if (!flow) {
        console.log('[useGuidedCaregiverChat] No existing flow, creating new one');
        flow = await chatService.initializeConversationFlow(sessionId);
      } else {
        console.log('[useGuidedCaregiverChat] Found existing conversation flow:', flow);
      }
      
      if (flow) {
        setConversationFlow(flow);
        
        // Restore stage from persistence or use flow stage
        const stageToUse = chatState?.currentStage || flow.current_stage;
        setCurrentStage(stageToUse);
        
        // Save to persistence if not already saved or if stage changed
        if (!chatState?.sessionId || chatState.currentStage !== stageToUse) {
          saveChatState({
            sessionId,
            caregiverId,
            currentStage: stageToUse,
            hasStartedChat: chatState?.hasStartedChat || false,
            chatRequestId: chatState?.chatRequestId
          });
        }
        
        // Load appropriate prompt templates for current stage
        console.log(`[useGuidedCaregiverChat] Loading prompt templates for stage: ${stageToUse}`);
        const templates = await chatService.getPromptTemplates(stageToUse);
        console.log(`[useGuidedCaregiverChat] Loaded ${templates.length} templates:`, templates);
        setPromptTemplates(templates);
        
        // Set appropriate welcome message based on stage and chat state
        if (stageToUse === 'waiting_acceptance') {
          setMessages([{
            content: `💙 Your chat request has been sent! The professional caregiver will be notified and typically responds within a few hours.`,
            isUser: false,
            timestamp: Date.now()
          }]);
        } else if (stageToUse === 'guided_qa') {
          setMessages([{
            content: `🎉 Great news! The professional caregiver has accepted your request and is ready to chat. What would you like to ask them?`,
            isUser: false,
            timestamp: Date.now()
          }]);
        } else if (chatState?.hasStartedChat) {
          setMessages([{
            content: `💙 Welcome back! Let's continue your conversation with this professional caregiver. What would you like to say next?`,
            isUser: false,
            timestamp: Date.now()
          }]);
        } else {
          setMessages([{
            content: `💙 Hi! I'm TAV, your care coordinator. I'll help you connect with this professional caregiver in a safe and structured way. Choose how you'd like to start the conversation:`,
            isUser: false,
            timestamp: Date.now()
          }]);
        }
        
        console.log('[useGuidedCaregiverChat] ✅ Initialization completed successfully');
      } else {
        console.error('[useGuidedCaregiverChat] Failed to initialize conversation flow');
        setError('Failed to initialize conversation');
        setMessages([{
          content: '💙 Sorry, there was an issue setting up your conversation. Please try again.',
          isUser: false,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('[useGuidedCaregiverChat] Error initializing conversation:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setMessages([{
        content: '💙 Sorry, there was an issue connecting. Please try again.',
        isUser: false,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [caregiverId, chatService, chatState, saveChatState]);

  // Handle prompt selection with enhanced persistence
  const handlePromptSelection = useCallback(async (promptText: string) => {
    if (!conversationFlow) {
      console.error('[useGuidedCaregiverChat] No conversation flow available for prompt selection');
      setError('No conversation flow available');
      return;
    }

    console.log(`[useGuidedCaregiverChat] *** ENHANCED PROMPT SELECTION ***`);
    console.log(`[useGuidedCaregiverChat] Stage: ${currentStage}, Prompt: "${promptText}"`);

    setIsLoading(true);
    setError(null);
    
    try {
      // Add user message immediately
      setMessages(prev => [...prev, {
        content: promptText,
        isUser: true,
        timestamp: Date.now()
      }]);

      // Handle the selection with enhanced error reporting
      const result = await chatService.handlePromptSelection(
        conversationFlow.session_id,
        promptText,
        caregiver,
        currentStage
      );

      console.log('[useGuidedCaregiverChat] Prompt selection result:', result);

      if (result.success && result.response) {
        // Add TAV response
        setMessages(prev => [...prev, {
          content: result.response!,
          isUser: false,
          timestamp: Date.now()
        }]);

        // Update stage if changed and save to persistence
        if (result.nextStage && result.nextStage !== currentStage) {
          console.log(`[useGuidedCaregiverChat] Stage transition: ${currentStage} -> ${result.nextStage}`);
          setCurrentStage(result.nextStage);
          
          // Update persistence with enhanced data
          saveChatState({
            currentStage: result.nextStage,
            hasStartedChat: true,
            chatRequestId: result.chatRequestId || chatState?.chatRequestId
          });
          
          // Load new prompt templates for the next stage
          if (result.nextStage !== 'waiting_acceptance') {
            console.log(`[useGuidedCaregiverChat] Loading templates for new stage: ${result.nextStage}`);
            const templates = await chatService.getPromptTemplates(result.nextStage);
            console.log(`[useGuidedCaregiverChat] Loaded ${templates.length} templates for ${result.nextStage}`);
            setPromptTemplates(templates);
          } else {
            // Clear templates during waiting stage
            console.log('[useGuidedCaregiverChat] Clearing templates for waiting stage');
            setPromptTemplates([]);
          }
        } else {
          // Mark as started even if stage didn't change
          if (!chatState?.hasStartedChat) {
            saveChatState({
              hasStartedChat: true
            });
          }
        }
      } else if (result.error) {
        console.error('[useGuidedCaregiverChat] Prompt selection error:', result.error);
        setError(result.error);
        setMessages(prev => [...prev, {
          content: `💙 ${result.error}`,
          isUser: false,
          timestamp: Date.now()
        }]);
      } else {
        console.error('[useGuidedCaregiverChat] Unexpected result format:', result);
        setError('Unexpected response format');
        setMessages(prev => [...prev, {
          content: '💙 Something unexpected happened. Please try again.',
          isUser: false,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('[useGuidedCaregiverChat] Error handling prompt selection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setMessages(prev => [...prev, {
        content: `💙 ${errorMessage}`,
        isUser: false,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationFlow, currentStage, caregiver, chatService, saveChatState, chatState]);

  // Enhanced caregiver response checking with persistence integration
  const checkCaregiverResponse = useCallback(async () => {
    if (currentStage !== 'waiting_acceptance') return;

    console.log('[useGuidedCaregiverChat] Checking caregiver response...');
    try {
      const chatRequest = await chatService.getChatRequestStatus(caregiverId);
      console.log('[useGuidedCaregiverChat] Chat request status:', chatRequest);
      
      if (chatRequest && chatRequest.status === 'accepted') {
        console.log('[useGuidedCaregiverChat] Caregiver accepted the request!');
        
        if (conversationFlow) {
          await chatService.updateConversationStage(conversationFlow.session_id, 'guided_qa');
          setCurrentStage('guided_qa');
          
          // Update persistence
          saveChatState({
            currentStage: 'guided_qa'
          });
          
          // Load guided Q&A templates
          const templates = await chatService.getPromptTemplates('guided_qa');
          setPromptTemplates(templates);
          
          // Add acceptance message - anonymized  
          setMessages(prev => [...prev, {
            content: `🎉 Great news! The professional caregiver has accepted your request and is ready to chat. What would you like to ask them?`,
            isUser: false,
            timestamp: Date.now()
          }]);
        }
      } else if (chatRequest && chatRequest.status === 'declined') {
        console.log('[useGuidedCaregiverChat] Caregiver declined the request');
        
        // Caregiver declined - anonymized
        setMessages(prev => [...prev, {
          content: `💙 This caregiver is not available right now, but don't worry - we have many other amazing caregivers who would love to help your family. Would you like me to show you more matches?`,
          isUser: false,
          timestamp: Date.now()
        }]);
        setPromptTemplates([]);
      }
    } catch (error) {
      console.error('[useGuidedCaregiverChat] Error checking caregiver response:', error);
    }
  }, [currentStage, caregiverId, conversationFlow, chatService, saveChatState]);

  // Poll for caregiver response during waiting stage
  useEffect(() => {
    if (currentStage === 'waiting_acceptance') {
      console.log('[useGuidedCaregiverChat] Starting polling for caregiver response...');
      const interval = setInterval(checkCaregiverResponse, 5000); // Check every 5 seconds
      return () => {
        console.log('[useGuidedCaregiverChat] Stopping polling for caregiver response');
        clearInterval(interval);
      };
    }
  }, [currentStage, checkCaregiverResponse]);

  return {
    messages,
    promptTemplates,
    currentStage,
    isLoading: isLoading || persistenceLoading,
    conversationFlow,
    error,
    hasStartedChat: chatState?.hasStartedChat || false,
    chatRequestId: chatState?.chatRequestId,
    initializeConversation,
    handlePromptSelection,
    checkCaregiverResponse
  };
};
