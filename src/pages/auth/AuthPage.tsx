
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Tavara</h1>
          <p className="text-gray-600 mt-2">Sign in to your account or create a new one</p>
        </div>

        {/* Email Login/Signup */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle>Email Authentication</CardTitle>
            </div>
            <CardDescription>
              Sign in with your email and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
                
                {/* WhatsApp Sign In Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => navigate('/auth/whatsapp')}
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Sign in via WhatsApp
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="signup">
                <SignupForm />
                
                {/* WhatsApp Create Account Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => navigate('/auth/whatsapp')}
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Create account via WhatsApp
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Tavara © 2025
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
