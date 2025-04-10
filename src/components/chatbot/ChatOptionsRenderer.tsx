
import React from 'react';
import { motion } from 'framer-motion';
import { OptionCard } from './OptionCard';
import { ChatOption } from '@/types/chatTypes';

interface ChatOptionsRendererProps {
  options: ChatOption[];
  onSelect: (id: string) => void;
}

export const ChatOptionsRenderer: React.FC<ChatOptionsRendererProps> = ({ 
  options, 
  onSelect 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col space-y-2 my-2"
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
