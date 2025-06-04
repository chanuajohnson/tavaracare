
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Brain, FormInput, HelpCircle } from 'lucide-react';
import { useConversationalForm } from '../hooks/useConversationalForm';

interface ConversationalFormChatProps {
  role: 'family' | 'professional' | 'community' | null;
}

export const ConversationalFormChat: React.FC<ConversationalFormChatProps> = ({ role }) => {
  const [message, setMessage] = useState('');
  const {
    conversationState,
    currentForm,
    isFormPage,
    startConversation,
    stopConversation,
    handleUserResponse,
    addMessage,
    getSuggestedResponses,
    generateFormGuidance
  } = useConversationalForm();

  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (conversationState.isActive && conversationState.mode === 'filling') {
      // In active filling mode, treat as form response
      handleUserResponse(message);
    } else {
      // Generate guidance or general help
      addMessage(message, 'user');
      
      setTimeout(() => {
        const guidance = generateFormGuidance(message);
        addMessage(guidance, 'tav');
      }, 1000);
    }

    setMessage('');
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

  const suggestedResponses = getSuggestedResponses();

  return (
    <div className="space-y-3">
      {/* Form Detection Status */}
      {isFormPage && currentForm && (
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <FormInput className="h-3 w-3 text-blue-600" />
            <p className="text-xs font-medium text-blue-800">Form Detected</p>
          </div>
          <p className="text-xs text-blue-700">{currentForm.formTitle}</p>
          <p className="text-xs text-blue-600">{currentForm.fields.length} fields to complete</p>
        </div>
      )}

      {/* Conversation History */}
      {conversationState.conversationHistory.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-2 border-t pt-2">
          {conversationState.conversationHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-2 rounded-lg text-xs ${
                  msg.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
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
          className="text-sm"
        />
        <Button
          size="sm"
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="px-3"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>

      {/* Form-Specific Quick Actions */}
      {isFormPage && !conversationState.isActive && (
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
