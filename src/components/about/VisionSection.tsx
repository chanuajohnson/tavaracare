
import { useState } from 'react';
import { FadeIn } from '@/components/framer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const VisionSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <FadeIn
      className="mb-8"
      delay={0}
      duration={0.5}
    >
      <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow">
        <CardHeader className="bg-primary-50">
          <CardTitle className="text-primary-700">Our Vision</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-primary-700 mb-6">We envision a future where every family in Trinidad &amp; Tobago can easily access compassionate, high-quality care, and where caregiving is a respected profession supported by fair compensation, ongoing education, and strong community connections—seamlessly bridging the needs of those seeking care and those providing it.</p>
            
            <div 
              className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="text-primary-600 space-y-4">
                <p>We are committed to creating a caregiving ecosystem that brings dignity, respect, and professionalism to all aspects of care work while ensuring families have access to reliable support during their most vulnerable moments.</p>
                <p>By connecting trained caregivers with families in need, we are building a sustainable model of care delivery that benefits our entire community and reinforces the critical value of care work in society.</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-primary-600 hover:text-primary-800 hover:bg-primary-100"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <span>Read less</span>
                  <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Read more</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
};
