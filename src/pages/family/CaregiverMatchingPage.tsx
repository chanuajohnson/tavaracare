
import React from 'react';
import { Navigation } from '@/components/layout/Navigation';

const CaregiverMatchingPage = () => {
  return (
    <>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Caregiver Matching</h1>
        <p className="text-lg mb-8">Find the perfect caregiver for your loved one's specific needs.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample caregiver cards */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-3"></div>
                  <div>
                    <h3 className="text-lg font-semibold">Caregiver {i}</h3>
                    <p className="text-sm text-gray-500">5 years experience</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Specialties:</span> Elder Care, Dementia</p>
                  <p className="text-sm"><span className="font-medium">Availability:</span> Weekdays, Mornings</p>
                  <p className="text-sm"><span className="font-medium">Location:</span> Within 5 miles</p>
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded text-sm">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CaregiverMatchingPage;
