
import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/container';
import { FadeIn } from '@/components/framer';
import { PageViewTracker } from '@/components/tracking/PageViewTracker';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const FamilyCareNeedsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="care_needs_view" />
      <Container className="py-8">
        <FadeIn className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Family Care Needs Assessment</h1>
          <p className="text-lg text-gray-600 mb-8">
            Complete this assessment to help us understand the specific care needs of your loved one.
            This information will help match you with the right caregivers and create an effective care plan.
          </p>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <p className="mb-4">
              The assessment covers several important areas:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Daily living activities and assistance needed</li>
              <li>Medical conditions and special care requirements</li>
              <li>Cognitive and memory considerations</li>
              <li>Meal preparation and dietary needs</li>
              <li>Housekeeping assistance requirements</li>
              <li>Emergency protocols and safety concerns</li>
            </ul>
            
            <p className="mb-6">
              Taking time to provide accurate and detailed information will help us create the most 
              effective care plan for your loved one's specific situation.
            </p>
            
            <div className="flex justify-end">
              <Link to="/dashboard/family">
                <Button className="flex items-center gap-2">
                  Begin Assessment <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            Your information is kept confidential and will only be shared with caregivers 
            you approve to join your care team.
          </div>
        </FadeIn>
      </Container>
    </div>
  );
};

export default FamilyCareNeedsPage;
