import React from "react";
import { HorizontalTabs, HorizontalTabsList, HorizontalTabsTrigger, HorizontalTabsContent } from "@/components/ui/horizontal-scroll-tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pill, ChefHat, Shield, FileText, Upload, Settings } from "lucide-react";
import { ProfessionalScheduleView } from "@/components/professional/ProfessionalScheduleView";
import { MedicationDashboard } from "@/components/professional/MedicationDashboard";
import { CarePlanMealPlanner } from "@/components/meal-planning/CarePlanMealPlanner";
import { CertificateUpload } from "@/components/professional/CertificateUpload";
import { DocumentManager } from "@/components/professional/DocumentManager";

interface CarePlanTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedCarePlanId?: string;
  selectedCarePlan?: any;
  loading: boolean;
  onCertificateUploadSuccess: () => void;
  showCarePlanTabs?: boolean;
}

export const CarePlanTabs = ({ 
  activeTab, 
  onTabChange, 
  selectedCarePlanId, 
  selectedCarePlan, 
  loading,
  onCertificateUploadSuccess,
  showCarePlanTabs = true
}: CarePlanTabsProps) => {
  const carePlanTabs = [
    {
      value: "schedule",
      icon: Calendar,
      label: "Schedule"
    },
    {
      value: "medications", 
      icon: Pill,
      label: "Medications"
    },
    {
      value: "meals",
      icon: ChefHat, 
      label: "Meal Planning"
    }
  ];

  const adminTabs = [
    {
      value: "admin-assist",
      icon: Shield,
      label: "Admin Assist"
    },
    {
      value: "documents",
      icon: FileText,
      label: "Documents"
    }
  ];

  const tabsToShow = showCarePlanTabs ? [...carePlanTabs, ...adminTabs] : adminTabs;
  const gridCols = showCarePlanTabs ? "grid-cols-5" : "grid-cols-2";

  return (
    <HorizontalTabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <HorizontalTabsList className={`grid w-full lg:${gridCols} ${gridCols}`}>
        {tabsToShow.map((tab) => (
          <HorizontalTabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </HorizontalTabsTrigger>
        ))}
      </HorizontalTabsList>

      {showCarePlanTabs && (
        <>
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
                  carePlanId={selectedCarePlanId || ''}
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
              carePlanId={selectedCarePlanId || ''}
              carePlanTitle={selectedCarePlan?.carePlan?.title || 'Care Plan'}
            />
          </HorizontalTabsContent>
        </>
      )}

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

      {/* ENHANCED DOCUMENTS TAB WITH ACCORDION LAYOUT AND TARGET IDS */}
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
            <Accordion type="single" collapsible defaultValue="upload" className="w-full">
              <AccordionItem value="upload">
                <AccordionTrigger className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Documents
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div id="upload-documents">
                    <CertificateUpload onUploadSuccess={onCertificateUploadSuccess} />
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="manage">
                <AccordionTrigger className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Documents
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div id="manage-documents">
                    <DocumentManager onDocumentDeleted={onCertificateUploadSuccess} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </HorizontalTabsContent>
    </HorizontalTabs>
  );
};
