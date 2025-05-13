
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
  // Map direction to the correct animation name
  const getAnimationName = () => {
    switch (direction) {
      case "left": return "slideInLeft";
      case "right": return "slideInRight";
      case "up": return "slideInUp";
      case "down": return "slideInDown";
      default: return "slideInUp";
    }
  };
  
  const animationStyle = {
    opacity: 0,
    transform: getInitialTransform(),
    animationName: getAnimationName(),
    animationDuration: `${duration}s`,
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
    animationDelay: `${delay}s`,
  };
  
  function getInitialTransform() {
    switch (direction) {
      case "left": return `translateX(-${distance}px)`;
      case "right": return `translateX(${distance}px)`;
      case "up": return `translateY(-${distance}px)`;
      case "down": return `translateY(${distance}px)`;
      default: return `translateY(${distance}px)`;
    }
  }
  
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
