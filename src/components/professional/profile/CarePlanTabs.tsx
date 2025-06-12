
import React from "react";
import { HorizontalTabs, HorizontalTabsList, HorizontalTabsTrigger, HorizontalTabsContent } from "@/components/ui/horizontal-scroll-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pill, ChefHat } from "lucide-react";
import { ProfessionalScheduleView } from "@/components/professional/ProfessionalScheduleView";
import { MedicationDashboard } from "@/components/professional/MedicationDashboard";
import { CarePlanMealPlanner } from "@/components/meal-planning/CarePlanMealPlanner";

interface CarePlanTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedCarePlanId: string;
  selectedCarePlan: any;
  loading: boolean;
  onCertificateUploadSuccess: () => void;
}

export const CarePlanTabs = ({ 
  activeTab, 
  onTabChange, 
  selectedCarePlanId, 
  selectedCarePlan, 
  loading
}: CarePlanTabsProps) => {
  return (
    <HorizontalTabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <HorizontalTabsList className="grid w-full grid-cols-3 lg:grid-cols-3">
        <HorizontalTabsTrigger value="schedule" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Schedule</span>
        </HorizontalTabsTrigger>
        <HorizontalTabsTrigger value="medications" className="flex items-center gap-2">
          <Pill className="h-4 w-4" />
          <span className="hidden sm:inline">Medications</span>
        </HorizontalTabsTrigger>
        <HorizontalTabsTrigger value="meals" className="flex items-center gap-2">
          <ChefHat className="h-4 w-4" />
          <span className="hidden sm:inline">Meal Planning</span>
        </HorizontalTabsTrigger>
      </HorizontalTabsList>

      <HorizontalTabsContent value="schedule" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Schedule
              {selectedCarePlan && (
                <Badge variant="outline" className="ml-2">
                  {selectedCarePlan.carePlan?.title}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Your upcoming shifts and care plan schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfessionalScheduleView 
              carePlanId={selectedCarePlanId}
              loading={loading}
            />
          </CardContent>
        </Card>
      </HorizontalTabsContent>

      <HorizontalTabsContent value="medications" className="space-y-6">
        <MedicationDashboard />
      </HorizontalTabsContent>

      <HorizontalTabsContent value="meals" className="space-y-6">
        <CarePlanMealPlanner 
          carePlanId={selectedCarePlanId}
          carePlanTitle={selectedCarePlan?.carePlan?.title || 'Care Plan'}
        />
      </HorizontalTabsContent>
    </HorizontalTabs>
  );
};
