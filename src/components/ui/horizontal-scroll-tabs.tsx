
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface HorizontalScrollTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const HorizontalScrollTabs: React.FC<HorizontalScrollTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className
}) => {
  return (
    <div className={cn("border-b border-border", className)}>
      <div className="flex overflow-x-auto scrollbar-hide">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
