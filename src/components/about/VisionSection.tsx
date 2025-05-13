
import { useState } from 'react';
import { FadeIn } from '@/components/framer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
                {/* Expanded content would go here */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
};
