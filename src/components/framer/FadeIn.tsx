
import React, { lazy, Suspense, ReactNode } from 'react';

// Lazily load the motion.div component
const MotionDiv = lazy(() => 
  import('framer-motion').then((mod) => ({ 
    default: mod.motion.div 
  }))
);

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
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv 
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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

export default FadeIn;
