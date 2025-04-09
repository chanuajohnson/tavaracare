
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface ChatbotLauncherProps {
  onClick: () => void;
  expanded?: boolean;
}

export function ChatbotLauncher({ onClick, expanded = false }: ChatbotLauncherProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${
        expanded ? 'rounded-full px-4 py-2' : 'rounded-full p-3'
      } bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center`}
    >
      <MessageCircle className="h-5 w-5" />
      {expanded && <span className="ml-2 font-medium">Chat with Us</span>}
    </motion.button>
  );
}
