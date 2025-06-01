
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Calendar, ShoppingCart, BarChart3, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { fetchCarePlanById } from "@/services/care-plans/carePlanService";
import { useAuth } from "@/components/providers/AuthProvider";
import { MealPlanner } from "@/components/meal-planning/MealPlanner";
import { RecipeLibrary } from "@/components/meal-planning/RecipeLibrary";
import { GroceryListManager } from "@/components/meal-planning/GroceryListManager";
import { NutritionTracker } from "@/components/meal-planning/NutritionTracker";

export default function MealManagementPage() {
  const { carePlanId } = useParams<{ carePlanId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [carePlanTitle, setCarePlanTitle] = useState('');
  const [activeTab, setActiveTab] = useState('meal-planning');

  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Care Management", path: "/family/care-management" },
    { label: "Meals", path: `/family/care-management/${carePlanId}/meals` },
  ];

  useEffect(() => {
    if (carePlanId) {
      loadCarePlanData();
    }
  }, [carePlanId]);

  const loadCarePlanData = async () => {
    if (!carePlanId) return;
    
    try {
      const carePlan = await fetchCarePlanById(carePlanId);
      if (carePlan) {
        setCarePlanTitle(carePlan.title);
      }
    } catch (error) {
      console.error("Error loading care plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!carePlanId) {
    return <div>Invalid care plan ID</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading meal management...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ChefHat className="h-8 w-8 text-green-500" />
                Meal Management
              </h1>
              {carePlanTitle && (
                <p className="text-muted-foreground mt-2">
                  Managing meals for: {carePlanTitle}
                </p>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="meal-planning" className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Meal Planning
              </TabsTrigger>
              <TabsTrigger value="recipe-library" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recipe Library
              </TabsTrigger>
              <TabsTrigger value="grocery-lists" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Grocery Lists
              </TabsTrigger>
              <TabsTrigger value="nutrition-tracking" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Nutrition Tracking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meal-planning" className="space-y-6">
              <MealPlanner carePlanId={carePlanId} />
            </TabsContent>

            <TabsContent value="recipe-library" className="space-y-6">
              <RecipeLibrary carePlanId={carePlanId} />
            </TabsContent>

            <TabsContent value="grocery-lists" className="space-y-6">
              <GroceryListManager carePlanId={carePlanId} />
            </TabsContent>

            <TabsContent value="nutrition-tracking" className="space-y-6">
              <NutritionTracker carePlanId={carePlanId} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
