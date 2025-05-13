
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

export function FadeIn({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.5,
  ...rest 
}: FadeInProps) {
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv 
        className={className}
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ 
          duration: duration,
          delay: delay
        }}
        {...rest}
      >
        {children}
      </MotionDiv>
    </Suspense>
  );
}
