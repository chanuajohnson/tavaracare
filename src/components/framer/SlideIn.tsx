
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
  delay?: number;
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  [key: string]: any;
}

export function SlideIn({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.5,
  direction = 'right',
  ...rest 
}: SlideInProps) {
  // Determine initial and animate values based on direction
  const getDirectionProps = () => {
    switch (direction) {
      case 'left':
        return { initial: { x: -100 }, animate: { x: 0 } };
      case 'right':
        return { initial: { x: 100 }, animate: { x: 0 } };
      case 'up':
        return { initial: { y: -100 }, animate: { y: 0 } };
      case 'down':
        return { initial: { y: 100 }, animate: { y: 0 } };
      default:
        return { initial: { x: 100 }, animate: { x: 0 } };
    }
  };

  const { initial, animate } = getDirectionProps();

  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv 
        className={className}
        initial={{ ...initial, opacity: 0 }} 
        animate={{ ...animate, opacity: 1 }} 
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
