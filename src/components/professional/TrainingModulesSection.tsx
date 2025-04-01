
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TrainingModulesSection = () => {
  const moduleList = [
    {
      id: "module1",
      title: "Module 1: Caregiving Basics & Professionalism",
      description: "Understanding the role of a caregiver, key responsibilities, ethics, and expectations."
    },
    {
      id: "module2",
      title: "Module 2: Elderly & Special Needs Care",
      description: "Knowledge and practical skills to care for elderly individuals and children with special needs."
    },
    {
      id: "module3",
      title: "Module 3: Safety & Emergency Preparedness",
      description: "Ensuring safety and well-being of both caregivers and care recipients."
    },
    {
      id: "module4",
      title: "Module 4: Emotional & Social Support",
      description: "Essential skills for providing emotional and social support to clients and families."
    },
    {
      id: "module5",
      title: "Module 5: Hands-On Care Techniques",
      description: "Essential hands-on skills for safely assisting with activities of daily living."
    },
    {
      id: "module6",
      title: "Module 6: Working with Families & Agencies",
      description: "Navigating relationships with families and agencies, contracts, and professional conduct."
    },
    {
      id: "module7",
      title: "Module 7: Legal & Ethical Considerations (Bonus Module)",
      description: "Legal, ethical, and human rights aspects of caregiving."
    }
  ];

  return (
    <div className="mt-12 w-full">
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-primary-800 mb-2"
        >
          Training Course Modules
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-600"
        >
          Our comprehensive curriculum covers everything a caregiver needs to know
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="module1" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-7 h-auto">
            {moduleList.map((module, index) => (
              <TabsTrigger key={module.id} value={module.id} className="text-xs sm:text-sm py-2">
                Module {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {moduleList.map(module => (
            <TabsContent key={module.id} value={module.id} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This module is designed to provide caregivers with the essential knowledge and skills 
                    needed to deliver professional and compassionate care in alignment with Trinidad & Tobago's 
                    cultural context and healthcare standards.
                  </p>
                  <Button variant="outline" className="mt-4">
                    Learn more about this module
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
