
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MicroChatBubble } from "@/components/chatbot/MicroChatBubble";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  role: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    cta: string;
    features: string[];
  };
  index: number;
}

export const FeatureCard = ({ role, index }: FeatureCardProps) => {
  return (
    <motion.div 
      key={role.id} 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card className="h-full">
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
            
            <MicroChatBubble role={role.id as 'family' | 'professional' | 'community'} position="right" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
