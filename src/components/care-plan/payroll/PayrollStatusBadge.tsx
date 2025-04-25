
import React from 'react';
import { cn } from "@/lib/utils";

interface PayrollStatusBadgeProps {
  status: string;
  className?: string;
}

export const PayrollStatusBadge: React.FC<PayrollStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      getStatusStyles(),
      className
    )}>
      {status}
    </span>
  );
};
