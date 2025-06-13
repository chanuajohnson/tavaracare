
import React from "react";
import { HorizontalTabs, HorizontalTabsList, HorizontalTabsTrigger, HorizontalTabsContent } from "@/components/ui/horizontal-scroll-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pill, ChefHat, Shield, FileText } from "lucide-react";
import { ProfessionalScheduleView } from "@/components/professional/ProfessionalScheduleView";
import { MedicationDashboard } from "@/components/professional/MedicationDashboard";
import { CarePlanMealPlanner } from "@/components/meal-planning/CarePlanMealPlanner";
import { CertificateUpload } from "@/components/professional/CertificateUpload";

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
  loading,
  onCertificateUploadSuccess 
}: CarePlanTabsProps) => {
  return (
    <HorizontalTabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <HorizontalTabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
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
        <HorizontalTabsTrigger value="admin-assist" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Admin Assist</span>
        </HorizontalTabsTrigger>
        <HorizontalTabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Documents</span>
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

      <HorizontalTabsContent value="admin-assist" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Administrative Assistance
            </CardTitle>
            <CardDescription>
              Tools and resources to help with administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Care Plan Documentation</h3>
                      <p className="text-sm text-muted-foreground">Generate care reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Compliance Tracking</h3>
                      <p className="text-sm text-muted-foreground">Monitor compliance status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Task Management</h3>
                      <p className="text-sm text-muted-foreground">Organize admin tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </HorizontalTabsContent>

      <HorizontalTabsContent value="documents" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Document Management
            </CardTitle>
            <CardDescription>
              Upload and manage your professional documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CertificateUpload onUploadSuccess={onCertificateUploadSuccess} />
          </CardContent>
        </Card>
      </HorizontalTabsContent>
    </HorizontalTabs>
  );
};
