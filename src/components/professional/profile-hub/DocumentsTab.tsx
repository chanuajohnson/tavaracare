
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Upload } from "lucide-react";
import { useProfileActions } from "@/hooks/professional/useProfileActions";

interface DocumentsTabProps {
  loading: boolean;
  steps: any[];
  setSteps: (steps: any[]) => void;
}

export function DocumentsTab({ loading, steps, setSteps }: DocumentsTabProps) {
  const { handleUploadCertificates } = useProfileActions();
  
  const documentTypes = [
    { 
      title: "Certification", 
      description: "Upload your professional certifications", 
      icon: "📜" 
    },
    { 
      title: "ID Documents", 
      description: "National ID or passport", 
      icon: "🪪" 
    },
    { 
      title: "Character Certificate", 
      description: "Certificate of Character or background check", 
      icon: "📝" 
    },
    { 
      title: "Other Documents", 
      description: "Additional verification documents", 
      icon: "📎" 
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
        <CardDescription>
          Upload your professional documents and certifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">Document Submission</h3>
                <p className="text-xs text-amber-700 mt-1">
                  For security and ease of processing, please email or WhatsApp your documents directly to our team. 
                  Click the upload button below to get submission instructions.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.map((doc, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{doc.icon}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-500">{doc.description}</p>
                      </div>
                    </div>
                    <button 
                      className="text-primary hover:text-primary-600 flex items-center text-sm font-medium"
                      onClick={() => handleUploadCertificates(steps, setSteps)}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
