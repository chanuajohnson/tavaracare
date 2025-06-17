
import React, { Suspense, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
}

// Use Suspense to protect against React lazy loading errors
const SafeSuspenseBoundary: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // We need to make sure React is initialized before rendering anything with forwardRef
  if (typeof window !== 'undefined' && !(window as any).reactInitialized) {
    return <div className="p-4">Loading chat interface...</div>;
  }
  
  return (
    <Suspense fallback={<div className="p-4">Loading components...</div>}>
      {children}
    </Suspense>
  );
};

export const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  className,
  width = "320px",
}) => {
  const isMobile = useIsMobile();
  const responsiveWidth = isMobile ? "100%" : width;
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when component mounts to show input field
  useEffect(() => {
    const scrollToBottom = () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToBottom);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "bg-background border rounded-lg shadow-xl flex flex-col z-40 overflow-auto",
        isMobile ? "h-[calc(100vh-140px)] max-w-[100vw]" : "h-[500px]", // Adjusted height for mobile and max width
        className
      )}
      style={{ width: responsiveWidth, maxWidth: isMobile ? '95vw' : undefined }}
    >
      <SafeSuspenseBoundary>
        {children}
      </SafeSuspenseBoundary>
    </div>
  );
};
