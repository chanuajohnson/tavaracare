
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download } from "lucide-react";
import { useState } from "react";

export function DocumentsTab() {
  const [documents, setDocuments] = useState([
    { name: "Certificate of Character", date: "2023-11-05", status: "verified" },
    { name: "Professional License", date: "2023-10-15", status: "pending" },
    { name: "ID Document", date: "2023-09-20", status: "verified" }
  ]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents & Certifications</CardTitle>
        <CardDescription>
          Upload and manage your professional documents and certifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between mb-4">
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </div>
        
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div key={index} className="border rounded-md p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">Uploaded on {new Date(doc.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc.status === 'verified' ? 'bg-green-100 text-green-700' : 
                  doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {documents.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No documents uploaded</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Upload your professional certifications, ID, and other required documents.
            </p>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload First Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
