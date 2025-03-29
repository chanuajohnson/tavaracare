import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHeart, Users, ShoppingBag, HeartHandshake, Footprints } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
interface CaregiverHealthCardProps {
  className?: string;
}
export function CaregiverHealthCard({
  className
}: CaregiverHealthCardProps) {
  const {
    user
  } = useAuth();
  const handleRequestClick = () => {
    if (!user) {
      toast.info("Please log in or register", {
        description: "You need to be logged in to request support services.",
        duration: 5000
      });
    }
  };
  return <motion.div initial={{
    opacity: 0,
    y: -10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className={className}>
      <Card className="overflow-hidden border-l-4 border-l-primary-300 bg-gradient-to-br from-blue-50 to-primary-50">
        
        
      </Card>
    </motion.div>;
}