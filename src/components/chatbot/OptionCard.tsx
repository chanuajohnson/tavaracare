
import React from 'react';
import { ChatOption } from '@/types/chatTypes';
import { useIsMobile } from "@/hooks/use-mobile";

interface OptionCardProps {
  option: ChatOption;
  onClick: (id: string) => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({ option, onClick }) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={`flex flex-col ${isMobile ? "p-2" : "p-3"} rounded-md bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${isMobile ? "mb-1" : "mb-2"}`}
      onClick={() => onClick(option.id)}
    >
      <div className={`font-medium ${isMobile ? "text-sm" : ""} break-words overflow-hidden`}>{option.label}</div>
      {option.subtext && (
        <div className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500 mt-1 break-words overflow-hidden`}>{option.subtext}</div>
      )}
    </div>
  );
};
