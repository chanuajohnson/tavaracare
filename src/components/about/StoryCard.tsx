
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface StoryCardProps {
  isActive: boolean;
  onClick: () => void;
}

export const StoryCard = ({
  isActive,
  onClick
}: StoryCardProps) => {
  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 h-full ${isActive ? 'shadow-lg border-primary-300' : 'hover:shadow-md'}`} 
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
        <div className="space-y-4">
          <p>Tavara was born from a personal experience—when our founders' mother needed care, the family saw firsthand how difficult and fragmented the caregiving system was. Finding reliable caregivers, managing schedules, and ensuring quality care was overwhelming.</p>
          
          <p>This revealed a bigger issue: caregiving doesn't just need more workers—it needs better systems, stronger communities, and real support for both families and caregivers. So, we built Tavara.</p>
        </div>
      </CardContent>
    </Card>
  );
};
