
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Mail, Clock } from "lucide-react";
import { useState } from "react";

export function AdminAssistantTab() {
  const [requests, setRequests] = useState([
    { id: 1, type: "Employment Verification", date: "2023-12-01", status: "completed" },
    { id: 2, type: "Reference Letter", date: "2023-12-15", status: "in-progress" }
  ]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Assistant</CardTitle>
        <CardDescription>
          Request administrative support and documentation for your professional needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <FileText className="h-8 w-8 mb-3 text-primary" />
              <h3 className="font-medium">Request Reference Letter</h3>
              <p className="text-sm text-center text-muted-foreground mt-1">
                Request a professional reference letter for job applications
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Briefcase className="h-8 w-8 mb-3 text-primary" />
              <h3 className="font-medium">Employment Verification</h3>
              <p className="text-sm text-center text-muted-foreground mt-1">
                Request employment verification for official purposes
              </p>
            </CardContent>
          </Card>
        </div>
        
        <h3 className="font-medium mb-3">Request History</h3>
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-md p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  {request.type.includes("Employment") ? 
                    <Briefcase className="h-5 w-5 text-primary" /> : 
                    <FileText className="h-5 w-5 text-primary" />
                  }
                </div>
                <div>
                  <p className="font-medium">{request.type}</p>
                  <p className="text-sm text-gray-500">Requested on {new Date(request.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  request.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  request.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {request.status === 'completed' ? 'Completed' : 
                   request.status === 'in-progress' ? 'In Progress' : 'Pending'}
                </span>
                {request.status === 'completed' && (
                  <Button variant="ghost" size="sm">Download</Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {requests.length === 0 && (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No requests yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Submit a request for administrative documents like reference letters or employment verification.
            </p>
            <Button>
              Create New Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
