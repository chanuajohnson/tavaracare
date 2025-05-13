
import React, { lazy, Suspense, ReactNode } from 'react';

// Lazily load the motion.div component
const MotionDiv = lazy(() => 
  import('framer-motion').then((mod) => ({ 
    default: mod.motion.div 
  }))
);

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  [key: string]: any;
}

export function ScaleIn({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.5,
  ...rest 
}: ScaleInProps) {
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv 
        className={className}
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
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
