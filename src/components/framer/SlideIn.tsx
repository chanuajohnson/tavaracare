
import React, { lazy, Suspense, ReactNode } from 'react';

// Lazily load the motion.div component
const MotionDiv = lazy(() => 
  import('framer-motion').then((mod) => ({ 
    default: mod.motion.div 
  }))
);

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
  const getInitial = () => {
    switch (direction) {
      case "left": return { x: -distance, opacity: 0 };
      case "right": return { x: distance, opacity: 0 };
      case "up": return { y: -distance, opacity: 0 };
      case "down": return { y: distance, opacity: 0 };
      default: return { y: distance, opacity: 0 };
    }
  };
  
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv
        className={className}
        initial={getInitial()}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{
          duration,
          delay,
          ease: "easeOut"
        }}
        {...props}
      >
        {children}
      </MotionDiv>
    </Suspense>
  );
};

export default SlideIn;
