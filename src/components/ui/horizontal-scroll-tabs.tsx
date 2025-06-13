
import React, { createContext, useContext } from "react";
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

// Context for tabs
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a HorizontalTabs provider");
  }
  return context;
};

// Main HorizontalTabs component that provides context
interface HorizontalTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const HorizontalTabs: React.FC<HorizontalTabsProps> = ({
  value,
  onValueChange,
  children,
  className
}) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Tabs list component
interface HorizontalTabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const HorizontalTabsList: React.FC<HorizontalTabsListProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("border-b border-border", className)}>
      <div className="flex overflow-x-auto scrollbar-hide">
        <div className="flex space-x-1 p-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// Individual tab trigger
interface HorizontalTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const HorizontalTabsTrigger: React.FC<HorizontalTabsTriggerProps> = ({
  value,
  children,
  className
}) => {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={() => onValueChange(value)}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap px-4 py-2",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </Button>
  );
};

// Tab content component
interface HorizontalTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const HorizontalTabsContent: React.FC<HorizontalTabsContentProps> = ({
  value,
  children,
  className
}) => {
  const { value: activeValue } = useTabsContext();
  
  if (activeValue !== value) {
    return null;
  }

  return (
    <div className={cn("mt-6", className)}>
      {children}
    </div>
  );
};
