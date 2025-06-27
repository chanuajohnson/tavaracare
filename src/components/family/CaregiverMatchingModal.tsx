import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Sparkles, MessageCircle, ChevronDown, Video } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { useCaregiverMatches } from "@/hooks/useCaregiverMatches";
import { CaregiverMatchCard } from "./CaregiverMatchCard";
import { GuidedCaregiverChatModal } from "./GuidedCaregiverChatModal";

interface CaregiverMatchingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referringPagePath?: string;
  referringPageLabel?: string;
}

const MAGICAL_MESSAGES = [
  { text: "Hold on, we are finding your perfect match! ✨", subtext: "Analyzing your care needs and preferences..." },
  { text: "Reviewing caregiver profiles in your area 🔍", subtext: "Checking availability and experience..." },
  { text: "Almost there! Matching you with the best caregiver 🎯", subtext: "Ensuring the perfect fit for your family..." }
];

export const CaregiverMatchingModal = ({ 
  open, 
  onOpenChange,
  referringPagePath = "/dashboard/family",
  referringPageLabel = "Family Dashboard"
}: CaregiverMatchingModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const { caregivers, isLoading: caregiverLoading, dataLoaded } = useCaregiverMatches(true);

  useEffect(() => {
    if (open) {
      console.log('CaregiverMatchingModal opened');
      setIsLoading(true);
      setCurrentMessageIndex(0);
      
      // Cycle through magical messages every 1.5 seconds
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % MAGICAL_MESSAGES.length);
      }, 1500);

      // Show the magical loading for 4.5 seconds total (3 messages) - SAME AS PAGE
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
        console.log('CaregiverMatchingModal loading complete');
      }, 4500);

      return () => {
        clearInterval(messageInterval);
        clearTimeout(loadingTimer);
      };
    }
  }, [open]);

  const bestMatch = caregivers[0];
  const currentMessage = MAGICAL_MESSAGES[currentMessageIndex];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50">
          <MatchingTracker 
            matchingType="caregiver" 
            additionalData={{
              referrer: referringPagePath,
              access_type: 'modal_view',
              shown_matches: caregivers.length
            }}
          />
          
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold text-primary-900">
              Your Caregiver Match
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              We found your ideal caregiver match based on your care needs and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-6 py-12">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
                        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-blue-500 animate-pulse" />
                        <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-purple-500 animate-pulse delay-150" />
                        <Sparkles className="absolute top-1/2 -left-4 h-4 w-4 text-pink-500 animate-pulse delay-300" />
                        <Sparkles className="absolute top-1/4 -right-3 h-3 w-3 text-green-500 animate-pulse delay-450" />
                        <Sparkles className="absolute bottom-1/4 -left-3 h-3 w-3 text-yellow-500 animate-pulse delay-600" />
                      </div>
                      
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentMessageIndex}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="text-center space-y-2"
                        >
                          <p className="text-2xl font-semibold text-blue-600">
                            {currentMessage.text}
                          </p>
                          <p className="text-lg text-gray-600">
                            {currentMessage.subtext}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Premium Video Call Feature Notice - Enhanced Accordion */}
                  <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                      <Sparkles className="absolute top-4 right-4 h-4 w-4 text-purple-400 animate-pulse" />
                      <Sparkles className="absolute bottom-4 left-4 h-3 w-3 text-indigo-400 animate-pulse delay-300" />
                      <Sparkles className="absolute top-1/2 right-1/4 h-2 w-2 text-pink-400 animate-pulse delay-600" />
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="video-details" className="border-none">
                        <AccordionTrigger className="hover:no-underline group p-6 pb-0">
                          <div className="flex items-center space-x-3 w-full">
                            <div className="relative">
                              <Video className="h-6 w-6 text-purple-600" />
                              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-purple-500 animate-pulse group-hover:animate-spin" />
                            </div>
                            <div className="text-left flex-1">
                              <h3 className="text-lg font-semibold text-purple-900 group-hover:text-purple-700 transition-colors">
                                Skip Chat - Book Video Visit ✨
                              </h3>
                              <p className="text-sm text-purple-700 opacity-80">
                                Click to see instant video call benefits
                              </p>
                            </div>
                            <motion.div
                              className="relative"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-5 w-5 text-purple-600" />
                              <Sparkles className="absolute -top-2 -right-2 h-3 w-3 text-indigo-400 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-6 pb-6">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 relative"
                          >
                            <div className="absolute inset-0 pointer-events-none">
                              <Sparkles className="absolute top-2 right-8 h-3 w-3 text-yellow-400 animate-pulse delay-200" />
                              <Sparkles className="absolute bottom-2 left-8 h-2 w-2 text-green-400 animate-pulse delay-500" />
                            </div>
                            
                            <div className="relative bg-white/50 rounded-lg p-4 backdrop-blur-sm border border-purple-200/50">
                              <p className="text-purple-800">
                                Skip the getting-to-know phase and book an instant video visit with your caregiver match! 
                                Meet face-to-face in a secure, TAV-moderated video call to discuss care needs and availability directly.
                              </p>
                            </div>
                            
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                            >
                              <SubscriptionFeatureLink
                                featureType="Video Call Access"
                                returnPath="/family/matching"
                                referringPagePath={referringPagePath}
                                referringPageLabel={referringPageLabel}
                              >
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                  <span className="relative flex items-center justify-center gap-2">
                                    <Video className="h-4 w-4" />
                                    Book Instant Video Visit
                                    <Sparkles className="h-4 w-4 animate-pulse" />
                                  </span>
                                </Button>
                              </SubscriptionFeatureLink>
                            </motion.div>
                          </motion.div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>

                  {/* Magical Caregiver Match */}
                  {bestMatch ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="relative"
                    >
                      {/* Magical sparkles around the card */}
                      <div className="absolute inset-0 pointer-events-none">
                        <Sparkles className="absolute -top-4 -right-4 h-6 w-6 text-blue-500 animate-pulse" />
                        <Sparkles className="absolute -top-2 left-1/4 h-4 w-4 text-purple-500 animate-pulse delay-300" />
                        <Sparkles className="absolute -bottom-4 -left-4 h-5 w-5 text-pink-500 animate-pulse delay-150" />
                        <Sparkles className="absolute top-1/2 -right-6 h-3 w-3 text-green-500 animate-pulse delay-450" />
                        <Sparkles className="absolute -bottom-2 right-1/3 h-4 w-4 text-yellow-500 animate-pulse delay-600" />
                        <Sparkles className="absolute top-1/4 -left-3 h-3 w-3 text-indigo-500 animate-pulse delay-200" />
                      </div>

                      <Card className="overflow-hidden bg-white shadow-lg border-2 border-transparent bg-gradient-to-r from-white via-white to-white relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-pink-100/20 rounded-lg opacity-50"></div>
                        
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 relative">
                          <div className="flex items-center justify-between">
                            <motion.div 
                              className="space-y-1"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                            >
                              <div className="flex items-center space-x-2">
                                <CardTitle className="text-xl">Your Perfect Match</CardTitle>
                                <Sparkles className="h-5 w-5 text-green-500 animate-pulse" />
                              </div>
                              <CardDescription className="text-base">Start a guided conversation or book a video visit</CardDescription>
                            </motion.div>
                            
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ duration: 0.6, delay: 0.6 }}
                              className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                              <span className="relative z-10">{bestMatch.match_score}% Match!</span>
                            </motion.div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-6 relative">
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                          >
                            <CaregiverMatchCard
                              caregiver={bestMatch}
                              returnPath="/family/matching"
                              referringPagePath={referringPagePath}
                              referringPageLabel={referringPageLabel}
                              showUnlockButton={false}
                            />
                          </motion.div>
                          
                          <motion.div 
                            className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                          >
                            <Button 
                              variant="default" 
                              className="w-full bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-200"
                              onClick={() => setShowChatModal(true)}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Start Guided Chat
                            </Button>
                            
                            <SubscriptionFeatureLink
                              featureType="Video Call Access"
                              returnPath="/family/matching"
                              referringPagePath={referringPagePath}
                              referringPageLabel={referringPageLabel}
                              variant="outline"
                              className="w-full transform hover:scale-105 transition-all duration-200"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Book Video Visit
                            </SubscriptionFeatureLink>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">No caregiver matches found</p>
                    </div>
                  )}

                  {/* Updated Chat Notice */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <Card className="bg-amber-50 border-amber-200 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 opacity-60"></div>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <MessageCircle className="h-5 w-5 text-amber-600 mt-0.5 animate-pulse" />
                          <div>
                            <h4 className="font-medium text-amber-900 mb-1">Guided Chat or Premium Video?</h4>
                            <p className="text-sm text-amber-800">
                              Our guided chat uses conversation prompts to help you ask the right questions safely. 
                              Ready to meet face-to-face? Upgrade to book instant video visits and skip the conversation phase entirely.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guided Chat Modal */}
      {bestMatch && (
        <GuidedCaregiverChatModal
          open={showChatModal}
          onOpenChange={setShowChatModal}
          caregiver={bestMatch}
        />
      )}
    </>
  );
};
