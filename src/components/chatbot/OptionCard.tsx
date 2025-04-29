
import React from 'react';
import { ChatOption } from '@/types/chatTypes';
import { useIsMobile } from "@/hooks/use-mobile";
import { Check } from 'lucide-react';

interface OptionCardProps {
  option: ChatOption;
  onClick: (id: string) => void;
  isSelected?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({ option, onClick, isSelected = false }) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={`flex flex-col ${isMobile ? "p-2.5" : "p-3"} rounded-md bg-white border 
        ${isSelected ? 'border-primary border-2 bg-primary/5' : 'border-gray-200'} 
        shadow-sm hover:shadow-md transition-all cursor-pointer 
        ${isMobile ? "mb-1.5" : "mb-2"} 
        active:scale-[0.98] hover:border-primary/50`}
      onClick={() => onClick(option.id)}
      role="button"
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between">
        <div className={`font-medium ${isMobile ? "text-sm" : ""} break-words overflow-hidden`}>
          {option.label}
        </div>
        {isSelected && (
          <div className="flex-shrink-0 ml-2">
            <Check size={16} className="text-primary" />
          </div>
        )}
      </div>
      {option.subtext && (
        <div className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500 mt-1 break-words overflow-hidden`}>
          {option.subtext}
        </div>
      )}
    </div>
  );
};
