
import React from 'react';

export const TypingIndicator: React.FC = () => {
  const dotStyle = {
    animation: 'typingPulse 1s infinite',
  };

  return (
    <div 
      className="flex items-center space-x-1 p-2 rounded-md bg-muted max-w-fit opacity-0 animate-fade-in"
      style={{ animationDuration: '300ms', animationFillMode: 'forwards' }}
    >
      <div 
        className="w-2 h-2 rounded-full bg-gray-400"
        style={{ 
          ...dotStyle, 
          animationDelay: '0ms' 
        }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-gray-400"
        style={{ 
          ...dotStyle, 
          animationDelay: '300ms' 
        }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-gray-400"
        style={{ 
          ...dotStyle, 
          animationDelay: '600ms' 
        }}
      />
    </div>
  );
};
