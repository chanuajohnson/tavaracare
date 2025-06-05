
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { OptionCard } from './OptionCard';
import { ChatOption } from '@/types/chatTypes';
import { useIsMobile } from "@/hooks/use-mobile";
import { getMultiSelectionStatus, isTransitionOption } from '@/services/chat/utils/multiSelectionManager';
import { Check } from 'lucide-react';

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
  
  // Check if this is a transition button set (e.g. single "Continue" button)
  const isTransitionButtonSet = options.length === 1 && 
                              isTransitionOption(options[0].id);
  
  // Check if this is a multi-select card set - BUT NOT a transition button set
  const isMultiSelect = multiSelectionStatus.active && 
                       options.some(opt => opt.id === "done_selecting") &&
                       !isTransitionButtonSet;
  
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

  // Filter out "done_selecting" from regular options for multi-select
  const regularOptions = isMultiSelect 
    ? options.filter(opt => opt.id !== "done_selecting")
    : options;
  
  // Find the "done selecting" option if it exists
  const doneOption = options.find(opt => opt.id === "done_selecting");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col space-y-${isMobile ? "1" : "2"} my-2 w-full overflow-hidden`}
    >
      {isMultiSelect && (
        <div className="mb-2 text-sm text-primary-700">
          <span className="font-medium">
            {selectedOptions.length > 0 
              ? `${selectedOptions.length} option${selectedOptions.length > 1 ? 's' : ''} selected` 
              : 'Select options below'}
          </span>
        </div>
      )}
      
      {regularOptions.map((option) => {
        const isSelected = selectedOptions.includes(option.id);
        
        return (
          <OptionCard
            key={option.id}
            option={option}
            onClick={handleOptionClick}
            isSelected={isSelected && isMultiSelect}
          />
        );
      })}
      
      {/* Always show the "Done selecting" button at the bottom for multi-select */}
      {isMultiSelect && doneOption && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`sticky bottom-0 mt-2 py-2.5 px-4 rounded-md 
            ${selectedOptions.length > 0 
              ? 'bg-primary text-white hover:bg-primary/90' 
              : 'bg-gray-200 text-gray-500'}
            text-center font-medium cursor-pointer transition-colors shadow-md`}
          onClick={() => onSelect(doneOption.id)}
        >
          <div className="flex items-center justify-center">
            <Check size={16} className="mr-1.5" />
            {doneOption.label}
            {selectedOptions.length > 0 && ` (${selectedOptions.length})`}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
