
import React, { useState, useEffect } from 'react';
import { ChatWidget } from '@/components/chatbot/ChatWidget';
import { useChatSession } from '@/hooks/chat/useChatSession';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useChatProgress } from '@/hooks/chat/useChatProgress';
import { Button } from '@/components/ui/button';
import { Settings, MessageSquare, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatExample() {
  const { sessionId, resetSession } = useChatSession();
  const { messages, addMessage, clearMessages } = useChatMessages(sessionId);
  const { progress, updateProgress, clearProgress } = useChatProgress();
  const [isOpen, setIsOpen] = useState(true);
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset the chat? This will clear all messages and progress.')) {
      resetSession();
      clearMessages();
      clearProgress();
      toast.success('Chat has been reset');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chat Example</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">About This Demo</h2>
              <p className="mb-4">
                This is a simplified demonstration of the Tavara.care AI-powered chat assistant. 
                The chat widget helps users navigate through a registration flow for different user roles.
              </p>
              <p>
                Try selecting a role and answering the questions to see how the guided conversation works.
                This example includes input validation and multi-select capabilities.
              </p>
            </div>
            
            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Chat Session Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Session ID:</p>
                  <p className="font-mono text-sm">{sessionId || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role:</p>
                  <p>{progress.role || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Question Index:</p>
                  <p>{progress.questionIndex}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Messages:</p>
                  <p>{messages.length}</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleReset}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Chat
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? (
                    <>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Hide Chat
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Show Chat
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {isOpen && (
            <div className="col-span-1 h-[600px] relative">
              <div className="absolute inset-0 rounded-lg shadow-lg overflow-hidden border border-border">
                <ChatWidget
                  sessionId={sessionId}
                  initialMessages={messages}
                  userRole={progress.role}
                  questionIndex={progress.questionIndex}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
