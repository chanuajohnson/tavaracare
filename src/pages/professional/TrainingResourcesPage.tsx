
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, GraduationCap, BookOpen, Shield, Heart, HandHeart, Users, ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { TrainingProgressTracker } from "@/components/professional/TrainingProgressTracker";
import { toast } from "@/components/ui/use-toast";
import { useTrainingProgress } from "@/hooks/useTrainingProgress";
import { supabase } from "@/lib/supabase";

const TrainingResourcesPage = () => {
  const { user } = useAuth();
  const { modules } = useTrainingProgress();
  
  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Training Resources",
      path: "/professional/training-resources",
    }
  ];

  const handleEnrollClick = async () => {
    toast({
      title: "Enrollment Request Received!",
      description: "We have your request logged and you will receive an email when this feature is live and launched.",
    });

    if (user) {
      try {
        const { error } = await supabase
          .from('user_module_progress')
          .upsert([
            {
              user_id: user.id,
              module_id: modules.length > 0 ? modules[0].id : null,
              status: 'requested',
              last_accessed: new Date().toISOString()
            }
          ]);
        
        if (error) {
          console.error("Error updating training request:", error);
        }
      } catch (err) {
        console.error("Failed to record training request:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold">Professional Caregiver Training</h1>
          <p className="text-muted-foreground max-w-3xl">
            Enhance your caregiving skills with our comprehensive training program designed 
            specifically for Trinidad & Tobago caregivers. Complete self-paced modules, gain 
            hands-on experience, and earn certification to unlock new career opportunities.
          </p>
        </motion.div>

        {user && (
          <div className="my-8">
            <TrainingProgressTracker />
          </div>
        )}

        <div className="my-8">
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">Ready to become a certified caregiver?</h2>
                  <p className="mt-2 text-gray-700 max-w-2xl">
                    Get started with our comprehensive training program and unlock new career opportunities. Join hundreds of caregivers elevating their skills today!
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button 
                    size="lg" 
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                    onClick={handleEnrollClick}
                  >
                    <GraduationCap className="h-5 w-5" />
                    Get Started Today
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 my-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Step 1: Self-Paced Online Training
              </CardTitle>
              <CardDescription>
                Complete structured modules at your own pace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">Caregivers will first complete structured online training modules that cover essential caregiving concepts.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Pre-recorded professional video lessons</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Progress tracking and knowledge quizzes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Earn a verified digital certificate</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Guided reflection activities</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-purple-500" />
                Step 2: Shadowing Experience
              </CardTitle>
              <CardDescription>
                Gain hands-on experience with professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">Shadowing a Professional Caregiver (Hands-On Experience)</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Matched with experienced mentors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">3-5 shadowing sessions (flexible)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Real caregiving environment exposure</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Guided reflection and assessment</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Step 3: Next Steps
              </CardTitle>
              <CardDescription>
                Launch your professional caregiving career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">Join a caregiver network for referrals, mentorship & continued learning</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Apply for paid opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Access advanced specialty training (e.g., Alzheimer's care, palliative care, pediatric care)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Earn a verified profile badge to increase credibility and attract more clients/agencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">Join our caregiver network</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="my-8">
          <h2 className="text-2xl font-bold mb-6">Training Structure: Course Modules</h2>
          <p className="mb-4 text-muted-foreground max-w-3xl">
            This training program is built to align with national caregiving best practices, including the 
            standards of the Geriatric Adolescent Partnership Programme (GAPP) and St. Anthony's School of Nursing.
          </p>
          
          <Accordion type="single" collapsible className="w-full max-w-4xl">
            <AccordionItem value="module-1">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Module 1: Caregiving Basics & Professionalism</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-7">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Understanding the role of a caregiver in Trinidad & Tobago</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Key responsibilities, ethics, and expectations in professional caregiving</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Adapting to different types of families and caregiving environments</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="module-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Module 2: Elderly & Special Needs Care</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-7">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Basics of elderly care, including Alzheimer's & dementia support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Caring for children with special needs (GAPP framework)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Understanding mobility assistance and fall prevention</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="module-3">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Module 3: Safety & Emergency Preparedness</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-7">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Handling emergencies (falls, choking, CPR basics, first aid)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Infection control, proper hygiene & disease prevention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Medication reminders & administration basics</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="module-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Module 4: Emotional & Social Support</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-7">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Communicating effectively with families and clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Managing stress and handling difficult caregiving situations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Providing companionship and emotional well-being support</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="module-5">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <HandHeart className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Module 5: Hands-On Care Techniques</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-7">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Assisting with daily living activities (bathing, dressing, feeding)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Safe lifting techniques to prevent injury</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Nutrition & meal prep tailored for senior and special-needs clients</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="module-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Module 6: Working with Families & Agencies</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-7">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Setting clear expectations with families</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Understanding contracts, payments, and worker rights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Maintaining professionalism in private home care and agency settings</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="module-7">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Bonus Module 7: Legal & Ethical Considerations in Caregiving</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-7">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Understanding legal responsibilities in caregiving</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Ethical considerations in caregiving</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Handling ethical dilemmas and difficult situations</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="mt-4 pl-2">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <span className="font-medium">Assessment: Each module concludes with a quiz to reinforce key learnings.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <span className="font-medium">Certification: Caregivers who pass all modules will earn a Caregiver Certificate of Completion, verified badge, and exclusive job opportunities.</span>
            </div>
          </div>
        </div>

        <div className="my-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full max-w-4xl">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="hover:no-underline font-medium">
                Who should enroll in this training?
              </AccordionTrigger>
              <AccordionContent>
                <p>This program is designed for:</p>
                <ul className="mt-2 space-y-1 pl-5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Aspiring caregivers looking for professional training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Existing caregivers wanting to upgrade skills & gain certification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Those interested in joining caregiving agencies in Trinidad & Tobago</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-2">
              <AccordionTrigger className="hover:no-underline font-medium">
                How long does the training take?
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Self-paced training: Approximately 6–8 weeks (varies per participant)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Shadowing period: 3–5 sessions over 2–4 weeks</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-3">
              <AccordionTrigger className="hover:no-underline font-medium">
                Is this training recognized?
              </AccordionTrigger>
              <AccordionContent>
                <p>Yes! This program aligns with national standards, including:</p>
                <ul className="mt-2 space-y-1 pl-5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Geriatric Adolescent Partnership Programme (GAPP)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>National Examinations Council (NEC) Certification Guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Ministry of Social Development Caregiver Training Standards</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-4">
              <AccordionTrigger className="hover:no-underline font-medium">
                What happens after training?
              </AccordionTrigger>
              <AccordionContent>
                <p>Caregivers who complete this program can:</p>
                <ul className="mt-2 space-y-1 pl-5">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Apply for caregiver jobs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Continue to specialized training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span>Get matched with families & agencies</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="my-12">
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold">Join the caregiving movement today!</h2>
                <p className="text-gray-700">
                  By enrolling in this program, you improve your employability, increase your earning potential, 
                  and deliver compassionate, high-quality care to those who need it most.
                </p>
                <div className="pt-2">
                  <Button 
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                    onClick={handleEnrollClick}
                  >
                    <GraduationCap className="h-5 w-5" />
                    Get Started Today
                  </Button>
                </div>
                <p className="text-sm text-gray-600">Because it truly takes a village!</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default TrainingResourcesPage;
