
import React from "react";
import HeroVideo from "@/components/HeroVideo";
import { EnvironmentInfo } from "@/components/debug/EnvironmentInfo";
import { SupabaseDebugger } from "@/components/debug/SupabaseDebugger";

const Index = () => {
  const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

  return (
    <div className="min-h-screen w-full">
      <HeroVideo />
      
      {isDebug && (
        <div className="mt-12 space-y-6 border-t pt-8 container mx-auto px-4">
          <h2 className="text-2xl font-semibold">Debug Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <EnvironmentInfo />
            <SupabaseDebugger />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            These tools are only visible when ?debug=true is added to the URL
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
