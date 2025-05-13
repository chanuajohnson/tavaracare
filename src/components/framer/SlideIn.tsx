
import React, { ReactNode } from 'react';

interface SlideInProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
  delay?: number;
  duration?: number;
  [key: string]: any;
}

export const SlideIn = ({
  children,
  className = "",
  direction = "up",
  distance = 20,
  delay = 0,
  duration = 0.5,
  ...props
}: SlideInProps) => {
  const getInitialTransform = () => {
    switch (direction) {
      case "left": return `translateX(-${distance}px)`;
      case "right": return `translateX(${distance}px)`;
      case "up": return `translateY(-${distance}px)`;
      case "down": return `translateY(${distance}px)`;
      default: return `translateY(${distance}px)`;
    }
  };
  
  const animationStyle = {
    opacity: 0,
    transform: getInitialTransform(),
    animation: `slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} ${duration}s ease-out forwards`,
    animationDelay: `${delay}s`,
  };
  
  return (
    <div 
      className={`slide-in ${className}`}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default SlideIn;
