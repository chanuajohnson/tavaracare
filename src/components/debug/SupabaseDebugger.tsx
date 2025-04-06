
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  debugSupabaseConnection, 
  getEnvironmentInfo, 
  supabase 
} from "@/lib/supabase";
import { AlertCircle, Check, Database, RefreshCw, X } from "lucide-react";

export function SupabaseDebugger() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    try {
      setIsChecking(true);
      setConnectionStatus('checking');
      
      // Get environment info
      const environmentInfo = getEnvironmentInfo();
      setEnvInfo(environmentInfo);
      
      // Check connection
      const result = await debugSupabaseConnection();
      setDebugInfo(result);
      
      if (result.connected) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (err) {
      console.error('Error checking Supabase connection:', err);
      setConnectionStatus('error');
      setDebugInfo({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-4 w-4" />
            Supabase Connection Diagnostics
          </CardTitle>
          <Badge variant={connectionStatus === 'connected' ? "default" : connectionStatus === 'checking' ? "outline" : "destructive"} 
                 className={connectionStatus === 'connected' ? "bg-green-500 hover:bg-green-600" : ""}>
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'checking' ? 'Checking...' : 'Error'}
          </Badge>
        </div>
        <CardDescription>
          Diagnose Supabase connection issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Info */}
        <div className="bg-muted/50 rounded-md p-3">
          <h3 className="text-sm font-medium mb-2">Environment</h3>
          {envInfo ? (
            <div className="space-y-1 text-sm">
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium">Mode:</span>
                <span className="col-span-2">{envInfo.environment}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium">Supabase URL:</span>
                <span className="col-span-2">{envInfo.supabaseUrl}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium">Using Fallbacks:</span>
                <span className="col-span-2">
                  {envInfo.usingFallbacks ? (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Yes - Not Recommended</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">No</Badge>
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Loading environment info...</div>
          )}
        </div>
        
        {/* Connection Status */}
        {connectionStatus === 'connected' ? (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle>Connection Successful</AlertTitle>
            <AlertDescription>
              Successfully connected to the Supabase project.
            </AlertDescription>
          </Alert>
        ) : connectionStatus === 'error' ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {debugInfo?.message || "Could not connect to Supabase."}
              
              <div className="mt-2 text-sm">
                <strong>Possible solutions:</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>Check that your .env file contains the correct Supabase URL and anon key</li>
                  <li>Ensure you've copied .env.development.example to .env.development</li>
                  <li>Verify your Supabase project is active</li>
                  <li>Check your browser console for more detailed error messages</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertTitle>Checking Connection</AlertTitle>
            <AlertDescription>
              Verifying connection to Supabase...
            </AlertDescription>
          </Alert>
        )}
        
        {/* Error Details */}
        {connectionStatus === 'error' && debugInfo && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h3 className="text-sm font-medium mb-2 text-red-700">Error Details</h3>
            <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-[200px]">
              {JSON.stringify(debugInfo.details, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={checkConnection} 
          disabled={isChecking}
          variant="outline"
          className="w-full"
          size="sm"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking Connection...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-Check Connection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
