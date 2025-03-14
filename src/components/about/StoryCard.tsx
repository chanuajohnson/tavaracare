
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface StoryCardProps {
  isActive: boolean;
  onClick: () => void;
}

export const StoryCard = ({ isActive, onClick }: StoryCardProps) => {
  const [readMore, setReadMore] = useState(false);

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${
        isActive ? 'shadow-lg border-primary-300' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardHeader className="bg-primary-50">
        <CardTitle className="flex items-center gap-2 text-primary-700">
          <BookOpen className="h-5 w-5" /> Our Story
        </CardTitle>
        <CardDescription>
          How Tavara.care came to be
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className={`space-y-4 ${readMore ? 'h-auto' : 'h-[150px] overflow-hidden'}`}>
          <p>
            Tavara.care was born from a deeply personal experience. When our founder's
            grandmother needed care, the family discovered how fragmented and challenging
            the caregiving landscape was. Despite having resources, the process of finding reliable
            care, managing schedules, and ensuring quality was overwhelming.
          </p>
          
          <p>
            This experience revealed a critical gap - caregiving doesn't just need more workers,
            it needs better systems, stronger communities, and enhanced support for both families
            and professional caregivers.
          </p>

          <p>
            The name "Tavara" comes from the concept that valuable services and care should be
            accessible to all who need them, with "care" emphasizing our core mission of supporting
            caregivers and care recipients alike.
          </p>

          <p>
            Launched in 2024, Tavara.care has grown into a comprehensive platform that brings
            together families, professional caregivers, and community resources. We're building
            technology that solves real problems, creates meaningful connections, and ultimately
            transforms how care is delivered and received.
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-4 text-primary-600"
          onClick={(e) => {
            e.stopPropagation();
            setReadMore(!readMore);
          }}
        >
          {readMore ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" /> Read Less
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" /> Read More
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
