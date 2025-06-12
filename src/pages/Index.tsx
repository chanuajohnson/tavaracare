
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCog, Heart, ArrowRight, Check, Vote, HelpCircle, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnvironmentInfo } from "@/components/debug/EnvironmentInfo";
import { SupabaseDebugger } from "@/components/debug/SupabaseDebugger";
import { supabase } from '@/integrations/supabase/client';

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

// All available videos - admin can control which ones are active
const allVideoSources = [
  "/your-video.MP4",
  "/your-video2.MP4", 
  "/your-video3.MP4",
  "/your-video4.MP4"
];

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeVideoRef, setActiveVideoRef] = useState<'primary' | 'secondary'>('primary');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeVideos, setActiveVideos] = useState<string[]>(allVideoSources);
  const [videoLoadStates, setVideoLoadStates] = useState<{[key: string]: boolean}>({});
  const navigate = useNavigate();
  const comparisonRef = useRef<HTMLDivElement>(null);
  const primaryVideoRef = useRef<HTMLVideoElement>(null);
  const secondaryVideoRef = useRef<HTMLVideoElement>(null);

  // Load active videos from admin settings on component mount
  useEffect(() => {
    loadActiveVideos();
  }, []);

  const loadActiveVideos = async () => {
    try {
      // Check if there are any video preferences stored
      const { data: videoSettings, error } = await supabase
        .from('hero_videos')
        .select('file_path, is_active')
        .eq('is_active', true);

      if (error) {
        console.log('No database video settings found, using all static videos');
        return;
      }

      // If database has active videos, combine with static videos that are enabled
      if (videoSettings && videoSettings.length > 0) {
        const dbVideos = videoSettings.map(v => v.file_path);
        setActiveVideos([...allVideoSources, ...dbVideos]);
      }
    } catch (error) {
      console.log('Using default video configuration:', error);
    }
  };

  // Get the currently active video ref
  const getCurrentVideoRef = () => {
    return activeVideoRef === 'primary' ? primaryVideoRef.current : secondaryVideoRef.current;
  };

  // Get the inactive video ref (for preloading next video)
  const getInactiveVideoRef = () => {
    return activeVideoRef === 'primary' ? secondaryVideoRef.current : primaryVideoRef.current;
  };

  // Enhanced video scaling with better error handling
  const applyVideoScaling = (video: HTMLVideoElement) => {
    const handleMetadata = () => {
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      // Remove existing scaling classes
      video.classList.remove('video-ultra-scale', 'video-portrait-scale', 'video-landscape-scale', 'video-fallback-fill');
      
      if (aspectRatio < 1) {
        video.classList.add('video-portrait-scale');
      } else if (aspectRatio > 1.7) {
        video.classList.add('video-landscape-scale');
      } else {
        video.classList.add('video-ultra-scale');
      }
      
      // Mark video as loaded for this source
      setVideoLoadStates(prev => ({ ...prev, [video.src]: true }));
    };

    if (video.videoWidth > 0) {
      handleMetadata();
    } else {
      video.addEventListener('loadedmetadata', handleMetadata, { once: true });
    }
  };

  // Enhanced video preloading with better state management
  useEffect(() => {
    if (activeVideos.length === 0) return;
    
    const nextVideoIndex = (currentVideoIndex + 1) % activeVideos.length;
    const inactiveVideo = getInactiveVideoRef();
    
    if (inactiveVideo && inactiveVideo.src !== activeVideos[nextVideoIndex]) {
      console.log(`Preloading video: ${activeVideos[nextVideoIndex]}`);
      inactiveVideo.src = activeVideos[nextVideoIndex];
      inactiveVideo.muted = true;
      inactiveVideo.load();
      applyVideoScaling(inactiveVideo);
      
      // Handle load errors
      inactiveVideo.addEventListener('error', (e) => {
        console.error(`Error loading video ${activeVideos[nextVideoIndex]}:`, e);
      }, { once: true });
    }
  }, [currentVideoIndex, activeVideoRef, activeVideos]);

  // Apply scaling to primary video on mount
  useEffect(() => {
    if (primaryVideoRef.current) {
      applyVideoScaling(primaryVideoRef.current);
    }
  }, []);

  const handleRoleSelect = (roleId: string) => {
    if (roleId === "community") {
      const role = communityRole;
      setSelectedRole(roleId);
      navigate(role.path);
      toast.success(`Welcome to the ${role.title} registration! Please complete the form to get started.`);
    } else {
      const role = roles.find(r => r.id === roleId);
      if (role) {
        setSelectedRole(roleId);
        navigate(role.path);
        toast.success(`Welcome to the ${role.title} registration! Please complete the form to get started.`);
      }
    }
  };

  const handleGetStarted = () => {
    comparisonRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const togglePlayPause = () => {
    const currentVideo = getCurrentVideoRef();
    if (currentVideo && !isTransitioning) {
      if (isPlaying) {
        currentVideo.pause();
        setIsPlaying(false);
      } else {
        currentVideo.play().catch(error => {
          console.error('Error playing video:', error);
        });
        setIsPlaying(true);
      }
    }
  };

  // Simplified video switching with better error handling
  const switchToNextVideo = async () => {
    if (isTransitioning || activeVideos.length === 0) return;
    
    console.log('Switching to next video...');
    setIsTransitioning(true);
    
    const nextIndex = (currentVideoIndex + 1) % activeVideos.length;
    const inactiveVideo = getInactiveVideoRef();
    const currentVideo = getCurrentVideoRef();
    
    if (inactiveVideo) {
      try {
        // Ensure the inactive video is ready
        if (inactiveVideo.readyState >= 2) { // HAVE_CURRENT_DATA
          inactiveVideo.currentTime = 0;
          
          // Only play if we were playing before
          if (isPlaying) {
            await inactiveVideo.play();
          }
          
          // Immediate switch with opacity transition
          setActiveVideoRef(prev => prev === 'primary' ? 'secondary' : 'primary');
          setCurrentVideoIndex(nextIndex);
          
          // Pause the now-inactive video after a brief delay
          setTimeout(() => {
            if (currentVideo && currentVideo !== inactiveVideo) {
              currentVideo.pause();
            }
            setIsTransitioning(false);
          }, 50);
        } else {
          // Video not ready, wait for it
          const handleCanPlay = async () => {
            try {
              inactiveVideo.currentTime = 0;
              if (isPlaying) {
                await inactiveVideo.play();
              }
              setActiveVideoRef(prev => prev === 'primary' ? 'secondary' : 'primary');
              setCurrentVideoIndex(nextIndex);
              
              setTimeout(() => {
                if (currentVideo && currentVideo !== inactiveVideo) {
                  currentVideo.pause();
                }
                setIsTransitioning(false);
              }, 50);
            } catch (error) {
              console.error('Error in delayed video switch:', error);
              setIsTransitioning(false);
            }
          };
          
          inactiveVideo.addEventListener('canplay', handleCanPlay, { once: true });
          
          // Fallback timeout
          setTimeout(() => {
            if (isTransitioning) {
              console.log('Video switch timeout, forcing transition');
              setIsTransitioning(false);
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error switching video:', error);
        setIsTransitioning(false);
      }
    } else {
      setIsTransitioning(false);
    }
  };

  const handleVideoEnd = () => {
    console.log('Video ended, switching to next');
    switchToNextVideo();
  };

  // Enhanced video change with better loading
  const changeVideo = async (newIndex: number) => {
    if (newIndex === currentVideoIndex || isTransitioning || activeVideos.length === 0) return;
    
    console.log(`Changing to video index: ${newIndex}`);
    setIsTransitioning(true);
    
    const inactiveVideo = getInactiveVideoRef();
    const currentVideo = getCurrentVideoRef();
    
    if (inactiveVideo) {
      try {
        // Set the new video source
        inactiveVideo.src = activeVideos[newIndex];
        inactiveVideo.muted = true;
        inactiveVideo.load();
        applyVideoScaling(inactiveVideo);
        
        const handleCanPlay = async () => {
          try {
            inactiveVideo.currentTime = 0;
            if (isPlaying) {
              await inactiveVideo.play();
            }
            
            // Switch active video
            setActiveVideoRef(prev => prev === 'primary' ? 'secondary' : 'primary');
            setCurrentVideoIndex(newIndex);
            
            // Pause old video
            setTimeout(() => {
              if (currentVideo && currentVideo !== inactiveVideo) {
                currentVideo.pause();
              }
              setIsTransitioning(false);
            }, 50);
          } catch (error) {
            console.error('Error in video change:', error);
            setIsTransitioning(false);
          }
        };
        
        if (inactiveVideo.readyState >= 2) {
          handleCanPlay();
        } else {
          inactiveVideo.addEventListener('canplay', handleCanPlay, { once: true });
          
          // Fallback timeout
          setTimeout(() => {
            if (isTransitioning) {
              console.log('Video change timeout, forcing transition');
              setIsTransitioning(false);
            }
          }, 3000);
        }
      } catch (error) {
        console.error('Error changing video:', error);
        setIsTransitioning(false);
      }
    }
  };

  const goToPreviousVideo = () => {
    if (activeVideos.length === 0) return;
    const prevIndex = currentVideoIndex === 0 ? activeVideos.length - 1 : currentVideoIndex - 1;
    changeVideo(prevIndex);
  };

  const goToNextVideo = () => {
    if (activeVideos.length === 0) return;
    const nextIndex = (currentVideoIndex + 1) % activeVideos.length;
    changeVideo(nextIndex);
  };

  const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

  if (activeVideos.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">No Active Videos</h1>
          <p className="text-xl">Please contact administrator to configure hero videos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* Hero Video Section */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        {/* Primary Video */}
        <video
          ref={primaryVideoRef}
          className={`absolute inset-0 w-full h-full video-ultra-scale transition-opacity duration-300 ${
            activeVideoRef === 'primary' ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          autoPlay
          muted={true}
          loop={false}
          playsInline
          preload="metadata"
          onEnded={handleVideoEnd}
          onError={(e) => console.error('Primary video error:', e)}
          aria-label="Background video showing care and community"
        >
          <source src={activeVideos[currentVideoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Secondary Video */}
        <video
          ref={secondaryVideoRef}
          className={`absolute inset-0 w-full h-full video-ultra-scale transition-opacity duration-300 ${
            activeVideoRef === 'secondary' ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          muted={true}
          loop={false}
          playsInline
          preload="metadata"
          onError={(e) => console.error('Secondary video error:', e)}
          aria-label="Background video showing care and community"
        >
          <source src={activeVideos[(currentVideoIndex + 1) % activeVideos.length]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 z-20"></div>

        {/* Content Overlay */}
        <div className="relative z-30 flex flex-col items-center justify-center h-full text-center px-4">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl leading-tight"
          >
            It takes a village to care
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
            {roles.map((role) => (
              <Button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-8 py-3 rounded-full flex items-center gap-2"
                aria-label={`Register as a ${role.title}`}
              >
                <role.icon className="h-5 w-5" />
                {role.title}
              </Button>
            ))}
            <Button
              onClick={() => handleRoleSelect("community")}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-8 py-3 rounded-full flex items-center gap-2"
              aria-label="Register as a Community member"
            >
              <Heart className="h-5 w-5" />
              Community
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
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
        <div className="absolute bottom-4 right-4 z-30 flex gap-2">
          {/* Previous Video Button */}
          <button
            onClick={goToPreviousVideo}
            disabled={isTransitioning}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors disabled:opacity-50"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            disabled={isTransitioning}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors disabled:opacity-50"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          {/* Next Video Button */}
          <button
            onClick={goToNextVideo}
            disabled={isTransitioning}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors disabled:opacity-50"
            aria-label="Next video"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Video Indicator Dots */}
        <div className="absolute bottom-4 left-4 z-30 flex gap-2">
          {activeVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => changeVideo(index)}
              disabled={isTransitioning}
              className={`w-2 h-2 rounded-full transition-all duration-300 disabled:opacity-50 ${
                index === currentVideoIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
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
