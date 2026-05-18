import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { familySteps, caregiverSteps, type MatchingStep as Step } from '@/data/howMatchingWorks';

const StepAccordion = ({ steps }: { steps: Step[] }) => (
  <Accordion type="single" collapsible className="w-full">
    {steps.map((step) => {
      const Icon = step.icon;
      return (
        <AccordionItem key={step.number} value={`step-${step.number}`} className="border-primary-100">
          <AccordionTrigger className="hover:no-underline py-3 group">
            <div className="flex items-center gap-3 text-left">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">
                {step.number}
              </div>
              <Icon className="h-4 w-4 text-primary-600 flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium text-primary-800">{step.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-10 pr-2">
            {step.intro && <p className="text-sm text-gray-600 mb-2">{step.intro}</p>}
            <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
              {step.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            {step.outro && <p className="text-sm text-gray-600 mt-2">{step.outro}</p>}
            <p className="mt-3 text-sm italic text-primary-700 border-l-2 border-primary-200 pl-3">
              {step.quote}
            </p>
          </AccordionContent>
        </AccordionItem>
      );
    })}
  </Accordion>
);

export const HowMatchingWorksCard = () => {
  const [tab, setTab] = useState<'family' | 'caregiver'>('family');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto"
    >
      <Card className="border-primary-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary-50 to-primary-100/40 py-4">
          <CardTitle className="text-xl sm:text-2xl text-primary-800">
            How Tavara Matching Works
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600">
            A real match isn't a search result — it's a system that looks at your life, your home, and the people who'll show up.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'family' | 'caregiver')}>
            <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-grid mb-3">
              <TabsTrigger value="family">For Families</TabsTrigger>
              <TabsTrigger value="caregiver">For Caregivers</TabsTrigger>
            </TabsList>

            <TabsContent value="family" className="mt-0">
              <StepAccordion steps={familySteps} />
            </TabsContent>

            <TabsContent value="caregiver" className="mt-0">
              <StepAccordion steps={caregiverSteps} />
            </TabsContent>
          </Tabs>

          <div className="mt-3 text-center bg-primary-50 rounded-lg py-3 px-4">
            <p className="text-sm sm:text-base italic text-primary-800 font-medium">
              A good match isn't enough — the whole system has to work.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
