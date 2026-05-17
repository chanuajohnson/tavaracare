
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchIcon, Phone as PhoneIcon, MessageSquare, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SEO } from "@/components/seo/SEO";
import { faqs, buildFaqPageSchema } from "@/data/faqs";


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

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Support", href: "/support" },
    { label: "FAQ", href: "/support/faq" }
  ];
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <SEO
        title="FAQ — Tavara Care Coordination Platform"
        description="Answers to common questions about Tavara: care coordination, caregiver matching, pricing, NIS payroll, plans, and family/professional accounts."
        canonicalPath="/support/faq"
        schema={buildFaqPageSchema()}
      />
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about the Tavara.care</p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Search for questions or answers..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-10" 
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={activeCategory === null ? "default" : "outline"} 
            className="cursor-pointer" 
            onClick={() => setActiveCategory(null)}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant={activeCategory === category ? "default" : "outline"} 
              className="cursor-pointer" 
              onClick={() => setActiveCategory(category === activeCategory ? null : category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* FAQs */}
      {filteredFaqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground whitespace-pre-line">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-8">
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
        </div>
      )}
      
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  window.open(`https://wa.me/18687865357?text=${encodeURIComponent("Hello, I need support with Tavara.care platform.")}`, "_blank");
                }}
              >
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Trigger opening the contact form from the FAB
                  const event = new CustomEvent('tavara:open-contact-form', {
                    detail: { fromFAQ: true }
                  });
                  window.dispatchEvent(event);
                }}
              >
                Open Contact Form
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
