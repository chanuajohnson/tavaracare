
import { supabase } from "@/lib/supabase";

export interface MealPlan {
  id: string;
  care_plan_id: string;
  title: string;
  start_date: string;
  end_date: string;
  created_at: string;
  meal_plan_items: MealPlanItem[];
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  meal_type: string;
  scheduled_for: string;
  serving_size?: number;
  notes?: string;
  created_at: string;
  recipe: Recipe;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  preparation_time: number;
  servings: number;
  ingredients: any;
  instructions: string[];
}

export interface GroceryList {
  id: string;
  care_plan_id: string;
  title: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  grocery_list_items: GroceryListItem[];
}

export interface GroceryListItem {
  id: string;
  grocery_list_id: string;
  item_name: string;
  quantity?: string;
  category?: string;
  purchased: boolean;
  purchased_by?: string;
  purchased_at?: string;
  notes?: string;
  created_at: string;
}

export const mealPlanService = {
  // Get meal plans for a specific care plan
  async getMealPlansForCarePlan(carePlanId: string): Promise<MealPlan[]> {
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
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new meal plan
  async createMealPlan(carePlanId: string, title: string, startDate: string, endDate: string): Promise<MealPlan> {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        care_plan_id: carePlanId,
        title,
        start_date: startDate,
        end_date: endDate
      })
      .select()
      .single();

    if (error) throw error;
    
    // Return with empty meal_plan_items array since it's a new meal plan
    return {
      ...data,
      meal_plan_items: []
    };
  },

  // Add meal to plan
  async addMealToPlan(mealPlanId: string, recipeId: string, mealType: string, scheduledFor: string): Promise<void> {
    const { error } = await supabase
      .from('meal_plan_items')
      .insert({
        meal_plan_id: mealPlanId,
        recipe_id: recipeId,
        meal_type: mealType,
        scheduled_for: scheduledFor,
        serving_size: 1 // Default serving size
      });

    if (error) throw error;
  },

  // Delete meal plan item
  async deleteMealPlanItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('meal_plan_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // Update meal plan item
  async updateMealPlanItem(itemId: string, updates: { serving_size?: number; notes?: string }): Promise<void> {
    const { error } = await supabase
      .from('meal_plan_items')
      .update(updates)
      .eq('id', itemId);

    if (error) throw error;
  },

  // Replace meal plan item recipe
  async replaceMealPlanItem(itemId: string, newRecipeId: string): Promise<void> {
    const { error } = await supabase
      .from('meal_plan_items')
      .update({ recipe_id: newRecipeId })
      .eq('id', itemId);

    if (error) throw error;
  },

  // Get grocery lists for a care plan
  async getGroceryListsForCarePlan(carePlanId: string): Promise<GroceryList[]> {
    const { data, error } = await supabase
      .from('grocery_lists')
      .select(`
        *,
        grocery_list_items (*)
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create grocery list
  async createGroceryList(carePlanId: string, title: string): Promise<GroceryList> {
    const { data, error } = await supabase
      .from('grocery_lists')
      .insert({
        care_plan_id: carePlanId,
        title,
        created_by: (await supabase.auth.getUser()).data.user?.id!
      })
      .select()
      .single();

    if (error) throw error;
    
    // Return with empty grocery_list_items array since it's a new grocery list
    return {
      ...data,
      grocery_list_items: []
    };
  },

  // Add item to grocery list
  async addGroceryItem(groceryListId: string, itemName: string, quantity?: string, category?: string): Promise<void> {
    const { error } = await supabase
      .from('grocery_list_items')
      .insert({
        grocery_list_id: groceryListId,
        item_name: itemName,
        quantity,
        category
      });

    if (error) throw error;
  },

  // Mark grocery item as purchased
  async markItemPurchased(itemId: string, purchased: boolean): Promise<void> {
    const updateData: any = { purchased };
    
    if (purchased) {
      updateData.purchased_by = (await supabase.auth.getUser()).data.user?.id;
      updateData.purchased_at = new Date().toISOString();
    } else {
      updateData.purchased_by = null;
      updateData.purchased_at = null;
    }

    const { error } = await supabase
      .from('grocery_list_items')
      .update(updateData)
      .eq('id', itemId);

    if (error) throw error;
  },

  // Get recipes
  async getRecipes(category?: string): Promise<Recipe[]> {
    let query = supabase.from('recipes').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};
