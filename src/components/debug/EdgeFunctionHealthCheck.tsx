import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'down';
  message: string;
  timestamp: string;
  duration?: number;
  details?: any;
}

export const EdgeFunctionHealthCheck: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<Record<string, HealthCheckResult>>({});
  const [autoRefresh, setAutoRefresh] = useState(false);

  const checkEdgeFunctionHealth = async (functionName: string): Promise<HealthCheckResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`Health check: Testing ${functionName}`);
      
      const response = await supabase.functions.invoke(functionName, {
        body: { healthCheck: true },
        headers: { 'X-Health-Check': 'true' }
      });
      
      const duration = Date.now() - startTime;
      
      if (response.error) {
        return {
          status: 'down',
          message: `Function error: ${response.error.message}`,
          timestamp: new Date().toISOString(),
          duration,
          details: response.error
        };
      }
      
      return {
        status: 'healthy',
        message: `Function responding normally (${duration}ms)`,
        timestamp: new Date().toISOString(),
        duration,
        details: response.data
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        status: 'down',
        message: `Network error: ${error.message}`,
        timestamp: new Date().toISOString(),
        duration,
        details: { error: error.message, stack: error.stack }
      };
    }
  };

  const runHealthChecks = async () => {
    setIsChecking(true);
    
    const functionsToCheck = [
      'automatic-caregiver-assignment'
    ];
    
    const newResults: Record<string, HealthCheckResult> = {};
    
    for (const functionName of functionsToCheck) {
      newResults[functionName] = await checkEdgeFunctionHealth(functionName);
    }
    
    setResults(newResults);
    setIsChecking(false);
  };

  useEffect(() => {
    // Run initial health check
    runHealthChecks();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(runHealthChecks, 30000); // Every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheckResult['status']) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Edge Function Health Monitor
        </CardTitle>
        <CardDescription>
          Real-time monitoring of Supabase Edge Function status and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={runHealthChecks}
            disabled={isChecking}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Run Health Check'}
          </Button>
          
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
          >
            {autoRefresh ? 'Stop Auto-Refresh' : 'Auto-Refresh'}
          </Button>
        </div>

        <div className="space-y-3">
          {Object.entries(results).map(([functionName, result]) => (
            <div key={functionName} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <h3 className="font-medium">{functionName}</h3>
                  {getStatusBadge(result.status)}
                </div>
                <div className="text-sm text-gray-500">
                  {result.duration && `${result.duration}ms`}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">{result.message}</p>
              
              <div className="text-xs text-gray-500">
                Last checked: {new Date(result.timestamp).toLocaleString()}
              </div>
              
              {result.details && (
                <details className="mt-2">
                  <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                    View Details
                  </summary>
                  <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {Object.keys(results).length === 0 && !isChecking && (
          <div className="text-center py-8 text-gray-500">
            No health check results yet. Click "Run Health Check" to start monitoring.
          </div>
        )}
      </CardContent>
    </Card>
  );
};