
import React from 'react';
import { motion } from 'framer-motion';

interface SectionTransitionProps {
  title: string;
  show: boolean;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({ 
  title,
  show
}) => {
  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-3 px-4 my-3 bg-primary/10 rounded-md border-l-4 border-primary text-center shadow-sm"
    >
      <span className="text-sm font-medium text-primary-700">
        Moving to new section: {title}
      </span>
    </motion.div>
  );
};
