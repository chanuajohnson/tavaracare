
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MealPlanItem } from "@/services/mealPlanService";

interface EditMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealItem: MealPlanItem;
  onSave: (updates: { serving_size?: number; notes?: string }) => void;
}

export const EditMealDialog = ({ open, onOpenChange, mealItem, onSave }: EditMealDialogProps) => {
  const [servingSize, setServingSize] = useState(mealItem.serving_size?.toString() || '1');
  const [notes, setNotes] = useState(mealItem.notes || '');

  const handleSave = () => {
    const updates: { serving_size?: number; notes?: string } = {};
    
    const parsedServingSize = parseInt(servingSize);
    if (!isNaN(parsedServingSize) && parsedServingSize > 0) {
      updates.serving_size = parsedServingSize;
    }
    
    if (notes.trim() !== mealItem.notes) {
      updates.notes = notes.trim() || null;
    }
    
    onSave(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Meal Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-name">Recipe</Label>
            <Input 
              id="recipe-name"
              value={mealItem.recipe.title} 
              readOnly 
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="serving-size">Serving Size</Label>
            <Input
              id="serving-size"
              type="number"
              min="1"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              placeholder="1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add dietary restrictions, preparation notes, or other comments..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
