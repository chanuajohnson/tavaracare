
import { useState } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumbs/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { StoryCard } from '@/components/about/StoryCard';
import { PodcastCard } from '@/components/about/PodcastCard';
import { MissionCard } from '@/components/about/MissionCard';
import { VisionSection } from '@/components/about/VisionSection';
import { Heart, Users, Lightbulb, Globe, Award, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AboutPage = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  const handleCardClick = (cardId: string) => {
    setActiveCard(activeCard === cardId ? null : cardId);
  };

  return <div className="min-h-screen bg-white">
      <Container>
        <Breadcrumb />
        <div className="space-y-8 py-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} className="text-4xl font-bold text-primary-800 tracking-tight">
              About Tavara
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="text-lg text-gray-600">
              It takes a village to care
            </motion.p>
          </div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
            <div className="text-gray-600 leading-relaxed">
              <p>Tavara is a <span className="text-primary-700 font-semibold">technology-driven platform</span> that <span className="text-primary-700 font-semibold">connects caregivers with families</span> who need them, making it easy to find and provide trusted home care.</p>
              
              <div className="mt-4">
                <p className="font-bold">For Families</p>
                <ul className="list-disc pl-6 mt-1">
                  <li>Find trained, reliable caregivers for elderly loved ones and individuals with special needs</li>
                </ul>
              </div>
              
              <div className="mt-2">
                <p className="font-bold">For Caregivers</p>
                <ul className="list-disc pl-6 mt-1">
                  <li>Get access to jobs, training, and ongoing support</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <StoryCard isActive={activeCard === 'story'} onClick={() => handleCardClick('story')} />
            <MissionCard isActive={activeCard === 'mission'} onClick={() => handleCardClick('mission')} />
          </div>

          <VisionSection />

          <div className="mt-16 text-center">
            <motion.h2 initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} viewport={{
            once: true
          }} className="text-2xl font-semibold mb-8 text-primary-800">Our Values</motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} viewport={{
            once: true
          }}>
              <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow h-full">
                <CardHeader className="bg-primary-50">
                  <CardTitle className="flex items-center gap-2 text-primary-700">
                    <Heart className="h-5 w-5" /> Empathy
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600">We understand the challenges of caregiving and are committed to supporting caregivers, families, and care recipients with kindness and respect.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} viewport={{
            once: true
          }}>
              <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow h-full">
                <CardHeader className="bg-primary-50">
                  <CardTitle className="flex items-center gap-2 text-primary-700">
                    <Users className="h-5 w-5" /> Community
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600">No caregiver should feel alone. Tavara fosters connection, resource-sharing, and mutual support, empowering caregivers through shared experiences.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.4
          }} viewport={{
            once: true
          }}>
              <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow h-full">
                <CardHeader className="bg-primary-50">
                  <CardTitle className="flex items-center gap-2 text-primary-700">
                    <Lightbulb className="h-5 w-5" /> Innovation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600">We use technology to simplify caregiving, connect people with the right resources, and enhance learning—always keeping human care at the center.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="mt-16">
            <motion.h2 initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} viewport={{
            once: true
          }} className="text-2xl font-semibold text-center mb-8 text-primary-800">The Tavara Platform</motion.h2>
            
            <NavigationMenu className="mx-auto max-w-4xl mb-10">
              <NavigationMenuList className="flex flex-col sm:flex-row justify-center gap-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-primary-50">For Families</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3 p-4">
                        <div className="row-span-3">
                          <h4 className="text-lg font-medium leading-none mb-2">Family Features</h4>
                          <p className="text-sm leading-snug text-muted-foreground mb-4">
                            Tools to coordinate care for your loved ones effectively.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Care Plans</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Caregiver Matching</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Medication Tracking</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Appointment Management</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Care Team Coordination</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Activity Monitoring</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-primary-50">For Professionals</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3 p-4">
                        <div className="row-span-3">
                          <h4 className="text-lg font-medium leading-none mb-2">Professional Features</h4>
                          <p className="text-sm leading-snug text-muted-foreground mb-4">
                            Resources to enhance your caregiving career.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Profile Showcase</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Job Opportunities</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Client Management</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Care Tracking</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Training Resources</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Professional Growth</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-primary-50">For Community</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3 p-4">
                        <div className="row-span-3">
                          <h4 className="text-lg font-medium leading-none mb-2">Community Features</h4>
                          <p className="text-sm leading-snug text-muted-foreground mb-4">
                            Ways to contribute to the caregiving community.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Care Circles</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Resource Sharing</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Community Events</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Support Services</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Family Connections</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Impact Tracking</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-8 shadow-inner max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Platform Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Profile Management</h4>
                    <p className="text-sm text-gray-600">Customized for different user roles</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Care Management</h4>
                    <p className="text-sm text-gray-600">Activity logs, team chat, care reports</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Medication Management</h4>
                    <p className="text-sm text-gray-600">Reminders and tracking tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Caregiver Learning Hub</h4>
                    <p className="text-sm text-gray-600">Training modules and resources</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Community Features</h4>
                    <p className="text-sm text-gray-600">Care circles, events, resource sharing</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Emergency Alerts</h4>
                    <p className="text-sm text-gray-600">Fall detection and emergency notifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <PodcastCard />
          </div>

          <div className="flex justify-center mt-16 mb-8">
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Link to="/dashboard/community">
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                  <Globe className="mr-2 h-5 w-5" />
                  Join the Tavara Community
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </Container>
    </div>;
};

export default AboutPage;
