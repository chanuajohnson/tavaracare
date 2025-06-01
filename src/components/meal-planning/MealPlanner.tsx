
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import RecipeBrowser from './RecipeBrowser';
import DateSelector from './components/DateSelector';
import MealTypeSelector, { mealTypes } from './components/MealTypeSelector';
import FeatureCard from './components/FeatureCard';
import { useMealPlan } from './hooks/useMealPlan';

interface MealPlannerProps {
  carePlanId: string;
}

export const MealPlanner = ({ carePlanId }: MealPlannerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { mealPlan, createMealPlanMutation } = useMealPlan(carePlanId, selectedDate);

  const handleRecipeSelect = (recipe: any) => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }
    if (!selectedMealType) {
      toast.error("Please select a meal type first");
      return;
    }
    
    createMealPlanMutation.mutate({ 
      recipe, 
      selectedMealType, 
      selectedDate 
    });
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="planner">Meal Planner</TabsTrigger>
          <TabsTrigger value="recipes">Recipe Library</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DateSelector
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              isCalendarOpen={isCalendarOpen}
              setIsCalendarOpen={setIsCalendarOpen}
            />
            <MealTypeSelector
              selectedMealType={selectedMealType}
              setSelectedMealType={setSelectedMealType}
              selectedDate={selectedDate}
            />
            <FeatureCard />
          </div>

          {selectedDate && selectedMealType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select a Recipe</h3>
              <div className="w-full overflow-x-auto">
                <RecipeBrowser 
                  category={selectedMealType}
                  onSelectRecipe={handleRecipeSelect}
                />
              </div>
            </div>
          )}

          {selectedDate && mealPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Meal Plan for {format(selectedDate, 'MMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {mealTypes.map((type) => {
                    const meals = mealPlan.meal_plan_items.filter(
                      (item: any) => item.meal_type === type.value
                    );

                    return (
                      <div key={type.value} className="space-y-2">
                        <h4 className="font-medium text-sm">{type.label}</h4>
                        {meals.length > 0 ? (
                          <div className="space-y-2">
                            {meals.map((meal: any) => (
                              <div key={meal.id} className="flex items-center gap-2 text-sm">
                                <ChefHat className="h-4 w-4 shrink-0" />
                                <span className="truncate">{meal.recipe.title}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No meals planned</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recipes">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Browse our collection of recipes and add them to your meal plan.</p>
              <div className="w-full overflow-x-auto">
                <RecipeBrowser 
                  onSelectRecipe={handleRecipeSelect}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Coming soon: Get personalized meal suggestions based on your preferences and dietary requirements.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealPlanner;
