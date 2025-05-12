
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
  role?: string | null;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  className,
  width = "320px",
  role
}) => {
  const isMobile = useIsMobile();
  const responsiveWidth = isMobile ? "100%" : width;
  
  // Add role-specific styling
  const getRoleColor = () => {
    if (!role) return "";
    switch (role) {
      case 'family': return "border-blue-200";
      case 'professional': return "border-green-200";
      case 'community': return "border-amber-200";
      default: return "";
    }
  };

  return (
    <div 
      className={cn(
        "bg-background border rounded-lg shadow-xl flex flex-col z-40",
        isMobile ? "h-[calc(100vh-140px)] max-w-[100vw]" : "h-[500px]",
        getRoleColor(),
        className
      )}
      style={{ width: responsiveWidth, maxWidth: isMobile ? '95vw' : undefined }}
      role="dialog"
      aria-label="Tavara Care Assistant Chat"
    >
      {children}
    </div>
  );
};
