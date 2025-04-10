
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MicroChatBubble } from "@/components/chatbot/MicroChatBubble";

interface RoleCardProps {
  role: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    path: string;
    cta: string;
  };
  index: number;
  onSelect: (roleId: string) => void;
}

export const RoleCard = ({ role, index, onSelect }: RoleCardProps) => {
  return (
    <motion.div 
      key={role.id} 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative group`}
    >
      <div className={`${role.color} rounded-2xl p-6 h-full transition-transform duration-300 group-hover:scale-[1.02]`}>
        <div className="mb-4">
          <role.icon className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">
          {role.title}
        </h3>
        <p className="text-gray-600 mb-6">{role.description}</p>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => onSelect(role.id)} 
            className="inline-flex items-center text-primary-700 font-medium group/button"
          >
            {role.cta}
            <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </button>
          
          <MicroChatBubble role={role.id as 'family' | 'professional' | 'community'} />
        </div>
      </div>
    </motion.div>
  );
};
