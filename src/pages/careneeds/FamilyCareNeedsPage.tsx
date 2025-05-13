
import React from 'react';
import { FadeIn } from '@/components/framer';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FamilyShortcutMenuBar } from '@/components/family/FamilyShortcutMenuBar';
import { useAuth } from '@/components/providers/AuthProvider';

const FamilyCareNeedsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <FamilyShortcutMenuBar />
      <Container className="py-8">
        <FadeIn className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Care Needs Assessment</h1>
          <p className="text-gray-600 mt-2">
            Help us understand the specific care needs for your loved one so we can match you with the right caregivers.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  This assessment helps us understand your loved one's needs across several important areas:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li>Daily living assistance</li>
                  <li>Medical conditions & requirements</li>
                  <li>Cognitive and memory support</li>
                  <li>Household help needs</li>
                  <li>Schedule and availability preferences</li>
                  <li>Emergency contacts and protocols</li>
                </ul>
                <Button 
                  onClick={() => navigate('/careneeds/start')} 
                  className="w-full"
                >
                  Begin Assessment
                </Button>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Why This Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  The information you provide helps us:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li>Match you with caregivers who have the right skills and experience</li>
                  <li>Create appropriate care plans tailored to your specific situation</li>
                  <li>Ensure we understand any special requirements or preferences</li>
                  <li>Prepare caregivers with the knowledge they need</li>
                </ul>
                <p className="text-sm text-gray-500 italic">
                  Your privacy is important. This information is only shared with approved caregivers assigned to your care plan.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <FadeIn delay={0.3} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Already Completed an Assessment?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <p>
                If you've previously completed a care needs assessment, you can view or update your information.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/careneeds/view')}
                >
                  View Assessment
                </Button>
                <Button
                  onClick={() => navigate('/careneeds/update')}
                >
                  Update Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </Container>
    </>
  );
};

export default FamilyCareNeedsPage;
