
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileCheck, Shield, User, AlertTriangle, Upload } from "lucide-react";
import { useState } from "react";

export function DocumentsTab() {
  const [documents, setDocuments] = useState([
    { name: "Certificate of Character", date: "2023-11-05", status: "verified", type: "certificate" },
    { name: "Professional License", date: "2023-10-15", status: "pending", type: "certification" },
    { name: "ID Document", date: "2023-09-20", status: "verified", type: "id" },
    { name: "Reference Letter", date: "2023-08-12", status: "verified", type: "reference" }
  ]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Important Documents</CardTitle>
        <CardDescription>
          Submit and manage your professional documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning Section */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Required Documents</h3>
              <p className="text-sm text-amber-700 mt-1">
                Please submit the following documents to complete your profile:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-amber-700 space-y-1">
                <li>National ID or Passport</li>
                <li>Professional certifications</li>
                <li>Certificate of Character</li>
                <li>Reference letters (at least 2)</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Document Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ID Documents */}
          <Card className="border-dashed border-2 hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-1">ID Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your national ID or passport
                </p>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload ID
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Certifications */}
          <Card className="border-dashed border-2 hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-50 p-3 rounded-full mb-3">
                  <FileCheck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-1">Certifications</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your professional certifications
                </p>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Certificate of Character */}
          <Card className="border-dashed border-2 hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-50 p-3 rounded-full mb-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-1">Certificate of Character</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your certificate of character
                </p>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* References */}
          <Card className="border-dashed border-2 hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-50 p-3 rounded-full mb-3">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-medium mb-1">References</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload reference letters (at least 2)
                </p>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload References
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
