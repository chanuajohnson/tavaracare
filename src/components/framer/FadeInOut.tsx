
import React, { ReactNode, useState, useEffect } from 'react';

interface FadeInOutProps {
  children: ReactNode;
  visible: boolean;
  className?: string;
  duration?: number;
  delay?: number;
  unmountOnExit?: boolean;
  [key: string]: any;
}

export const FadeInOut = ({ 
  children, 
  visible, 
  className = "", 
  duration = 0.3, 
  delay = 0, 
  unmountOnExit = true,
  ...props 
}: FadeInOutProps) => {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isMounted, setIsMounted] = useState(visible);
  
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 10); // Small delay to ensure DOM update
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
      if (unmountOnExit) {
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, duration * 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, unmountOnExit]);
  
  if (!shouldRender) return null;
  
  const animationStyle = {
    opacity: isMounted ? 1 : 0,
    transition: `opacity ${duration}s ease-out ${delay}s`,
    display: 'contents',
  };
  
  return (
    <div 
      className={className}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default FadeInOut;
