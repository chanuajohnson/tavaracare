
import { motion } from "framer-motion";
import { RoleCard } from "./RoleCard";
import { FeatureCard } from "./FeatureCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MicroChatBubble } from "@/components/chatbot/MicroChatBubble";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleSectionProps {
  roles: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    path: string;
    cta: string;
    features: string[];
  }>;
  communityRole: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    path: string;
    cta: string;
    features: string[];
  };
  onRoleSelect: (roleId: string) => void;
  comparisonRef: React.RefObject<HTMLDivElement>;
}

export const RoleSection = ({ roles, communityRole, onRoleSelect, comparisonRef }: RoleSectionProps) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {roles.map((role, index) => (
          <RoleCard key={role.id} role={role} index={index} onSelect={onRoleSelect} />
        ))}
      </div>

      <div ref={comparisonRef} className="mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who is Tavara For?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find your perfect match, whether you're seeking care or providing care</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {roles.map((role, index) => (
            <FeatureCard key={role.id} role={role} index={index} />
          ))}
        </div>
      </div>

      <div className="mt-32 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Community Engagement
          </h2>
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
            <Card className="h-full">
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
                  
                  <MicroChatBubble role="community" position="right" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};
