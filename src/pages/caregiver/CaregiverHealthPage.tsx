
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HandHeart, Users, ShoppingBag, HeartHandshake, Footprints, Heart, MessageCircle, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

const CaregiverHealthPage = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  
  useJourneyTracking({
    journeyStage: 'caregiver_support',
    additionalData: { page: 'caregiver_health_hub' },
    trackOnce: true
  });
  
  const handleRequestSupport = async (type: string) => {
    // For non-logged in users, just show a toast
    if (!user) {
      toast.info(`Support request received`, {
        description: `We'll be in touch soon about your ${type} request.`,
        duration: 5000,
      });
      return;
    }
    
    // For logged in users, send an actual email via the edge function
    try {
      setIsSubmitting(type);
      
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: user.user_metadata?.full_name || "Tavara User",
          email: user.email || "",
          message: `I'd like to request support with ${type}. Please contact me to discuss this further.`,
        },
      });
      
      if (error) throw error;
      
      toast.success(`Request sent successfully`, {
        description: `We've received your ${type} request and will be in touch soon.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error sending support request:", error);
      toast.error(`Couldn't send request`, {
        description: `There was a problem sending your ${type} request. Please try again.`,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <Container className="py-6">
        <Breadcrumb />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center rounded-full bg-primary-100 p-3 mb-4">
            <Heart className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-primary-900 mb-3">Caregiver Health & Support</h1>
          <p className="text-xl text-primary-700 max-w-2xl mx-auto">
            Because caring for others shouldn't mean losing yourself.
          </p>
          
          <div className="mt-8 max-w-3xl mx-auto text-gray-600 leading-relaxed">
            <p className="mb-4">
              The truth is, caregiving is beautiful — and it's also brutal. It can pull you apart, leave you unseen, and take a toll on your body, mind, and spirit.
            </p>
            <p className="font-medium text-primary-800">
              This is where we begin to change that.
            </p>
          </div>
        </motion.div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-primary-800 mb-6 flex items-center">
            <div className="bg-primary-100 rounded-full p-1.5 mr-2">
              <Footprints className="h-5 w-5 text-primary-600" />
            </div>
            What Support Can Look Like Here
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full border-l-4 border-l-blue-400 shadow-sm">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600 mt-1">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Presence Support</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        Need someone to simply be there while you do something hard?
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    We'll match you with a volunteer, peer caregiver, or support companion to sit with you — emotionally, physically, or even silently.
                  </p>
                  
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p className="text-blue-700 font-medium italic">
                      "You do the work. I'll hold the space."
                    </p>
                  </div>
                  
                  {user ? (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                      onClick={() => handleRequestSupport('Presence Support')}
                      disabled={isSubmitting === 'Presence Support'}
                    >
                      {isSubmitting === 'Presence Support' ? (
                        <>Sending Request...</>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Request Support
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleRequestSupport('presence support')}
                    >
                      Request a Companion
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full border-l-4 border-l-green-400 shadow-sm">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-2 text-green-600 mt-1">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Errand & Relief Circle</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        You don't need to do it all.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Whether it's a food drop, pharmacy run, or someone to walk with — we help you connect with others who are nearby and ready to share the load.
                  </p>
                  
                  <div className="bg-green-50 p-3 rounded-md border border-green-100">
                    <p className="text-green-700 font-medium italic">
                      Helping each other helps us all.
                    </p>
                  </div>
                  
                  {user ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                      onClick={() => handleRequestSupport('Errand Circle')}
                      disabled={isSubmitting === 'Errand Circle'}
                    >
                      {isSubmitting === 'Errand Circle' ? (
                        <>Sending Request...</>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Request Errand Help
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => handleRequestSupport('browse helpers')}
                      >
                        Browse Helpers
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleRequestSupport('post a need')}
                      >
                        Post a Need
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full border-l-4 border-l-amber-400 shadow-sm">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 p-2 text-amber-600 mt-1">
                      <Footprints className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Companion Matching</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        Some people are just... longing to go to the beach. Or sit on a porch. Or talk.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    You're not the only one. We'll help you find someone who needs the company just as much as you do.
                  </p>
                  
                  {user ? (
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2"
                      onClick={() => handleRequestSupport('Companion Matching')}
                      disabled={isSubmitting === 'Companion Matching'}
                    >
                      {isSubmitting === 'Companion Matching' ? (
                        <>Sending Request...</>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Request Companion Match
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => handleRequestSupport('companion matching')}
                    >
                      See Companion Matches
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="h-full border-l-4 border-l-purple-400 shadow-sm">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-100 p-2 text-purple-600 mt-1">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Emotional Co-Care</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        You carry so much — sometimes you just need someone to witness it.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Whether you're managing grief, exhaustion, or something you can't even name… you don't have to do it alone.
                  </p>
                  
                  <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                    <p className="text-purple-700 font-medium italic">
                      "Let's be in this moment, together."
                    </p>
                  </div>
                  
                  {user ? (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                      onClick={() => handleRequestSupport('Emotional Co-Care')}
                      disabled={isSubmitting === 'Emotional Co-Care'}
                    >
                      {isSubmitting === 'Emotional Co-Care' ? (
                        <>Sending Request...</>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Request Emotional Support
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleRequestSupport('emotional presence')}
                    >
                      Schedule Emotional Presence
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary-100 p-2 text-primary-700">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Why This Matters</CardTitle>
                  <CardDescription>The reality of caregiver health & burnout</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Studies show caregivers are:</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">33%</Badge>
                  <span className="text-gray-700">More likely to develop mental health challenges within one year of caregiving</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">25%</Badge>
                  <span className="text-gray-700">More likely to experience physical health deterioration</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">Higher Risk</Badge>
                  <span className="text-gray-700">Often more at risk than the person they're caring for</span>
                </div>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-md border border-primary-100">
                <p className="text-primary-800 text-lg font-medium mb-2">We're building a platform that changes this.</p>
                <p className="text-primary-700">
                  That protects the people doing the protecting.<br />
                  That sees you — and shows up with you.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
        >
          <div className="inline-flex items-center justify-center rounded-full bg-primary-100 p-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary-700" />
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-3">Built for You, Built by You</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Have ideas for the kind of support that would actually help you?<br />
            We're listening — and co-creating this space together.
          </p>
          
          <Button 
            size="lg" 
            className="bg-primary-600 hover:bg-primary-700"
            onClick={() => handleRequestSupport('share story')}
          >
            Share Your Story or Suggest a Feature
          </Button>
        </motion.div>
      </Container>
    </div>
  );
};

export default CaregiverHealthPage;
