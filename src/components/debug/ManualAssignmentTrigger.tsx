import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAssignments } from '@/hooks/useAdminAssignments';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const ManualAssignmentTrigger: React.FC = () => {
  const [userId, setUserId] = useState('f4e4ee41-4232-420f-a493-adecab839a95');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { triggerAutomaticAssignment } = useAdminAssignments();

  const handleDirectFunctionCall = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('=== MANUAL FUNCTION TEST STARTED ===');
      console.log('Testing with user ID:', userId);
      
      const functionCall = await supabase.functions.invoke('automatic-caregiver-assignment', {
        body: { familyUserId: userId }
      });
      
      console.log('=== FUNCTION CALL RESULT ===');
      console.log('Full response:', functionCall);
      console.log('Data:', functionCall.data);
      console.log('Error:', functionCall.error);
      
      setResult(functionCall);
      
      if (functionCall.error) {
        toast.error(`Function error: ${functionCall.error.message}`);
      } else if (functionCall.data?.success) {
        toast.success('Assignment function executed successfully!');
      } else {
        toast.warning('Function executed but no assignments created');
      }
      
    } catch (error) {
      console.error('Exception during function call:', error);
      setResult({ exception: error.message });
      toast.error(`Exception: ${error.message}`);
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
        
        <div className="flex gap-2">
          <Button 
            onClick={handleDirectFunctionCall}
            disabled={isLoading || !userId}
            variant="default"
          >
            {isLoading ? 'Testing...' : 'Test Direct Function Call'}
          </Button>
          
          <Button 
            onClick={handleHookTrigger}
            disabled={isLoading || !userId}
            variant="outline"
          >
            {isLoading ? 'Testing...' : 'Test via Hook'}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Test Result:</h3>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};