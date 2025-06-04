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
  user_id: string;
  name: string;
  title?: string; // For backward compatibility
  description?: string;
  status: string;
  is_template: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  grocery_items: GroceryItem[];
}

export interface GroceryItem {
  id: string;
  grocery_list_id: string;
  category: string;
  item_name: string;
  description?: string;
  brand?: string;
  quantity?: string;
  size_weight?: string;
  estimated_price?: number;
  store_section?: string;
  substitutes?: string;
  notes?: string;
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  preferred_store?: string;
  priority: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroceryShare {
  id: string;
  grocery_list_id: string;
  share_token: string;
  shared_by: string;
  expires_at?: string;
  can_edit: boolean;
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
        serving_size: 1
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
        grocery_items (*)
      `)
      .eq('care_plan_id', carePlanId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Type cast the urgency_level to ensure it matches our interface
    const typedData = data?.map(list => ({
      ...list,
      grocery_items: list.grocery_items?.map((item: any) => ({
        ...item,
        urgency_level: item.urgency_level as 'low' | 'medium' | 'high' | 'urgent'
      })) || []
    }));
    
    return typedData || [];
  },

  // Create grocery list with enhanced fields
  async createGroceryList(carePlanId: string, name: string, description?: string): Promise<GroceryList> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('grocery_lists')
      .insert({
        care_plan_id: carePlanId,
        user_id: user.id,
        name,
        description,
        title: name, // For backward compatibility
        created_by: user.id,
        status: 'active',
        is_template: false,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      grocery_items: []
    };
  },

  // Add enhanced grocery item
  async addGroceryItem(
    groceryListId: string, 
    itemData: {
      category: string;
      item_name: string;
      description?: string;
      brand?: string;
      quantity?: string;
      size_weight?: string;
      estimated_price?: number;
      store_section?: string;
      substitutes?: string;
      notes?: string;
      urgency_level?: 'low' | 'medium' | 'high' | 'urgent';
      preferred_store?: string;
      priority?: number;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('grocery_items')
      .insert({
        grocery_list_id: groceryListId,
        category: itemData.category || 'Food Goods',
        item_name: itemData.item_name,
        description: itemData.description,
        brand: itemData.brand,
        quantity: itemData.quantity,
        size_weight: itemData.size_weight,
        estimated_price: itemData.estimated_price,
        store_section: itemData.store_section,
        substitutes: itemData.substitutes,
        notes: itemData.notes,
        urgency_level: itemData.urgency_level || 'medium',
        preferred_store: itemData.preferred_store,
        priority: itemData.priority || 1
      });

    if (error) throw error;
  },

  // Bulk add grocery items
  async bulkAddGroceryItems(
    groceryListId: string,
    items: Array<{
      category: string;
      item_name: string;
      description?: string;
      brand?: string;
      quantity?: string;
      size_weight?: string;
      estimated_price?: number;
      store_section?: string;
      substitutes?: string;
      notes?: string;
      urgency_level?: 'low' | 'medium' | 'high' | 'urgent';
      preferred_store?: string;
      priority?: number;
    }>
  ): Promise<{ success: number; errors: string[] }> {
    const chunkSize = 50;
    let successCount = 0;
    const errors: string[] = [];

    // Process items in chunks to avoid database limits
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      
      const insertData = chunk.map(item => ({
        grocery_list_id: groceryListId,
        category: item.category || 'Food Goods',
        item_name: item.item_name,
        description: item.description || null,
        brand: item.brand || null,
        quantity: item.quantity || null,
        size_weight: item.size_weight || null,
        estimated_price: item.estimated_price || null,
        store_section: item.store_section || null,
        substitutes: item.substitutes || null,
        notes: item.notes || null,
        urgency_level: item.urgency_level || 'medium',
        preferred_store: item.preferred_store || null,
        priority: item.priority || 1,
        is_completed: false
      }));

      try {
        const { error } = await supabase
          .from('grocery_items')
          .insert(insertData);

        if (error) {
          errors.push(`Chunk ${Math.floor(i / chunkSize) + 1}: ${error.message}`);
        } else {
          successCount += chunk.length;
        }
      } catch (error) {
        errors.push(`Chunk ${Math.floor(i / chunkSize) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success: successCount, errors };
  },

  // Update grocery item
  async updateGroceryItem(itemId: string, updates: Partial<GroceryItem>): Promise<void> {
    const { error } = await supabase
      .from('grocery_items')
      .update(updates)
      .eq('id', itemId);

    if (error) throw error;
  },

  // Mark grocery item as completed/purchased
  async markItemCompleted(itemId: string, completed: boolean): Promise<void> {
    const { error } = await supabase
      .from('grocery_items')
      .update({ is_completed: completed })
      .eq('id', itemId);

    if (error) throw error;
  },

  // Delete grocery item
  async deleteGroceryItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('grocery_items')
      .delete()
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
  },

  // Generate grocery list from meal plan items
  async generateGroceryListFromMealPlan(
    carePlanId: string, 
    mealPlanIds: string[], 
    listName: string
  ): Promise<GroceryList> {
    // Create the grocery list first
    const groceryList = await this.createGroceryList(carePlanId, listName, 'Generated from meal plans');

    // Get meal plan items with recipes
    const { data: mealPlanItems, error } = await supabase
      .from('meal_plan_items')
      .select(`
        *,
        recipe:recipes (*)
      `)
      .in('meal_plan_id', mealPlanIds);

    if (error) throw error;

    // Extract and aggregate ingredients
    const ingredientMap = new Map<string, {
      category: string;
      quantity: string;
      notes: string[];
    }>();

    mealPlanItems?.forEach((item: any) => {
      if (item.recipe?.ingredients) {
        const ingredients = Array.isArray(item.recipe.ingredients) 
          ? item.recipe.ingredients 
          : JSON.parse(item.recipe.ingredients);

        ingredients.forEach((ingredient: any) => {
          const key = ingredient.name?.toLowerCase() || ingredient;
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.notes.push(`${item.recipe.title} (${item.serving_size || 1} servings)`);
          } else {
            ingredientMap.set(key, {
              category: ingredient.category || 'Food Goods',
              quantity: ingredient.quantity || '',
              notes: [`${item.recipe.title} (${item.serving_size || 1} servings)`]
            });
          }
        });
      }
    });

    // Add ingredients as grocery items
    const itemsToAdd = Array.from(ingredientMap.entries()).map(([itemName, details]) => ({
      category: details.category,
      item_name: itemName,
      quantity: details.quantity,
      notes: details.notes.join('; '),
      urgency_level: 'medium' as const
    }));

    if (itemsToAdd.length > 0) {
      await this.bulkAddGroceryItems(groceryList.id, itemsToAdd);
    }

    return groceryList;
  }
};
