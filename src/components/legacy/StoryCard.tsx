
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, MapPin, Star, Heart, Briefcase, Coffee } from "lucide-react";
import { Story } from "./StoryList";

interface StoryCardProps {
  story: Story;
  onReadMore: () => void;
}

// Helper function to get initials from a name
const getInitials = (name: string): string => {
  if (!name) return "?";
  
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// Helper function to truncate text
const truncateText = (text: string | null, maxLength = 150): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + "...";
};

export const StoryCard = ({ story, onReadMore }: StoryCardProps) => {
  const initials = getInitials(story.full_name || "");
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Avatar and basic info */}
          <div className="md:w-1/4 flex flex-col items-center md:items-start gap-4">
            <Avatar className="h-24 w-24 border-2 border-primary-100 bg-primary-50">
              <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-semibold text-gray-900">{story.full_name}</h3>
              
              {story.birth_year && (
                <p className="text-sm text-gray-600 flex items-center justify-center md:justify-start gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Born in {story.birth_year}
                </p>
              )}
            </div>
            
            {/* Personality Traits */}
            {story.personality_traits && story.personality_traits.length > 0 && (
              <div className="w-full mt-2">
                <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Personality
                </p>
                <div className="flex flex-wrap gap-1">
                  {story.personality_traits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right side - Story and details */}
          <div className="md:w-3/4 space-y-4">
            {/* Preview of life story */}
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mb-2">
                <BookOpen className="h-4 w-4" />
                Their Story
              </p>
              <p className="text-gray-700 line-clamp-5">
                {truncateText(story.life_story, 400)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Career Fields */}
              {story.career_fields && story.career_fields.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    Career
                  </p>
                  <p className="text-sm text-gray-700">
                    {story.career_fields.join(", ")}
                  </p>
                </div>
              )}
              
              {/* Hobbies & Interests */}
              {story.hobbies_interests && story.hobbies_interests.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Coffee className="h-4 w-4 text-gray-500" />
                    Interests
                  </p>
                  <p className="text-sm text-gray-700">
                    {story.hobbies_interests.join(", ")}
                  </p>
                </div>
              )}
              
              {/* Notable Events */}
              {story.notable_events && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <Star className="h-4 w-4 text-gray-500" />
                    Notable Events
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {story.notable_events}
                  </p>
                </div>
              )}
              
              {/* Unique Facts */}
              {story.unique_facts && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    Unique Facts
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {story.unique_facts}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 border-t mt-4">
        <Button 
          variant="outline" 
          className="w-full text-primary hover:text-primary-700 hover:bg-primary-50 focus:ring-primary-500 group"
          onClick={onReadMore}
        >
          <span>Read Full Legacy</span>
          <BookOpen className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};
