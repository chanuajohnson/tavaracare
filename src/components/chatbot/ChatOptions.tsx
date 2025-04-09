
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChatOption } from '@/types/chatbotTypes';

interface ChatOptionsProps {
  options: ChatOption[];
  onSelect?: (value: string) => void;
}

export function ChatOptions({ options = [], onSelect }: ChatOptionsProps) {
  // Handle potential undefined options
  if (!options || options.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-2 mt-2"
    >
      {options.map((option, index) => (
        <Button
          key={`${option.value}-${index}`}
          variant="outline"
          size="sm"
          className="text-xs bg-white hover:bg-gray-50"
          onClick={() => {
            if (onSelect) onSelect(option.value);
            if (option.action) option.action();
          }}
        >
          {option.label}
        </Button>
      ))}
    </motion.div>
  );
}
