
import React from 'react';
import { Navigation } from '@/components/layout/Navigation';

const LegacyStoriesPage = () => {
  return (
    <>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Legacy Stories</h1>
        <p className="text-lg mb-8">Preserve and share the stories that matter most.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample story cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Family Story #{i}</h3>
                <p className="text-gray-600">A beautiful legacy story about family traditions, memories, and values.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LegacyStoriesPage;
