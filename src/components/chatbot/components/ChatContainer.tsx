
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  className,
  width = "320px",
}) => {
  const isMobile = useIsMobile();
  const responsiveWidth = isMobile ? "100%" : width;

  return (
    <div 
      className={cn(
        "bg-background border rounded-lg shadow-xl flex flex-col z-40",
        isMobile ? "h-[calc(100vh-160px)] max-w-[100vw]" : "h-[500px]", 
        className
      )}
      style={{ 
        width: responsiveWidth, 
        maxWidth: isMobile ? '95vw' : undefined,
        marginBottom: isMobile ? 'env(safe-area-inset-bottom, 16px)' : undefined 
      }}
    >
      {children}
    </div>
  );
};
