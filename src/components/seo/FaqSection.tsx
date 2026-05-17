import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { faqs } from '@/data/faqs';

interface FaqSectionProps {
  /** Ordered list of FAQ ids to render. Order in props == order shown. */
  ids: string[];
  /** Section heading (h2). */
  title?: string;
  /** Optional intro paragraph below the heading. */
  intro?: string;
  /** Show a link to the full FAQ page below the accordion. Defaults to true. */
  showFullFaqLink?: boolean;
  className?: string;
}

/**
 * Visible FAQ accordion section. Renders the questions/answers so the page
 * satisfies Google's "FAQ content must be visible" requirement when paired
 * with FAQPage JSON-LD schema (built separately via buildFaqPageSchema).
 */
export const FaqSection: React.FC<FaqSectionProps> = ({
  ids,
  title = 'Frequently Asked Questions',
  intro,
  showFullFaqLink = true,
  className = '',
}) => {
  const items = ids
    .map(id => faqs.find(f => f.id === id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  if (items.length === 0) return null;

  return (
    <section className={`container mx-auto px-4 py-12 max-w-3xl ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
        {intro && <p className="text-muted-foreground">{intro}</p>}
      </div>

      <Accordion type="single" collapsible className="w-full">
        {items.map(faq => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground whitespace-pre-line">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {showFullFaqLink && (
        <div className="text-center mt-6">
          <Link to="/support/faq" className="text-primary hover:underline text-sm font-medium">
            See all frequently asked questions →
          </Link>
        </div>
      )}
    </section>
  );
};

export default FaqSection;
