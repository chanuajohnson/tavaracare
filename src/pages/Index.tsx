
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Briefcase, MapPin, Phone, Mail, Clock, CheckCircle, Star, Calendar, Shield, MessageSquare, BookOpen, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Fab } from "@/components/ui/fab";
import { TavaraAssistantPanel } from "@/components/tav/TavaraAssistantPanel";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
            Care Coordination Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-6">
            Tavara
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of care coordinators, families, and professionals 
            working together to provide exceptional care across Trinidad & Tobago.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/auth">Get Started</Link>
          </Button>
        </motion.div>
      </section>

      {/* Two-Card Layout */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Family Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">Family</CardTitle>
                  <CardDescription>Coordinate care for your loved ones</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/auth">Find Care Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Professional Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">Professional</CardTitle>
                  <CardDescription>Provide care services and expertise</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/auth">Get Hired as a Skilled Care Professional</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who is Tavara For? Section */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Who is Tavara For?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform serves different members of the caregiving community, 
              each with unique needs and goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Family Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Heart className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold">For Families</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Care Coordination</h4>
                    <p className="text-muted-foreground text-sm">Connect with vetted caregivers and coordinate schedules</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Schedule Management</h4>
                    <p className="text-muted-foreground text-sm">Organize care schedules and track caregiver availability</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Trusted Network</h4>
                    <p className="text-muted-foreground text-sm">Access background-checked and certified professionals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Communication Hub</h4>
                    <p className="text-muted-foreground text-sm">Stay connected with your care team through our platform</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Professional Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Briefcase className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold">For Professionals</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Career Opportunities</h4>
                    <p className="text-muted-foreground text-sm">Find meaningful work with families who need your expertise</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Professional Development</h4>
                    <p className="text-muted-foreground text-sm">Access training resources and certification programs</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Recognition & Reviews</h4>
                    <p className="text-muted-foreground text-sm">Build your reputation through family feedback and ratings</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Flexible Scheduling</h4>
                    <p className="text-muted-foreground text-sm">Choose assignments that fit your availability and preferences</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Engagement Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Community Engagement
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Be part of a supportive community that values collaboration and shared care.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2 text-center">Community</CardTitle>
                  <CardDescription className="text-center">Building stronger communities through collective caregiving</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                      Volunteer Network
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                      Resource Sharing
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                      Community Events
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                      Peer Support Groups
                    </div>
                  </div>
                  <Button asChild className="w-full mt-6">
                    <Link to="/auth">Join the Village</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Shape Our Future Features Section */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Shape Our Future Features
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Your voice matters! Help us prioritize the features that will make the biggest 
              difference in your caregiving journey. Vote on upcoming features and suggest new ones.
            </p>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-primary">
                Feature Voting System
              </p>
              <p className="text-muted-foreground">
                See what's coming next and influence our development roadmap by voting on 
                features that matter most to you and your care community.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/features">View Feature Roadmap</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
            <p className="text-lg text-muted-foreground">
              Have questions? Our team is here to help you every step of the way.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-muted-foreground">+1 (868) 786-5357</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground">hello@tavara.care</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-muted-foreground">Trinidad & Tobago</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAB Component */}
      <Fab
        position="bottom-right"
        showMenu={true}
        className="bg-primary hover:bg-primary/90 text-white"
      />

      {/* TAV Assistant Panel */}
      <TavaraAssistantPanel />
    </div>
  );
};

export default Index;
