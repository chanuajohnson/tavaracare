
import React, { useState, useEffect, ReactNode } from 'react';

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
  const [isClient, setIsClient] = useState(false);
  
  // Only load framer-motion on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
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
      </React.Suspense>
    );
  };
  
  return <MotionWrapper />;
};

export default ScaleIn;
