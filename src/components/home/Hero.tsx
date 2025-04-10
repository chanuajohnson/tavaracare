
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MicroChatBubble } from "@/components/chatbot/MicroChatBubble";

interface HeroProps {
  handleGetStarted: () => void;
}

export const Hero = ({ handleGetStarted }: HeroProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="text-center mb-16"
    >
      <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-4 inline-block">
        Care Coordination Platform
      </span>
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Tavara</h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
        Join our community of care coordinators, families, and professionals to make
        caring easier and more effective.
      </p>
      
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center mt-16"
      >
        <div className="relative inline-flex items-center">
          <button 
            onClick={handleGetStarted} 
            className="inline-flex items-center justify-center h-11 px-8 font-medium text-white bg-primary-500 rounded-full transition-colors duration-300 hover:bg-primary-600"
          >
            Get Started
          </button>
          
          <div className="ml-3">
            <MicroChatBubble role="family" position="right" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
