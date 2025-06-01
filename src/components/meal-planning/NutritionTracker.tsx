
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, Target, TrendingUp } from "lucide-react";

interface NutritionTrackerProps {
  carePlanId: string;
}

export const NutritionTracker = ({ carePlanId }: NutritionTrackerProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Nutrition Tracking</h2>
      </div>

      {/* Coming Soon */}
      <Card className="p-8 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nutrition Tracking Coming Soon</h3>
        <p className="text-muted-foreground mb-4">
          Track nutritional goals, dietary requirements, and meal analytics for your care plan.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 border rounded-lg">
            <Target className="h-6 w-6 mx-auto text-blue-500 mb-2" />
            <h4 className="font-medium">Daily Goals</h4>
            <p className="text-sm text-muted-foreground">Set and track daily nutrition targets</p>
          </div>
          <div className="p-4 border rounded-lg">
            <TrendingUp className="h-6 w-6 mx-auto text-green-500 mb-2" />
            <h4 className="font-medium">Progress Tracking</h4>
            <p className="text-sm text-muted-foreground">Monitor nutrition progress over time</p>
          </div>
          <div className="p-4 border rounded-lg">
            <BarChart3 className="h-6 w-6 mx-auto text-purple-500 mb-2" />
            <h4 className="font-medium">Meal Analytics</h4>
            <p className="text-sm text-muted-foreground">Analyze nutritional content of meals</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
