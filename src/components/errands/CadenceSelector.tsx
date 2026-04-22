import React from 'react';
import { cn } from '@/lib/utils';

export type Cadence = 'weekly' | 'biweekly' | 'monthly' | 'one_time';

interface CadenceSelectorProps {
  value: Cadence;
  onChange: (value: Cadence) => void;
}

const OPTIONS: { value: Cadence; label: string; sub: string }[] = [
  { value: 'weekly', label: 'Weekly', sub: 'every week' },
  { value: 'biweekly', label: 'Biweekly', sub: 'every 2 weeks' },
  { value: 'monthly', label: 'Monthly', sub: 'every month' },
  { value: 'one_time', label: 'One-time', sub: 'single delivery' },
];

export const CadenceSelector: React.FC<CadenceSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-4 py-2 rounded-full border text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-foreground border-border hover:border-primary/50'
            )}
          >
            <div>{opt.label}</div>
            <div className={cn('text-xs', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
              {opt.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export const cadenceLabel = (c: Cadence): string => {
  switch (c) {
    case 'weekly':
      return 'every week';
    case 'biweekly':
      return 'every 2 weeks';
    case 'monthly':
      return 'every month';
    case 'one_time':
      return 'one-time';
  }
};
