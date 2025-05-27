
import React, { lazy, Suspense } from 'react';
import { LucideProps } from 'lucide-react';

// Fallback component for when icons are loading
const IconFallback = () => (
  <div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
);

// Map of commonly used icons - add more as needed
const iconComponents = {
  // Essential icons used in critical components
  MessageSquare: lazy(() => import('lucide-react/dist/esm/icons/message-square')),
  X: lazy(() => import('lucide-react/dist/esm/icons/x')),
  Send: lazy(() => import('lucide-react/dist/esm/icons/send')),
  HelpCircle: lazy(() => import('lucide-react/dist/esm/icons/help-circle')),
  FileQuestion: lazy(() => import('lucide-react/dist/esm/icons/file-question')),
  Phone: lazy(() => import('lucide-react/dist/esm/icons/phone')),
  Loader2: lazy(() => import('lucide-react/dist/esm/icons/loader-2')),
  Calendar: lazy(() => import('lucide-react/dist/esm/icons/calendar')),
  Clock: lazy(() => import('lucide-react/dist/esm/icons/clock')),
  ChevronDown: lazy(() => import('lucide-react/dist/esm/icons/chevron-down')),
  ChevronUp: lazy(() => import('lucide-react/dist/esm/icons/chevron-up')),
} as const;

// Create a type that only allows the exact keys from our iconComponents object
type IconName = keyof typeof iconComponents;

interface LazyIconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

// The LazyIcon component that will be used throughout the app
export const LazyIcon: React.FC<LazyIconProps> = ({ name, ...props }) => {
  const IconComponent = iconComponents[name];

  return (
    <Suspense fallback={<IconFallback />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

// Export individual wrapped icons for direct import with proper typing
export const MessageSquareIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"MessageSquare" as const} {...props} />
);

export const XIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"X" as const} {...props} />
);

export const SendIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"Send" as const} {...props} />
);

export const HelpCircleIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"HelpCircle" as const} {...props} />
);

export const FileQuestionIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"FileQuestion" as const} {...props} />
);

export const PhoneIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"Phone" as const} {...props} />
);

export const Loader2Icon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"Loader2" as const} {...props} />
);

export const CalendarIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"Calendar" as const} {...props} />
);

export const ClockIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"Clock" as const} {...props} />
);

export const ChevronDownIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"ChevronDown" as const} {...props} />
);

export const ChevronUpIcon: React.FC<Omit<LucideProps, 'ref'>> = (props) => (
  <LazyIcon name={"ChevronUp" as const} {...props} />
);
