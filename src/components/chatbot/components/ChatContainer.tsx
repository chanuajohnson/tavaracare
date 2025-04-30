
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
        isMobile ? "h-[calc(100vh-140px)]" : "h-[500px]", // Adjusted height for mobile
        className
      )}
      style={{ width: responsiveWidth }}
    >
      {children}
    </div>
  );
};
