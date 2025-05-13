
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
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv
        className={className}
        initial={{ scale: initialScale, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
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

export default ScaleIn;
