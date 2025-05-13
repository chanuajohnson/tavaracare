
import React, { ReactNode } from 'react';

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  initialScale?: number;
  delay?: number;
  duration?: number;
  [key: string]: any;
}

export const ScaleIn = ({
  children,
  className = "",
  initialScale = 0.95,
  delay = 0,
  duration = 0.5,
  ...props
}: ScaleInProps) => {
  const animationStyle = {
    opacity: 0,
    transform: `scale(${initialScale})`,
    animationName: 'scaleIn',
    animationDuration: `${duration}s`,
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
    animationDelay: `${delay}s`,
  };
  
  return (
    <div
      className={`scale-in ${className}`}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default ScaleIn;
