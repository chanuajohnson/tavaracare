
import React, { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  [key: string]: any;
}

export const FadeIn = ({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.5, 
  ...props 
}: FadeInProps) => {
  const animationStyle = {
    opacity: 0,
    animation: `fadeIn ${duration}s ease-out forwards`,
    animationDelay: `${delay}s`,
  };
  
  return (
    <div 
      className={`fade-in ${className}`}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default FadeIn;
