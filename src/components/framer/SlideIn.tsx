
import React, { useState, useEffect, ReactNode } from 'react';

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
  const [isClient, setIsClient] = useState(false);
  
  // Only load framer-motion on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const getInitial = () => {
    switch (direction) {
      case "left": return { x: -distance, opacity: 0 };
      case "right": return { x: distance, opacity: 0 };
      case "up": return { y: -distance, opacity: 0 };
      case "down": return { y: distance, opacity: 0 };
      default: return { y: distance, opacity: 0 };
    }
  };
  
  // Static fallback for server-side rendering or before hydration
  if (!isClient) {
    return <div className={className}>{children}</div>;
  }
  
  // Dynamically import the motion component only on client side
  const MotionWrapper = () => {
    // Use dynamic import with React.lazy but inside a component that only renders client-side
    const MotionDiv = React.lazy(() => 
      Promise.resolve().then(() => import('framer-motion')).then((mod) => ({ 
        default: mod.motion.div 
      }))
    );
    
    return (
      <React.Suspense fallback={<div className={className}>{children}</div>}>
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
      </React.Suspense>
    );
  };
  
  return <MotionWrapper />;
};

export default SlideIn;
