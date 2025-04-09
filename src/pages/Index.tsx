
import React from 'react';
import Navigation from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Connecting Families with Trusted Caregivers
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find the right care for your loved ones or discover meaningful caregiving opportunities in your community.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to="/registration/family">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
                Find Care
              </Button>
            </Link>
            <Link to="/registration/professional">
              <Button size="lg" variant="outline" className="border-primary-500 text-primary-500 hover:bg-primary-50">
                Offer Care
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">For Families</h3>
                <p className="text-gray-600">
                  Find qualified, compassionate caregivers who match your specific needs and preferences.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">For Professionals</h3>
                <p className="text-gray-600">
                  Connect with families seeking your caregiving skills and build meaningful relationships.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">For Communities</h3>
                <p className="text-gray-600">
                  Support care initiatives in your local area and strengthen community connections.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Include the chatbot widget on the homepage */}
      <ChatbotWidget delay={3000} />
    </div>
  );
};

export default Index;
