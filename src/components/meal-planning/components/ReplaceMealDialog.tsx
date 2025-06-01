
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MealPlanItem, Recipe } from "@/services/mealPlanService";
import RecipeBrowser from "../RecipeBrowser";

interface ReplaceMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMealItem: MealPlanItem;
  onReplace: (newRecipeId: string) => void;
}

export const ReplaceMealDialog = ({ open, onOpenChange, currentMealItem, onReplace }: ReplaceMealDialogProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleReplace = () => {
    if (selectedRecipe) {
      onReplace(selectedRecipe.id);
      setSelectedRecipe(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Replace Meal</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Currently: <strong>{currentMealItem.recipe.title}</strong>
          </p>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="text-sm font-medium mb-3">Select a new recipe:</h3>
          <RecipeBrowser 
            category={currentMealItem.meal_type}
            onSelectRecipe={handleRecipeSelect}
          />
          
          {selectedRecipe && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-900">
                Selected: {selectedRecipe.title}
              </p>
              {selectedRecipe.description && (
                <p className="text-xs text-blue-700 mt-1">{selectedRecipe.description}</p>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleReplace}
            disabled={!selectedRecipe}
          >
            Replace Meal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
