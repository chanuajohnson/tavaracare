
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import RecipeBrowser from './RecipeBrowser';
import DateSelector from './components/DateSelector';
import MealTypeSelector, { mealTypes } from './components/MealTypeSelector';
import FeatureCard from './components/FeatureCard';
import { MealItemCard } from './components/MealItemCard';
import { useMealPlan } from './hooks/useMealPlan';

interface MealPlannerProps {
  carePlanId: string;
}

export const MealPlanner = ({ carePlanId }: MealPlannerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { 
    mealPlan, 
    createMealPlanMutation,
    deleteMealItemMutation,
    updateMealItemMutation,
    replaceMealItemMutation
  } = useMealPlan(carePlanId, selectedDate);

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

  const handleDeleteMealItem = (itemId: string) => {
    deleteMealItemMutation.mutate(itemId);
  };

  const handleUpdateMealItem = (itemId: string, updates: { serving_size?: number; notes?: string }) => {
    updateMealItemMutation.mutate({ itemId, updates });
  };

  const handleReplaceMealItem = (itemId: string, newRecipeId: string) => {
    replaceMealItemMutation.mutate({ itemId, newRecipeId });
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
                      <div key={type.value} className="space-y-3">
                        <h4 className="font-medium text-sm border-b pb-2">{type.label}</h4>
                        {meals.length > 0 ? (
                          <div className="space-y-3">
                            {meals.map((meal: any) => (
                              <MealItemCard
                                key={meal.id}
                                mealItem={meal}
                                onDelete={handleDeleteMealItem}
                                onUpdate={handleUpdateMealItem}
                                onReplace={handleReplaceMealItem}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md text-center">
                            No meals planned
                          </p>
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
