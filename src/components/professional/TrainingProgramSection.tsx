
import { FadeIn } from "@/components/framer";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, Briefcase } from "lucide-react";

export const TrainingProgramSection = () => {
  return (
    <div className="mt-8 w-full">
      <div className="text-center mb-8">
        <FadeIn delay={0} duration={0.5}>
          <h2 className="text-2xl font-bold text-primary-800 mb-2">
            Our Comprehensive Training Program
          </h2>
        </FadeIn>
        <FadeIn delay={0.2} duration={0.5}>
          <p className="text-gray-600">
            A three-step approach blending self-paced learning, hands-on experience, and career development
          </p>
        </FadeIn>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <FadeIn delay={0} duration={0.5}>
          <Card className="h-full">
            <div className="bg-primary-100 p-6 flex justify-center items-center">
              <GraduationCap className="h-16 w-16 text-primary-700" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Step 1: Self-Paced Online Training</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>Professionally produced pre-recorded video lessons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>Progress tracking and completion certificates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>Knowledge quizzes and guided reflection prompts</span>
                </li>
              </ul>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2} duration={0.5}>
          <Card className="h-full">
            <div className="bg-primary-200 p-6 flex justify-center items-center">
              <Users className="h-16 w-16 text-primary-700" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Step 2: Shadowing a Professional</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>Mentor matching with experienced professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>Hands-on observation during real caregiving shifts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>Guided reflection and final readiness assessment</span>
                </li>
              </ul>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4} duration={0.5}>
          <Card className="h-full">
            <div className="bg-primary-300 p-6 flex justify-center items-center">
              <Briefcase className="h-16 w-16 text-primary-700" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Step 3: Career Development</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>Professional job-matching platform access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>Caregiver network for referrals and mentorship</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">•</span>
                  <span>Advanced specialty training opportunities</span>
                </li>
              </ul>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};
