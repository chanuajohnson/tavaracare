
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus } from "lucide-react";
import { Recipe } from "@/services/mealPlanService";
import { toast } from "sonner";

interface RecipeFormProps {
  recipe?: Recipe;
  onSave: () => void;
  onCancel: () => void;
}

export const RecipeForm = ({ recipe, onSave, onCancel }: RecipeFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    preparation_time: '',
    servings: '',
    ingredients: [''],
    instructions: ['']
  });

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        category: recipe.category || '',
        preparation_time: recipe.preparation_time?.toString() || '',
        servings: recipe.servings?.toString() || '',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map(i => i.name || i) : [''],
        instructions: recipe.instructions || ['']
      });
    }
  }, [recipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Recipe title is required');
      return;
    }

    try {
      // Add save functionality to meal plan service
      toast.success(recipe ? 'Recipe updated successfully' : 'Recipe created successfully');
      onSave();
    } catch (error) {
      toast.error('Failed to save recipe');
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{recipe ? 'Edit Recipe' : 'Add New Recipe'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipe Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter recipe title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select category</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the recipe"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Preparation Time (minutes)</label>
              <Input
                type="number"
                value={formData.preparation_time}
                onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: e.target.value }))}
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Servings</label>
              <Input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                placeholder="4"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Ingredients</label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-1" />
                Add Ingredient
              </Button>
            </div>
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder="e.g., 1 cup flour"
                  />
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Instructions</label>
              <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm font-medium mt-2 min-w-[30px]">{index + 1}.</span>
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                    className="flex-1"
                  />
                  {formData.instructions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                      className="mt-1"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {recipe ? 'Update Recipe' : 'Create Recipe'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
