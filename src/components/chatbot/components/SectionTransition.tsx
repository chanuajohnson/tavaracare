
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
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="py-4 px-4 my-5 bg-gradient-to-r from-primary/10 to-primary/20 rounded-md border-l-4 border-primary text-center shadow-md"
    >
      <span className="text-sm font-medium text-primary-700">
        New section: {title}
      </span>
    </motion.div>
  );
};
