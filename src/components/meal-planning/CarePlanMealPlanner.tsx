
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, ShoppingCart, Plus, Check, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { mealPlanService, MealPlan, GroceryList } from "@/services/mealPlanService";
import RecipeBrowser from './RecipeBrowser';
import DateSelector from './components/DateSelector';
import MealTypeSelector, { mealTypes } from './components/MealTypeSelector';

interface CarePlanMealPlannerProps {
  carePlanId: string;
  carePlanTitle: string;
}

export const CarePlanMealPlanner = ({ carePlanId, carePlanTitle }: CarePlanMealPlannerProps) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGroceryListTitle, setNewGroceryListTitle] = useState('');

  useEffect(() => {
    loadData();
  }, [carePlanId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mealPlansData, groceryListsData] = await Promise.all([
        mealPlanService.getMealPlansForCarePlan(carePlanId),
        mealPlanService.getGroceryListsForCarePlan(carePlanId)
      ]);
      setMealPlans(mealPlansData);
      setGroceryLists(groceryListsData);
    } catch (error) {
      console.error('Error loading meal planning data:', error);
      toast.error('Failed to load meal planning data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = async (recipe: any) => {
    if (!selectedDate || !selectedMealType) {
      toast.error('Please select a date and meal type first');
      return;
    }

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Find or create meal plan for the selected date
      let mealPlan = mealPlans.find(mp => mp.start_date === dateStr);
      
      if (!mealPlan) {
        mealPlan = await mealPlanService.createMealPlan(
          carePlanId,
          `Meal Plan for ${format(selectedDate, 'MMM d, yyyy')}`,
          dateStr,
          dateStr
        );
      }

      await mealPlanService.addMealToPlan(
        mealPlan.id,
        recipe.id,
        selectedMealType,
        selectedDate.toISOString()
      );

      toast.success('Recipe added to meal plan');
      loadData();
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast.error('Failed to add recipe to meal plan');
    }
  };

  const handleCreateGroceryList = async () => {
    if (!newGroceryListTitle.trim()) {
      toast.error('Please enter a grocery list title');
      return;
    }

    try {
      await mealPlanService.createGroceryList(carePlanId, newGroceryListTitle);
      setNewGroceryListTitle('');
      toast.success('Grocery list created');
      loadData();
    } catch (error) {
      console.error('Error creating grocery list:', error);
      toast.error('Failed to create grocery list');
    }
  };

  const handleToggleItemPurchased = async (itemId: string, purchased: boolean) => {
    try {
      await mealPlanService.markItemPurchased(itemId, !purchased);
      toast.success(purchased ? 'Item marked as unpurchased' : 'Item marked as purchased');
      loadData();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            Meal Planning for {carePlanTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="planner" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="planner">Meal Planner</TabsTrigger>
              <TabsTrigger value="grocery">Grocery Lists</TabsTrigger>
              <TabsTrigger value="recipes">Recipe Library</TabsTrigger>
            </TabsList>

            <TabsContent value="planner" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {selectedDate && selectedMealType && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Select a Recipe</h3>
                  <RecipeBrowser 
                    category={selectedMealType}
                    onSelectRecipe={handleAddRecipe}
                  />
                </div>
              )}

              {/* Display existing meal plans */}
              {mealPlans.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Meal Plans</h3>
                  {mealPlans.map((mealPlan) => (
                    <Card key={mealPlan.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{mealPlan.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {mealTypes.map((type) => {
                            const meals = mealPlan.meal_plan_items.filter(
                              (item) => item.meal_type === type.value
                            );

                            return (
                              <div key={type.value} className="space-y-2">
                                <h4 className="font-medium text-sm">{type.label}</h4>
                                {meals.length > 0 ? (
                                  <div className="space-y-2">
                                    {meals.map((meal) => (
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
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="grocery" className="space-y-4 mt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="New grocery list title..."
                  value={newGroceryListTitle}
                  onChange={(e) => setNewGroceryListTitle(e.target.value)}
                />
                <Button onClick={handleCreateGroceryList}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create List
                </Button>
              </div>

              {groceryLists.map((list) => (
                <Card key={list.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      {list.title}
                      <Badge variant="outline">{list.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {list.grocery_list_items.length > 0 ? (
                      <div className="space-y-2">
                        {list.grocery_list_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleItemPurchased(item.id, item.purchased)}
                            >
                              {item.purchased ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <div className="h-4 w-4 border rounded" />
                              )}
                            </Button>
                            <span className={item.purchased ? 'line-through text-muted-foreground' : ''}>
                              {item.item_name}
                            </span>
                            {item.quantity && (
                              <Badge variant="secondary">{item.quantity}</Badge>
                            )}
                            {item.category && (
                              <Badge variant="outline">{item.category}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No items in this list yet</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recipes" className="space-y-4 mt-6">
              <RecipeBrowser onSelectRecipe={handleAddRecipe} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
