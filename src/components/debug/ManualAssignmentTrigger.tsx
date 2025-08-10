import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAssignments } from '@/hooks/useAdminAssignments';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const ManualAssignmentTrigger: React.FC = () => {
  const [userId, setUserId] = useState('f4e4ee41-4232-420f-a493-adecab839a95');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { triggerAutomaticAssignment } = useAdminAssignments();

  const handleDirectFunctionCall = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('=== ENHANCED MANUAL FUNCTION TEST STARTED ===');
      console.log('Testing with user ID:', userId);
      console.log('Timestamp:', new Date().toISOString());
      
      // Enhanced diagnostics
      console.log('Supabase client check:', {
        clientExists: !!supabase,
        functionsExists: !!supabase.functions,
        invokeMethod: typeof supabase.functions?.invoke
      });
      
      // ---- DEBUG: start ----
      const payload = { familyUserId: String(userId ?? '') };
      const json = JSON.stringify(payload);
      console.log(
        '[manual-assign][client] invoking',
        'payload=', payload,
        'jsonLen=', json.length,
        'userId=', userId,
        'typeof userId=', typeof userId
      );
      // ---- DEBUG: end ----
      
      const startTime = Date.now();
      
      const functionCall = await supabase.functions.invoke('automatic-caregiver-assignment', {
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Origin': 'ManualAssignmentTrigger'
        }
      });
      
      console.log('[manual-assign][client] invoke result:', { data: functionCall.data, error: functionCall.error });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('=== ENHANCED FUNCTION CALL RESULT ===');
      console.log('Duration:', duration, 'ms');
      console.log('Full response:', functionCall);
      console.log('Data:', functionCall.data);
      console.log('Error:', functionCall.error);
      console.log('Response type:', typeof functionCall.data);
      
      const enhancedResult = {
        ...functionCall,
        metadata: {
          duration,
          timestamp: new Date().toISOString(),
          userId: userId,
          testOrigin: 'ManualAssignmentTrigger'
        }
      };
      
      setResult(enhancedResult);
      
      if (functionCall.error) {
        console.error('Function error details:', {
          message: functionCall.error.message,
          context: functionCall.error.context,
          details: functionCall.error.details
        });
        toast.error(`Function error: ${functionCall.error.message}`);
      } else if (functionCall.data?.success) {
        toast.success(`Assignment function executed successfully! Created ${functionCall.data.assignments?.length || 0} assignments`);
      } else {
        toast.warning('Function executed but no assignments created');
      }
      
    } catch (error) {
      console.error('Exception during function call:', error);
      const errorResult = { 
        exception: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userId: userId
      };
      setResult(errorResult);
      toast.error(`Exception: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnectivity = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('=== CONNECTIVITY TEST STARTED ===');
      
      // Test basic Supabase connectivity
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .limit(1);
        
      console.log('Basic Supabase query test:', { profiles, profileError });
      
      // Test edge function OPTIONS request (CORS preflight)
      const optionsResponse = await fetch(`https://cpdfmyemjrefnhddyrck.supabase.co/functions/v1/automatic-caregiver-assignment`, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type,authorization'
        }
      });
      
      console.log('OPTIONS request test:', {
        status: optionsResponse.status,
        statusText: optionsResponse.statusText,
        headers: Object.fromEntries(optionsResponse.headers.entries())
      });
      
      setResult({
        connectivity: {
          supabaseQuery: { profiles, profileError },
          optionsRequest: {
            status: optionsResponse.status,
            statusText: optionsResponse.statusText,
            ok: optionsResponse.ok
          }
        }
      });
      
      toast.success('Connectivity test completed - check console for details');
      
    } catch (error) {
      console.error('Connectivity test error:', error);
      setResult({ connectivityError: error.message });
      toast.error(`Connectivity test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHookTrigger = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('=== HOOK TRIGGER TEST STARTED ===');
      const result = await triggerAutomaticAssignment({ family_user_id: userId });
      console.log('Hook result:', result);
      setResult({ hookResult: result });
    } catch (error) {
      console.error('Hook error:', error);
      setResult({ hookError: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Manual Assignment Function Test</CardTitle>
        <CardDescription>
          Debug the automatic caregiver assignment function for specific users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Family User ID</label>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter family user ID"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button 
            onClick={handleDirectFunctionCall}
            disabled={isLoading || !userId}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Testing...' : 'Test Function'}
          </Button>
          
          <Button 
            onClick={handleHookTrigger}
            disabled={isLoading || !userId}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isLoading ? 'Testing...' : 'Test via Hook'}
          </Button>
          
          <Button 
            onClick={testConnectivity}
            disabled={isLoading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            {isLoading ? 'Testing...' : 'Test Connectivity'}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              {result.error || result.exception ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : result.data?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <h3 className="font-medium">Test Result:</h3>
            </div>
            <div className="bg-gray-50 border rounded-md p-4">
              <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            
            {result.data?.success && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">
                  ✅ Assignment creation successful! Created {result.data.assignments?.length || 0} assignments.
                </p>
              </div>
            )}
            
            {result.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">
                  ❌ Error: {result.error.message}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};