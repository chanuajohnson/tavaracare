
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Users, UserCog, Heart, ArrowRight, Check, Vote, HelpCircle, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnvironmentInfo } from "@/components/debug/EnvironmentInfo";
import { SupabaseDebugger } from "@/components/debug/SupabaseDebugger";

const roles = [
  {
    id: "family",
    title: "Family",
    description: "Coordinate care for your loved ones",
    icon: Users,
    color: "bg-primary-100",
    path: "/dashboard/family",
    cta: "Find Care Now",
    features: ["Create and manage care plans", "Find qualified caregivers", "Track medications and appointments", "Coordinate with care team", "Monitor care activities", "Access care logs and reports"]
  },
  {
    id: "professional",
    title: "Professional",
    description: "Provide care services and expertise",
    icon: UserCog,
    color: "bg-primary-200",
    path: "/dashboard/professional",
    cta: "Get Hired",
    features: ["Showcase qualifications", "Find care opportunities", "Manage client relationships", "Track care delivery", "Access training resources", "Professional development"]
  }
];

const communityRole = {
  id: "community",
  title: "Community",
  description: "Support and contribute to care networks",
  icon: Heart,
  color: "bg-primary-300",
  path: "/dashboard/community",
  cta: "Join the Village",
  features: ["Join care circles", "Share local resources", "Participate in community events", "Offer support services", "Connect with families", "Track community impact"]
};

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const navigate = useNavigate();
  const comparisonRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleRoleSelect = (roleId: string) => {
    if (roleId === "community") {
      const role = communityRole;
      setSelectedRole(roleId);
      navigate(role.path);
      toast.success(`Welcome to the ${role.title} Dashboard! Sign in to access all features.`);
    } else {
      const role = roles.find(r => r.id === roleId);
      if (role) {
        setSelectedRole(roleId);
        navigate(role.path);
        toast.success(`Welcome to the ${role.title} Dashboard! Sign in to access all features.`);
      }
    }
  };

  const handleGetStarted = () => {
    comparisonRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

  return (
    <div className="min-h-screen w-full">
      {/* Hero Video Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/lovable-uploads/12de91cf-3454-4e5d-9f29-b80cf84bb8c1.png"
        >
          {/* Placeholder for video source - you'll need to add your video file */}
          <source src="/your-video.mp4" type="video/mp4" />
          <source src="/your-video.webm" type="video/webm" />
          {/* Fallback image if video doesn't load */}
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img 
              src="/TAVARACARElogo.JPG"
              alt="Tavara" 
              className="h-16 w-auto md:h-20 mx-auto"
            />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl leading-tight"
          >
            It Takes a Village to Care
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl leading-relaxed"
          >
            Join our community of care coordinators, families, and professionals to make caring easier and more effective.
          </motion.p>

          {/* Role Selection CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            {roles.map((role, index) => (
              <Button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="bg-white/90 hover:bg-white text-gray-900 font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <role.icon className="w-5 h-5 mr-2" />
                {role.cta}
              </Button>
            ))}
            <Button
              onClick={() => handleRoleSelect("community")}
              className="bg-primary hover:bg-primary-600 text-white font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2" />
              {communityRole.cta}
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <button
              onClick={handleGetStarted}
              className="text-white/80 hover:text-white transition-colors"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm mb-2">Explore More</span>
                <ArrowRight className="w-5 h-5 rotate-90 animate-bounce" />
              </div>
            </button>
          </motion.div>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
          <button
            onClick={togglePlayPause}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMute}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* Main Content - Roles Section */}
      <div className="bg-gradient-to-b from-white to-primary-50">
        <div className="container px-4 py-16 mx-auto">
          <div ref={comparisonRef} className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who is Tavara For?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find your perfect match, whether you're seeking care or providing care
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="mb-4">
                        <role.icon className="w-8 h-8 text-primary-600" />
                      </div>
                      <CardTitle>{role.title}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {role.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <ArrowRight className="w-4 h-4 text-primary-500 mr-2 mt-1 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="flex justify-between items-center mt-6">
                        <Link to={role.path}>
                          <Button className="inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                            {role.cta}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Community Section */}
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Community Engagement</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover how you can support and contribute to care networks in your community.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4">
                      <communityRole.icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <CardTitle>{communityRole.title}</CardTitle>
                    <CardDescription>{communityRole.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {communityRole.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <ArrowRight className="w-4 h-4 text-primary-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex justify-between items-center mt-6">
                      <Link to={communityRole.path}>
                        <Button className="inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                          {communityRole.cta}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {isDebug && (
          <div className="container px-4 pb-8">
            <div className="mt-12 space-y-6 border-t pt-8">
              <h2 className="text-2xl font-semibold">Debug Tools</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <EnvironmentInfo />
                <SupabaseDebugger />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                These tools are only visible when ?debug=true is added to the URL
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
