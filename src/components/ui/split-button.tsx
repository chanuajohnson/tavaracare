
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitButtonAction {
  text: string;
  variant: 'default' | 'secondary' | 'outline';
  onClick: () => void;
  disabled?: boolean;
}

interface SplitButtonProps {
  primaryAction: SplitButtonAction;
  secondaryAction: SplitButtonAction;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  primaryAction,
  secondaryAction,
  className,
  size = 'default'
}) => {
  return (
    <div className={cn('flex', className)}>
      <Button
        variant={primaryAction.variant}
        size={size}
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled}
        className="rounded-r-none border-r-0 flex-1"
      >
        {primaryAction.text}
      </Button>
      <Button
        variant={secondaryAction.variant}
        size={size}
        onClick={secondaryAction.onClick}
        disabled={secondaryAction.disabled}
        className="rounded-l-none px-2 border-l border-l-border/50"
      >
        {secondaryAction.text}
      </Button>
    </div>
  );
};
