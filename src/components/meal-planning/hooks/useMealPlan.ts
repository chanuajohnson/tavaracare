
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { toast } from "sonner";

export const useMealPlan = (carePlanId: string, selectedDate: Date | undefined) => {
  const queryClient = useQueryClient();

  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ['meal-plan', carePlanId, selectedDate],
    queryFn: async () => {
      if (!selectedDate || !carePlanId) return null;
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (
            *,
            recipe:recipes (*)
          )
        `)
        .eq('care_plan_id', carePlanId)
        .eq('start_date', format(selectedDate, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data?.[0];
    },
    enabled: !!selectedDate && !!carePlanId,
  });

  const createMealPlanMutation = useMutation({
    mutationFn: async (params: { recipe: any; selectedMealType: string; selectedDate: Date }) => {
      const { recipe, selectedMealType, selectedDate } = params;
      if (!selectedDate || !selectedMealType || !carePlanId) return;

      // Create or get meal plan
      let mealPlanId = mealPlan?.id;
      
      if (!mealPlanId) {
        const { data: newPlan, error: planError } = await supabase
          .from('meal_plans')
          .insert({
            care_plan_id: carePlanId,
            start_date: format(selectedDate, 'yyyy-MM-dd'),
            end_date: format(selectedDate, 'yyyy-MM-dd'),
            title: `Meal Plan for ${format(selectedDate, 'MMM d, yyyy')}`
          })
          .select()
          .single();

        if (planError) throw planError;
        mealPlanId = newPlan.id;
      }

      // Add meal plan item
      const { error: itemError } = await supabase
        .from('meal_plan_items')
        .insert({
          meal_plan_id: mealPlanId,
          recipe_id: recipe.id,
          meal_type: selectedMealType,
          scheduled_for: format(selectedDate, 'yyyy-MM-dd')
        });

      if (itemError) throw itemError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast.success('Meal added to plan');
    },
    onError: (error) => {
      toast.error('Failed to add meal to plan');
      console.error('Error:', error);
    }
  });

  return { mealPlan, isLoading, createMealPlanMutation };
};
