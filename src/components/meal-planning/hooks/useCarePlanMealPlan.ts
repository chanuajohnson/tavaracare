
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
      toast.success('Meal plan created');
    },
    onError: (error) => {
      toast.error('Failed to create meal plan');
      console.error('Error creating meal plan:', error);
    }
  });

  const addMealMutation = useMutation({
    mutationFn: (params: { mealPlanId: string; recipeId: string; mealType: string; scheduledFor: string }) =>
      mealPlanService.addMealToPlan(params.mealPlanId, params.recipeId, params.mealType, params.scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans', carePlanId] });
      toast.success('Recipe added to meal plan');
    },
    onError: (error) => {
      toast.error('Failed to add recipe to meal plan');
      console.error('Error adding recipe:', error);
    }
  });

  const createGroceryListMutation = useMutation({
    mutationFn: (title: string) => mealPlanService.createGroceryList(carePlanId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists', carePlanId] });
      toast.success('Grocery list created');
    },
    onError: (error) => {
      toast.error('Failed to create grocery list');
      console.error('Error creating grocery list:', error);
    }
  });

  return {
    mealPlans,
    groceryLists,
    isLoading: mealPlansLoading || groceryListsLoading,
    createMealPlanMutation,
    addMealMutation,
    createGroceryListMutation,
  };
};
