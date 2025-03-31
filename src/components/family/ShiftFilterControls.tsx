
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { CalendarDays, Filter, RefreshCw } from "lucide-react";

interface ShiftFilterControlsProps {
  currentFilter: 'all' | 'assigned' | 'unassigned' | 'completed';
  onFilterChange: (filter: 'all' | 'assigned' | 'unassigned' | 'completed') => void;
  onRefresh: () => void;
}

export function ShiftFilterControls({ 
  currentFilter, 
  onFilterChange, 
  onRefresh 
}: ShiftFilterControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter shifts:</span>
      </div>
      
      <Select
        value={currentFilter}
        onValueChange={(value) => 
          onFilterChange(value as 'all' | 'assigned' | 'unassigned' | 'completed')
        }
      >
        <SelectTrigger className="h-8 w-[180px]">
          <SelectValue placeholder="Filter shifts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All shifts</SelectItem>
          <SelectItem value="assigned">Assigned shifts</SelectItem>
          <SelectItem value="unassigned">Unassigned shifts</SelectItem>
          <SelectItem value="completed">Completed shifts</SelectItem>
        </SelectContent>
      </Select>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 ml-auto"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh shifts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
