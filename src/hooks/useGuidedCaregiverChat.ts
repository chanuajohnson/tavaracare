
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
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const [messages, setMessages] = useState<Array<{ content: string; isUser: boolean; timestamp: number }>>([]);
  const [current Stage, setCurrentStage] = useState<string>('introduction');

  // Initialize conversation
  const initializeConversation = useCallback(async () => {
    setIsLoading(true);
    try {
      // Validate that caregiver ID is a real UUID from database
      if (!caregiverId || caregiverId.length !== 36) {
        console.error('Invalid caregiver ID:', caregiverId);
        setMessages([{
          content: '💙 Sorry, there was an issue connecting to this caregiver. Please try selecting a different match.',
          isUser: false,
          timestamp: Date.now()
        }]);
        setIsLoading(false);
        return;
      }

      // Create a session ID for this conversation
      const sessionId = `caregiver-chat-${caregiverId}-${Date.now()}`;
      
      // Initialize conversation flow
      const flow = await chatService.initializeConversationFlow(sessionId);
      if (flow) {
        setConversationFlow(flow);
        setCurrentStage(flow.current_stage);
        
        // Load initial prompt templates
        const templates = await chatService.getPromptTemplates(flow.current_stage);
        setPromptTemplates(templates);
        
        // Add welcome message
        setMessages([{
          content: `💙 Hi! I'm TAV, your care coordinator. I'll help you connect with ${caregiver.full_name} in a safe and structured way. Choose how you'd like to start the conversation:`,
          isUser: false,
          timestamp: Date.now()
        }]);
      } else {
        setMessages([{
          content: '💙 Sorry, there was an issue setting up your conversation. Please try again.',
          isUser: false,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setMessages([{
        content: '💙 Sorry, there was an issue connecting. Please try again.',
        isUser: false,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [caregiverId, caregiver.full_name, chatService]);

  // Handle prompt selection
  const handlePromptSelection = useCallback(async (promptText: string) => {
    if (!conversationFlow) return;

    setIsLoading(true);
    try {
      // Add user message
      setMessages(prev => [...prev, {
        content: promptText,
        isUser: true,
        timestamp: Date.now()
      }]);

      // Handle the selection
      const result = await chatService.handlePromptSelection(
        conversationFlow.session_id,
        promptText,
        caregiver,
        currentStage
      );

      if (result.success && result.response) {
        // Add TAV response
        setMessages(prev => [...prev, {
          content: result.response!,
          isUser: false,
          timestamp: Date.now()
        }]);

        // Update stage if changed
        if (result.nextStage && result.nextStage !== currentStage) {
          setCurrentStage(result.nextStage);
          
          // Load new prompt templates for the next stage
          if (result.nextStage !== 'waiting_acceptance') {
            const templates = await chatService.getPromptTemplates(result.nextStage);
            setPromptTemplates(templates);
          } else {
            // Clear templates during waiting stage
            setPromptTemplates([]);
          }
        }
      } else if (result.error) {
        setMessages(prev => [...prev, {
          content: `💙 ${result.error}`,
          isUser: false,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Error handling prompt selection:', error);
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

    try {
      const chatRequest = await chatService.getChatRequestStatus(caregiverId);
      if (chatRequest && chatRequest.status === 'accepted') {
        // Caregiver accepted! Move to guided Q&A
        if (conversationFlow) {
          await chatService.updateConversationStage(conversationFlow.session_id, 'guided_qa');
          setCurrentStage('guided_qa');
          
          // Load guided Q&A templates
          const templates = await chatService.getPromptTemplates('guided_qa');
          setPromptTemplates(templates);
          
          // Add acceptance message
          setMessages(prev => [...prev, {
            content: `🎉 Great news! ${caregiver.full_name} has accepted your request and is ready to chat. What would you like to ask them?`,
            isUser: false,
            timestamp: Date.now()
          }]);
        }
      } else if (chatRequest && chatRequest.status === 'declined') {
        // Caregiver declined
        setMessages(prev => [...prev, {
          content: `💙 ${caregiver.full_name} is not available right now, but don't worry - we have many other amazing caregivers who would love to help your family. Would you like me to show you more matches?`,
          isUser: false,
          timestamp: Date.now()
        }]);
        setPromptTemplates([]);
      }
    } catch (error) {
      console.error('Error checking caregiver response:', error);
    }
  }, [currentStage, caregiverId, conversationFlow, caregiver.full_name, chatService]);

  // Poll for caregiver response during waiting stage
  useEffect(() => {
    if (currentStage === 'waiting_acceptance') {
      const interval = setInterval(checkCaregiverResponse, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
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
