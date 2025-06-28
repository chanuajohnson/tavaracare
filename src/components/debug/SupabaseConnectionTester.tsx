
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { getEnvironmentInfo } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const SupabaseConnectionTester: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    client: 'success' | 'error' | 'pending';
    database: 'success' | 'error' | 'pending';
    functions: 'success' | 'error' | 'pending';
    auth: 'success' | 'error' | 'pending';
  }>({
    client: 'pending',
    database: 'pending',
    functions: 'pending',
    auth: 'pending'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [details, setDetails] = useState<any>({});

  const runConnectionTests = async () => {
    setIsRunning(true);
    const results = { ...testResults };
    const testDetails: any = {};

    try {
      // Test 1: Supabase Client Configuration
      console.log('Testing Supabase client configuration...');
      const envInfo = getEnvironmentInfo();
      const clientTest = supabase ? 'success' : 'error';
      results.client = clientTest;
      testDetails.client = {
        configured: !!supabase,
        environment: envInfo.environment,
        supabaseUrl: envInfo.supabaseUrl,
        projectId: envInfo.projectId,
        usingFallbacks: envInfo.usingFallbacks
      };

      // Test 2: Database Connection
      console.log('Testing database connection...');
      try {
        const { data: dbTest, error: dbError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        results.database = dbError ? 'error' : 'success';
        testDetails.database = {
          connected: !dbError,
          error: dbError?.message,
          response: dbTest ? 'Data received' : 'No data'
        };
      } catch (err: any) {
        results.database = 'error';
        testDetails.database = {
          connected: false,
          error: err.message
        };
      }

      // Test 3: Edge Functions
      console.log('Testing edge functions...');
      try {
        const { data: funcTest, error: funcError } = await supabase.functions.invoke('whatsapp-verify', {
          body: {
            action: 'test_connection'
          }
        });
        
        results.functions = funcError ? 'error' : 'success';
        testDetails.functions = {
          reachable: !funcError,
          error: funcError?.message,
          response: funcTest ? 'Function responded' : 'No response'
        };
      } catch (err: any) {
        results.functions = 'error';
        testDetails.functions = {
          reachable: false,
          error: err.message
        };
      }

      // Test 4: Auth Session
      console.log('Testing auth session...');
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        results.auth = authError ? 'error' : 'success';
        testDetails.auth = {
          sessionExists: !!authData?.session,
          userExists: !!authData?.session?.user,
          error: authError?.message
        };
      } catch (err: any) {
        results.auth = 'error';
        testDetails.auth = {
          sessionExists: false,
          error: err.message
        };
      }

    } catch (error: any) {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed');
    }

    setTestResults(results);
    setDetails(testDetails);
    setIsRunning(false);

    // Show summary toast
    const passedTests = Object.values(results).filter(r => r === 'success').length;
    const totalTests = Object.keys(results).length;
    
    if (passedTests === totalTests) {
      toast.success(`All ${totalTests} connection tests passed!`);
    } else {
      toast.warning(`${passedTests}/${totalTests} connection tests passed`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Diagnostics</CardTitle>
        <CardDescription>
          Test all aspects of your Supabase connection to identify network issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runConnectionTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run Connection Tests'}
        </Button>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.client)}
              <span className="font-medium">Supabase Client</span>
            </div>
            {getStatusBadge(testResults.client)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.database)}
              <span className="font-medium">Database Connection</span>
            </div>
            {getStatusBadge(testResults.database)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.functions)}
              <span className="font-medium">Edge Functions</span>
            </div>
            {getStatusBadge(testResults.functions)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.auth)}
              <span className="font-medium">Authentication</span>
            </div>
            {getStatusBadge(testResults.auth)}
          </div>
        </div>

        {Object.keys(details).length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Test Details:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
