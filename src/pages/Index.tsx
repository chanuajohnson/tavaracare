import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { Heart, Shield, Users, ArrowRight, MessageCircle, Mail, Star, CheckCircle } from 'lucide-react';
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget';

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (user) {
      if (userRole === 'family') {
        navigate('/dashboard/family');
      } else if (userRole === 'professional') {
        navigate('/dashboard/professional');
      } else if (userRole === 'community') {
        navigate('/dashboard/community');
      } else if (userRole === 'admin') {
        navigate('/dashboard/admin');
      } else {
        // No role, stay on index page
      }
    }
  }, [user, userRole, isLoading, mounted, navigate]);

  const handleGetStarted = () => {
    navigate('/features');
  };

  const handleJoinCommunity = () => {
    navigate('/community');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
            Find Trusted Caregivers in Trinidad & Tobago
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Connecting families with compassionate and reliable caregivers for
            their loved ones.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={handleGetStarted}>
              Learn More <ArrowRight className="ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={handleJoinCommunity}>
              Join Our Community
            </Button>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      {!user && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Started Today
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of families finding trusted care in Trinidad & Tobago
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {/* WhatsApp Login */}
              <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
                <CardHeader className="text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                  <CardTitle className="text-green-700">Quick WhatsApp Sign-In</CardTitle>
                  <CardDescription>
                    Get started instantly with your WhatsApp number
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>No password required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Instant verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Secure login</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/auth/whatsapp')}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Continue with WhatsApp
                  </Button>
                </CardContent>
              </Card>

              {/* Email Login */}
              <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
                <CardHeader className="text-center">
                  <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-blue-700">Email Sign-In</CardTitle>
                  <CardDescription>
                    Traditional email and password authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Create with email & password</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Account recovery options</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Full account control</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    size="lg"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Continue with Email
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600">
              Explore the features that make finding care easier than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <Card className="shadow-md">
              <CardHeader>
                <Heart className="h-10 w-10 text-red-500 mb-4" />
                <CardTitle className="text-lg font-semibold">
                  Trusted Caregivers
                </CardTitle>
                <CardDescription>
                  Verified and background-checked caregivers for your peace of
                  mind.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  We ensure all caregivers meet our high standards of quality and
                  trust.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 2 */}
            <Card className="shadow-md">
              <CardHeader>
                <Shield className="h-10 w-10 text-green-500 mb-4" />
                <CardTitle className="text-lg font-semibold">
                  Safe & Secure
                </CardTitle>
                <CardDescription>
                  Secure platform with advanced data protection measures.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Your data is protected with the latest encryption and security
                  protocols.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 3 */}
            <Card className="shadow-md">
              <CardHeader>
                <Users className="h-10 w-10 text-blue-500 mb-4" />
                <CardTitle className="text-lg font-semibold">
                  Easy Matching
                </CardTitle>
                <CardDescription>
                  Find the perfect caregiver with our intuitive matching system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Our smart matching algorithm connects you with caregivers who
                  meet your specific needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Read stories from families who have found peace of mind with our
              platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Testimonial Card 1 */}
            <Card className="shadow-md">
              <CardContent>
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                </div>
                <p className="text-gray-700 mb-4">
                  "Thanks to Takes a Village, we found a wonderful caregiver for
                  my mother. She's been a blessing to our family."
                </p>
                <div className="text-sm text-gray-500">
                  - Sarah J., San Fernando
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Card 2 */}
            <Card className="shadow-md">
              <CardContent>
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                </div>
                <p className="text-gray-700 mb-4">
                  "The platform is so easy to use, and we quickly found a
                  qualified professional to care for my father."
                </p>
                <div className="text-sm text-gray-500">
                  - Michael T., Port of Spain
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-8 px-4 bg-gray-900 text-white text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Takes a Village. All rights
          reserved.
        </p>
      </footer>

      <ChatbotWidget />
    </div>
  );
};

export default Index;
