
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificateUpload } from "../CertificateUpload";
import { FileText, Settings, User, Shield, CheckCircle } from "lucide-react";

interface PersonalProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: any;
  onCertificateUploadSuccess?: () => void;
}

export const PersonalProfileTabs: React.FC<PersonalProfileTabsProps> = ({
  activeTab,
  onTabChange,
  profile,
  onCertificateUploadSuccess
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="admin-assist" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Admin Assist
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>
              Your professional profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg">{profile?.full_name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Professional Type</label>
                <p className="text-lg">{profile?.professional_type || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Years of Experience</label>
                <p className="text-lg">{profile?.years_of_experience || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Background Check Status</label>
                <p className="text-lg capitalize">{profile?.background_check_status?.replace('_', ' ') || "Not started"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Professional Documents</CardTitle>
            <CardDescription>
              Upload and manage your professional certifications and documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CertificateUpload onUploadSuccess={onCertificateUploadSuccess} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="admin-assist" className="mt-6">
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
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Configure your professional profile settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Settings management coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
