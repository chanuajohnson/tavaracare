
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Calendar, ShoppingCart, BarChart3, Plus, ArrowLeft } from "lucide-react";
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
  const [carePlan, setCarePlan] = useState<any>(null);
  const [carePlanTitle, setCarePlanTitle] = useState('');
  const [activeTab, setActiveTab] = useState('meal-planning');
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Care Management", path: "/family/care-management" },
    { label: "Care Plan", path: `/family/care-management/${carePlanId}` },
    { label: "Meals", path: `/family/care-management/${carePlanId}/meals` },
  ];

  useEffect(() => {
    if (carePlanId && user) {
      loadCarePlanData();
    }
  }, [carePlanId, user]);

  const loadCarePlanData = async () => {
    if (!carePlanId) {
      setError('No care plan ID provided');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Loading care plan data for ID:', carePlanId);
      const carePlanData = await fetchCarePlanById(carePlanId);
      
      if (carePlanData) {
        console.log('Care plan loaded successfully:', carePlanData);
        setCarePlan(carePlanData);
        setCarePlanTitle(carePlanData.title);
        setError(null);
      } else {
        console.log('Care plan not found');
        setError('Care plan not found');
      }
    } catch (error) {
      console.error("Error loading care plan:", error);
      setError('Failed to load care plan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!carePlanId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Invalid Care Plan</h2>
            <p className="text-muted-foreground mb-4">No care plan ID provided.</p>
            <Button onClick={() => navigate('/family/care-management')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Care Management
            </Button>
          </Card>
        </div>
      </div>
    );
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

  if (error || !carePlan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <Card className="p-8 text-center mt-8">
            <h2 className="text-2xl font-semibold mb-2">Care Plan Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The requested care plan could not be found.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/family/care-management')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Care Management
              </Button>
              <Button variant="outline" onClick={loadCarePlanData}>
                Try Again
              </Button>
            </div>
          </Card>
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
              <p className="text-muted-foreground mt-2">
                Managing meals for: {carePlanTitle}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate(`/family/care-management/${carePlanId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Care Plan
            </Button>
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
