import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Brain, FormInput, HelpCircle, Loader2 } from 'lucide-react';
import { useConversationalForm } from '../hooks/useConversationalForm';
import { useTAVConversation } from '../hooks/useTAVConversation';
import { useTavaraState } from '../hooks/TavaraStateContext';
import { formFieldTracker, FieldCompletionStatus } from '@/utils/formFieldTracker';
import { sectionBasedFormTracker, FormSectionData } from '@/utils/sectionBasedFormTracker';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface ConversationalFormChatProps {
  role: 'family' | 'professional' | 'community' | null;
  realTimeDataCallback?: (message: string, isUser: boolean) => void;
}

export const ConversationalFormChat: React.FC<ConversationalFormChatProps> = ({ role, realTimeDataCallback }) => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [sessionId] = useState(() => uuidv4());
  const [fieldStatus, setFieldStatus] = useState<FieldCompletionStatus>({ 
    totalFields: 0, 
    filledFields: 0, 
    emptyFields: 0, 
    completionPercentage: 0 
  });
  const [sectionStatus, setSectionStatus] = useState<FormSectionData | null>(null);
  
  const {
    conversationState,
    currentForm,
    isFormPage,
    startConversation,
    stopConversation,
    handleUserResponse,
    getSuggestedResponses,
    generateFormGuidance
  } = useConversationalForm();

  // Check if we're in demo mode
  const isDemoRoute = location.pathname.startsWith('/demo/');
  
  // TAV AI conversation context
  const tavContext = {
    currentPage: location.pathname,
    currentForm: currentForm?.formId,
    formFields: currentForm?.fields.reduce((acc, field) => {
      acc[field.name] = field;
      return acc;
    }, {} as Record<string, any>),
    userRole: role || undefined,
    sessionId,
    isDemoMode: isDemoRoute
  };

  const tavaraState = useTavaraState();
  
  // Use prop callback if provided, otherwise fall back to context callback
  const activeCallback = realTimeDataCallback || tavaraState.realTimeDataCallback;
  
  // DEBUG: Log callback availability in ConversationalFormChat
  console.warn('🔗 [ConversationalFormChat] realTimeDataCallback available:', !!activeCallback, {
    propCallback: !!realTimeDataCallback,
    contextCallback: !!tavaraState.realTimeDataCallback,
    usingProp: !!realTimeDataCallback
  });
  
  const { messages: aiMessages, isTyping, sendMessage: sendAIMessage } = useTAVConversation(
    tavContext, 
    activeCallback
  );

  // Track form field completion status - both field-level and section-level
  useEffect(() => {
    if (!isFormPage || !currentForm) return;

    const cleanup = formFieldTracker.watchFormChanges((status) => {
      setFieldStatus(status);
    });

    // Set up section-based tracking with polling for real-time updates
    const updateSectionStatus = () => {
      if (currentForm?.formId) {
        const sectionData = sectionBasedFormTracker.getSectionCompletionStatus(currentForm.formId);
        setSectionStatus(sectionData);
      }
    };

    // Initial update
    updateSectionStatus();

    // Poll for section updates every 500ms while on form page
    const sectionInterval = setInterval(updateSectionStatus, 500);

    return () => {
      cleanup();
      clearInterval(sectionInterval);
    };
  }, [isFormPage, currentForm]);

  // Initialize with welcome message based on context
  useEffect(() => {
    if (aiMessages.length === 0) {
      // Send initial context message to AI
      if (isFormPage && currentForm) {
        sendAIMessage(`I'm on the ${currentForm.formTitle} page. Can you help me understand what I need to do?`);
      }
    }
  }, [isFormPage, currentForm, aiMessages.length]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');

    // If in active form filling mode, use form logic
    if (conversationState.isActive && conversationState.mode === 'filling') {
      handleUserResponse(userMessage);
      return;
    }

    // Otherwise, use AI conversation
    await sendAIMessage(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Start filling form') {
      startConversation('filling');
    } else if (action === 'Guide me through form') {
      startConversation('guidance');
    } else {
      setMessage(action);
    }
  };

  // Combine form conversation history with AI messages
  const allMessages = [
    ...conversationState.conversationHistory.map(msg => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.type === 'user',
      timestamp: msg.timestamp
    })),
    ...aiMessages
  ].sort((a, b) => a.timestamp - b.timestamp);

  const suggestedResponses = getSuggestedResponses();

  return (
    <div className="space-y-3">
      {/* Form Detection Status - Section-Based */}
      {isFormPage && currentForm && sectionStatus?.currentSection && (
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <FormInput className="h-3 w-3 text-blue-600" />
            <p className="text-xs font-medium text-blue-800">Form Detected</p>
          </div>
          <p className="text-xs text-blue-700">{currentForm.formTitle}</p>
          <p className="text-xs text-blue-600">
            {sectionStatus.currentSection.filledFields} of {sectionStatus.currentSection.totalFields} fields completed ({sectionStatus.currentSection.sectionTitle}).
          </p>
        </div>
      )}

      {/* Conversation History */}
      {allMessages.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-2 border-t pt-2">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-2 rounded-lg text-xs ${
                  msg.isUser
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-2 rounded-lg text-xs flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                TAV is typing...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Form Filling Indicator */}
      {conversationState.isActive && conversationState.mode === 'filling' && (
        <div className="bg-green-50 rounded-lg p-2 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-3 w-3 text-green-600" />
            <p className="text-xs font-medium text-green-800">Form Filling Mode Active</p>
          </div>
          {conversationState.currentField && (
            <p className="text-xs text-green-700">
              Currently asking: {conversationState.currentField.label}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={stopConversation}
            className="h-5 px-2 text-xs text-green-600 hover:text-green-700 mt-1"
          >
            Exit form mode
          </Button>
        </div>
      )}

      {/* Suggested Responses */}
      {conversationState.isActive && suggestedResponses.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Quick responses:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedResponses.slice(0, 3).map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleQuickAction(response)}
              >
                {response}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="flex gap-2">
        <Input
          placeholder={
            conversationState.isActive && conversationState.mode === 'filling'
              ? "Type your answer..."
              : isFormPage
              ? "Ask me about this form..."
              : "Ask TAV for help..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isTyping}
          className="text-sm"
        />
        <Button
          size="sm"
          onClick={handleSendMessage}
          disabled={!message.trim() || isTyping}
          className="px-3"
        >
          {isTyping ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Form-Specific Quick Actions */}
      {isFormPage && !conversationState.isActive && allMessages.length === 0 && (
        <div className="flex flex-wrap gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => handleQuickAction('Start filling form')}
          >
            <FormInput className="h-3 w-3 mr-1" />
            Fill form with TAV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => handleQuickAction('Guide me through form')}
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Form guidance
          </Button>
        </div>
      )}
    </div>
  );
};
