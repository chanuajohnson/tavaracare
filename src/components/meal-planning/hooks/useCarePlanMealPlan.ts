
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mealPlanService } from "@/services/mealPlanService";
import { toast } from "sonner";

export const useCarePlanMealPlan = (carePlanId: string) => {
  const queryClient = useQueryClient();

  const { data: mealPlans, isLoading: mealPlansLoading } = useQuery({
    queryKey: ['meal-plans', carePlanId],
    queryFn: () => mealPlanService.getMealPlansForCarePlan(carePlanId),
    enabled: !!carePlanId,
  });

  const { data: groceryLists, isLoading: groceryListsLoading } = useQuery({
    queryKey: ['grocery-lists', carePlanId],
    queryFn: () => mealPlanService.getGroceryListsForCarePlan(carePlanId),
    enabled: !!carePlanId,
  });

  const createMealPlanMutation = useMutation({
    mutationFn: (params: { title: string; startDate: string; endDate: string }) =>
      mealPlanService.createMealPlan(carePlanId, params.title, params.startDate, params.endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans', carePlanId] });
      toast.success('Meal plan created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create meal plan');
      console.error('Error creating meal plan:', error);
    }
  });

  const addMealMutation = useMutation({
    mutationFn: (params: { mealPlanId: string; recipeId: string; mealType: string; scheduledFor: string }) =>
      mealPlanService.addMealToPlan(params.mealPlanId, params.recipeId, params.mealType, params.scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans', carePlanId] });
      toast.success('Recipe added to meal plan successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add recipe to meal plan');
      console.error('Error adding recipe:', error);
    }
  });

  const createGroceryListMutation = useMutation({
    mutationFn: (params: { name: string; description?: string }) => 
      mealPlanService.createGroceryList(carePlanId, params.name, params.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists', carePlanId] });
      toast.success('Grocery list created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create grocery list');
      console.error('Error creating grocery list:', error);
    }
  });

  const addGroceryItemMutation = useMutation({
    mutationFn: (params: { groceryListId: string; itemData: any }) =>
      mealPlanService.addGroceryItem(params.groceryListId, params.itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists', carePlanId] });
      toast.success('Item added to grocery list successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add item to grocery list');
      console.error('Error adding grocery item:', error);
    }
  });

  const bulkAddGroceryItemsMutation = useMutation({
    mutationFn: (params: { groceryListId: string; items: any[] }) =>
      mealPlanService.bulkAddGroceryItems(params.groceryListId, params.items),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists', carePlanId] });
      if (data.errors.length > 0) {
        toast.warning(`Added ${data.success} items with ${data.errors.length} errors`);
      } else {
        toast.success(`Successfully added ${data.success} items to grocery list`);
      }
    },
    onError: (error: any) => {
      toast.error('Failed to bulk upload grocery items');
      console.error('Error bulk uploading items:', error);
    }
  });

  const updateGroceryItemMutation = useMutation({
    mutationFn: (params: { itemId: string; updates: any }) =>
      mealPlanService.updateGroceryItem(params.itemId, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists', carePlanId] });
      toast.success('Item updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update item');
      console.error('Error updating grocery item:', error);
    }
  });

  const deleteGroceryItemMutation = useMutation({
    mutationFn: (itemId: string) => mealPlanService.deleteGroceryItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists', carePlanId] });
      toast.success('Item deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete item');
      console.error('Error deleting grocery item:', error);
    }
  });

  const markItemCompletedMutation = useMutation({
    mutationFn: (params: { itemId: string; completed: boolean }) =>
      mealPlanService.markItemCompleted(params.itemId, params.completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists', carePlanId] });
    },
    onError: (error: any) => {
      toast.error('Failed to update item status');
      console.error('Error updating item status:', error);
    }
  });

  const generateGroceryListMutation = useMutation({
    mutationFn: (params: { mealPlanIds: string[]; listName: string }) =>
      mealPlanService.generateGroceryListFromMealPlan(carePlanId, params.mealPlanIds, params.listName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists', carePlanId] });
      toast.success('Grocery list generated from meal plans successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to generate grocery list from meal plans');
      console.error('Error generating grocery list:', error);
    }
  });

  return {
    mealPlans,
    groceryLists,
    isLoading: mealPlansLoading || groceryListsLoading,
    createMealPlanMutation,
    addMealMutation,
    createGroceryListMutation,
    addGroceryItemMutation,
    bulkAddGroceryItemsMutation,
    updateGroceryItemMutation,
    deleteGroceryItemMutation,
    markItemCompletedMutation,
    generateGroceryListMutation,
  };
};
