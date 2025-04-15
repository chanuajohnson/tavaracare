
import React from 'react';
import { SupabaseDebugger } from './SupabaseDebugger';
import { ChatDebugger } from './ChatDebugger';

export function DebugDashboard() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Tavara Debug Dashboard</h1>
      <p className="text-muted-foreground">
        Use this dashboard to troubleshoot and test your configuration. 
        Add <code className="bg-muted px-1 py-0.5 rounded">?debug=true</code> to any URL 
        to enable detailed console logging.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <SupabaseDebugger />
        <ChatDebugger />
      </div>
      
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-sm">
        <h3 className="font-semibold text-amber-800">Debug Mode Instructions</h3>
        <p className="text-amber-700 mt-1">
          This debugging dashboard helps identify and fix connection issues between your 
          frontend application and Supabase edge functions. Use the tools above to:
        </p>
        <ul className="list-disc ml-5 mt-2 text-amber-700 space-y-1">
          <li>Test connectivity to your Supabase project</li>
          <li>Verify the chat-gpt edge function is working</li>
          <li>Check if required database tables exist</li>
          <li>Review and reset chat configuration</li>
          <li>Manage local storage data</li>
        </ul>
      </div>
    </div>
  );
}
