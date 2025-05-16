
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getModuleStatus } from '@/utils/moduleInitTracker';
import { getCurrentPhase } from '@/utils/appBootstrap';
import { isDebugMode, collectDiagnostics, toggleDebugMode } from '@/utils/prodDebug';
import { Skeleton } from "@/components/ui/skeleton";

export function InitializationDebugger() {
  const [moduleStatus, setModuleStatus] = useState<Record<string, boolean>>({});
  const [bootPhase, setBootPhase] = useState('');
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(false);
  
  useEffect(() => {
    // Check if debug mode is enabled
    setDebugEnabled(isDebugMode());
    
    // Initial data fetch
    refreshData();
    
    // Set up polling
    const interval = setInterval(refreshData, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const refreshData = () => {
    setIsLoading(true);
    
    try {
      // Get module status
      const status = getModuleStatus();
      setModuleStatus(status);
      
      // Get boot phase
      setBootPhase(getCurrentPhase());
      
      // Get full diagnostics
      const diags = collectDiagnostics();
      setDiagnostics(diags);
    } catch (error) {
      console.error('Error refreshing debug data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleDebug = () => {
    const newState = !debugEnabled;
    toggleDebugMode(newState);
    setDebugEnabled(newState);
  };
  
  const handleForceInit = () => {
    if (window.React) {
      window.reactInitialized = true;
      refreshData();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Initialization Debugger
        </CardTitle>
        <CardDescription>
          Monitor application initialization status and phases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="w-full">
            <TabsTrigger value="status" className="flex-1">Status</TabsTrigger>
            <TabsTrigger value="timing" className="flex-1">Timing</TabsTrigger>
            <TabsTrigger value="diagnostics" className="flex-1">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Current Boot Phase</h3>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <Badge>
                  {bootPhase || 'Unknown'}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Module Status</h3>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                Object.entries(moduleStatus).map(([module, status]) => (
                  <div key={module} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <div className="font-medium text-xs">{module}</div>
                    <Badge variant={status ? "default" : "outline"}>
                      {status ? 'Ready' : 'Pending'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={refreshData} variant="outline" size="sm" className="flex-1">
                Refresh
              </Button>
              <Button 
                onClick={handleToggleDebug} 
                variant={debugEnabled ? "default" : "outline"} 
                size="sm"
                className="flex-1"
              >
                {debugEnabled ? 'Disable Debug' : 'Enable Debug'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="timing" className="space-y-4 pt-4">
            <div className="bg-muted/50 rounded-md p-3">
              <h3 className="text-sm font-medium mb-2">Initialization Events</h3>
              {window.tavaraInitTiming?.events ? (
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {window.tavaraInitTiming.events.map((event, i) => (
                    <div key={i} className="grid grid-cols-2 text-xs bg-background p-1 rounded">
                      <span>{event.event}</span>
                      <span className="text-right font-mono">{event.elapsed}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No timing events recorded</p>
              )}
            </div>
            
            <div className="bg-muted/50 rounded-md p-3">
              <h3 className="text-sm font-medium mb-2">Bootstrap Phases</h3>
              {window.bootstrapTiming ? (
                <div className="space-y-1">
                  {Object.entries(window.bootstrapTiming).map(([phase, time]) => (
                    <div key={phase} className="grid grid-cols-2 text-xs bg-background p-1 rounded">
                      <span>{phase}</span>
                      <span className="text-right font-mono">{time}ms</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No bootstrap timing recorded</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="diagnostics" className="space-y-4 pt-4">
            <div className="bg-muted/50 rounded-md p-3 overflow-hidden">
              <h3 className="text-sm font-medium mb-2">System Information</h3>
              {isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <pre className="text-xs overflow-x-auto bg-background p-2 rounded">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleForceInit} variant="outline" size="sm" className="flex-1">
                Force React Init Flag
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="flex-1">
                Reload Page
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between">
        <span>Add ?debug=true to your URL to enable detailed debug logs</span>
        <span>Current URL: {typeof window !== 'undefined' ? window.location.pathname : ''}</span>
      </CardFooter>
    </Card>
  );
}
