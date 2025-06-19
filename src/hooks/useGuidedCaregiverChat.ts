
import { useState, useEffect, useCallback } from 'react';
import { GuidedCaregiverChatService, ChatConversationFlow, ChatPromptTemplate } from '@/components/tav/services/guidedCaregiverChatService';

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

  // Initialize conversation
  const initializeConversation = useCallback(async () => {
    console.log(`[useGuidedCaregiverChat] Initializing conversation for caregiver: ${caregiverId}`);
    setIsLoading(true);
    
    try {
      // Validate that caregiver ID is a real UUID from database
      if (!caregiverId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(caregiverId)) {
        console.error('[useGuidedCaregiverChat] Invalid caregiver ID:', caregiverId);
        setMessages([{
          content: '💙 Sorry, there was an issue connecting to this caregiver. Please try selecting a different match.',
          isUser: false,
          timestamp: Date.now()
        }]);
        setIsLoading(false);
        return;
      }

      // Generate a proper UUID session ID - CRITICAL FIX
      const sessionId = crypto.randomUUID();
      console.log(`[useGuidedCaregiverChat] Generated proper UUID session ID: ${sessionId}`);
      
      // Initialize conversation flow with proper UUID
      console.log('[useGuidedCaregiverChat] Initializing conversation flow...');
      const flow = await chatService.initializeConversationFlow(sessionId);
      
      if (flow) {
        console.log('[useGuidedCaregiverChat] Conversation flow initialized successfully:', flow);
        setConversationFlow(flow);
        setCurrentStage(flow.current_stage);
        
        // Load initial prompt templates
        console.log(`[useGuidedCaregiverChat] Loading prompt templates for stage: ${flow.current_stage}`);
        const templates = await chatService.getPromptTemplates(flow.current_stage);
        console.log(`[useGuidedCaregiverChat] Loaded ${templates.length} templates:`, templates);
        setPromptTemplates(templates);
        
        // Add welcome message - anonymized
        setMessages([{
          content: `💙 Hi! I'm TAV, your care coordinator. I'll help you connect with this professional caregiver in a safe and structured way. Choose how you'd like to start the conversation:`,
          isUser: false,
          timestamp: Date.now()
        }]);
        
        console.log('[useGuidedCaregiverChat] Initialization completed successfully');
      } else {
        console.error('[useGuidedCaregiverChat] Failed to initialize conversation flow');
        setMessages([{
          content: '💙 Sorry, there was an issue setting up your conversation. Please try again.',
          isUser: false,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('[useGuidedCaregiverChat] Error initializing conversation:', error);
      setMessages([{
        content: '💙 Sorry, there was an issue connecting. Please try again.',
        isUser: false,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [caregiverId, chatService]);

  // Handle prompt selection with improved error handling
  const handlePromptSelection = useCallback(async (promptText: string) => {
    if (!conversationFlow) {
      console.error('[useGuidedCaregiverChat] No conversation flow available for prompt selection');
      return;
    }

    console.log(`[useGuidedCaregiverChat] FLOW DEBUG: Handling prompt selection in stage: ${currentStage}`);
    console.log(`[useGuidedCaregiverChat] FLOW DEBUG: Prompt text: "${promptText}"`);
    console.log(`[useGuidedCaregiverChat] FLOW DEBUG: Caregiver ID: ${caregiver.id}`);

    setIsLoading(true);
    try {
      // Add user message immediately
      setMessages(prev => [...prev, {
        content: promptText,
        isUser: true,
        timestamp: Date.now()
      }]);

      // Handle the selection with detailed error reporting
      console.log('[useGuidedCaregiverChat] FLOW DEBUG: Calling chatService.handlePromptSelection...');
      const result = await chatService.handlePromptSelection(
        conversationFlow.session_id,
        promptText,
        caregiver,
        currentStage
      );

      console.log('[useGuidedCaregiverChat] FLOW DEBUG: Prompt selection result:', result);

      if (result.success && result.response) {
        // Add TAV response
        setMessages(prev => [...prev, {
          content: result.response!,
          isUser: false,
          timestamp: Date.now()
        }]);

        // Update stage if changed
        if (result.nextStage && result.nextStage !== currentStage) {
          console.log(`[useGuidedCaregiverChat] FLOW DEBUG: Stage transition: ${currentStage} -> ${result.nextStage}`);
          setCurrentStage(result.nextStage);
          
          // Load new prompt templates for the next stage
          if (result.nextStage !== 'waiting_acceptance') {
            console.log(`[useGuidedCaregiverChat] FLOW DEBUG: Loading templates for new stage: ${result.nextStage}`);
            const templates = await chatService.getPromptTemplates(result.nextStage);
            console.log(`[useGuidedCaregiverChat] FLOW DEBUG: Loaded ${templates.length} templates for ${result.nextStage}`);
            setPromptTemplates(templates);
          } else {
            // Clear templates during waiting stage
            console.log('[useGuidedCaregiverChat] FLOW DEBUG: Clearing templates for waiting stage');
            setPromptTemplates([]);
          }
        }
      } else if (result.error) {
        console.error('[useGuidedCaregiverChat] FLOW DEBUG: Prompt selection error:', result.error);
        setMessages(prev => [...prev, {
          content: `💙 ${result.error}`,
          isUser: false,
          timestamp: Date.now()
        }]);
      } else {
        console.error('[useGuidedCaregiverChat] FLOW DEBUG: Unexpected result format:', result);
        setMessages(prev => [...prev, {
          content: '💙 Something unexpected happened. Please try again.',
          isUser: false,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('[useGuidedCaregiverChat] FLOW DEBUG: Error handling prompt selection:', error);
      setMessages(prev => [...prev, {
        content: '💙 Something went wrong. Please try again.',
        isUser: false,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationFlow, currentStage, caregiver, chatService]);

  // Check for caregiver response (for waiting stage)
  const checkCaregiverResponse = useCallback(async () => {
    if (currentStage !== 'waiting_acceptance') return;

    console.log('[useGuidedCaregiverChat] FLOW DEBUG: Checking caregiver response...');
    try {
      const chatRequest = await chatService.getChatRequestStatus(caregiverId);
      console.log('[useGuidedCaregiverChat] FLOW DEBUG: Chat request status:', chatRequest);
      
      if (chatRequest && chatRequest.status === 'accepted') {
        console.log('[useGuidedCaregiverChat] FLOW DEBUG: Caregiver accepted the request!');
        // Caregiver accepted! Move to guided Q&A
        if (conversationFlow) {
          await chatService.updateConversationStage(conversationFlow.session_id, 'guided_qa');
          setCurrentStage('guided_qa');
          
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
        console.log('[useGuidedCaregiverChat] FLOW DEBUG: Caregiver declined the request');
        // Caregiver declined - anonymized
        setMessages(prev => [...prev, {
          content: `💙 This caregiver is not available right now, but don't worry - we have many other amazing caregivers who would love to help your family. Would you like me to show you more matches?`,
          isUser: false,
          timestamp: Date.now()
        }]);
        setPromptTemplates([]);
      }
    } catch (error) {
      console.error('[useGuidedCaregiverChat] FLOW DEBUG: Error checking caregiver response:', error);
    }
  }, [currentStage, caregiverId, conversationFlow, chatService]);

  // Poll for caregiver response during waiting stage
  useEffect(() => {
    if (currentStage === 'waiting_acceptance') {
      console.log('[useGuidedCaregiverChat] FLOW DEBUG: Starting polling for caregiver response...');
      const interval = setInterval(checkCaregiverResponse, 5000); // Check every 5 seconds
      return () => {
        console.log('[useGuidedCaregiverChat] FLOW DEBUG: Stopping polling for caregiver response');
        clearInterval(interval);
      };
    }
  }, [currentStage, checkCaregiverResponse]);

  return {
    messages,
    promptTemplates,
    currentStage,
    isLoading,
    conversationFlow,
    initializeConversation,
    handlePromptSelection,
    checkCaregiverResponse
  };
};
