
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Edit2, Trash2, RotateCcw, Clock, Users } from "lucide-react";
import { MealPlanItem } from "@/services/mealPlanService";
import { EditMealDialog } from "./EditMealDialog";
import { ReplaceMealDialog } from "./ReplaceMealDialog";

interface MealItemCardProps {
  mealItem: MealPlanItem;
  onDelete: (itemId: string) => void;
  onUpdate: (itemId: string, updates: { serving_size?: number; notes?: string }) => void;
  onReplace: (itemId: string, newRecipeId: string) => void;
}

export const MealItemCard = ({ mealItem, onDelete, onUpdate, onReplace }: MealItemCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove "${mealItem.recipe.title}" from your meal plan?`)) {
      onDelete(mealItem.id);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">{mealItem.recipe.title}</h4>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplaceDialog(true)}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {mealItem.recipe.description && (
            <p className="text-xs text-muted-foreground mb-2">{mealItem.recipe.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            {mealItem.recipe.preparation_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{mealItem.recipe.preparation_time} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{mealItem.serving_size || 1} serving{(mealItem.serving_size || 1) > 1 ? 's' : ''}</span>
            </div>
          </div>

          {mealItem.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
              <p className="text-xs text-blue-700">{mealItem.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EditMealDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mealItem={mealItem}
        onSave={(updates) => {
          onUpdate(mealItem.id, updates);
          setShowEditDialog(false);
        }}
      />

      <ReplaceMealDialog
        open={showReplaceDialog}
        onOpenChange={setShowReplaceDialog}
        currentMealItem={mealItem}
        onReplace={(newRecipeId) => {
          onReplace(mealItem.id, newRecipeId);
          setShowReplaceDialog(false);
        }}
      />
    </>
  );
};
