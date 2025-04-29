
import React from 'react';

interface ChatDebugPanelProps {
  debugMode: boolean;
  config: any;
  conversationStage: "intro" | "questions" | "completion";
  progress: {
    role?: string;
  };
  currentSectionIndex: number;
  currentQuestionIndex: number;
  messages: any[];
  sessionId: string;
}

export const ChatDebugPanel: React.FC<ChatDebugPanelProps> = ({
  debugMode,
  config,
  conversationStage,
  progress,
  currentSectionIndex,
  currentQuestionIndex,
  messages,
  sessionId
}) => {
  if (!debugMode) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50 max-w-xs overflow-auto max-h-48">
      <h4 className="font-bold">Chat Debug</h4>
      <div>Mode: <span className="text-green-400">{config.mode}</span></div>
      <div>Stage: <span className="text-yellow-400">{conversationStage}</span></div>
      <div>Role: <span className="text-blue-400">{progress.role || "not set"}</span></div>
      <div>Index: <span className="text-purple-400">{currentSectionIndex}.{currentQuestionIndex}</span></div>
      <div>Messages: <span className="text-orange-400">{messages.length}</span></div>
      <div>Session ID: <span className="text-gray-400 text-[10px]">{sessionId.slice(0, 8)}...</span></div>
    </div>
  );
};
