
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Clock, Users } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Compassionate Care",
    description: "Connect with caregivers who truly understand the importance of dignified, personalized care."
  },
  {
    icon: Shield,
    title: "Trusted & Verified",
    description: "All caregivers are thoroughly vetted with background checks and verified certifications."
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Find care that fits your schedule with 24/7 availability and flexible arrangements."
  },
  {
    icon: Users,
    title: "Family-Centered",
    description: "Keep your family connected with tools for communication, coordination, and peace of mind."
  }
];

export const Benefits = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Tavara.care?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're more than a platform—we're a community dedicated to making caregiving easier, more connected, and more meaningful.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
