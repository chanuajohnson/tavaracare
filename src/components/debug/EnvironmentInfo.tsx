
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnvironmentInfo } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function EnvironmentInfo() {
  const envInfo = getEnvironmentInfo();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Environment Information</CardTitle>
        <CardDescription>
          Current configuration and environment details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Environment:</span>
            <Badge variant={envInfo.environment === 'production' ? "default" : "outline"}>
              {envInfo.environment}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Supabase Project:</span>
            <span className="font-mono text-xs text-muted-foreground">{envInfo.supabaseUrl}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Project ID:</span>
            <span className="font-mono text-xs">{envInfo.projectId}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Using Fallbacks:</span>
            {envInfo.usingFallbacks ? (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Yes</Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">No</Badge>
            )}
          </div>
        </div>

        {envInfo.usingFallbacks && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <InfoIcon className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              This project is using fallback Supabase credentials. For full functionality, please ensure proper environment variables are set.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        OpenAI integration requires proper Supabase edge function configuration
      </CardFooter>
    </Card>
  );
}
