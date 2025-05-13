
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/framer';

interface TeamMemberCardProps {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
  isDemo?: boolean;
}

export const TeamMemberCard = ({ name, role, bio, imageSrc, isDemo = false }: TeamMemberCardProps) => {
  return (
    <FadeIn
      duration={0.3}
      className="group"
      style={{ transform: 'translateY(0)' }}
      onMouseEnter={(e) => {
        if (e.currentTarget) {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.transition = 'transform 0.3s ease';
        }
      }}
      onMouseLeave={(e) => {
        if (e.currentTarget) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.transition = 'transform 0.3s ease';
        }
      }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img 
            src={imageSrc} 
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-primary-800">{name}</h3>
            {isDemo && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                Demo
              </Badge>
            )}
          </div>
          <p className="text-primary-600 mb-3">{role}</p>
          <p className="text-gray-600 text-sm">{bio}</p>
        </CardContent>
      </Card>
    </FadeIn>
  );
};
