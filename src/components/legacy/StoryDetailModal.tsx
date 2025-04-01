
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Briefcase, Heart, BookOpen, MapPin, Star, Coffee, Moon, Sun } from "lucide-react";
import { Story } from "./StoryList";

interface StoryDetailModalProps {
  story: Story;
  open: boolean;
  onClose: () => void;
}

// Helper function to get initials
const getInitials = (name: string): string => {
  if (!name) return "?";
  
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export const StoryDetailModal = ({ story, open, onClose }: StoryDetailModalProps) => {
  const initials = getInitials(story.full_name || "");
  
  // Split the life story into paragraphs
  const paragraphs = story.life_story?.split(/\n\n|\n/) || [];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-primary-100 bg-primary-50">
              <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <DialogTitle className="text-2xl">{story.full_name}</DialogTitle>
              {story.birth_year && (
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  Born in {story.birth_year}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-8 mt-4">
          {/* Life Story */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              Their Story
            </h3>
            <div className="text-gray-700 space-y-4 bg-gray-50 p-4 rounded-md">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">No life story available.</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personality Traits */}
            {story.personality_traits && story.personality_traits.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-gray-600" />
                  Personality
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {story.personality_traits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Career Fields */}
            {story.career_fields && story.career_fields.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-600" />
                  Career & Achievements
                </h3>
                <p className="text-sm text-gray-700">
                  {story.career_fields.join(", ")}
                </p>
              </div>
            )}
            
            {/* Hobbies & Interests */}
            {story.hobbies_interests && story.hobbies_interests.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Coffee className="h-4 w-4 mr-2 text-gray-600" />
                  Hobbies & Interests
                </h3>
                <p className="text-sm text-gray-700">
                  {story.hobbies_interests.join(", ")}
                </p>
              </div>
            )}
            
            {/* Unique Facts */}
            {story.unique_facts && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-gray-600" />
                  Unique Facts
                </h3>
                <p className="text-sm text-gray-700">
                  {story.unique_facts}
                </p>
              </div>
            )}
            
            {/* Notable Events */}
            {story.notable_events && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                  Notable Events
                </h3>
                <p className="text-sm text-gray-700">
                  {story.notable_events}
                </p>
              </div>
            )}
            
            {/* Family & Social Info */}
            {story.family_social_info && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-gray-600" />
                  Family & Social Life
                </h3>
                <p className="text-sm text-gray-700">
                  {story.family_social_info}
                </p>
              </div>
            )}
            
            {/* Cultural Preferences */}
            {story.cultural_preferences && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                  Cultural Heritage & Preferences
                </h3>
                <p className="text-sm text-gray-700">
                  {story.cultural_preferences}
                </p>
              </div>
            )}
            
            {/* Daily Routines */}
            {story.daily_routines && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Sun className="h-4 w-4 mr-2 text-gray-600" />
                  Daily Routines
                </h3>
                <p className="text-sm text-gray-700">
                  {story.daily_routines}
                </p>
              </div>
            )}
            
            {/* Joyful Things */}
            {story.joyful_things && (
              <div className="space-y-2 col-span-1 md:col-span-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Sun className="h-4 w-4 mr-2 text-gray-600" />
                  Things That Brought Joy
                </h3>
                <p className="text-sm text-gray-700">
                  {story.joyful_things}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
