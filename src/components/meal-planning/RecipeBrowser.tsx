
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Clock, Users, BookOpen } from "lucide-react";

// Updated Recipe type to match the actual database structure
type Recipe = {
  id: string;
  title: string;
  description: string;
  category: string;
  preparation_time: number;
  servings: number;
  ingredients: any; // Using 'any' for the JSON type from the database
  instructions: string[];
};

interface RecipeBrowserProps {
  category?: string;
  onSelectRecipe?: (recipe: Recipe) => void;
}

const RecipeBrowser = ({ category, onSelectRecipe }: RecipeBrowserProps) => {
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', category],
    queryFn: async () => {
      const query = supabase.from('recipes').select('*');
      if (category) {
        query.eq('category', category);
      }
      const { data, error } = await query;
      if (error) throw error;
      // Cast the data to Recipe[] to handle the JSON fields correctly
      return data as unknown as Recipe[];
    },
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading recipes...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipes?.map((recipe) => (
        <Card 
          key={recipe.id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelectRecipe?.(recipe)}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg">{recipe.title}</CardTitle>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {recipe.preparation_time} mins
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {recipe.servings} servings
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecipeBrowser;
