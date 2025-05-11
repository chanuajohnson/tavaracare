
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Calendar, Clock, ActivitySquare, ArrowRight } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

export const MealPlanningSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Meal Planning</CardTitle>
        <CardDescription>Plan and manage meals, recipes, and nutrition</CardDescription>
      </CardHeader>
      <CardContent>
        <Link to="/family/features-overview">
          <Button variant="default" className="w-full mb-6">
            Learn More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <UpvoteFeatureButton featureTitle="Meal Planning" className="w-full mb-6" buttonText="Upvote this Feature" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Select Date
              </CardTitle>
              <CardDescription>Pick a date for meal planning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <p className="text-gray-500 text-sm">Pick a date</p>
              </div>
              <Link to="/family/features-overview" className="block mt-4">
                <Button variant="secondary" className="w-full">Select Date</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Meal Types
              </CardTitle>
              <CardDescription>Choose meal types for planning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-500">Morning Drink</p>
                  <p className="text-gray-500">Morning Snack</p>
                  <p className="text-gray-500">Afternoon Snack</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-500">Breakfast</p>
                  <p className="text-gray-500">Lunch</p>
                  <p className="text-gray-500">Dinner</p>
                </div>
              </div>
              <Link to="/family/features-overview" className="block mt-4">
                <Button variant="secondary" className="w-full">Select Types</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChefHat className="h-5 w-5 text-primary" />
                Recipe Library
              </CardTitle>
              <CardDescription>Browse and manage recipes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/family/features-overview">
                <Button variant="secondary" className="w-full">View Library</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ActivitySquare className="h-5 w-5 text-primary" />
                Suggestions
              </CardTitle>
              <CardDescription>Get personalized meal suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/family/features-overview">
                <Button variant="secondary" className="w-full">View Suggestions</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
