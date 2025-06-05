
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose?: () => void;
  onReset: () => void;
  hideHeader?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onReset,
  hideHeader = false,
}) => {
  if (hideHeader) return null;

  return (
    <div className="flex items-center justify-between border-b p-3">
      <h3 className="font-medium">Tavara Assistant</h3>
      <div className="flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onReset}
          title="Start over"
          className="h-7 w-7"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </Button>
        {onClose && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            title="Close chat"
            className="h-7 w-7"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};
