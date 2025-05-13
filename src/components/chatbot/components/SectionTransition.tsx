
import React from 'react';
import { SlideIn } from '@/components/framer';

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
    <SlideIn
      direction="up" 
      duration={0.5}
      className="py-4 px-4 my-5 bg-gradient-to-r from-primary/10 to-primary/20 rounded-md border-l-4 border-primary text-center shadow-md"
    >
      <span className="text-sm font-medium text-primary-700">
        New section: {title}
      </span>
    </SlideIn>
  );
};
