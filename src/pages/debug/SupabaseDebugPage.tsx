
import React from 'react';
import { SupabaseDebugger } from '@/components/debug/SupabaseDebugger';
import { EnvironmentInfo } from '@/components/debug/EnvironmentInfo';

export default function SupabaseDebugPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Diagnostics</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <EnvironmentInfo />
        <SupabaseDebugger />
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h2 className="text-lg font-medium text-blue-800 mb-2">Developer Instructions</h2>
        <div className="text-sm text-blue-700">
          <p className="mb-2">To set up local development with Supabase:</p>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>Copy <code>.env.development.example</code> to <code>.env.development</code></li>
            <li>Copy <code>.env.production.example</code> to <code>.env.production.local</code> (if needed)</li>
            <li>Fill in your Supabase URL and anon key in these files</li>
            <li>Restart the development server</li>
          </ol>
          
          <p className="mb-2">For production deployments:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ensure GitHub Secrets contain <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code></li>
            <li>The GitHub Actions workflow will use these secrets during the build process</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
