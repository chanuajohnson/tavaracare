
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnvironmentInfo } from "@/integrations/supabase/client";
import { AlertCircle, Database, Server } from "lucide-react";

export function EnvironmentInfo() {
  const envInfo = getEnvironmentInfo();
  const isDev = envInfo.environment === 'development';
  
  return (
    <Card className={`${isDev ? 'border-amber-300' : 'border-green-300'} shadow-sm`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-4 w-4" />
            {isDev ? 'Development' : 'Production'} Environment
          </CardTitle>
          <Badge variant={isDev ? "outline" : "default"} className={isDev ? "bg-amber-50 text-amber-700 border-amber-200" : ""}>
            {envInfo.environment.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          Supabase connection information
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Database URL</div>
              <div className="text-muted-foreground truncate max-w-[300px]">
                {envInfo.supabaseUrl?.substring(0, 30)}...
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Project ID</div>
              <div className="text-muted-foreground">{envInfo.projectId}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
