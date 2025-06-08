
import React from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FabProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  label?: string;
}

export const Fab = ({
  icon = <HelpCircle className="h-5 w-5" />,
  onClick,
  className,
  position = "bottom-right",
  label,
}: FabProps) => {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed z-50 rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all hover:scale-105",
        positionClasses[position],
        className
      )}
      aria-label={label || "Action button"}
    >
      {icon}
    </Button>
  );
};
