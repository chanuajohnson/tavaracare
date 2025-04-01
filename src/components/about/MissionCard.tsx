
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface MissionCardProps {
  isActive: boolean;
  onClick: () => void;
}

export const MissionCard = ({
  isActive,
  onClick
}: MissionCardProps) => {
  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 h-full ${isActive ? 'shadow-lg border-primary-300' : 'hover:shadow-md'}`} 
      onClick={onClick}
    >
      <CardHeader className="bg-primary-50">
        <CardTitle className="flex items-center gap-2 text-primary-700">
          <Target className="h-5 w-5" /> Our Mission
        </CardTitle>
        <CardDescription>
          What drives everything we do
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p>At Tavara.care, our mission is to transform caregiving through technology, community, and compassion. </p>
          
          <p>We connect families with qualified caregivers while providing professional development, fair compensation, and supportive resources to elevate the caregiving profession and create a more connected care ecosystem in Trinidad &amp; Tobago.</p>
        </div>
      </CardContent>
    </Card>
  );
};
