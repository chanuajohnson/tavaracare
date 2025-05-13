
import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div 
      className="flex items-center space-x-1 p-2 rounded-md bg-muted max-w-fit opacity-0 animate-fade-in"
      style={{ animationDuration: '300ms', animationFillMode: 'forwards' }}
    >
      <div 
        className="w-2 h-2 rounded-full bg-gray-400 animate-typing-pulse"
        style={{ animationDelay: '0ms' }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-gray-400 animate-typing-pulse"
        style={{ animationDelay: '300ms' }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-gray-400 animate-typing-pulse"
        style={{ animationDelay: '600ms' }}
      />
    </div>
  );
};
