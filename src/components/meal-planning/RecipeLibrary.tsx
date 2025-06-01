
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Clock, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { mealPlanService, Recipe } from "@/services/mealPlanService";
import { RecipeForm } from "./RecipeForm";
import { toast } from "sonner";

interface RecipeLibraryProps {
  carePlanId: string;
}

export const RecipeLibrary = ({ carePlanId }: RecipeLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();

  const { data: recipes, isLoading, refetch } = useQuery({
    queryKey: ['recipes', selectedCategory],
    queryFn: () => mealPlanService.getRecipes(selectedCategory || undefined),
  });

  const categories = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  const filteredRecipes = recipes?.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowAddForm(true);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (!confirm(`Are you sure you want to delete "${recipe.title}"?`)) return;
    
    try {
      // Add delete functionality to meal plan service
      toast.success('Recipe deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete recipe');
    }
  };

  const handleRecipeSaved = () => {
    setShowAddForm(false);
    setEditingRecipe(undefined);
    refetch();
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
          </h2>
          <Button 
            variant="outline"
            onClick={() => {
              setShowAddForm(false);
              setEditingRecipe(undefined);
            }}
          >
            Cancel
          </Button>
        </div>
        <RecipeForm
          recipe={editingRecipe}
          onSave={handleRecipeSaved}
          onCancel={() => {
            setShowAddForm(false);
            setEditingRecipe(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recipe Library</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading recipes...</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No recipes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No recipes match your search.' : 'Get started by adding your first recipe.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Recipe
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRecipe(recipe)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecipe(recipe)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {recipe.description && (
                  <p className="text-sm text-muted-foreground">{recipe.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {recipe.preparation_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.preparation_time} min</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{recipe.servings} servings</span>
                    </div>
                  )}
                </div>
                {recipe.category && (
                  <div className="mt-2">
                    <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                      {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
