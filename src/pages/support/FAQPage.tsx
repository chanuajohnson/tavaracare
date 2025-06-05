
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";

const FAQPage = () => {
  const breadcrumbItems = [
    { href: "/", label: "Home" },
    { label: "FAQ" }
  ];

  const faqs = [
    {
      question: "What is Tavara.care?",
      answer: "Tavara.care is a comprehensive caregiving platform that connects families with professional caregivers and provides tools for managing care plans, schedules, and coordination."
    },
    {
      question: "How do I get started as a family?",
      answer: "Simply sign up for a family account, complete your profile, and tell us about your care needs. We'll help match you with qualified caregivers in your area."
    },
    {
      question: "How do I become a caregiver on the platform?",
      answer: "Create a professional account, complete your certification and background check verification, and set up your availability. We'll connect you with families who need your services."
    },
    {
      question: "What types of care services are available?",
      answer: "We offer a wide range of services including personal care, companionship, medication management, meal preparation, transportation, and specialized care for conditions like dementia."
    },
    {
      question: "How does pricing work?",
      answer: "Pricing varies based on the type of care, location, and specific needs. Caregivers set their rates, and families can see transparent pricing before booking services."
    },
    {
      question: "Are all caregivers background checked?",
      answer: "Yes, all professional caregivers on our platform must complete background checks and provide verification of their certifications and experience."
    },
    {
      question: "Can I schedule recurring care visits?",
      answer: "Absolutely! Our platform supports both one-time visits and recurring care schedules. You can set up daily, weekly, or custom schedules that work for your needs."
    },
    {
      question: "How do I manage medications through the platform?",
      answer: "Our medication management system allows you to track medications, set reminders, and log administrations. Caregivers can record when medications are given."
    },
    {
      question: "What if I need to cancel or reschedule a visit?",
      answer: "You can cancel or reschedule visits through the platform. We recommend giving as much notice as possible to respect caregivers' time."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team through the help button (floating action button) on any page, via WhatsApp, or through our contact form. We're here to help!"
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take privacy and security very seriously. All data is encrypted and we follow strict privacy guidelines to protect your personal and health information."
    },
    {
      question: "Can family members access care information?",
      answer: "Yes, you can invite family members to access care plans and schedules. You control what information each family member can see and edit."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <Container>
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about the Tavara.care platform, services, and how to get started with quality caregiving support.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 text-base leading-relaxed pt-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <p className="text-sm text-gray-500">
            Use the help button in the bottom right corner to contact our support team, start a WhatsApp conversation, or send us detailed feedback.
          </p>
        </motion.div>
      </Container>
    </div>
  );
};

export default FAQPage;
