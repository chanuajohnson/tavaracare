
import React from 'react';
import { ChatOption } from '@/data/chatIntroMessage';

interface OptionCardProps {
  option: ChatOption;
  onClick: (id: string) => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({ option, onClick }) => {
  return (
    <div 
      className="flex flex-col p-3 rounded-md bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-2"
      onClick={() => onClick(option.id)}
    >
      <div className="font-medium">{option.label}</div>
      {option.subtext && (
        <div className="text-sm text-gray-500 mt-1">{option.subtext}</div>
      )}
    </div>
  );
};
