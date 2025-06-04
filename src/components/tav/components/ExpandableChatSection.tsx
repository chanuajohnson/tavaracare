
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ExpandableChatSectionProps {
  role: 'family' | 'professional' | 'community' | null;
}

export const ExpandableChatSection: React.FC<ExpandableChatSectionProps> = ({ role }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; content: string; isUser: boolean; timestamp: number }>>([]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate TAV response
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${message}". I'm here to help guide you through your ${role} journey. What specific step would you like assistance with?`,
        isUser: false,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-200 mt-4">
      {/* Expandable Header */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between h-auto py-3 px-4 hover:bg-primary/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Chat with TAV</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      {/* Expandable Chat Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="bg-primary/5 rounded-lg p-3">
                  <p className="text-sm text-primary font-medium mb-1">💙 Hi there!</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I'm here to help you navigate your {role} journey. Ask me anything about the steps above, 
                    or let me guide you through filling out forms.
                  </p>
                </div>
              )}

              {/* Messages */}
              {messages.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-xs ${
                          msg.isUser
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

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask TAV for help..."
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

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setMessage("Help me with the next step")}
                >
                  Next step help
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setMessage("Guide me through a form")}
                >
                  Form guidance
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
