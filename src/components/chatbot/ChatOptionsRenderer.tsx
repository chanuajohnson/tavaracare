
import React from 'react';
import { motion } from 'framer-motion';
import { OptionCard } from './OptionCard';
import { ChatOption } from '@/types/chatTypes';
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatOptionsRendererProps {
  options: ChatOption[];
  onSelect: (id: string) => void;
}

export const ChatOptionsRenderer: React.FC<ChatOptionsRendererProps> = ({ 
  options, 
  onSelect 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col space-y-${isMobile ? "1" : "2"} my-2 w-full`}
    >
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          onClick={onSelect}
        />
      ))}
    </motion.div>
  );
};
