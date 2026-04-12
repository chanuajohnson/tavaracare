import React, { useState } from "react";
import { PRODUCTION_BASE_URL } from '@/utils/urlConstants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, CheckCircle, Settings, BookOpen, ClipboardCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DailyChecklist } from "@/components/professional/DailyChecklist";

export const AdminAssistantCard = () => {
  const [showChecklist, setShowChecklist] = useState(false);

  return (
    <>
      <Card className="w-full">
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
            {/* Nurse Handbook & SOP */}
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Nurse Handbook & SOP</h3>
                    <p className="text-sm text-muted-foreground">Standard operating procedures</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 gap-2" asChild>
                  <a href={`${PRODUCTION_BASE_URL}/documents/Tavara_Nurse_Handbook.pdf`} target="_blank" rel="noopener noreferrer" download="Tavara_Nurse_Handbook.pdf">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Handbook
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Daily Care Checklist */}
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Daily Care Checklist</h3>
                    <p className="text-sm text-muted-foreground">Interactive shift checklist & log</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="default" size="sm" className="flex-1 gap-2" onClick={() => setShowChecklist(true)}>
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Open Checklist
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="https://tavaracare.lovable.app/documents/Tavara_Daily_Checklist.pdf" target="_blank" rel="noopener noreferrer" download="Tavara_Daily_Checklist.pdf">
                      <FileText className="h-3.5 w-3.5" />
                      PDF
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                    <CheckCircle className="h-6 w-6 text-primary" />
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
                    <Settings className="h-6 w-6 text-primary" />
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

      {/* Daily Checklist Dialog */}
      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Daily Care Checklist
            </DialogTitle>
          </DialogHeader>
          <DailyChecklist />
        </DialogContent>
      </Dialog>
    </>
  );
};
