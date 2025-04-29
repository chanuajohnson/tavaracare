
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { OptionCard } from './OptionCard';
import { ChatOption } from '@/types/chatTypes';
import { useIsMobile } from "@/hooks/use-mobile";
import { getMultiSelectionStatus } from '@/services/chat/utils/multiSelectionManager';

interface ChatOptionsRendererProps {
  options: ChatOption[];
  onSelect: (id: string) => void;
}

export const ChatOptionsRenderer: React.FC<ChatOptionsRendererProps> = ({ 
  options, 
  onSelect 
}) => {
  const isMobile = useIsMobile();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const multiSelectionStatus = getMultiSelectionStatus();
  
  // Update selected options when multi-selection status changes
  useEffect(() => {
    if (multiSelectionStatus.active) {
      setSelectedOptions(multiSelectionStatus.selections);
    } else {
      setSelectedOptions([]);
    }
  }, [multiSelectionStatus]);
  
  // Check if this is a multi-select card set
  const isMultiSelect = multiSelectionStatus.active && 
                       options.some(opt => opt.id === "done_selecting");
  
  // Handle option click for multi-select
  const handleOptionClick = (optionId: string) => {
    if (isMultiSelect && optionId !== "done_selecting") {
      // Toggle selection
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(prev => prev.filter(id => id !== optionId));
      } else {
        setSelectedOptions(prev => [...prev, optionId]);
      }
    }
    
    // Always call parent's onSelect handler
    onSelect(optionId);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col space-y-${isMobile ? "1" : "2"} my-2 w-full overflow-hidden`}
    >
      {options.map((option) => {
        const isSelected = selectedOptions.includes(option.id);
        const isDoneButton = option.id === "done_selecting";
        
        // Special styling for "Done selecting" button
        if (isDoneButton) {
          return (
            <div key={option.id} className="mt-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-2 rounded-md bg-primary text-white text-center cursor-pointer hover:bg-primary/90 transition-colors`}
                onClick={() => handleOptionClick(option.id)}
              >
                {option.label}
              </motion.div>
            </div>
          );
        }
        
        return (
          <OptionCard
            key={option.id}
            option={option}
            onClick={handleOptionClick}
            isSelected={isSelected && isMultiSelect}
          />
        );
      })}
    </motion.div>
  );
};
