import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Eye, Star, MapPin, Clock } from "lucide-react";
import { SimpleMatchCard } from "./SimpleMatchCard";
import { UnifiedMatch } from "@/hooks/useUnifiedMatches";

interface FamilyMatchGridProps {
  matches: UnifiedMatch[];
  onChatClick: (caregiverId: string) => void;
  onViewDetails: (caregiverId: string) => void;
  onViewAll: () => void;
  showViewAll?: boolean;
}

export const FamilyMatchGrid = ({ 
  matches, 
  onChatClick, 
  onViewDetails, 
  onViewAll,
  showViewAll = true 
}: FamilyMatchGridProps) => {
  const bestMatch = matches[0];
  const otherMatches = matches.slice(1, 4); // Show up to 3 additional matches

  if (matches.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No matches found</h3>
              <p>Complete your care assessment to get personalized matches</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Best Match - Featured */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Your Best Match
              </CardTitle>
              <CardDescription className="text-base">
                Highest compatibility for your care needs
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {Math.round(bestMatch.match_score)}% Match
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <SimpleMatchCard
            caregiver={bestMatch}
            variant="modal"
            onChatClick={() => onChatClick(bestMatch.id)}
            onViewDetails={() => onViewDetails(bestMatch.id)}
            showChatButton={true}
          />
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="default" 
              size="lg"
              className="w-full"
              onClick={() => onChatClick(bestMatch.id)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Conversation
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => onViewDetails(bestMatch.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Good Matches */}
      {otherMatches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Other Great Options</CardTitle>
                <CardDescription>
                  {matches.length - 1} more qualified caregiver{matches.length === 2 ? '' : 's'}
                </CardDescription>
              </div>
              {showViewAll && matches.length > 4 && (
                <Button variant="outline" size="sm" onClick={onViewAll}>
                  View All {matches.length}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {otherMatches.map((match, index) => (
              <div key={match.id} className="relative">
                <SimpleMatchCard
                  caregiver={match}
                  variant="dashboard"
                  onChatClick={() => onChatClick(match.id)}
                  onViewDetails={() => onViewDetails(match.id)}
                  showChatButton={true}
                />
                
                {/* Match ranking indicator */}
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 2} Match
                  </Badge>
                </div>
              </div>
            ))}
            
            {showViewAll && matches.length > 4 && (
              <div className="pt-4 text-center border-t">
                <Button variant="outline" onClick={onViewAll}>
                  <Eye className="h-4 w-4 mr-2" />
                  View {matches.length - 4} More Matches
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {showViewAll && (
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Ready to find your caregiver?</h3>
                <p className="text-sm text-muted-foreground">
                  Browse all {matches.length} matches or start chatting with your top pick
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onViewAll}>
                  <Eye className="h-4 w-4 mr-2" />
                  Browse All
                </Button>
                <Button onClick={() => onChatClick(bestMatch.id)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
