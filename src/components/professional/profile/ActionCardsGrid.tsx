
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Award, Users, ChevronDown, ChevronUp } from "lucide-react";

interface ActionCardsGridProps {
  isTrainingExpanded: boolean;
  onToggleTraining: () => void;
}

export const ActionCardsGrid = ({ isTrainingExpanded, onToggleTraining }: ActionCardsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Work Logs</h3>
              <p className="text-sm text-muted-foreground">Log your hours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow" 
        onClick={onToggleTraining}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Training</h3>
              <p className="text-sm text-muted-foreground">Continue learning</p>
            </div>
            <div className="text-primary">
              {isTrainingExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Community</h3>
              <p className="text-sm text-muted-foreground">Connect with peers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
