
import { useEffect, useState } from "react";
import { ConversationalFormChat } from "@/components/tav/components/ConversationalFormChat";
import { FamilyRegistrationForm } from "@/components/family/FamilyRegistrationForm";
import { ChatProvider } from "@/components/chatbot/ChatProvider";
import { ChatbotSystem } from "@/components/chatbot/ChatbotSystem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileText } from "lucide-react";
import { setAuthFlowFlag, AUTH_FLOW_FLAGS } from "@/utils/authFlowUtils";

const FamilyRegistration = () => {
  const [completionMethod, setCompletionMethod] = useState<'form' | 'tav' | null>(null);

  useEffect(() => {
    // Prevent auth redirection by setting specific flag for registration
    setAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_REGISTRATION_REDIRECT);
    
    // Clean up on unmount
    return () => {
      sessionStorage.removeItem(AUTH_FLOW_FLAGS.SKIP_REGISTRATION_REDIRECT);
    };
  }, []);

  // Show method selection screen
  if (!completionMethod) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Complete Your Family Registration</CardTitle>
            <p className="text-muted-foreground mt-2">
              Choose how you'd like to complete your registration. Both options will help us understand your care needs.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Traditional Form Option */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                <CardContent className="p-6" onClick={() => setCompletionMethod('form')}>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Complete Form</h3>
                      <p className="text-sm text-muted-foreground">
                        Fill out a traditional form with all the sections organized clearly. 
                        TAV will be available to help if needed.
                      </p>
                    </div>
                    <Button className="w-full" variant="outline">
                      Use Traditional Form
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* TAV Conversational Option */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                <CardContent className="p-6" onClick={() => setCompletionMethod('tav')}>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Complete with TAV</h3>
                      <p className="text-sm text-muted-foreground">
                        Have a conversation with TAV, our AI assistant, who will guide you 
                        through each step naturally.
                      </p>
                    </div>
                    <Button className="w-full">
                      Chat with TAV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                💙 Both options collect the same information and take about 10-15 minutes to complete.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show TAV conversational interface
  if (completionMethod === 'tav') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button 
            variant="ghost" 
            onClick={() => setCompletionMethod(null)}
            className="mb-4"
          >
            ← Back to Options
          </Button>
        </div>
        <ConversationalFormChat role="family" />
      </div>
    );
  }

  // Show traditional form with TAV assistant
  return (
    <ChatProvider>
      <div className="min-h-screen bg-background">
        {/* Header with back button */}
        <div className="border-b bg-white">
          <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setCompletionMethod(null)}
              >
                ← Back to Options
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Family Registration</h1>
                <p className="text-sm text-muted-foreground">
                  Complete your registration to get matched with caregivers
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                💙 TAV is available in the corner if you need help
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="py-8">
          <FamilyRegistrationForm 
            onComplete={() => {
              // Handle completion - could redirect to dashboard or show success message
              window.location.href = '/dashboard/family';
            }}
          />
        </div>

        {/* TAV Assistant in bottom-right */}
        <ChatbotSystem 
          position="bottom-right" 
          spacing={24}
        />
      </div>
    </ChatProvider>
  );
};

export default FamilyRegistration;
