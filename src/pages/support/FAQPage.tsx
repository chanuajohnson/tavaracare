
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchIcon, Phone as PhoneIcon, MessageSquare, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [{
  id: "faq-1",
  question: "What is Tavara.care?",
  answer: "Tavara.care is a care coordination platform designed to help families, care professionals, and communities connect for better caregiving solutions. We provide tools for care matching, task management, messaging, and professional networking, ensuring quality care experiences.",
  category: "General"
}, {
  id: "faq-2",
  question: "Who can use Tavara.care?",
  answer: "Tavara.care is designed for three primary user groups:\n\n- Families seeking caregivers for their loved ones\n- Care Professionals looking for job opportunities and tools to manage their schedules\n- Community Organizations sharing resources and events related to caregiving",
  category: "General"
}, {
  id: "faq-3",
  question: "How do I create a family care account?",
  answer: "To create a family care account:\n\n1. Click on the 'Sign In' button in the top navigation bar.\n2. Select the 'Sign Up' tab.\n3. Choose 'Family' as your role and complete the registration process.\n4. After email verification, you can set up your family profile and start searching for care professionals.",
  category: "Account Management"
}, {
  id: "faq-4",
  question: "What information do care professionals need to provide when signing up?",
  answer: "Care professionals must submit:\n\n- Contact information\n- Professional credentials (certifications, licenses, etc.)\n- Areas of expertise\n- Service areas and availability\n- References and background verification (required for profile visibility to families)",
  category: "Account Management"
}, {
  id: "faq-5",
  question: "How do I find a qualified care professional?",
  answer: "Families can search for caregivers by:\n\n1. Navigating to 'Find Care' from the Family Dashboard.\n2. Using filters for care type, location, and availability.\n3. Viewing caregiver profiles, ratings, and reviews before making a selection.\n\nPremium Feature: Priority Matching allows families to get automatically connected with top-rated caregivers.",
  category: "Care Matching & Services"
}, {
  id: "faq-6",
  question: "Can I invite other family members to help manage care?",
  answer: "Yes! You can invite family members to collaborate on care management by:\n\n1. Going to 'Team Management' in your dashboard.\n2. Selecting 'Invite Family Member'.\n3. Entering their email address to send an invitation.\n\nThis feature is free for all users.",
  category: "Care Management"
}, {
  id: "faq-7",
  question: "How does the message board work?",
  answer: "The message board allows users to:\n\n- Post and respond to caregiver listings.\n- Receive direct messages from interested professionals.\n- Engage with the caregiver community.\n\nPremium Feature: Unlimited Messaging allows families to send and receive unlimited messages.",
  category: "Messaging & Communication"
}, {
  id: "faq-8",
  question: "What should I do if I need immediate support?",
  answer: "For immediate assistance:\n\n1. Click the 'Help' button (question mark icon) at the bottom right of any page.\n2. Choose from:\n   - WhatsApp Support (fastest response time)\n   - Submit a Support Ticket\n   - Browse FAQs",
  category: "Support"
}, {
  id: "faq-9",
  question: "What features are free on Tavara.care?",
  answer: "Free Features Include:\n\n✔ Basic caregiver search and profile browsing\n✔ Posting a limited number of care requests\n✔ Accessing community resources and events\n✔ Participating in forums and discussions\n✔ Sending a limited number of messages\n✔ Viewing task management (without advanced tools)",
  category: "Subscription & Pricing"
}, {
  id: "faq-10",
  question: "What features require a paid subscription?",
  answer: "Premium Features Include:\n\n🚀 Professional Matching - Get priority recommendations for top caregivers\n🚀 Unlimited Messaging - Send and receive unlimited messages\n🚀 Task Management Tools - Advanced features for scheduling and tracking care tasks\n🚀 Priority Support - Get faster responses from the Tavara.care team\n🚀 Enhanced Profile Visibility - For care professionals looking to get more job opportunities",
  category: "Subscription & Pricing"
}, {
  id: "faq-11",
  question: "What are the subscription plans and pricing?",
  answer: "Plan Name | Features Included | Price\n\n---|---|---\nFamily Basic | Limited access to caregiver search and messaging | Free\nFamily Care | Unlimited profile views, direct messaging, and posting care needs | $14.99/month\nFamily Premium | All 'Family Care' features + personalized matching and priority support | $29.99/month\nProfessional Pro | Enhanced profile visibility and unlimited job applications | $19.99/month\nProfessional Expert | Complete feature access, priority matching, and advanced analytics | $34.99/month",
  category: "Subscription & Pricing"
}, {
  id: "faq-12",
  question: "How do I upgrade my subscription?",
  answer: "To upgrade:\n\n1. Go to 'Subscription & Pricing' in your account settings.\n2. Select the plan that best fits your needs.\n3. Enter payment details and confirm your upgrade.",
  category: "Subscription & Pricing"
}, {
  id: "faq-13",
  question: "How can I update my availability as a care professional?",
  answer: "To update your availability:\n\n1. Log into your Professional Dashboard.\n2. Navigate to 'Schedule Management'.\n3. Modify recurring availability or block off specific dates and times.\n\nChanges will be reflected to families in real-time.",
  category: "Professional Users & Job Management"
}, {
  id: "faq-14",
  question: "How does task management work for professionals?",
  answer: "The Task Management feature allows care professionals to:\n\n✔ Organize care responsibilities\n✔ Set reminders for appointments\n✔ Track completed and upcoming tasks\n\nPremium Feature: Advanced task tracking with automated scheduling is available in 'Professional Expert' plans.",
  category: "Professional Users & Job Management"
}, {
  id: "faq-15",
  question: "How do professionals receive payments?",
  answer: "Care professionals are paid directly by families. Tavara.care does not process caregiver payments but provides an invoicing tool to help manage payments and earnings.",
  category: "Professional Users & Job Management"
}, {
  id: "faq-16",
  question: "Can community organizations post resources and events?",
  answer: "Yes! Community organizations can:\n\n✔ Create a Community Account (verification required)\n✔ Post events, resources, and services\n✔ Engage with families and professionals\n\nThis feature is free for verified community organizations.",
  category: "Community & Support"
}, {
  id: "faq-17",
  question: "How do I report an issue with the platform?",
  answer: "To report an issue:\n\n1. Click the 'Help' button in the bottom right corner.\n2. Select 'Contact Support'.\n3. Provide details and screenshots (if applicable).\n\nOur support team will review and respond as soon as possible.",
  category: "Support"
}, {
  id: "faq-18",
  question: "Is my personal and health information secure?",
  answer: "Yes, Tavara.care prioritizes data security. We:\n\n✔ Encrypt all personal and health information\n✔ Comply with relevant data protection regulations\n✔ Implement strict access controls\n✔ Allow users to control who sees their data",
  category: "Privacy & Security"
}, {
  id: "faq-19",
  question: "Still have questions?",
  answer: "If you couldn't find what you're looking for, feel free to:\n\n✔ Visit our Help Center\n✔ Reach out via WhatsApp Support\n✔ Submit a Support Ticket",
  category: "Support"
}];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Extract unique categories from the FAQ data
  const categories = Array.from(new Set(faqs.map(faq => faq.category)));
  
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? faq.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });
  
  return <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about the Tavara.care</p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input type="text" placeholder="Search for questions or answers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant={activeCategory === null ? "default" : "outline"} className="cursor-pointer" onClick={() => setActiveCategory(null)}>
            All
          </Badge>
          {categories.map(category => <Badge key={category} variant={activeCategory === category ? "default" : "outline"} className="cursor-pointer" onClick={() => setActiveCategory(category === activeCategory ? null : category)}>
              {category}
            </Badge>)}
        </div>
      </div>
      
      {/* FAQs */}
      {filteredFaqs.length > 0 ? <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.map(faq => <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground whitespace-pre-line">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>)}
        </Accordion> : <div className="text-center py-8">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-1">No results found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any FAQs matching your search criteria
          </p>
          <Button onClick={() => {
        setSearchQuery("");
        setActiveCategory(null);
      }}>
            Clear filters
          </Button>
        </div>}
      
      {/* Support Options */}
      <div className="mt-12 bg-muted rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Still need help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <PhoneIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">WhatsApp Support</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Get quick support via WhatsApp
              </p>
              <Button variant="outline" size="sm" onClick={() => {
              window.open(`https://wa.me/18687865357?text=${encodeURIComponent("Hello, I need support with Tavara.care platform.")}`, "_blank");
            }}>
                Connect on WhatsApp
              </Button>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Contact Form</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Submit a detailed support request
              </p>
              <Button variant="outline" size="sm" onClick={() => {
              // This would open the contact form modal
              alert("Contact form would open here");
            }}>
                Open Contact Form
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
