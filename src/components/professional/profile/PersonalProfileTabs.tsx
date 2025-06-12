
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificateUpload } from "../CertificateUpload";
import { FileText, Settings, User } from "lucide-react";

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
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents
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
