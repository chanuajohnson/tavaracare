
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { GroceryItem } from "@/services/mealPlanService";

interface DeleteGroceryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groceryItem: GroceryItem;
  onConfirm: () => void;
}

export const DeleteGroceryItemDialog = ({ open, onOpenChange, groceryItem, onConfirm }: DeleteGroceryItemDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Grocery Item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "<strong>{groceryItem.item_name}</strong>"? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
