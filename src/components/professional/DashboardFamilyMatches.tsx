
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, MapPin, Star, Clock, Sparkles } from "lucide-react";
import { useFamilyMatches } from "@/hooks/useFamilyMatches";
import { useNavigate } from "react-router-dom";

export const DashboardFamilyMatches = () => {
  const { families, isLoading } = useFamilyMatches(true); // Show only best match
  const navigate = useNavigate();
  const [showAllMatches, setShowAllMatches] = useState(false);

  const bestMatch = families[0];

  const handleViewAllMatches = () => {
    navigate('/professional/family-matches');
  };

  const handleContactFamily = (familyId: string) => {
    console.log('Contacting family:', familyId);
    // Implementation for contacting family
  };

  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Your Family Match
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {families.length} {families.length === 1 ? 'family matches' : 'families match'} your expertise and availability
          </p>
        </div>
        <Button variant="outline" onClick={handleViewAllMatches} className="flex items-center gap-2">
          View All Matches
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-8 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-blue-500 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-purple-500 animate-pulse delay-150" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-blue-600">Finding your perfect family match! ✨</p>
              <p className="text-sm text-gray-600">Analyzing compatibility and care needs...</p>
            </div>
          </div>
        ) : bestMatch ? (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{bestMatch.full_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{bestMatch.location}</span>
                    <span className="text-gray-400">•</span>
                    <span>{bestMatch.distance} km away</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    <Star className="h-3 w-3 mr-1" />
                    {bestMatch.match_score}% match
                  </Badge>
                  {bestMatch.is_premium && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Care Types Needed:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {bestMatch.care_types?.slice(0, 3).map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {bestMatch.care_types && bestMatch.care_types.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{bestMatch.care_types.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {bestMatch.schedule_overlap_details && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Schedule Compatibility:</p>
                    <p className="text-sm text-blue-600">{bestMatch.schedule_overlap_details}</p>
                  </div>
                )}

                {bestMatch.budget_preferences && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Budget Range:</p>
                    <p className="text-sm text-gray-600">{bestMatch.budget_preferences}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={() => handleContactFamily(bestMatch.id)}
                >
                  Contact Family
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleViewAllMatches}
                >
                  View Details
                </Button>
              </div>
            </div>

            {bestMatch.match_explanation && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Why this is a great match:</span>
                </div>
                <p className="text-sm text-blue-700">{bestMatch.match_explanation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Family Matches Yet</h3>
            <p className="text-gray-500 mb-4">
              Complete your profile to get matched with families who need your expertise.
            </p>
            <Button variant="outline" onClick={() => navigate('/registration/professional')}>
              Complete Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
