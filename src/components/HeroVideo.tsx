
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, UserCog, Heart } from 'lucide-react';

const HeroVideo = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/your-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Background video showing care and community"
      >
        <source src="/your-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
        <h1 className="text-4xl md:text-6xl font-semibold mb-8 max-w-4xl leading-tight">
          It takes a village to care
        </h1>
        
        {/* CTA Buttons */}
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          <Link to="/registration/family">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-8 py-3 rounded-full flex items-center gap-2"
              aria-label="Register as a Family seeking care"
            >
              <Users className="h-5 w-5" />
              Family
            </Button>
          </Link>
          
          <Link to="/registration/professional">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-8 py-3 rounded-full flex items-center gap-2"
              aria-label="Register as a Professional caregiver"
            >
              <UserCog className="h-5 w-5" />
              Professional
            </Button>
          </Link>
          
          <Link to="/registration/community">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-8 py-3 rounded-full flex items-center gap-2"
              aria-label="Register as a Community member"
            >
              <Heart className="h-5 w-5" />
              Community
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroVideo;
